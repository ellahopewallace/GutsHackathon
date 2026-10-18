import { useEffect, useState } from "react";
import StatBars from "../StatBars";
import { ACTIONS } from "./actions";
import { Avatar, Brand, FacesPill, ThemeButton } from "../ui/common";
import { BrushIcon, DoorIcon, FeedIcon, HeartIcon, LanternIcon, NapIcon, PetIcon, PlayIcon, ScrollIcon, TreatIcon } from "../ui/icons";
import { moodOf, overall } from "../../game/care";

// The quiet interface around the courtyard: the top bar, the care dock, small
// popovers, bottom sheets, the diary and the doors that open on arrival.
// Everything is icons and cat faces; the only words are cats' names.

const MOOD_ICON = { happy: HeartIcon, content: HeartIcon, sleepy: NapIcon, hungry: FeedIcon, scruffy: BrushIcon, lonely: PlayIcon };

// Floating over the sky: the inn's name, who's here, the diary, day/night.
export function TopBar({ guests, night, onPresence, onDiary, onTheme }) {
  return (
    <header className="topbar">
      <Brand className="topbar-brand" />
      <FacesPill guests={guests.filter((g) => g.online)} night={night} onClick={onPresence} />
      <button type="button" className="icon-button" onClick={onDiary} aria-label="Courtyard diary">
        <ScrollIcon size={22} />
      </button>
      <ThemeButton night={night} onToggle={onTheme} />
    </header>
  );
}

// Your cat's face with a ring that fills as it's looked after. The small
// caret on top hints that it opens.
function MeButton({ cat, stats, night, open, onClick }) {
  const value = overall(stats);
  const r = 29;
  const c = 2 * Math.PI * r;
  return (
    <button type="button" className={`dock-me ${open ? "is-open" : ""}`} onClick={onClick} aria-label={`${cat.name}: how they're doing`} aria-expanded={open}>
      <svg className="dock-me-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={r} className="ring-track" />
        <circle cx="32" cy="32" r={r} className="ring-fill" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 32 32)" />
      </svg>
      <Avatar look={cat.look} size={46} night={night} />
      <span className="dock-me-caret" aria-hidden="true">
        <svg viewBox="0 0 12 8" width="12" height="8">
          <path d="M 2 6 L 6 2 L 10 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </button>
  );
}

// The care dock, under the thumb: your cat, then five softly tinted buttons.
export function Dock({ cat, stats, night, meOpen, onMe, onAction, shake }) {
  return (
    <nav className="dock" aria-label="Look after your cat">
      <MeButton cat={cat} stats={stats} night={night} open={meOpen} onClick={onMe} />
      <div className="dock-actions">
        {ACTIONS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            data-action={id}
            className={`dock-btn ${shake === id ? "is-shaking" : ""}`}
            onClick={(e) => onAction(id, e.currentTarget)}
            aria-label={label}
          >
            <Icon size={32} strokeWidth={1.6} />
          </button>
        ))}
      </div>
    </nav>
  );
}

// Your cat at a glance: four rings and a mood, no words.
export function StatsPopover({ cat, stats, night }) {
  const Mood = MOOD_ICON[moodOf(stats)];
  return (
    <div className="popover popover--stats" role="dialog" aria-label={cat.name}>
      <div className="popover-head">
        <Avatar look={cat.look} size={38} night={night} />
        <strong>{cat.name}</strong>
        <span className="popover-mood">
          <Mood size={22} />
        </span>
      </div>
      <StatBars stats={stats} />
    </div>
  );
}

// Someone else's cat: its face, its name, and two ways to say hello.
export function CatPill({ cat, night, onAction }) {
  // Briefly highlight the button that was used.
  const [sent, setSent] = useState(null);
  useEffect(() => {
    if (!sent) return undefined;
    const timer = setTimeout(() => setSent(null), 1200);
    return () => clearTimeout(timer);
  }, [sent]);
  const send = (type, el) => {
    const result = onAction(type, cat.id, el);
    if (result?.ok) setSent(type);
  };
  return (
    <div className="popover popover--cat" role="dialog" aria-label={cat.name}>
      <Avatar look={cat.look} size={48} night={night} />
      <strong className="pill-name">{cat.name}</strong>
      <button type="button" className={`pill-btn ${sent === "pet" ? "is-sent" : ""}`} onClick={(e) => send("pet", e.currentTarget)} aria-label={`Pet ${cat.name}`}>
        <PetIcon size={28} />
      </button>
      <button type="button" className={`pill-btn ${sent === "treat" ? "is-sent" : ""}`} onClick={(e) => send("treat", e.currentTarget)} aria-label={`Give ${cat.name} a treat`}>
        <TreatIcon size={28} />
      </button>
    </div>
  );
}

