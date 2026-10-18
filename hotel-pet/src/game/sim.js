// The courtyard simulation.
//
// Nothing here is sent over the network. Time is split into 12 s slots; for
// each slot every cat gets a plan (wander, groom, nap, watch the koi, meet a
// friend...) chosen by seeded randomness from the slot number and the cats in
// the hotel. Positions are pure functions of the clock, so every phone that
// knows the same guests and the same events shows the same cats in the same
// places. Guests' actions (feed, play, pet...) arrive as events and override a
// cat's plan for a while.
import { hashString, pick, pickWeighted, rand, rng, shuffle } from "./rng";
import {
  ARRIVAL, ENTRANCE, FOOD, NAP_SPOTS, WATCH_SPOTS,
  bowlSpot, butterflyAt, clampToFloor, depthScale, randomFloorPoint,
} from "./world";
import { wellbeing } from "./care";

const SLOT_MS = 12000;
const WALK = 0.042; // world units per ms
const RUN = 0.12;
const LOOP_START = 4500;

const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (u) => 0.7 * u + 0.3 * (0.5 - Math.cos(Math.PI * u) / 2);

// How long each guest action takes over a cat (ms), given where it started.
function eventDuration(ev, from, spot) {
  switch (ev.type) {
    case "arrive": return dist(ENTRANCE, spot) / WALK + 900;
    case "feed": return dist(from, spot) / (WALK * 1.4) + 6500;
    case "nap": return dist(from, spot) / WALK + 24000;
    case "brush": return 5600;
    case "pet": return 4200;
    case "treat": return 3600;
    case "play": return 8400;
    default: return 0;
  }
}

// Which step of a timed sequence ([[startMs, ...], ...]) is current `since` ms in.
function phaseAt(phases, since) {
  let current = phases[0];
  for (const p of phases) if (since >= p[0]) current = p;
  return current;
}

/**
 * Creates a simulation for one courtyard. Feed it the cats (setRoster) and
 * the guests' events (setEvents), then ask where any cat is at any moment
 * (stateAt), which bowls and toys are out (propsAt) and which friendly
 * moments happened (socialBetween). Results are cached per slot.
 */
