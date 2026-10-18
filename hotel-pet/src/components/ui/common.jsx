import Cat from "../cat/Cat";
import { MoonIcon, SunIcon } from "./icons";

// Small pieces shared by the cat picker and the hotel screen. Their styles
// live in index.css with the other global primitives.

// The Purr Inn seal and name.
export function Brand({ className = "" }) {
  return (
    <div className={`brand ${className}`}>
      <span className="hanko" aria-hidden="true">
        猫
      </span>
      <strong>Purr Inn</strong>
    </div>
  );
}

// Day/night switch. It shows where you would go: the sun at night, the moon by day.
export function ThemeButton({ night, onToggle }) {
  return (
    <button type="button" className="icon-button" onClick={onToggle} aria-label={night ? "Day" : "Night"}>
      {night ? <SunIcon size={22} /> : <MoonIcon size={22} />}
    </button>
  );
}

// A cat's face in a circle. Cats are the only identity in the hotel, so this
// is how every guest appears outside the courtyard.
export function Avatar({ look, size = 40, night }) {
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      <Cat look={look} pose="sit" variant="head" night={night} />
    </span>
  );
}

// A few overlapping faces and a count: who is staying right now. It is a
// button when tapping it opens something, otherwise just a picture.
export function FacesPill({ guests, night, onClick }) {
  const label = `${guests.length} cats here`;
  const content = (
    <>
      <span className="faces" aria-hidden="true">
        {guests.slice(0, 3).map((g) => (
          <Avatar key={g.id} look={g.cat.look} size={26} night={night} />
        ))}
      </span>
      <b aria-hidden="true">{guests.length}</b>
    </>
  );
  return onClick ? (
    <button type="button" className="faces-pill" onClick={onClick} aria-label={label}>
      {content}
    </button>
  ) : (
    <div className="faces-pill" role="img" aria-label={label}>
      {content}
    </div>
  );
}
