// Hand-inked icons in the same soft woodblock style as the cats. Outlines use
// currentColor so they follow the day/night theme.

function Icon({ children, size = 28, label, strokeWidth = 1.5 }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function FeedIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 6.5 18 C 6.5 23.5 10.5 26.5 16 26.5 C 21.5 26.5 25.5 23.5 25.5 18 Z" fill="#efb3c4" />
      <path d="M 12 22 Q 14.5 20.6 17 22 Q 14.5 23.4 12 22 Z M 17 22 L 19.4 20.6 L 19.4 23.4 Z" fill="#f8f6fc" stroke="none" />
      <ellipse cx="16" cy="18" rx="9.5" ry="2.2" fill="#eef0fa" />
      <path d="M 9 13 C 11 9.6 17 9.6 19.4 12 L 23.4 9.6 L 22.4 13 L 23.4 16.4 L 19.4 14 C 17 16.4 11 16.4 9 13 Z" fill="#86a3d6" />
      <circle cx="12" cy="12.6" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function PlayIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="14.5" cy="15.5" r="8.5" fill="#f2acc0" />
      <path d="M 7.6 12 Q 14 8 21.6 12 M 6.4 16.4 Q 14 11.6 22.8 16.6 M 8.4 21 Q 14.6 16 21.2 21 M 11.6 7.6 Q 17.6 15 12.4 23.6" stroke="#fbe3ea" strokeWidth="1.1" />
      <circle cx="14.5" cy="15.5" r="8.5" />
      <path d="M 22 20 Q 26.5 23 25 27.5" />
    </Icon>
  );
}

export function BrushIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 5.5 17.5 C 6 10 11 6 16 6 C 21 6 26 10 26.5 17.5 Z" fill="#efd394" />
      <path d="M 7.5 17.5 V 25 M 10.2 17.5 V 25.6 M 12.9 17.5 V 26 M 15.6 17.5 V 26.2 M 18.3 17.5 V 26 M 21 17.5 V 25.6 M 23.7 17.5 V 25" strokeWidth="1.3" />
    </Icon>
  );
}

export function NapIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 19.5 5.8 A 10.5 10.5 0 1 0 26.4 20.4 A 8.6 8.6 0 0 1 19.5 5.8 Z" fill="#f3dfa2" />
      <path d="M 21.6 8.6 H 26 L 21.6 13.4 H 26" strokeWidth="1.3" />
    </Icon>
  );
}

export function PetIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 16 27 C 10.4 27 8.6 23.4 9.8 20.6 C 11 17.8 13.6 16.8 16 16.8 C 18.4 16.8 21 17.8 22.2 20.6 C 23.4 23.4 21.6 27 16 27 Z" fill="#f8d3dc" />
      <ellipse cx="8.4" cy="13.6" rx="2.6" ry="3.4" fill="#f8d3dc" transform="rotate(-20 8.4 13.6)" />
      <ellipse cx="13" cy="8.8" rx="2.6" ry="3.4" fill="#f8d3dc" transform="rotate(-6 13 8.8)" />
      <ellipse cx="19" cy="8.8" rx="2.6" ry="3.4" fill="#f8d3dc" transform="rotate(6 19 8.8)" />
      <ellipse cx="23.6" cy="13.6" rx="2.6" ry="3.4" fill="#f8d3dc" transform="rotate(20 23.6 13.6)" />
    </Icon>
  );
}

export function TreatIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 4.6 16 C 8 10.6 17 10.6 20.6 14.4 L 27 10.4 L 25.4 16 L 27 21.6 L 20.6 17.6 C 17 21.4 8 21.4 4.6 16 Z" fill="#86a3d6" />
      <path d="M 12.6 12.4 Q 14.4 16 12.6 19.6" strokeWidth="1.1" />
      <circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function HeartIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 16 26 C 8 20.5 5 16 5 11.6 C 5 8.4 7.6 6 10.6 6 C 12.9 6 14.8 7.4 16 9.4 C 17.2 7.4 19.1 6 21.4 6 C 24.4 6 27 8.4 27 11.6 C 27 16 24 20.5 16 26 Z" fill="#ec9bb2" stroke="none" />
    </Icon>
  );
}

