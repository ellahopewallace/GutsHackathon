// Presence + events for the hotel.
//
// With Firebase configured (VITE_FIREBASE_* in .env) guests and events live in
// Firestore under hotels/{hotelId}/guests and hotels/{hotelId}/events, so every
// phone in the hotel shares one courtyard. Without it, tabs on the same device
// talk over BroadcastChannel, which is enough to demo multiplayer on a laptop.
//
// Only presence (an anonymous guest id, their cat and its stats) and intents
// (feed, play, pet...) are sent. Cat positions are never sent: every device
// simulates the same courtyard from the same seed (see game/sim.js).
//
// Both transports offer the same small interface: join(guest), update(fields),
// send(event), leave() and close(), and report back through onGuests(list),
// onEvents(list) and onStatus(status).

const FIREBASE_READY = Boolean(
  import.meta.env.VITE_FIREBASE_PROJECT_ID && import.meta.env.VITE_FIREBASE_API_KEY,
);

// A guest counts as "here" if seen within ONLINE_MS; guests are forgotten
// entirely after RECENT_MS. Firestore guests refresh `lastSeen` every
// HEARTBEAT_MS.
export const ONLINE_MS = 50000;
const HEARTBEAT_MS = 15000;
const RECENT_MS = 30 * 60 * 1000;

// Tabs on one device. Messages: "hello" (a newcomer asks everyone to announce
// themselves), "presence" (a guest record), "bye" (a guest checked out) and
// "event" (an action). Each tab re-announces itself every 4 s as a heartbeat.
function localHotel({ hotelId, onGuests, onEvents, onStatus }) {
  const channel = "BroadcastChannel" in window ? new BroadcastChannel(`purr-inn:${hotelId}`) : null;
  const guests = new Map();
  let self = null;
  const post = (msg) => channel?.postMessage(msg);
  const publish = () => {
    const now = Date.now();
    for (const [id, g] of guests) if (now - g.lastSeen > RECENT_MS) guests.delete(id);
    onGuests([...guests.values()]);
  };
  if (channel) {
    channel.onmessage = ({ data }) => {
      if (data.kind === "hello" && self) post({ kind: "presence", guest: self });
      if (data.kind === "presence") {
        guests.set(data.guest.id, { ...data.guest, lastSeen: Date.now() });
        publish();
      }
      if (data.kind === "bye") {
        guests.delete(data.id);
        publish();
      }
      if (data.kind === "event") onEvents([data.event]);
    };
  }
  post({ kind: "hello" });
  const beat = setInterval(() => {
    if (self) post({ kind: "presence", guest: { ...self, lastSeen: Date.now() } });
    publish();
  }, 4000);
  onStatus(channel ? "local" : "solo");
  return {
    join(guest) {
      self = { ...guest, lastSeen: Date.now() };
      post({ kind: "presence", guest: self });
    },
    update(partial) {
      if (!self) return;
      self = { ...self, ...partial, lastSeen: Date.now() };
      post({ kind: "presence", guest: self });
    },
    send(event) {
      post({ kind: "event", event });
    },
    leave() {
      if (self) post({ kind: "bye", id: self.id });
      self = null;
    },
    close() {
      clearInterval(beat);
      channel?.close();
    },
  };
}

