import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HotelScene from "../scene/HotelScene";
import { CatPill, Diary, DoorReveal, Dock, Presence, Sheet, StatsPopover, TopBar } from "./HotelParts";
import { ACTION_ICON } from "./actions";
import { LanternIcon, ScrollIcon } from "../ui/icons";
import { now, useHotel } from "../../hooks/useHotel";
import { decay } from "../../game/care";
import { residentStats } from "../../game/residents";
import { hashString } from "../../game/rng";
import { bowlSpot, clampToFloor, depthScale } from "../../game/world";
import "./Hotel.css";

// The hotel screen: the shared courtyard filling the screen, with the quiet
// interface around it. It wires the hotel's state (useHotel) to the scene and
// turns button presses into actions, flights and gentle nudges.

// Some breeds are simply bigger.
const SIZE = { nfc: 1.12, mike: 0.94, siamese: 0.96 };

// The icon you pressed floats over to the cat it's for, so cause and effect
// are obvious without a word of text. It follows a curved path (a quadratic
// Bézier sampled into keyframes) and fades as it lands.
function Flight({ flight, onDone }) {
  const ref = useRef(null);
  useEffect(() => {
    const { x0, y0, x1, y1 } = flight;
    const cx = (x0 + x1) / 2;
    const cy = Math.min(y0, y1) - 90;
    const frames = [];
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const u = 1 - t;
      const x = u * u * x0 + 2 * u * t * cx + t * t * x1 - x0;
      const y = u * u * y0 + 2 * u * t * cy + t * t * y1 - y0;
      frames.push({ transform: `translate(${x}px, ${y}px) scale(${1 - t * 0.35})`, opacity: t > 0.85 ? (1 - t) / 0.15 : 1 });
    }
    const anim = ref.current.animate(frames, { duration: 760, easing: "cubic-bezier(0.4, 0, 0.2, 1)" });
    anim.onfinish = () => onDone(flight.id);
    return () => anim.cancel();
  }, [flight, onDone]);
  const Icon = ACTION_ICON[flight.kind];
  return (
    <div className="flight" ref={ref} style={{ left: flight.x0, top: flight.y0 }} aria-hidden="true">
      <Icon size={30} />
    </div>
  );
}