export function LanternIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 16 2.5 V 6" />
      <rect x="11" y="5" width="10" height="3.4" rx="1.4" fill="currentColor" />
      <ellipse cx="16" cy="16" rx="8.6" ry="9" fill="#f2b0c1" />
      <path d="M 8.2 13 Q 16 14.4 23.8 13 M 7.6 17 Q 16 18.4 24.4 17 M 8.4 21 Q 16 22.4 23.6 21" stroke="#de93a8" strokeWidth="0.9" />
      <rect x="11" y="23.6" width="10" height="3.2" rx="1.4" fill="currentColor" />
    </Icon>
  );
}

export function ScrollIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 8 6 H 24 V 25 Q 24 27.6 21.4 27.6 H 10.6" fill="#f4f3fb" />
      <path d="M 8 6 Q 5.4 6 5.4 8.6 Q 5.4 11.2 8 11.2 V 25 Q 8 27.6 10.6 27.6 Q 13.2 27.6 13.2 25 V 23" />
      <path d="M 12 12.5 H 20 M 12 16.5 H 18.5 M 12 20.5 H 16" stroke="#ec9bb2" strokeWidth="1.6" />
    </Icon>
  );
}

export function DoorIcon(props) {
  return (
    <Icon {...props}>
      <rect x="6" y="5" width="15" height="22" rx="1.5" fill="#fdf0dc" />
      <path d="M 13.5 5 V 27 M 6 12.4 H 21 M 6 19.8 H 21" stroke="#bba9cf" strokeWidth="0.9" />
      <rect x="6" y="5" width="15" height="22" rx="1.5" />
      <path d="M 21 16 H 28.5 M 25.5 13 L 28.5 16 L 25.5 19" />
    </Icon>
  );
}

export function SunIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="16" cy="16" r="6" fill="#f6c6d1" />
      <path d="M 16 4.5 V 7 M 16 25 V 27.5 M 4.5 16 H 7 M 25 16 H 27.5 M 7.9 7.9 L 9.6 9.6 M 22.4 22.4 L 24.1 24.1 M 7.9 24.1 L 9.6 22.4 M 22.4 9.6 L 24.1 7.9" />
    </Icon>
  );
}

export function MoonIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 20 5.5 A 11 11 0 1 0 27 20.5 A 9 9 0 0 1 20 5.5 Z" fill="#f3e3b5" />
      <circle cx="9" cy="8" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="6" cy="14" r="0.6" fill="currentColor" stroke="none" />
    </Icon>
  );
}

// Writing on the nameplate.
export function PencilIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 8.5 23.5 L 10 18.5 L 21 7.5 L 24.5 11 L 13.5 22 Z" />
      <path d="M 18.5 10 L 22 13.5 M 8.5 23.5 L 13.5 22" />
    </Icon>
  );
}

// "Another name, please": a tumbling die.
export function DiceIcon(props) {
  return (
    <Icon {...props}>
      <rect x="7" y="7" width="18" height="18" rx="4.5" transform="rotate(-10 16 16)" />
      <g fill="currentColor" stroke="none" transform="rotate(-10 16 16)">
        <circle cx="11.5" cy="11.5" r="1.6" />
        <circle cx="16" cy="16" r="1.6" />
        <circle cx="20.5" cy="20.5" r="1.6" />
      </g>
    </Icon>
  );
}

// Go on: enter the inn.
export function ArrowIcon(props) {
  return (
    <Icon {...props}>
      <path d="M 7 16 H 25 M 18 9 L 25 16 L 18 23" />
    </Icon>
  );
}