// Phones across the hotel, through Firestore. One document per guest (kept
// fresh by a heartbeat, deleted on check-out) and one per event; listeners
// stream changes to every phone. Firebase is loaded only when configured.
async function firebaseHotel({ hotelId, onGuests, onEvents, onStatus }) {
  const [{ db }, fs] = await Promise.all([import("../lib/firebase"), import("firebase/firestore")]);
  const { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, updateDoc, where } = fs;
  const guestsCol = collection(db, "hotels", hotelId, "guests");
  const eventsCol = collection(db, "hotels", hotelId, "events");
  let self = null;

  const stopGuests = onSnapshot(
    guestsCol,
    (snap) => {
      const now = Date.now();
      onGuests(snap.docs.map((d) => d.data()).filter((g) => now - (g.lastSeen ?? 0) < RECENT_MS));
      // The first snapshot is often served from the local cache (our own
      // check-in) before the server has said anything; only a server
      // snapshot proves the connection works.
      if (!snap.metadata.fromCache) onStatus("online");
    },
    (err) => onStatus("error", err),
  );
  // Only recent events matter: older ones no longer move any cat.
  const stopEvents = onSnapshot(
    query(eventsCol, where("at", ">", Date.now() - 90000), orderBy("at")),
    (snap) => {
      // The query's start time is fixed when we connect, so also drop
      // anything older than 90 s here for phones that stay open a long time.
      const cutoff = Date.now() - 90000;
      const added = snap
        .docChanges()
        .filter((c) => c.type === "added")
        .map((c) => c.doc.data())
        .filter((e) => (e.at ?? 0) > cutoff);
      if (added.length) onEvents(added);
    },
    (err) => onStatus("error", err),
  );
  const beat = () => {
    if (self) updateDoc(doc(guestsCol, self.id), { lastSeen: Date.now() }).catch(() => {});
  };
  const timer = setInterval(beat, HEARTBEAT_MS);
  const onVisible = () => document.visibilityState === "visible" && beat();
  document.addEventListener("visibilitychange", onVisible);

  return {
    join(guest) {
      self = guest;
      setDoc(doc(guestsCol, guest.id), { ...guest, lastSeen: Date.now() }).catch((err) => onStatus("error", err));
    },
    update(partial) {
      if (!self) return;
      self = { ...self, ...partial };
      updateDoc(doc(guestsCol, self.id), { ...partial, lastSeen: Date.now() }).catch(() => {});
    },
    send(event) {
      setDoc(doc(eventsCol, event.id), event).catch((err) => onStatus("error", err));
    },
    leave() {
      if (self) deleteDoc(doc(guestsCol, self.id)).catch(() => {});
      self = null;
    },
    close() {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      stopGuests();
      stopEvents();
    },
  };
}

/**
 * Connects to the hotel. Returns a controller immediately; with Firebase the
 * real connection is swapped in once it is ready, and if Firestore fails the
 * local channel takes over so the demo keeps working.
 */
export function connectHotel(options) {
  let backend = null;
  let closed = false;
  const queue = [];
  const call = (method, ...args) => {
    if (backend) backend[method](...args);
    else queue.push([method, args]);
  };
  const adopt = (b) => {
    if (closed) {
      b.close();
      return;
    }
    backend = b;
    for (const [method, args] of queue.splice(0)) backend[method](...args);
  };

  // What we have told the hotel about ourselves, so that if Firestore drops
  // out before it ever answered (wrong config, rules not published, no
  // network) we can check in again over the local channel instead.
  let self = null;
  let online = false; // Firestore answered from the server at least once
  let dropped = false; // we gave up on Firestore
  const fallback = (err) => {
    if (closed || online || dropped) return;
    dropped = true;
    console.warn("Firestore unavailable, using local mode", err);
    backend?.close();
    adopt(localHotel(options));
    if (self) backend.join(self);
  };

  if (FIREBASE_READY) {
    firebaseHotel({
      ...options,
      onStatus: (s, err) => {
        if (dropped) return undefined; // late noise from the closed listeners
        if (s === "online") online = true;
        if (s === "error" && !online) return fallback(err);
        return options.onStatus(s, err);
      },
    })
      .then(adopt)
      .catch(fallback);
  } else {
    adopt(localHotel(options));
  }

  return {
    join: (guest) => {
      self = guest;
      call("join", guest);
    },
    update: (partial) => {
      if (self) self = { ...self, ...partial };
      call("update", partial);
    },
    send: (event) => call("send", event),
    leave: () => {
      self = null;
      call("leave");
    },
    close() {
      closed = true;
      backend?.close();
    },
  };
}