export function createSim() {
  let roster = [];
  let byId = new Map();
  let rosterKey = "";
  let events = [];
  const slots = new Map();
  const eventInfo = new Map();
  const players = new Map();

  // Plans depend on who is in the hotel, so caches are dropped whenever a cat
  // arrives or leaves (but not when only their stats change).
  function setRoster(cats) {
    const key = cats.map((c) => `${c.id}@${c.joinedAt}`).sort().join(",");
    roster = cats;
    byId = new Map(cats.map((c) => [c.id, c]));
    if (key !== rosterKey) {
      rosterKey = key;
      slots.clear();
      eventInfo.clear();
      players.clear();
    }
  }

  // Departures are animated by the scene itself; they never steer a cat.
  function setEvents(list) {
    events = list.filter((e) => e.type !== "leave").sort((a, b) => a.at - b.at);
  }

  // ---------------------------------------------------------------- plans
  // Every cat's plan for slot `s` (memoised; only the last few slots are kept).
  function slot(s) {
    let plans = slots.get(s);
    if (!plans) {
      plans = computeSlot(s);
      slots.set(s, plans);
      if (slots.size > 12) slots.delete(slots.keys().next().value);
    }
    return plans;
  }

  function computeSlot(s) {
    const t0 = s * SLOT_MS;
    // Sorted, so every device considers the cats in the same order.
    const cats = roster.filter((c) => c.joinedAt <= t0).sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const plans = new Map();
    const free = [];
    // Spots already claimed this slot, so cats spread out instead of bunching
    // up (and leave the doorway clear for arrivals).
    const taken = [];
    const roomy = (p, d) =>
      taken.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= d) && Math.hypot(p.x - ARRIVAL.x, p.y - ARRIVAL.y) >= 60;
    const spaced = (next, d, margin) => {
      let p = randomFloorPoint(next, margin);
      for (let i = 0; i < 7 && !roomy(p, d); i++) p = randomFloorPoint(next, margin);
      taken.push(p);
      return p;
    };
    for (const cat of cats) {
      const m = wellbeing(cat.stats(t0));
      const block = Math.floor(s / 3);
      const napChance = m.energy < 25 ? 0.8 : m.energy < 45 ? 0.32 : 0.1;
      if (rand("nap", cat.id, block) < napChance) {
        const j = rng("napspot", cat.id, block);
        const spot = pick(NAP_SPOTS, j());
        const plan = {
          kind: "nap", x: spot.x + (j() - 0.5) * 30, y: spot.y + (j() - 0.5) * 10,
          facing: j() < 0.5 ? -1 : 1, delay: j() * 1500, phases: [[0, "sleep", "idle", "zzz"]],
        };
        plans.set(cat.id, plan);
        taken.push(plan);
        continue;
      }
      if (m.fullness < 25 && rand("beg", cat.id, s) < 0.75) {
        const j = rng("begspot", cat.id, s);
        const plan = {
          kind: "beg", x: FOOD.x + (j() - 0.5) * 50, y: FOOD.y + 12 + j() * 16,
          facing: 1, delay: j() * 1500, phases: [[0, "sit", "beg", "fish"]],
        };
        plans.set(cat.id, plan);
        taken.push(plan);
        continue;
      }
      free.push(cat);
    }

    const r = rng("pairs", s);
    const ids = shuffle(free.map((c) => c.id).sort(), r);
    for (let i = 0; i + 1 < ids.length; i += 2) {
      if (r() > 0.62) continue;
      const kind = pickWeighted([["boop", 3], ["groom", 2], ["chase", 2], ["play", 2], ["sit", 1.4]], r());
      const spot = kind === "sit" ? pick(WATCH_SPOTS, r()) : spaced(rng("meet", s, ids[i]), 95, 56);
      const delay = r() * 1200;
      for (const [role, self, partner] of [[0, ids[i], ids[i + 1]], [1, ids[i + 1], ids[i]]]) {
        const plan = socialPlan(kind, spot, role, partner, delay);
        if (plan.loop) plan.loop.start = t0 + LOOP_START;
        else Object.assign(plan, clampToFloor(plan));
        plans.set(self, plan);
      }
    }
    for (const cat of free) {
      if (!plans.has(cat.id)) plans.set(cat.id, soloPlan(cat, s, wellbeing(cat.stats(t0)), spaced));
    }
    return plans;
  }

  function socialPlan(kind, spot, role, partner, delay) {
    const k = depthScale(spot.y) / 0.6;
    const side = role === 0 ? -1 : 1;
    const base = { kind, partner, role, delay, social: true };
    switch (kind) {
      case "boop":
        return { ...base, x: spot.x + side * 31 * k, y: spot.y, facing: -side,
          phases: [[0, "walk", "boop", "heart"], [4300, "sit", "happy", null]] };
      case "groom":
        return { ...base, x: spot.x + side * 17 * k, y: spot.y, facing: role === 0 ? -1 : 1,
          phases: [[0, "sit", role === 0 ? "groom" : "happy", role === 0 ? null : "flower"]] };
      case "play":
        return { ...base, x: spot.x + side * 27 * k, y: spot.y, facing: -side,
          phases: [[0, "walk", "play", "note"], [5600, "sit", "happy", null]] };
      case "chase": {
        const phase = role === 1 ? 0 : -0.95;
        const loop = { cx: spot.x, cy: spot.y, rx: 44, ry: 19, w: 0.0019, phase, until: 7600 };
        return { ...base, x: spot.x + Math.cos(phase) * 44, y: spot.y + Math.sin(phase) * 19, run: true,
          loop, facing: 1, phases: [[0, "sit", "happy", null]] };
      }
      default:
        return { ...base, x: spot.x + side * 18 * k, y: spot.y + role * 5, facing: 1,
          phases: [[0, "sit", "idle", null]] };
    }
  }

  function soloPlan(cat, s, m, spaced) {
    const r = rng("solo", cat.id, s);
    const kind = pickWeighted([
      ["wander", 3], ["sit", 2],
      ["groom", m.cleanliness < 45 ? 4 : 1.6],
      ["loaf", m.energy < 50 ? 2 : 1],
      ["watch", 1.2],
      ["butterfly", m.happiness > 55 ? 1.3 : 0.6],
    ], r());
    const delay = r() * 1800;
    if (kind === "watch") {
      const spot = pick(WATCH_SPOTS, r());
      return { kind, x: spot.x + (r() - 0.5) * 26, y: spot.y + (r() - 0.5) * 16, facing: 1, delay,
        phases: [[0, "sit", "idle", null]] };
    }
    if (kind === "butterfly") {
      return { kind, delay, dynamic: true, until: 6500, facing: 1,
        phases: [[0, "sit", "happy", null]] };
    }
    const p = spaced(r, 55, 10);
    const idle = { groom: ["sit", "groom", null], loaf: ["sleep", "idle", null] }[kind] ?? ["sit", "idle", null];
    return { kind, x: p.x, y: p.y, facing: r() < 0.5 ? -1 : 1, delay, phases: [[0, ...idle]] };
  }

  function butterflyGround(t) {
    const b = butterflyAt(t, 0);
    return clampToFloor({ x: b.x, y: b.y + 18 });
  }

  function loopPoint(plan, t) {
    const { cx, cy, rx, ry, w, phase, start } = plan.loop;
    const a = phase + w * (t - start);
    return { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
  }

  // Where a cat is when slot s ends.
  function endOf(cat, s) {
    const plan = slot(s).get(cat.id);
    if (!plan) return ARRIVAL;
    const t0 = s * SLOT_MS;
    if (plan.loop) return loopPoint(plan, t0 + LOOP_START + plan.loop.until);
    if (plan.dynamic) return butterflyGround(t0 + plan.delay + plan.until);
    return { x: plan.x, y: plan.y };
  }

  function startOf(cat, s) {
    if (cat.joinedAt > (s - 1) * SLOT_MS) return ARRIVAL;
    return endOf(cat, s - 1);
  }

  function idleOf(plan, since) {
    const [, pose, act, emote] = phaseAt(plan.phases, since);
    return { pose, act, emote, facing: plan.facing };
  }

  // A cat's state from its slot plan alone (no guest actions).
  function baseState(cat, t) {
    const s = Math.floor(t / SLOT_MS);
    const plan = slot(s).get(cat.id);
    if (!plan) return { x: ARRIVAL.x, y: ARRIVAL.y, pose: "sit", act: "idle", facing: 1, emote: null };
    const t0 = s * SLOT_MS + plan.delay;
    const start = startOf(cat, s);

    if (t < t0) {
      const prev = slot(s - 1).get(cat.id);
      const idle = prev ? idleOf(prev, 1e9) : { pose: "sit", act: "idle", facing: 1, emote: null };
      return { x: start.x, y: start.y, ...idle, emote: idle.emote === "heart" ? null : idle.emote };
    }

    if (plan.dynamic) {
      const target0 = butterflyGround(t0);
      const end = t0 + plan.until;
      const tt = Math.min(t, end);
      const target = butterflyGround(tt);
      const f = Math.min(1, ((tt - t0) * RUN) / Math.max(1, dist(start, target0)));
      const x = lerp(start.x, target.x, f);
      const y = lerp(start.y, target.y, f);
      if (t < end) return { x, y, pose: "walk", act: "idle", facing: target.x >= x ? 1 : -1, emote: t - t0 < 1600 ? "exclaim" : null, run: true };
      return { x, y, ...idleOf(plan, t - end), facing: 1 };
    }

    const target = { x: plan.x, y: plan.y };
    const dur = dist(start, target) / (plan.run ? RUN : WALK);
    if (t < t0 + dur) {
      const u = ease((t - t0) / dur);
      return {
        x: lerp(start.x, target.x, u), y: lerp(start.y, target.y, u),
        pose: "walk", act: "idle", facing: target.x >= start.x ? 1 : -1, emote: null, run: plan.run,
      };
    }

    if (plan.loop) {
      const loopStart = s * SLOT_MS + LOOP_START;
      const loopEnd = loopStart + plan.loop.until;
      if (t < loopStart) return { ...target, pose: "walk", act: "play", facing: plan.role === 0 ? 1 : -1, emote: "exclaim" };
      if (t < loopEnd) return { ...loopPoint(plan, t), pose: "walk", act: "idle", facing: 1, emote: null, run: true };
      return { ...loopPoint(plan, loopEnd), ...idleOf(plan, t - loopEnd) };
    }

    const since = t - (t0 + dur);
    const idle = idleOf(plan, since);
    return { ...target, ...idle, emote: idle.emote === "heart" && since > 3200 ? null : idle.emote };
  }

  // ---------------------------------------------------------------- guest actions
  function playersOf(ev) {
    let list = players.get(ev.id);
    if (list) return list;
    const land = clampToFloor({ x: ev.x ?? 200, y: ev.y ?? 560 });
    const others = roster
      .filter((c) => c.id !== ev.catId && c.joinedAt <= ev.at)
      .map((c) => ({ id: c.id, p: stateAt(c.id, ev.at - 1) }))
      .filter((o) => !o.p.busy && dist(o.p, land) < 190)
      .sort((a, b) => dist(a.p, land) - dist(b.p, land))
      .slice(0, 2)
      .map((o) => o.id);
    list = byId.has(ev.catId) ? [ev.catId, ...others] : others;
    players.set(ev.id, list);
    return list;
  }

  function involves(ev, catId) {
    if (ev.catId === catId) return true;
    return ev.type === "play" && playersOf(ev).includes(catId);
  }

  function infoFor(ev, cat) {
    const key = `${ev.id}|${cat.id}`;
    let info = eventInfo.get(key);
    if (info) return info;
    const from = ev.type === "arrive" ? ENTRANCE : stateAt(cat.id, ev.at - 1);
    let spot = from;
    if (ev.type === "arrive") {
      const j = rng("arrive", ev.id);
      spot = { x: ARRIVAL.x + (j() - 0.5) * 60, y: ARRIVAL.y + j() * 20 };
    } else if (ev.type === "feed") {
      spot = bowlSpot(hashString(cat.id));
      spot = { x: spot.x, y: spot.y - 2 };
    } else if (ev.type === "nap") {
      spot = NAP_SPOTS.reduce((best, p) => (dist(from, p) < dist(from, best) ? p : best), NAP_SPOTS[0]);
      spot = { x: spot.x + (rand("napj", ev.id) - 0.5) * 24, y: spot.y };
    }
    info = { from, spot, dur: eventDuration(ev, from, spot), role: ev.type === "play" ? playersOf(ev).indexOf(cat.id) : 0 };
    eventInfo.set(key, info);
    if (eventInfo.size > 400) eventInfo.delete(eventInfo.keys().next().value);
    return info;
  }

  function walkTo(from, spot, t, start, speed) {
    const dur = dist(from, spot) / speed;
    if (t - start < dur) {
      const u = ease((t - start) / dur);
      return { x: lerp(from.x, spot.x, u), y: lerp(from.y, spot.y, u), walking: true, facing: spot.x >= from.x ? 1 : -1 };
    }
    return { x: spot.x, y: spot.y, walking: false };
  }

  function overrideState(ev, info, t) {
    const { from, spot } = info;
    const busy = { busy: true, ev: ev.id };
    switch (ev.type) {
      case "arrive":
      case "feed":
      case "nap": {
        const speed = ev.type === "feed" ? WALK * 1.4 : WALK;
        const w = walkTo(from, spot, t, ev.at, speed);
        if (w.walking) return { ...w, ...busy, pose: "walk", act: "idle", emote: ev.type === "feed" ? "fish" : null };
        if (ev.type === "feed") return { ...w, ...busy, pose: "sit", act: "eat", facing: 1, emote: null };
        if (ev.type === "nap") return { ...w, ...busy, pose: "sleep", act: "idle", facing: from.x < spot.x ? 1 : -1, emote: "zzz" };
        return { ...w, ...busy, pose: "sit", act: "happy", facing: 1, emote: "flower" };
      }
      case "brush":
        return { x: from.x, y: from.y, ...busy, pose: "sit", act: "happy", facing: from.facing ?? 1, emote: "sparkle" };
      case "pet":
        return { x: from.x, y: from.y, ...busy, pose: "sit", act: "happy", facing: from.facing ?? 1, emote: "heart" };
      case "treat":
        return { x: from.x, y: from.y, ...busy, pose: "sit", act: "happy", facing: from.facing ?? 1, emote: "fish" };
      case "play": {
        const toy = toyAt(ev, t);
        const angle = (info.role - 1) * 2.1 + 1.57;
        const target = clampToFloor({ x: toy.x + Math.cos(angle) * 26, y: toy.y + Math.sin(angle) * 11 });
        const startAt = ev.at + 250;
        if (t < startAt) return { x: from.x, y: from.y, ...busy, pose: "sit", act: "idle", facing: toy.x >= from.x ? 1 : -1, emote: "exclaim" };
        const firstTarget = clampToFloor({ x: (ev.x ?? 200) + Math.cos(angle) * 26, y: (ev.y ?? 560) + Math.sin(angle) * 11 });
        const f = Math.min(1, ((t - startAt) * RUN) / Math.max(1, dist(from, firstTarget)));
        const x = lerp(from.x, target.x, f);
        const y = lerp(from.y, target.y, f);
        const facing = toy.x >= x ? 1 : -1;
        if (f < 1) return { x, y, ...busy, pose: "walk", act: "idle", facing, emote: null, run: true };
        return { x, y, ...busy, pose: "walk", act: "play", facing, emote: "note" };
      }
      default:
        return null;
    }
  }

  // The toy a guest tossed for a play event: thrown in from the bottom edge,
  // then it rolls around while the cats chase it.
  function toyAt(ev, t) {
    const tau = t - ev.at;
    const land = clampToFloor({ x: ev.x ?? 200, y: ev.y ?? 560 });
    if (tau < 650) {
      const u = tau / 650;
      return { x: lerp(200, land.x, u), y: lerp(740, land.y, u), lift: Math.sin(Math.PI * u) * 90, spin: u * 540 };
    }
    const k = Math.min(1, (tau - 650) / 1400);
    const h = hashString(ev.id);
    const p = clampToFloor({
      x: land.x + Math.sin((tau - 650) * 0.0011 + (h % 7)) * 38 * k,
      y: land.y + Math.sin((tau - 650) * 0.0017 + (h % 5)) * 15 * k,
    });
    return { ...p, lift: 0, spin: 540 + (tau - 650) * 0.25 };
  }

  // ---------------------------------------------------------------- public
  function stateAt(catId, t) {
    const cat = byId.get(catId);
    if (!cat) return { x: ARRIVAL.x, y: ARRIVAL.y, pose: "sit", act: "idle", facing: 1, emote: null };
    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i];
      if (ev.at > t) continue;
      if (t - ev.at > 60000) break;
      if (!involves(ev, catId)) continue;
      const info = infoFor(ev, cat);
      if (t < ev.at + info.dur) {
        const state = overrideState(ev, info, t);
        if (state) return state;
      }
    }
    return baseState(cat, t);
  }

  // Toys and food bowls currently on the ground.
  function propsAt(t) {
    const out = [];
    for (let i = events.length - 1; i >= 0; i--) {
      const ev = events[i];
      if (t - ev.at > 60000) break;
      if (ev.at > t) continue;
      if (ev.type === "play" && t - ev.at < 9000) {
        out.push({ id: ev.id, kind: "toy", fade: Math.min(1, (9000 - (t - ev.at)) / 600), ...toyAt(ev, t) });
      }
      if (ev.type === "feed" && byId.has(ev.catId)) {
        const info = infoFor(ev, byId.get(ev.catId));
        const left = ev.at + info.dur - t;
        if (left > -400) {
          const spot = bowlSpot(hashString(ev.catId));
          out.push({ id: ev.id, kind: "bowl", x: spot.x, y: spot.y + 1, fade: Math.max(0, Math.min(1, (left + 400) / 600)) });
        }
      }
    }
    return out;
  }

  // Friendly moments between cats in (from, to], for the activity feed.
  function socialBetween(from, to) {
    const out = [];
    for (let s = Math.floor(from / SLOT_MS); s <= Math.floor(to / SLOT_MS); s++) {
      const at = s * SLOT_MS + 3800;
      if (at <= from || at > to) continue;
      for (const [id, plan] of slot(s)) {
        if (!plan.social || plan.role !== 0 || plan.kind === "sit") continue;
        out.push({ id: `soc:${s}:${id}`, type: "social", what: plan.kind, at, a: id, b: plan.partner });
      }
    }
    return out;
  }

  return { setRoster, setEvents, stateAt, propsAt, socialBetween };
}
