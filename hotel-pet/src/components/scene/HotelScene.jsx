import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Cat from "../cat/Cat";
import { Butterfly, Courtyard, Fireflies, Foreground, Koi, Petals } from "./Backdrop";
import { POSE_HEIGHT, PROP_SVG, icon, replay, spawnForTransition, spawnName, spawnRipple, spawnStroke } from "./effects";
import { createSim } from "../../game/sim";
import { ENTRANCE, WORLD, butterflyAt, depthScale, isWalkable } from "../../game/world";
import { hashString } from "../../game/rng";
import "./Scene.css";

function Actor({ cat, isMe, onSelect, register, night }) {
  const h = hashString(cat.id);
  const style = {
    "--blink-delay": `${-(h % 5000) / 1000}s`,
    "--ear-delay": `${-(h % 7000) / 1000}s`,
    "--idle-delay": `${-(h % 9000) / 1000}s`,
  };
  return (
    <div className="actor" ref={(el) => register(cat.id, el)} data-cat={cat.id} data-pose="sit" data-act="idle" style={style}>
      <div className="actor-scale">
        <div className="actor-ring" />
        <div className="actor-flip">
          <div className="actor-art">
            <Cat look={cat.look} scruffy={cat.scruffy} night={night} />
          </div>
        </div>
        <button
          type="button"
          className="actor-hit"
          aria-label={isMe ? `${cat.name}, your cat` : cat.name}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(cat.id);
          }}
        />
      </div>
    </div>
  );
}

const MemoActor = memo(Actor);

// Name tag and mood bubble. They live in their own layer above every cat, so
// a cat walking in front never hides whose cat is whose.
function Label({ cat, isMe, register }) {
  return (
    <div className="label" ref={(el) => register(cat.id, el)}>
      <div className="actor-emote" data-emote="">
        <div className="emote-bubble" />
      </div>
      <div className={`actor-tag ${isMe ? "actor-tag--me" : ""}`}>{cat.name}</div>
    </div>
  );
}

const MemoLabel = memo(Label);

/**
 * The shared courtyard. `cats` are everyone's cats; `events` are guest actions
 * (from the network and from resident guests). Each frame the simulation says
 * where every cat should be, and the DOM is updated directly so React never
 * re-renders mid-animation.
 */