// A sheet that slides up from the bottom, with an icon instead of a title.
export function Sheet({ open, label, icon, onClose, children, extra }) {
  // Keep the content mounted while the sheet slides away, then drop it so a
  // closed sheet costs nothing.
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  return (
    <div className={`sheet-layer ${open ? "is-open" : ""}`} aria-hidden={!open}>
      <button type="button" className="sheet-scrim" onClick={onClose} tabIndex={-1} aria-label="Close" />
      <section
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onTransitionEnd={(e) => {
          if (!open && e.target === e.currentTarget) setMounted(false);
        }}
      >
        <div className="sheet-grip" aria-hidden="true" />
        <header className="sheet-head">
          <span className="sheet-icon">{icon}</span>
          {extra}
        </header>
        <div className="sheet-body">{mounted && children}</div>
      </section>
    </div>
  );
}

// Who's here: every cat in the hotel by face and name, yours first. Tapping
// one finds it in the courtyard. No rooms, no lobby.
export function Presence({ guests, night, onPick, onCheckout }) {
  const sorted = [...guests].sort((a, b) => {
    if (a.isMe !== b.isMe) return a.isMe ? -1 : 1;
    if (a.online !== b.online) return a.online ? -1 : 1;
    return (b.joinedAt ?? 0) - (a.joinedAt ?? 0);
  });
  return (
    <div className="presence">
      <ul className="faces-grid">
        {sorted.map((g) => (
          <li key={g.id}>
            <button type="button" className={`face ${g.isMe ? "is-me" : ""}`} onClick={() => onPick(g.id)} disabled={!g.online}>
              <span className="face-avatar">
                <Avatar look={g.cat.look} size={58} night={night} />
                {g.online && <span className="face-dot" aria-label="here" />}
              </span>
              <strong>{g.cat.name}</strong>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="icon-button checkout" onClick={onCheckout} aria-label="Check out">
        <DoorIcon size={24} />
      </button>
    </div>
  );
}

const DIARY_ICON = { feed: FeedIcon, play: PlayIcon, brush: BrushIcon, nap: NapIcon, pet: PetIcon, treat: TreatIcon, arrive: LanternIcon, leave: DoorIcon };
const SOCIAL_ICON = { boop: HeartIcon, groom: BrushIcon, chase: PlayIcon, play: PlayIcon };

// One cat in a diary line: its face and name. When the cat has already left,
// the name carried by the event is used instead.
function CatTag({ id, name, cats, night }) {
  const known = cats.get(id);
  return (
    <span className="who">
      {known && <Avatar look={known.look} size={22} night={night} />}
      {known?.name ?? name}
    </span>
  );
}

// The courtyard diary: tiny shared moments told with cat faces and icons, and
// no timestamps. `cats` maps a guest id to { name, look }.
export function Diary({ feed, cats, night }) {
  const lines = feed.filter((e) => e.kind === "leave" || cats.has(e.catId ?? e.a));
  if (!lines.length) return null;
  const tag = (id, name) => <CatTag id={id} name={name} cats={cats} night={night} />;
  return (
    <ol className="diary">
      {lines.map((e) => {
        // Two cats being friendly: "Mochi ♥ Yuzu".
        if (e.kind === "social") {
          const Icon = SOCIAL_ICON[e.what] ?? HeartIcon;
          return (
            <li key={e.id} className="diary-line">
              {tag(e.a)}
              <Icon size={20} />
              {tag(e.b)}
            </li>
          );
        }
        const Icon = DIARY_ICON[e.kind] ?? HeartIcon;
        // Comings and goings: a lantern or a door, then the cat.
        if (e.kind === "arrive" || e.kind === "leave") {
          return (
            <li key={e.id} className={`diary-line ${e.kind === "leave" ? "diary-line--quiet" : ""}`}>
              <Icon size={20} />
              {tag(e.catId, e.catName)}
            </li>
          );
        }
        // Care: who did it (as their cat) and for which cat. Looking after
        // your own cat shows just the icon and the cat.
        return (
          <li key={e.id} className="diary-line">
            {e.by !== e.catId && tag(e.by, e.byCat)}
            <Icon size={20} />
            {tag(e.catId, e.catName)}
          </li>
        );
      })}
    </ol>
  );
}

// Shoji doors sliding open the first time you enter.
export function DoorReveal({ onDone }) {
  return (
    <div className="door-reveal" onAnimationEnd={(e) => e.target.classList.contains("door--right") && onDone()} aria-hidden="true">
      <div className="door door--left" />
      <div className="door door--right" />
      <div className="door-title">
        <span className="hanko">猫</span>
        <b>ようこそ</b>
      </div>
    </div>
  );
}
