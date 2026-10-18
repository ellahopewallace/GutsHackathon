import { useEffect, useRef, useState } from "react";
import Cat from "./cat/Cat";
import { Brand, FacesPill, ThemeButton } from "./ui/common";
import { ArrowIcon, DiceIcon, PencilIcon } from "./ui/icons";
import { ACCESSORIES, BREEDS, CAT_NAMES, COATS, EYES, FURS, PATTERNS, WHITES, breedById, defaultCat } from "../data/cats";
import { residentsAt } from "../game/residents";
import { connectHotel, ONLINE_MS } from "../net/hotelNet";
import { loadLast } from "../lib/session";
import "./CatPicker.css";

// Choosing a cat is the whole check-in: pick one, adjust its look, give it a
// name, and walk in. The cat is the traveller's only identity in the hotel,
// so there is nothing else to fill in.

const LINE = "#545a94";

// ---- option swatches: each option is drawn as the thing itself, so no labels are needed ----

function PatternSwatch({ id, look }) {
  const { coat, mark } = look;
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <clipPath id={`pat-${id}`}>
          <circle cx="16" cy="16" r="13" />
        </clipPath>
        <radialGradient id={`pt-${id}`} cx="0.5" cy="0.35" r="0.75">
          <stop offset="0.35" stopColor={coat} />
          <stop offset="1" stopColor={mark} />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill={id === "points" ? `url(#pt-${id})` : id === "patches" ? "#f8f5f3" : coat} />
      <g clipPath={`url(#pat-${id})`}>
        {id === "tabby" && <path d="M 5 10 Q 11 13 9 20 M 13 6 Q 18 12 15 24 M 21 7 Q 26 13 23 22" stroke={mark} strokeWidth="2.6" fill="none" strokeLinecap="round" />}
        {id === "patches" && (
          <>
            <path d="M 3 8 C 10 4 16 10 13 16 C 10 21 4 18 3 8 Z" fill="#e4b590" />
            <path d="M 19 18 C 25 15 31 20 28 27 C 23 30 17 25 19 18 Z" fill="#4a4550" />
          </>
        )}
      </g>
      <circle cx="16" cy="16" r="13" fill="none" stroke={LINE} strokeWidth="1" />
    </svg>
  );
}

function WhiteSwatch({ id, look }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <clipPath id={`wh-${id}`}>
          <circle cx="16" cy="16" r="13" />
        </clipPath>
      </defs>
      <circle cx="16" cy="16" r="13" fill={look.coat} />
      <g clipPath={`url(#wh-${id})`} fill="#f8f5f3">
        {id === "bib" && <path d="M 9 30 C 9 22 12 17 16 17 C 20 17 23 22 23 30 Z" />}
        {id === "lots" && <path d="M 2 30 L 2 21 C 8 21 12 15 16 7 C 20 15 24 21 30 21 L 30 30 Z" />}
      </g>
      <circle cx="16" cy="16" r="13" fill="none" stroke={LINE} strokeWidth="1" />
    </svg>
  );
}

function FurSwatch({ id, look }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {id === "short" ? (
        <path d="M 9 27 C 18 27 22 21 20 14 C 19 10 21 6 25 5" stroke={look.coat} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      ) : (
        <path
          d="M 6 27 C 7 23 12 23 14 20 C 11 19 12 15 15 14 C 13 11 16 8 19 9 C 19 6 23 4 26 6 C 28 8 26 12 23 12 C 25 15 22 18 19 18 C 20 21 17 24 14 24 C 13 27 9 29 6 27 Z"
          fill={look.coat}
          stroke={LINE}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      )}
      {id === "short" && <path d="M 9 27 C 18 27 22 21 20 14 C 19 10 21 6 25 5" stroke={LINE} strokeWidth="1" fill="none" opacity="0.5" />}
    </svg>
  );
}

function EyeSwatch({ color }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M 5 16 C 9 8 23 8 27 16 C 23 24 9 24 5 16 Z" fill={color} stroke={LINE} strokeWidth="1.2" />
      <ellipse cx="16" cy="16" rx="2.2" ry="5.6" fill="#3b3550" />
      <circle cx="18.4" cy="13" r="1.4" fill="#fdfcff" />
    </svg>
  );
}