export default function HotelScene({ cats, events, meId, selectedId, now, night, onSelectCat, onFloorTap, onSocial, apiRef }) {
  const sceneRef = useRef(null);
  const worldRef = useRef(null);
  const propsRef = useRef(null);
  const fxRef = useRef(null);
  const norenRef = useRef(null);
  const butterflyRef = useRef(null);
  const actors = useRef(new Map());
  const labels = useRef(new Map());
  const states = useRef(new Map());
  // One simulation for the life of the courtyard.
  const [sim] = useState(createSim);
  // The latest props for the animation loop, which is set up only once.
  const latest = useRef({});
  useLayoutEffect(() => {
    latest.current = { events, now, onSocial, meId, selectedId };
  });

  const [departing, setDeparting] = useState([]);
  const prevCats = useRef(cats);

  // Keep cats that just left on screen long enough to walk out the door.
  useEffect(() => {
    const ids = new Set(cats.map((c) => c.id));
    const gone = prevCats.current.filter((c) => !ids.has(c.id));
    prevCats.current = cats;
    if (gone.length) {
      const leftAt = now();
      setDeparting((list) => [...list.filter((d) => !ids.has(d.id)), ...gone.map((c) => ({ ...c, leftAt }))]);
      setTimeout(() => {
        setDeparting((list) => list.filter((d) => d.leftAt !== leftAt));
      }, 5200);
    } else {
      setDeparting((list) => (list.some((d) => ids.has(d.id)) ? list.filter((d) => !ids.has(d.id)) : list));
    }
  }, [cats, now]);

  useEffect(() => {
    sim.setRoster(cats.map((c) => ({ id: c.id, joinedAt: c.joinedAt, stats: c.stats })));
  }, [sim, cats]);

  useEffect(() => {
    sim.setEvents(events);
  }, [sim, events]);

  useEffect(() => {
    if (!apiRef) return undefined;
    apiRef.current = {
      positionOf: (id) => states.current.get(id) ?? null,
      // World point -> screen point, for effects that fly in from the UI.
      toScreen: (x, y) => {
        const rect = worldRef.current.getBoundingClientRect();
        const k = rect.width / WORLD.width;
        return { x: rect.left + x * k, y: rect.top + y * k, k };
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef]);

  // Dev only: window.__neko.stateAt(catId, time) to check that two devices agree.
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__neko = { stateAt: (id, t) => sim.stateAt(id, t), ids: () => [...actors.current.keys()] };
    return () => {
      delete window.__neko;
    };
  }, [sim]);

  const register = useCallback((id, el) => {
    if (!el) {
      actors.current.delete(id);
      return;
    }
    actors.current.set(id, {
      el,
      scale: el.querySelector(".actor-scale"),
      flip: el.querySelector(".actor-flip"),
    });
  }, []);

  const registerLabel = useCallback((id, el) => {
    if (!el) {
      labels.current.delete(id);
      return;
    }
    // Labels stack by depth like the cats, except yours, which is always on top.
    const boost = el.parentElement?.classList.contains("is-me") ? 1000 : 0;
    labels.current.set(id, {
      el,
      emote: el.querySelector(".actor-emote"),
      bubble: el.querySelector(".emote-bubble"),
      tag: el.querySelector(".actor-tag"),
      boost,
      shown: true,
    });
  }, []);

  // Fit the world into the scene: cover, anchored to the bottom so the garden
  // is always visible. Showing about 340 of the 400 units across brings the
  // cats close; on wider screens more width is shown instead, so the sky is
  // never cropped past the sun.
  useLayoutEffect(() => {
    const scene = sceneRef.current;
    const world = worldRef.current;
    const fit = () => {
      const w = scene.clientWidth;
      const h = scene.clientHeight;
      const close = Math.min(w / (WORLD.width - 60), h / (WORLD.height - 70));
      const k = Math.max(w / WORLD.width, h / WORLD.height, close);
      world.style.transform = `translate(${(w - WORLD.width * k) / 2}px, ${h - WORLD.height * k}px) scale(${k})`;
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(scene);
    return () => ro.disconnect();
  }, []);

  // The animation loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let lastSocial = latest.current.now();
    let lastSeen = lastSocial;
    let frame = 0;
    const props = new Map();

    // When cats bunch up, show only the name tags that fit: yours first, then
    // the selected cat, then cats nearer the front. The rest fade out.
    const layoutTags = (selected) => {
      const items = [];
      for (const [id, label] of labels.current) {
        const st = states.current.get(id);
        if (!st || !label.tag) continue;
        label.width ??= label.tag.offsetWidth;
        items.push({ label, x: st.x, y: st.y, w: label.width, rank: label.boost ? 2 : id === selected ? 1 : 0 });
      }
      items.sort((a, b) => b.rank - a.rank || b.y - a.y);
      const placed = [];
      for (const it of items) {
        const clash = placed.some((p) => Math.abs(p.x - it.x) < (p.w + it.w) / 2 + 3 && Math.abs(p.y - it.y) < 14);
        if (!clash) placed.push(it);
        if (it.label.shown === clash) {
          it.label.shown = !clash;
          it.label.tag.classList.toggle("is-hidden", clash);
        }
      }
    };

    const tick = (frameTime) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (frameTime - last) / 1000);
      last = frameTime;
      const { now: clock, events: evs, onSocial: social, meId: me, selectedId: selected } = latest.current;
      const t = clock();
      const fx = fxRef.current;

      // Moments that deserve a cue in the courtyard itself.
      for (const ev of evs) {
        if (ev.at <= lastSeen || ev.at > t) continue;
        if (ev.type === "arrive") {
          replay(norenRef.current, "flap");
          // Everyone else sees the new cat's name at the door for a moment.
          if (ev.by !== me) spawnName(fx, ENTRANCE.x, ENTRANCE.y - 8, ev.catName, "arrive");
        }
        const target = states.current.get(ev.catId);
        if (!target) continue;
        const s = depthScale(target.y);
        if (ev.type === "pet") spawnStroke(fx, "hand", target.x, target.y - (POSE_HEIGHT.sit - 24) * s);
        if (ev.type === "brush") spawnStroke(fx, "comb", target.x, target.y - 52 * s);
        if (ev.catId === me) {
          replay(actors.current.get(me)?.el, "glow");
          // Someone was kind to your cat: their cat's name floats above yours.
          if (ev.by !== me && (ev.type === "pet" || ev.type === "treat")) {
            spawnName(fx, target.x, target.y - POSE_HEIGHT.sit * s - 26, ev.byCat, ev.type);
          }
        }
      }
      lastSeen = t;

      for (const [id, actor] of actors.current) {
        const { el } = actor;
        const leaving = Boolean(el.dataset.leaving);
        let st = states.current.get(id);
        let target;
        if (leaving) {
          const from = st ?? ENTRANCE;
          target = { x: ENTRANCE.x, y: ENTRANCE.y + 4, pose: "walk", act: "idle", facing: from.x > ENTRANCE.x ? -1 : 1, emote: null };
        } else {
          target = sim.stateAt(id, t);
        }
        const fresh = !st;
        if (!st) {
          // null fields force every attribute to be written on the first frame.
          st = { x: target.x, y: target.y, vx: 0, pose: null, act: null, facing: 0, emote: null, gait: null, opacity: 1 };
          states.current.set(id, st);
        }
        const label = labels.current.get(id);
        if (!leaving && st.opacity < 1) {
          st.opacity = 1;
          el.style.opacity = "";
          if (label) label.el.style.opacity = "";
        }
        if (st.el !== el || st.labelEl !== label?.el) {
          // A fresh element (e.g. after a rejoin) needs every style rewritten.
          st.el = el;
          st.labelEl = label?.el;
          st.move = st.scale = st.lift = st.z = null;
          st.pose = st.act = st.gait = st.emote = null;
          st.facing = 0;
        }

        // Follow the simulated position, but never faster than a trot, so any
        // jump (a late join, an action ending) becomes a short, smooth run.
        const dx = target.x - st.x;
        const dy = target.y - st.y;
        const d = Math.hypot(dx, dy);
        const maxStep = (leaving ? 46 : 105) * dt;
        let speed = 0;
        if (d > 0.01) {
          const step = Math.min(d, maxStep);
          st.x += (dx / d) * step;
          st.y += (dy / d) * step;
          speed = step / Math.max(dt, 0.001);
          if (Math.abs(dx) > 0.3) st.vx = dx;
        }
        const moving = speed > 7 || (target.pose === "walk" && target.act === "idle" && d > 0.5);
        const next = {
          pose: moving ? "walk" : target.pose,
          act: moving ? "idle" : target.act,
          gait: moving && (target.run || speed > 75) ? "run" : "walk",
          facing: moving ? (st.vx >= 0 ? 1 : -1) : target.facing || st.facing || 1,
          emote: moving && !target.emote ? "" : target.emote || "",
        };

        if (!fresh && (next.emote !== st.emote || next.act !== st.act)) {
          spawnForTransition(fx, st, next, st.x, st.y, id === me);
        }
        if (next.pose !== st.pose) el.dataset.pose = next.pose;
        if (next.act !== st.act) el.dataset.act = next.act;
        if (next.gait !== st.gait) el.dataset.gait = next.gait;
        if (next.emote !== st.emote && label) {
          label.emote.dataset.emote = next.emote;
          // Keep the old icon while an emptied bubble fades out.
          if (next.emote) label.bubble.innerHTML = icon(next.emote);
        }
        if (next.facing !== st.facing) actor.flip.style.transform = `scaleX(${next.facing})`;
        Object.assign(st, next);

        // Only touch the DOM when something visibly changed.
        const s = depthScale(st.y) * Number(el.dataset.size || 1);
        const move = `translate3d(${st.x.toFixed(1)}px, ${st.y.toFixed(1)}px, 0)`;
        const scale = `scale(${s.toFixed(3)})`;
        const lift = `translate3d(0, ${(-(POSE_HEIGHT[st.pose] ?? 110) * s - 4).toFixed(0)}px, 0)`;
        const z = 100 + Math.round(st.y);
        if (move !== st.move) {
          el.style.transform = st.move = move;
          if (label) label.el.style.transform = move;
        }
        if (scale !== st.scale) actor.scale.style.transform = st.scale = scale;
        if (lift !== st.lift && label) label.emote.style.transform = st.lift = lift;
        if (z !== st.z) {
          el.style.zIndex = String((st.z = z));
          if (label) label.el.style.zIndex = String(z + label.boost);
        }
        if (leaving && d < 10) {
          st.opacity = Math.max(0, st.opacity - dt * 2.4);
          el.style.opacity = st.opacity.toFixed(2);
          if (label) label.el.style.opacity = el.style.opacity;
        }
      }

      // Bowls and toys.
      const live = new Set();
      for (const p of sim.propsAt(t)) {
        live.add(p.id);
        let node = props.get(p.id);
        if (!node) {
          node = document.createElement("div");
          node.className = `prop prop--${p.kind}`;
          node.innerHTML = PROP_SVG[p.kind];
          propsRef.current.appendChild(node);
          props.set(p.id, node);
        }
        const s = depthScale(p.y) * 1.25;
        node.style.transform = `translate3d(${p.x.toFixed(1)}px, ${(p.y - (p.lift ?? 0)).toFixed(1)}px, 0) scale(${s.toFixed(3)})`;
        node.style.zIndex = String(102 + Math.round(p.y));
        node.style.opacity = String(p.fade ?? 1);
        if (p.kind === "toy") node.firstChild.style.transform = `rotate(${Math.round(p.spin ?? 0)}deg)`;
      }
      for (const [id, node] of props) {
        if (!live.has(id)) {
          node.remove();
          props.delete(id);
        }
      }

      if ((frame++ & 3) === 0) layoutTags(selected);

      if (butterflyRef.current) {
        const b = butterflyAt(t, 0);
        butterflyRef.current.style.transform = `translate3d(${b.x.toFixed(1)}px, ${(b.y - b.lift - 30).toFixed(1)}px, 0)`;
      }

      // Report friendly cat moments to the diary about once a second.
      if (t - lastSocial > 1000) {
        const moments = sim.socialBetween(lastSocial, t);
        lastSocial = t;
        if (moments.length) social?.(moments);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sim]);

  const handleClick = (e) => {
    const rect = worldRef.current.getBoundingClientRect();
    const k = rect.width / WORLD.width;
    const x = (e.clientX - rect.left) / k;
    const y = (e.clientY - rect.top) / k;
    if (onFloorTap && isWalkable(x, y)) {
      spawnRipple(fxRef.current, x, y);
      onFloorTap({ x, y });
    } else {
      onSelectCat?.(null);
    }
  };

  const everyone = [...cats, ...departing.filter((d) => !cats.some((c) => c.id === d.id))];

  return (
    <div className="scene" ref={sceneRef} onClick={handleClick}>
      <div className="world" ref={worldRef}>
        <Courtyard night={night} norenRef={norenRef} />
        <div className="scene-vignette" />
        <Koi night={night} />
        <div className="actors">
          {everyone.map((cat) => (
            <ActorSlot
              key={cat.id}
              cat={cat}
              isMe={cat.id === meId}
              selected={cat.id === selectedId}
              leftAt={cat.leftAt}
              night={night}
              onSelect={onSelectCat}
              register={register}
            />
          ))}
          <div className="props" ref={propsRef} />
        </div>
        <Butterfly innerRef={butterflyRef} night={night} />
        <Foreground night={night} />
        {night && <Fireflies />}
        <div className="labels">
          {everyone.map((cat) => (
            <div
              key={cat.id}
              className={`label-slot${cat.id === selectedId ? " is-selected" : ""}${cat.id === meId ? " is-me" : ""}`}
            >
              <MemoLabel cat={cat} isMe={cat.id === meId} register={registerLabel} />
            </div>
          ))}
        </div>
        <Petals night={night} />
        <div className="fx" ref={fxRef} />
      </div>
    </div>
  );
}

function ActorSlot({ cat, isMe, selected, leftAt, night, onSelect, register }) {
  const size = cat.size ?? 1;
  const reg = useCallback(
    (id, el) => {
      register(id, el);
      if (el) {
        el.dataset.size = String(size);
        if (leftAt) el.dataset.leaving = String(leftAt);
        else delete el.dataset.leaving;
      }
    },
    [register, size, leftAt],
  );
  return (
    <div className={`actor-slot${selected ? " is-selected" : ""}${isMe ? " is-me" : ""}`}>
      <MemoActor cat={cat} isMe={isMe} onSelect={onSelect} register={reg} night={night} />
    </div>
  );
}