export default function HotelScreen({ profile, hotelId, withResidents, night, onToggleTheme, onCheckout, onStatsChange }) {
  const hotel = useHotel({ profile, hotelId, withResidents, onStatsChange });
  const [selectedId, setSelectedId] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [revealing, setRevealing] = useState(Boolean(profile.arriving));
  const [flights, setFlights] = useState([]);
  const [shake, setShake] = useState(null);
  const sceneApi = useRef(null);
  const catCache = useRef(new Map());

  // Cats for the courtyard, reusing objects so unchanged cats never re-render
  // (the cache is read during render on purpose: it only hands back objects
  // that are identical anyway). `stats` is a function of time so the
  // simulation can ask how hungry or sleepy a cat is at any moment.
  const cats = useMemo(() => {
    const next = new Map();
    const list = [];
    for (const g of hotel.guests) {
      if (!g.online) continue;
      const scruffy = !g.resident && decay(g.stats, now()).cleanliness < 22;
      const prev = catCache.current.get(g.id);
      const same = prev && prev.look === g.cat.look && prev.name === g.cat.name && prev.statsRef === g.stats && prev.scruffy === scruffy;
      const cat = same
        ? prev
        : {
            id: g.id,
            name: g.cat.name,
            breed: g.cat.breed,
            look: g.cat.look,
            size: SIZE[g.cat.breed] ?? 1,
            joinedAt: g.joinedAt ?? 0,
            statsRef: g.stats,
            scruffy,
            stats: g.resident ? (t) => residentStats(g.id, t) : (t) => decay(g.stats, t),
          };
      next.set(g.id, cat);
      list.push(cat);
    }
    catCache.current = next;
    return list;
  }, [hotel.guests]);

  // Guest id -> the cat that represents them, for the diary.
  const catsById = useMemo(() => new Map(hotel.guests.map((g) => [g.id, { name: g.cat.name, look: g.cat.look }])), [hotel.guests]);
  const me = hotel.guests[0];

  // Screen position of a cat's head (or any world point), for flights.
  const screenPoint = useCallback((catId, world) => {
    const api = sceneApi.current;
    if (!api) return null;
    if (world) return api.toScreen(world.x, world.y);
    const p = api.positionOf(catId);
    if (!p) return null;
    return api.toScreen(p.x, p.y - 70 * depthScale(p.y));
  }, []);

  const fly = useCallback(
    (kind, fromEl, catId, world) => {
      const to = screenPoint(catId, world);
      if (!fromEl || !to) return;
      const r = fromEl.getBoundingClientRect();
      const flight = { id: `${kind}-${performance.now()}`, kind, x0: r.left + r.width / 2 - 15, y0: r.top + r.height / 2 - 15, x1: to.x - 15, y1: to.y - 15 };
      setFlights((list) => [...list, flight]);
    },
    [screenPoint],
  );
  const landed = useCallback((id) => setFlights((list) => list.filter((f) => f.id !== id)), []);

  // A dock button: look after your own cat.
  const act = hotel.act;
  const onAction = useCallback(
    (type, el) => {
      setSelectedId(null);
      if (type === "play") {
        // Toss the yarn ball a little to the side of your cat, on the floor.
        const p = sceneApi.current?.positionOf(profile.id) ?? { x: 200, y: 560 };
        return act("play", clampToFloor({ x: p.x + (p.x > 200 ? -64 : 64), y: p.y + 18 }));
      }
      const result = act(type);
      if (result.ok) {
        // Food flies to the cat's bowl, everything else to the cat itself.
        const world = type === "feed" ? bowlSpot(hashString(profile.id)) : null;
        fly(type, el, profile.id, world);
      } else if (result.reason === "too_tired") {
        // Too sleepy to play: nudge toward the nap button instead of saying so.
        setShake("nap");
        setTimeout(() => setShake(null), 900);
      }
      return result;
    },
    [act, fly, profile.id],
  );

  // The pill on someone else's cat: pet it or give it a treat.
  const onCatAction = useCallback(
    (type, catId, el) => {
      const result = act(type, { catId });
      if (result.ok) fly(type, el, catId);
      return result;
    },
    [act, fly],
  );

  // Tapping the garden tosses a yarn ball there.
  const onFloorTap = useCallback(
    (point) => {
      setSelectedId(null);
      act("play", point);
    },
    [act],
  );

  const toggleMe = () => setSelectedId((id) => (id === profile.id ? null : profile.id));
  const closeSheet = useCallback(() => setSheet(null), []);

  const selectedCat = cats.find((c) => c.id === selectedId);
  const showStats = selectedId === profile.id;

  return (
    <div className="hotel">
      <div className="hotel-main">
        <div className="stage">
          <HotelScene
            cats={cats}
            events={hotel.events}
            meId={profile.id}
            selectedId={selectedId}
            now={now}
            night={night}
            onSelectCat={setSelectedId}
            onFloorTap={onFloorTap}
            onSocial={hotel.addMoments}
            apiRef={sceneApi}
          />
          <TopBar guests={hotel.guests} night={night} onPresence={() => setSheet("presence")} onDiary={() => setSheet("diary")} onTheme={onToggleTheme} />
          {showStats && <StatsPopover cat={me.cat} stats={hotel.stats} night={night} />}
          {!showStats && selectedCat && <CatPill key={selectedCat.id} cat={selectedCat} night={night} onAction={onCatAction} />}
        </div>
        <Dock cat={me.cat} stats={hotel.stats} night={night} meOpen={showStats} onMe={toggleMe} onAction={onAction} shake={shake} />
      </div>

      <Sheet open={sheet === "presence"} label="Cats here" icon={<LanternIcon size={26} />} onClose={closeSheet} extra={<span className={`net-dot net-dot--${hotel.status}`} aria-label={hotel.status} />}>
        <Presence
          guests={hotel.guests}
          night={night}
          onPick={(id) => {
            setSelectedId(id);
            setSheet(null);
          }}
          onCheckout={() => {
            hotel.checkout();
            onCheckout();
          }}
        />
      </Sheet>
      <Sheet open={sheet === "diary"} label="Courtyard diary" icon={<ScrollIcon size={26} />} onClose={closeSheet}>
        <Diary feed={hotel.feed} cats={catsById} night={night} />
      </Sheet>

      {flights.map((f) => (
        <Flight key={f.id} flight={f} onDone={landed} />
      ))}
      {revealing && <DoorReveal onDone={() => setRevealing(false)} />}
    </div>
  );
}