function AccessorySwatch({ id }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {id === "sakura" &&
        [0, 72, 144, 216, 288].map((a) => (
          <path key={a} d="M 16 16 C 13 14 13 9 15 8 L 16 9.4 L 17 8 C 19 9 19 14 16 16 Z" fill="#f7cdd9" stroke={LINE} strokeWidth="0.8" transform={`rotate(${a} 16 16)`} />
        ))}
      {id === "sakura" && <circle cx="16" cy="16" r="1.8" fill="#e595ad" />}
      {id === "bell" && (
        <>
          <path d="M 5 10 Q 16 17 27 10" stroke="#e793aa" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="16" cy="19" r="6" fill="#e8c878" stroke={LINE} strokeWidth="1" />
          <path d="M 12.5 20.5 H 19.5" stroke={LINE} strokeWidth="1" />
        </>
      )}
      {id === "scarf" && (
        <>
          <path d="M 5 9 Q 16 14 27 9 L 25 13 Q 20 20 17 25 Q 16 26.5 15 25 Q 12 20 7 13 Z" fill="#6b78bd" stroke={LINE} strokeWidth="1" strokeLinejoin="round" />
          <circle cx="13" cy="15" r="1" fill="#f6f3fb" />
          <circle cx="19" cy="15" r="1" fill="#f6f3fb" />
          <circle cx="16" cy="19.5" r="1" fill="#f6f3fb" />
        </>
      )}
      {id === "none" && <circle cx="16" cy="16" r="10" fill="none" stroke={LINE} strokeWidth="1.2" strokeDasharray="2.5 3" />}
    </svg>
  );
}

// ---- layout pieces ----

function Row({ label, children }) {
  return (
    <div className="picker-row" role="radiogroup" aria-label={label}>
      {children}
    </div>
  );
}

function Choice({ on, label, onClick, children }) {
  return (
    <button type="button" role="radio" aria-checked={on} aria-label={label} title={label} className={`choice ${on ? "is-on" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

// The cat's name tag, hung right under the cat. It is the same pink tag that
// follows your cat around the courtyard, so it is clear whose name this is
// without a word of explanation; the pencil says it can be written on.
function Nameplate({ name, onChange, onShuffle }) {
  return (
    <div className="nameplate">
      <label className="nameplate-tag">
        <PencilIcon size={20} />
        <span className="visually-hidden">Your cat's name</span>
        <input
          value={name}
          maxLength={14}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Name"
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
        />
      </label>
      <button type="button" className="nameplate-dice" onClick={onShuffle} aria-label="Another name">
        <DiceIcon size={22} />
      </button>
    </div>
  );
}

// Who is already staying, seen from the door without checking in: the hotel's
// live guests plus the resident cats, refreshed every few seconds.
function useGuestPeek(hotelId, withResidents) {
  const [here, setHere] = useState([]);
  useEffect(() => {
    let guests = [];
    const refresh = () => {
      const t = Date.now();
      const live = guests.filter((g) => t - (g.lastSeen ?? 0) < ONLINE_MS);
      setHere([...live, ...(withResidents ? residentsAt(t) : [])]);
    };
    const net = connectHotel({
      hotelId,
      onGuests: (list) => {
        guests = list;
        refresh();
      },
      onEvents: () => {},
      onStatus: () => {},
    });
    refresh();
    const timer = setInterval(refresh, 5000);
    return () => {
      clearInterval(timer);
      net.close();
    };
  }, [hotelId, withResidents]);
  return here;
}

export default function CatPicker({ hotelId, withResidents, night, onToggleTheme, onConfirm }) {
  // Returning travellers start from the cat they had last time.
  const [cat, setCat] = useState(() => loadLast()?.cat ?? defaultCat());
  const [act, setAct] = useState("idle");
  const [purrs, setPurrs] = useState(0);
  const timer = useRef(0);
  const here = useGuestPeek(hotelId, withResidents);
  const breed = breedById(cat.breed);
  const look = cat.look;
  const name = cat.name.trim();

  // The preview cat reacts to every change for a moment, then settles.
  const cheer = (kind = "happy", ms = 1400) => {
    setAct(kind);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAct("idle"), ms);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

  const setLook = (patch) => {
    setCat((c) => ({ ...c, look: { ...c.look, ...patch } }));
    cheer();
  };
  const chooseBreed = (b) => {
    setCat((c) => ({ ...c, breed: b.id, look: { ...b.look } }));
    cheer("meow", 1200);
  };
  const shuffleName = () => {
    const options = CAT_NAMES.filter((n) => n !== cat.name);
    setCat((c) => ({ ...c, name: options[Math.floor(Math.random() * options.length)] }));
    cheer("meow", 900);
  };
  const pet = () => {
    setPurrs((n) => n + 1);
    cheer("happy", 1800);
  };

  return (
    <main className="picker screen-enter">
      <header className="picker-top">
        <Brand />
        {here.length > 0 && <FacesPill guests={here} night={night} />}
        <ThemeButton night={night} onToggle={onToggleTheme} />
      </header>

      <section className="picker-stage" aria-label="Your cat">
        <div className="picker-stage-sun" aria-hidden="true" />
        <div className="picker-cushion" aria-hidden="true" />
        <button type="button" className="picker-cat" onClick={pet} aria-label={`Pet ${name || "your cat"}`}>
          <Cat look={look} pose="sit" act={act} night={night} title={`${name || "Your cat"}, ${breed.name}`} />
        </button>
        {purrs > 0 && (
          <span key={purrs} className="picker-purr" aria-hidden="true">
            ゴロゴロ
          </span>
        )}
      </section>
      <Nameplate name={cat.name} onChange={(value) => setCat((c) => ({ ...c, name: value }))} onShuffle={shuffleName} />

      <p className="picker-breed">
        <strong>{breed.name}</strong>
        <span>{breed.jp}</span>
      </p>

      <Row label="Breed">
        {BREEDS.map((b) => (
          <Choice key={b.id} on={cat.breed === b.id} label={b.name} onClick={() => chooseBreed(b)}>
            <span className="choice-face">
              <Cat look={b.look} pose="sit" variant="head" night={night} />
            </span>
          </Choice>
        ))}
      </Row>

      <Row label="Coat">
        {COATS.map((c) => (
          <Choice key={c.id} on={look.coat === c.coat} label={c.label} onClick={() => setLook({ coat: c.coat, mark: c.mark })}>
            <span className="choice-color" style={{ background: c.coat }} />
          </Choice>
        ))}
      </Row>

      <Row label="Pattern">
        {PATTERNS.map((p) => (
          <Choice key={p.id} on={look.markings === p.id} label={p.label} onClick={() => setLook({ markings: p.id })}>
            <PatternSwatch id={p.id} look={look} />
          </Choice>
        ))}
      </Row>

      <Row label="White and fur">
        {WHITES.map((w) => (
          <Choice key={w.id} on={look.white === w.id} label={w.label} onClick={() => setLook({ white: w.id })}>
            <WhiteSwatch id={w.id} look={look} />
          </Choice>
        ))}
        <span className="row-gap" aria-hidden="true" />
        {FURS.map((f) => (
          <Choice key={f.id} on={look.fur === f.id} label={f.label} onClick={() => setLook({ fur: f.id })}>
            <FurSwatch id={f.id} look={look} />
          </Choice>
        ))}
      </Row>

      <Row label="Eyes">
        {EYES.map((e) => (
          <Choice key={e.id} on={look.eyes === e.color} label={e.label} onClick={() => setLook({ eyes: e.color })}>
            <EyeSwatch color={e.color} />
          </Choice>
        ))}
      </Row>

      <Row label="Wears">
        {ACCESSORIES.map((a) => (
          <Choice key={a.id} on={look.accessory === a.id} label={a.label} onClick={() => setLook({ accessory: a.id })}>
            <AccessorySwatch id={a.id} />
          </Choice>
        ))}
      </Row>

      <div className="picker-cta">
        <button type="button" className="soft-button soft-button--primary" disabled={!name} onClick={() => onConfirm({ ...cat, name })} aria-label="Enter Purr Inn">
          <ArrowIcon size={30} strokeWidth={2.2} />
        </button>
      </div>
    </main>
  );
}
