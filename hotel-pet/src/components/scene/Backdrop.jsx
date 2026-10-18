import { memo } from "react";

// Artwork for the courtyard, split into layers so the moving pieces (mist,
// lanterns, koi, cats) slide between them without the big paintings ever
// being repainted. All layers share the 400 x 720 world space.
//
// The composition is quietly measured, like a print laid out on a grid: the
// entrance, plaque and stepping-stone path sit on the centre axis (x = 200);
// lanterns, plants and wisteria mirror each other around it; Fuji's peak and
// the sun (or moon) rest near the golden section (x ~ 250); stones and rake
// lines widen in a steady perspective rhythm toward the viewer.

const DAY = {
  line: "#545a94",
  sky: ["#aebde4", "#cdd6ef", "#efe0ea"],
  sun: ["#f7c6d1", "#eda9ba"],
  hills: "#c3c6e3",
  fuji: ["#7888c0", "#97a5d3", "#c3cbe8"],
  fujiLine: "#59639e",
  snow: "#f6f4fb",
  snowLines: "#cfd5ee",
  pagoda: "#9ba5d2",
  pagodaLine: "#6670a8",
  mist: ["#f1dde8", "#f8edf3"],
  branch: ["#7e6788", "#9f86a6"],
  blossom: "#f7cdd9",
  blossomCenter: "#e595ad",
  roof: "#8d9bcd",
  tiles: "#7b89c0",
  ridge: "#6c79b2",
  eave: "#eceff9",
  underEave: "#5c6599",
  rafters: "#d9ddf2",
  plaque: "#4b5089",
  plaqueBorder: "#ead29c",
  plaqueText: "#f8e8bb",
  beam: "#9a93c6",
  post: "#857eb6",
  shoji: ["#fde7cc", "#f6e0d6"],
  kumiko: "#bba9cf",
  kick: "#aaa0cf",
  doorway: "#4d5285",
  deck: "#c2bedf",
  deckLines: "#a9a4cc",
  deckGrain: "#b5b0d6",
  deckEdge: "#9c96c4",
  ground: ["#c6cbe6", "#d0d4ec"],
  rake: "#b6bcdd",
  pool: "#fff3df",
  poolOpacity: 0.4,
  moss: "#a2cbbf",
  mossHi: "#c0e1d7",
  stones: ["#c6c5df", "#b6b5d3", "#d4d3ea", "#bdbcd8"],
  stoneHi: "#edecf7",
  pebble: "#b2b6d8",
  lanternStone: "#bab9d6",
  lanternRoof: "#a9a8c9",
  lanternWindow: "#fbe2a8",
  glow: "#ffe4ad",
  glowOpacity: 0.32,
  mat: "#d9d1e8",
  weave: "#bfb5d9",
  cushionA: "#f0b6c7",
  cushionB: "#909fd7",
  tuftA: "#fbe6c4",
  tuftB: "#eef0fb",
  water: ["#97badb", "#7398c8"],
  waves: "#c7def0",
  lily: "#9dc8b8",
  lotus: "#f7cbd7",
  lotusDeep: "#eeacbf",
  lantern: "#f2b0c1",
  lanternRibs: "#de93a8",
  noren: "#707dc2",
  norenTrim: "#909cd8",
  mon: "#f7f4fc",
  koi: ["#faf6fb", "#f2a9a9"],
  fern: "#9ccabd",
  stem: "#6f9f98",
  daisy: "#fcfbfe",
  daisyCenter: "#f2d690",
  peach: "#f5bfcb",
  leaf: "#8fbfb2",
  pot: "#9f97c8",
  wisteria: "#cbb8e8",
  petal: "#f7cdd9",
};

const NIGHT = {
  ...DAY,
  line: "#272b5e",
  sky: ["#33376f", "#4d5296", "#8678b3"],
  sun: ["#fcf4d6", "#efe3be"],
  hills: "#4c5290",
  fuji: ["#46528f", "#5f6aa8", "#7d82b8"],
  fujiLine: "#2a3068",
  snow: "#dde1f3",
  snowLines: "#a9b0d6",
  pagoda: "#5a63a1",
  pagodaLine: "#343a78",
  mist: ["#7e77b3", "#8b84bd"],
  branch: ["#463d6d", "#5b5085"],
  blossom: "#e6abc6",
  blossomCenter: "#c77ea0",
  roof: "#525c9b",
  tiles: "#46508f",
  ridge: "#3c4583",
  eave: "#9196c9",
  underEave: "#30356a",
  rafters: "#8389bf",
  plaque: "#2d3165",
  plaqueBorder: "#e8c987",
  plaqueText: "#fde8ae",
  beam: "#5b5796",
  post: "#4f4b8a",
  shoji: ["#fdd9a1", "#f2c08f"],
  kumiko: "#a68ca8",
  kick: "#6c639f",
  doorway: "#2b2e5e",
  deck: "#6f6ca6",
  deckLines: "#5f5c96",
  deckGrain: "#67649f",
  deckEdge: "#535088",
  ground: ["#6b70a8", "#757ab1"],
  rake: "#6267a2",
  pool: "#ffd9a0",
  poolOpacity: 0.22,
  moss: "#4f8086",
  mossHi: "#609299",
  stones: ["#8c8ebd", "#7e80b2", "#9698c6", "#8789b9"],
  stoneHi: "#acaed4",
  pebble: "#7f83b5",
  lanternStone: "#8789b8",
  lanternRoof: "#787aab",
  lanternWindow: "#ffe09a",
  glow: "#ffd58a",
  glowOpacity: 0.55,
  mat: "#7f78ae",
  weave: "#6e68a0",
  cushionA: "#c98aa9",
  cushionB: "#6070b0",
  tuftA: "#e3c9a6",
  tuftB: "#c9cbe8",
  water: ["#3d5191", "#2f407b"],
  waves: "#5d71b0",
  lily: "#5b8b86",
  lotus: "#d9a6c0",
  lotusDeep: "#c48fab",
  lantern: "#f2a3b8",
  lanternRibs: "#d08299",
  noren: "#4d589e",
  norenTrim: "#6672b4",
  mon: "#e3e5f6",
  koi: ["#e3e1f0", "#d9958f"],
  fern: "#5f9096",
  stem: "#4a7579",
  daisy: "#dcdef2",
  daisyCenter: "#e6c983",
  peach: "#d99db4",
  leaf: "#567f85",
  pot: "#625d98",
  wisteria: "#9d90d0",
  petal: "#e6abc6",
};

const palette = (night) => (night ? NIGHT : DAY);

// Where the sun (or moon) rests: on Fuji's peak, near the golden section.
const SUN = { x: 252, y: 172, r: 42 };

function Blossom({ x, y, r = 4, rot = 0, P }) {
  const petal = "M 0 0 C -2.5 -1.6 -2.6 -4.4 -1.1 -5.3 L 0 -4.5 L 1.1 -5.3 C 2.6 -4.4 2.5 -1.6 0 0 Z";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 5.3})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={petal} transform={`rotate(${a})`} fill={P.blossom} stroke={P.line} strokeWidth="0.45" />
      ))}
      <circle r="1.1" fill={P.blossomCenter} />
    </g>
  );
}

// A blossoming bough: a brush-stroke branch with flowers along it.
function Branch({ d, blossoms, width = 5, P }) {
  return (
    <g>
      <path d={d} fill="none" stroke={P.branch[0]} strokeWidth={width} strokeLinecap="round" />
      <path d={d} fill="none" stroke={P.branch[1]} strokeWidth={width * 0.45} strokeLinecap="round" opacity="0.7" />
      {blossoms.map(([x, y, r, rot], i) => (
        <Blossom key={i} x={x} y={y} r={r} rot={rot} P={P} />
      ))}
    </g>
  );
}

const STARS = [
  [40, 140, 0.9], [76, 166, 0.7], [118, 132, 1.1], [150, 188, 0.6], [182, 150, 0.8], [214, 124, 0.7], [296, 140, 0.9],
  [62, 214, 0.6], [104, 236, 0.8], [168, 222, 0.6], [362, 228, 0.8], [384, 150, 0.7], [352, 120, 1], [318, 206, 0.6],
  [26, 250, 0.7], [138, 262, 0.6], [200, 196, 0.5], [92, 120, 0.6], [330, 252, 0.6], [292, 238, 0.5],
];

const SkyLayer = memo(function SkyLayer({ night }) {
  const P = palette(night);
  const id = night ? "bd-sky-n" : "bd-sky-d";
  return (
    <svg className="layer" viewBox="0 0 400 720" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.sky[0]} />
          <stop offset="0.55" stopColor={P.sky[1]} />
          <stop offset="1" stopColor={P.sky[2]} />
        </linearGradient>
      </defs>
      <rect width="400" height="420" fill={`url(#${id})`} />
      {night &&
        STARS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#f6f3ff" opacity={0.4 + (i % 4) * 0.12} />)}
    </svg>
  );
});

const FarLayer = memo(function FarLayer({ night }) {
  const P = palette(night);
  const k = night ? "n" : "d";
  const tier = (cx, y, w) =>
    `M ${cx - w} ${y} Q ${cx} ${y - 5} ${cx + w} ${y} L ${cx + w * 0.6} ${y - 7} L ${cx - w * 0.6} ${y - 7} Z ` +
    `M ${cx - w * 0.42} ${y} L ${cx + w * 0.42} ${y} L ${cx + w * 0.42} ${y + 12} L ${cx - w * 0.42} ${y + 12} Z`;
  return (
    <svg className="layer" viewBox="0 0 400 720" aria-hidden="true">
      <defs>
        <radialGradient id={`bd-sun-${k}`} cx="0.45" cy="0.4" r="0.7">
          <stop offset="0" stopColor={P.sun[0]} />
          <stop offset="1" stopColor={P.sun[1]} />
        </radialGradient>
        <radialGradient id={`bd-halo-${k}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.sun[0]} stopOpacity={night ? 0.34 : 0.4} />
          <stop offset="1" stopColor={P.sun[0]} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`bd-fuji-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.fuji[0]} />
          <stop offset="0.6" stopColor={P.fuji[1]} />
          <stop offset="1" stopColor={P.fuji[2]} />
        </linearGradient>
      </defs>
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r * 2.1} fill={`url(#bd-halo-${k})`} />
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill={`url(#bd-sun-${k})`} />
      {night && (
        <g fill={P.sky[1]} opacity="0.16">
          <circle cx={SUN.x - 12} cy={SUN.y - 8} r="7" />
          <circle cx={SUN.x + 8} cy={SUN.y + 10} r="5" />
          <circle cx={SUN.x + 12} cy={SUN.y - 16} r="3.5" />
        </g>
      )}
      <path d="M -10 322 C 50 300 110 304 160 314 C 210 324 258 300 318 304 C 358 307 388 314 410 318 L 410 360 L -10 360 Z" fill={P.hills} opacity="0.8" />
      {/* Fuji, shifted so its peak sits under the sun */}
      <g transform="translate(-24 0)">
        <path
          d="M 70 336 C 140 300 205 236 246 192 L 258 180 L 266 184 L 276 177 L 287 185 L 297 180 C 330 222 378 276 430 306 L 430 360 L 70 360 Z"
          fill={`url(#bd-fuji-${k})`}
          stroke={P.fujiLine}
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        <path
          d="M 230 210 L 246 192 L 258 180 L 266 184 L 276 177 L 287 185 L 297 180 L 312 198 L 305 205 L 298 199 L 291 209 L 283 201 L 274 214 L 266 203 L 257 212 L 249 204 L 240 213 Z"
          fill={P.snow}
          stroke={P.fujiLine}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <path d="M 252 196 L 258 206 M 268 192 L 270 204 M 282 194 L 284 206" stroke={P.snowLines} strokeWidth="0.9" strokeLinecap="round" />
      </g>
      <g fill={P.pagoda} stroke={P.pagodaLine} strokeWidth="0.7" strokeLinejoin="round">
        <path d={`${tier(96, 300, 26)} ${tier(96, 280, 22)} ${tier(96, 261, 18)}`} />
        <path d="M 96 254 L 96 228" stroke={P.pagodaLine} strokeWidth="1.4" />
        <path d="M 92 238 H 100 M 92.5 243 H 99.5 M 93 248 H 99" stroke={P.pagodaLine} strokeWidth="0.9" />
      </g>
      {night && <rect x="92.5" y="282" width="7" height="5" rx="1" fill="#ffe2a0" opacity="0.85" />}
      <Branch
        P={P}
        d="M -14 132 C 30 140 66 156 110 162 M 46 146 C 58 164 66 180 86 194 M 82 156 C 100 144 116 138 142 134"
        width={5}
        blossoms={[
          [110, 162, 5.4, 10], [100, 170, 4.2, 40], [118, 156, 4, -20], [86, 194, 5, 0], [78, 186, 4.2, 30],
          [142, 134, 4.8, 20], [132, 142, 4, -30], [60, 150, 4.4, 15], [70, 160, 3.8, -25], [30, 140, 4, 5],
          [94, 200, 3.6, -15], [150, 128, 3.6, 10],
        ]}
      />
      <Branch
        P={P}
        d="M 414 150 C 386 158 360 168 340 188 M 380 158 C 370 144 362 136 348 130"
        width={4.4}
        blossoms={[
          [340, 188, 5, 10], [350, 180, 4, -30], [332, 196, 3.8, 25], [348, 130, 4.4, 0], [360, 140, 3.8, 30],
          [372, 162, 4.2, -10], [398, 154, 4, 15],
        ]}
      />
    </svg>
  );
});

const MistLayer = memo(function MistLayer({ night }) {
  const P = palette(night);
  const band = (x, y, w, h) => (
    <g key={`${x}-${y}`}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={P.mist[0]} opacity={night ? 0.5 : 0.8} />
      <rect x={x + 10} y={y + h * 0.28} width={w - 20} height={h * 0.3} rx={h * 0.15} fill={P.mist[1]} opacity={night ? 0.45 : 0.75} />
    </g>
  );
  // Three bands in a steady rhythm, alternating sides.
  return (
    <svg className="layer" viewBox="0 0 400 720" aria-hidden="true">
      {band(-50, 236, 190, 15)}
      {band(250, 262, 190, 14)}
      {band(-40, 290, 300, 19)}
    </svg>
  );
});

function Shoji({ x, w, shadowCat, P, k }) {
  const lines = [];
  for (let gx = x + 12; gx < x + w - 4; gx += 12) lines.push(`M ${gx} 394 V 440`);
  for (let gy = 409; gy < 440; gy += 15) lines.push(`M ${x} ${gy} H ${x + w}`);
  return (
    <g>
      <rect x={x} y="394" width={w} height="46" fill={`url(#bd-shoji-${k})`} />
      {shadowCat && (
        <path
          d={`M ${x + 30} 440 C ${x + 26} 428 ${x + 30} 420 ${x + 34} 417 L ${x + 33} 409 L ${x + 37} 413 L ${x + 41} 413 L ${x + 45} 409 L ${x + 44} 417 C ${x + 48} 421 ${x + 50} 430 ${x + 47} 440 Z M ${x + 47} 437 C ${x + 56} 438 ${x + 58} 430 ${x + 54} 426`}
          fill="#7a6fa8"
          stroke="#7a6fa8"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.26"
        />
      )}
      <path d={lines.join(" ")} stroke={P.kumiko} strokeWidth="0.8" fill="none" />
      <rect x={x} y="440" width={w} height="12" fill={P.kick} />
      <rect x={x} y="394" width={w} height="58" fill="none" stroke={P.post} strokeWidth="1.2" />
    </g>
  );
}

function Cushion({ x, y, fill, tuft, P }) {
  return (
    <g>
      <path
        d={`M ${x - 23} ${y - 5} Q ${x} ${y - 11} ${x + 23} ${y - 7} Q ${x + 28} ${y} ${x + 24} ${y + 7} Q ${x} ${y + 12} ${x - 23} ${y + 8} Q ${x - 27} ${y + 1} ${x - 23} ${y - 5} Z`}
        fill={fill}
        stroke={P.line}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d={`M ${x - 20} ${y - 2} Q ${x} ${y - 7} ${x + 20} ${y - 4}`} stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" fill="none" />
      <path d={`M ${x - 3} ${y} L ${x + 3} ${y + 2} M ${x + 3} ${y} L ${x - 3} ${y + 2}`} stroke={tuft} strokeWidth="1.3" strokeLinecap="round" />
      {[[-23, -5], [23, -7], [24, 7], [-23, 8]].map(([dx, dy]) => (
        <path key={`${dx}${dy}`} d={`M ${x + dx} ${y + dy} l ${dx > 0 ? 3 : -3} ${dy > 0 ? 3 : -2}`} stroke={tuft} strokeWidth="1.4" strokeLinecap="round" />
      ))}
    </g>
  );
}

function pondStones(P) {
  const stones = [];
  for (let i = 0; i < 17; i++) {
    const a = ((80 + i * 13.5) * Math.PI) / 180;
    const x = 338 + Math.cos(a) * 88;
    const y = 612 + Math.sin(a) * 42;
    const rx = 9 + ((i * 7) % 5);
    const ry = 5 + ((i * 3) % 3);
    stones.push(
      <g key={i}>
        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={P.stones[i % 4]} stroke={P.line} strokeWidth="0.8" />
        <path d={`M ${x - rx * 0.5} ${y - ry * 0.35} Q ${x} ${y - ry * 0.8} ${x + rx * 0.45} ${y - ry * 0.4}`} stroke={P.stoneHi} strokeWidth="0.9" fill="none" />
      </g>,
    );
  }
  return stones;
}

// Stepping stones down the centre axis: steady left-right rhythm, growing as
// they come toward the viewer.
const STEPS = [[200, 498, 14], [192, 523, 14.8], [207, 551, 15.6], [193, 582, 16.4], [207, 616, 17.2], [193, 653, 18], [206, 693, 19]];

// Rake lines: spacing widens toward the front, like a perspective grid.
function rakeLines() {
  const out = [];
  let y = 497;
  let gap = 6;
  while (y < 718) {
    out.push(`M -10 ${y.toFixed(1)} C 60 ${(y - 2).toFixed(1)} 130 ${(y + 2).toFixed(1)} 200 ${y.toFixed(1)} S 330 ${(y - 2).toFixed(1)} 410 ${y.toFixed(1)}`);
    y += gap;
    gap += 0.42;
  }
  return out.join(" ");
}

// Small scattered pebbles and grass tufts: a little texture, nothing busy.
const PEBBLES = [
  [58, 548, 2.2], [82, 566, 1.6], [138, 590, 1.8], [150, 548, 1.4], [246, 520, 1.8], [270, 540, 1.4], [300, 506, 1.6],
  [118, 660, 2], [160, 640, 1.5], [258, 664, 1.8], [62, 674, 1.6], [228, 590, 1.4], [176, 512, 1.4], [342, 532, 1.8],
];
const TUFTS = [[44, 562], [338, 520], [150, 676], [272, 680], [96, 520]];

function Pot({ x, y, P, children }) {
  return (
    <g>
      {children}
      <path d={`M ${x - 9} ${y - 12} L ${x + 9} ${y - 12} L ${x + 7} ${y} L ${x - 7} ${y} Z`} fill={P.pot} stroke={P.line} strokeWidth="0.9" strokeLinejoin="round" />
      <path d={`M ${x - 9.5} ${y - 12} H ${x + 9.5}`} stroke={P.line} strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

function Wisteria({ x, y, P }) {
  const drops = [];
  for (let i = 0; i < 9; i++) {
    const dx = ((i * 7) % 11) - 5;
    drops.push(<ellipse key={i} cx={x + dx * 0.8} cy={y + i * 2.6} rx={2.4 - i * 0.12} ry="1.8" fill={P.wisteria} />);
  }
  return (
    <g opacity="0.92">
      <path d={`M ${x} ${y - 4} Q ${x + 2} ${y + 8} ${x - 1} ${y + 22}`} stroke={P.stem} strokeWidth="0.8" fill="none" />
      {drops}
      <path d={`M ${x - 6} ${y - 3} q 3 -3 6 0 q 3 -3 6 0`} fill={P.leaf} />
    </g>
  );
}

const HotelLayer = memo(function HotelLayer({ night }) {
  const P = palette(night);
  const k = night ? "n" : "d";
  const tiles = [];
  for (let i = 0; i <= 32; i++) {
    const xt = 62 + i * 8.5;
    const xb = 200 + (xt - 200) * 1.62;
    tiles.push(`M ${xt.toFixed(1)} 316 Q ${((xt + xb) / 2 + (xt - 200) * 0.06).toFixed(1)} 338 ${xb.toFixed(1)} 364`);
  }
  const rafters = [];
  for (let x = -24; x <= 424; x += 11.2) rafters.push(<rect key={x} x={x.toFixed(1)} y="377" width="4" height="4" fill={P.rafters} />);
  const grain = [];
  for (let i = 0; i < 9; i++) {
    const x = 8 + i * 47;
    const y = 455 + (i % 3) * 7;
    grain.push(`M ${x} ${y} q 10 -1.2 22 0 q 8 1 16 0.2`);
  }

  return (
    <svg className="layer" viewBox="0 0 400 720" aria-hidden="true">
      <defs>
        <radialGradient id={`bd-shoji-${k}`} cx="0.5" cy="0.55" r="0.75">
          <stop offset="0" stopColor={P.shoji[0]} />
          <stop offset="1" stopColor={P.shoji[1]} />
        </radialGradient>
        <linearGradient id={`bd-ground-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.ground[0]} />
          <stop offset="1" stopColor={P.ground[1]} />
        </linearGradient>
        <linearGradient id={`bd-water-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.water[0]} />
          <stop offset="1" stopColor={P.water[1]} />
        </linearGradient>
        <radialGradient id={`bd-pool-${k}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.pool} stopOpacity={P.poolOpacity * 2} />
          <stop offset="1" stopColor={P.pool} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`bd-glow-${k}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={P.glow} stopOpacity={P.glowOpacity} />
          <stop offset="1" stopColor={P.glow} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`bd-decklight-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.shoji[0]} stopOpacity={night ? 0.24 : 0} />
          <stop offset="1" stopColor={P.shoji[0]} stopOpacity="0" />
        </linearGradient>
        <pattern id={`bd-waves-${k}`} width="24" height="12" patternUnits="userSpaceOnUse">
          <g fill="none" stroke={P.waves} strokeWidth="0.8" opacity="0.55">
            <path d="M 0 12 A 12 12 0 0 1 24 12 M 4 12 A 8 8 0 0 1 20 12 M 8 12 A 4 4 0 0 1 16 12" />
            <path d="M -12 6 A 12 12 0 0 1 12 6 M 12 6 A 12 12 0 0 1 36 6" />
          </g>
        </pattern>
        <clipPath id={`bd-pond-${k}`}>
          <ellipse cx="338" cy="612" rx="80" ry="35" />
        </clipPath>
      </defs>

      {/* ---- roof ---- */}
      <path
        d="M 52 312 C 50 300 44 294 38 292 C 46 290 54 296 58 304 L 342 304 C 346 296 354 290 362 292 C 356 294 350 300 348 312 Z"
        fill={P.ridge}
        stroke={P.line}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M 58 314 L 342 314 C 365 336 395 356 432 362 L 432 374 C 300 368 100 368 -32 374 L -32 362 C 5 356 35 336 58 314 Z"
        fill={P.roof}
        stroke={P.line}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d={tiles.join(" ")} stroke={P.tiles} strokeWidth="1.3" fill="none" />
      <path d="M -32 362 C 100 355 300 355 432 362" stroke={P.eave} strokeWidth="2.4" fill="none" />
      <path d="M -32 362 C 100 355 300 355 432 362" stroke={P.line} strokeWidth="0.9" fill="none" />
      <path d="M -32 374 C 100 368 300 368 432 374 L 432 390 L -32 390 Z" fill={P.underEave} />
      {rafters}
      <rect x="160" y="321" width="80" height="27" rx="3" fill={P.plaque} stroke={P.plaqueBorder} strokeWidth="1.4" />
      <rect x="163.5" y="324.5" width="73" height="20" rx="2" fill="none" stroke={P.plaqueBorder} strokeWidth="0.5" opacity="0.7" />
      <text x="200" y="340.5" textAnchor="middle" fontFamily="'Shippori Mincho B1', serif" fontWeight="800" fontSize="15" letterSpacing="3" fill={P.plaqueText}>
        猫の宿
      </text>
      <Wisteria x={56} y={392} P={P} />
      <Wisteria x={344} y={392} P={P} />

      {/* ---- facade, symmetric about the entrance ---- */}
      <rect x="-10" y="386" width="420" height="9" fill={P.beam} />
      <Shoji x={4} w={74} P={P} k={k} />
      <Shoji x={86} w={70} P={P} k={k} />
      <Shoji x={244} w={70} shadowCat P={P} k={k} />
      <Shoji x={322} w={74} P={P} k={k} />
      <rect x="164" y="395" width="72" height="57" fill={P.doorway} />
      {night && <rect x="172" y="430" width="56" height="22" fill="#ffd9a0" opacity="0.14" />}
      {[0, 82, 160, 240, 318, 400].map((x) => (
        <rect key={x} x={x - 4} y="386" width="8" height="68" fill={P.post} />
      ))}

      {/* ---- engawa deck ---- */}
      <rect x="-10" y="452" width="420" height="26" fill={P.deck} />
      <path d="M -10 458.5 H 410 M -10 465 H 410 M -10 471.5 H 410" stroke={P.deckLines} strokeWidth="0.7" />
      <path d={grain.join(" ")} stroke={P.deckGrain} strokeWidth="0.7" fill="none" strokeLinecap="round" />
      <path d="M 40 452 V 458.5 M 132 458.5 V 465 M 268 465 V 471.5 M 360 452 V 458.5 M 96 465 V 471.5 M 304 458.5 V 465" stroke={P.deckLines} strokeWidth="0.7" />
      <rect x="-10" y="452" width="420" height="26" fill={`url(#bd-decklight-${k})`} />
      <rect x="-10" y="477" width="420" height="9" fill={P.deckEdge} />
      <ellipse cx="200" cy="455" rx="22" ry="4.5" fill={P.stones[0]} stroke={P.line} strokeWidth="0.8" />
      <Pot x={108} y={455} P={P}>
        <path d="M 108 443 C 100 438 97 431 102 427 C 104 433 107 436 108 443 Z M 108 443 C 116 437 119 430 114 426 C 112 432 109 436 108 443 Z M 108 443 C 107 434 109 428 108 422 C 106 428 106 435 108 443 Z" fill={P.leaf} stroke={P.line} strokeWidth="0.6" />
      </Pot>
      <Pot x={292} y={455} P={P}>
        <g fill={P.blossom} stroke={P.line} strokeWidth="0.5">
          <circle cx="286" cy="437" r="4.2" />
          <circle cx="294" cy="434" r="4.6" />
          <circle cx="299" cy="440" r="3.8" />
          <circle cx="290" cy="442" r="3.6" />
        </g>
        <path d="M 284 444 q 3 -2 6 0 M 294 444 q 3 -2 6 0" stroke={P.leaf} strokeWidth="1.4" fill="none" />
      </Pot>

      {/* ---- garden ---- */}
      <rect x="-10" y="486" width="420" height="240" fill={`url(#bd-ground-${k})`} />
      <path d="M -10 486 H 410" stroke="#2f3470" strokeWidth="5" opacity="0.12" />
      <path d={rakeLines()} stroke={P.rake} strokeWidth="1.05" fill="none" />
      {PEBBLES.map(([x, y, r], i) => (
        <ellipse key={i} cx={x} cy={y} rx={r * 1.4} ry={r} fill={P.pebble} opacity="0.7" />
      ))}
      {TUFTS.map(([x, y], i) => (
        <path key={i} d={`M ${x - 4} ${y} q 1 -6 -1 -9 M ${x} ${y} q 0 -7 1 -11 M ${x + 4} ${y} q -1 -6 2 -9`} stroke={P.leaf} strokeWidth="1.1" fill="none" strokeLinecap="round" />
      ))}
      {night ? (
        <>
          <ellipse cx="120" cy="500" rx="54" ry="20" fill={`url(#bd-pool-${k})`} />
          <ellipse cx="280" cy="500" rx="54" ry="20" fill={`url(#bd-pool-${k})`} />
          <ellipse cx="44" cy="500" rx="46" ry="18" fill={`url(#bd-pool-${k})`} />
        </>
      ) : (
        <ellipse cx="200" cy="566" rx="66" ry="24" fill={`url(#bd-pool-${k})`} />
      )}

      {/* moss mound with a stone lantern */}
      <ellipse cx="40" cy="500" rx="58" ry="22" fill={P.moss} stroke={P.line} strokeWidth="0.9" />
      <path d="M -10 494 Q 30 482 86 494" stroke={P.mossHi} strokeWidth="3" fill="none" opacity="0.8" />
      <circle cx="44" cy="456" r={night ? 40 : 30} fill={`url(#bd-glow-${k})`} />
      <g fill={P.lanternStone} stroke={P.line} strokeWidth="0.95" strokeLinejoin="round">
        <path d="M 29 503 L 59 503 L 56 494 L 32 494 Z" />
        <rect x="39" y="472" width="10" height="22" />
        <path d="M 28 472 L 60 472 L 56 465 L 32 465 Z" />
        <rect x="34" y="447" width="20" height="18" />
        <path d="M 21 448 Q 44 428 67 448 L 61 450 L 27 450 Z" fill={P.lanternRoof} />
        <circle cx="44" cy="432" r="3.6" />
      </g>
      <rect x="39" y="451" width="10" height="10" fill={P.lanternWindow} stroke={P.line} strokeWidth="0.8" />
      <path d="M 36 503 Q 30 494 22 492 M 52 503 Q 58 492 66 490" stroke={P.stem} strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {STEPS.map(([x, y, r], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={r} ry={r * 0.43} fill={P.stones[2]} stroke={P.line} strokeWidth="0.8" />
          <path d={`M ${x - r * 0.5} ${y - 2} Q ${x} ${y - r * 0.32} ${x + r * 0.45} ${y - 2.5}`} stroke={P.stoneHi} strokeWidth="0.9" fill="none" />
        </g>
      ))}

      <path d="M 42 598 Q 88 593 136 598 L 142 645 Q 88 650 36 645 Z" fill={P.mat} stroke={P.line} strokeWidth="0.9" strokeLinejoin="round" />
      <path d="M 44 606 Q 89 601 137 606 M 43 614 Q 89 609 138 614 M 41 622 Q 89 617 139 622 M 40 630 Q 89 625 140 630 M 38 638 Q 89 633 141 638" stroke={P.weave} strokeWidth="0.7" fill="none" />

      <Cushion x={106} y={522} fill={P.cushionA} tuft={P.tuftA} P={P} />
      <Cushion x={226} y={641} fill={P.cushionB} tuft={P.tuftB} P={P} />

      {/* koi pond */}
      {pondStones(P).slice(0, 9)}
      <ellipse cx="338" cy="612" rx="80" ry="35" fill={`url(#bd-water-${k})`} stroke={P.line} strokeWidth="0.9" />
      <g clipPath={`url(#bd-pond-${k})`}>
        <rect x="250" y="570" width="160" height="90" fill={`url(#bd-waves-${k})`} />
        {night ? (
          <ellipse cx="300" cy="600" rx="22" ry="6" fill={P.sun[0]} opacity="0.34" />
        ) : (
          <path d="M 262 600 Q 300 588 350 590" stroke={P.waves} strokeWidth="1.5" fill="none" opacity="0.6" />
        )}
      </g>
      {pondStones(P).slice(9)}
      <g stroke={P.line} strokeWidth="0.7">
        <path d="M 296 628 a 10 5 0 1 0 1 -1 Z" fill={P.lily} />
        <path d="M 296 628 L 304 625" stroke={P.stem} />
        <path d="M 360 594 a 8 4 0 1 0 1 -1 Z" fill={P.lily} />
        <path d="M 378 628 a 9 4.5 0 1 0 1 -1 Z" fill={P.lily} />
      </g>
      <g transform="translate(366 596)">
        <path d="M 0 0 C -5 -3 -6 -9 0 -12 C 6 -9 5 -3 0 0 Z" fill={P.lotus} stroke={P.line} strokeWidth="0.6" />
        <path d="M 0 0 C -8 -1 -11 -6 -9 -9 C -4 -8 -1 -4 0 0 Z M 0 0 C 8 -1 11 -6 9 -9 C 4 -8 1 -4 0 0 Z" fill={P.lotusDeep} stroke={P.line} strokeWidth="0.6" />
      </g>
    </svg>
  );
});

// Paper lantern hanging from the eaves. It glows at night.
const Lantern = memo(function Lantern({ x, y, glyph, night }) {
  const P = palette(night);
  return (
    <div className="lantern" style={{ left: x - 15, top: y }}>
      <svg viewBox="0 0 30 50" width="30" height="50" aria-hidden="true">
        {night && <circle cx="15" cy="25" r="24" fill="#ffd3a0" opacity="0.24" />}
        <path d="M 15 0 V 6" stroke={P.line} strokeWidth="1" />
        <rect x="8" y="5" width="14" height="5" rx="1.5" fill={P.line} />
        <ellipse cx="15" cy="25" rx="12.5" ry="16" fill={P.lantern} stroke={P.line} strokeWidth="1" />
        <path d="M 3.6 19 Q 15 21 26.4 19 M 2.8 25 Q 15 27 27.2 25 M 3.6 31 Q 15 33 26.4 31" stroke={P.lanternRibs} strokeWidth="0.7" fill="none" />
        <ellipse cx="11" cy="20" rx="3" ry="6" fill="#ffffff" opacity={night ? 0.32 : 0.22} />
        <text x="15" y="30" textAnchor="middle" fontFamily="'Shippori Mincho B1', serif" fontWeight="800" fontSize="12" fill={P.line} opacity="0.8">
          {glyph}
        </text>
        <rect x="8" y="40" width="14" height="4.5" rx="1.5" fill={P.line} />
        <path d="M 13 45 L 12 50 M 15 45 V 50.5 M 17 45 L 18 50" stroke={P.plaqueBorder} strokeWidth="0.9" />
      </svg>
    </div>
  );
});

// The noren curtain over the entrance; it sways when a cat walks through.
const Noren = memo(function Noren({ flapRef, night }) {
  const P = palette(night);
  const panel = (x, i) => (
    <g key={i} className={`noren-panel noren-panel--${i}`} style={{ transformOrigin: `${x + 11}px 3px` }}>
      <path d={`M ${x} 3 H ${x + 22} V 38 Q ${x + 11} 40 ${x} 38 Z`} fill={P.noren} stroke={P.line} strokeWidth="0.8" />
      <path d={`M ${x + 2} 33 H ${x + 20}`} stroke={P.norenTrim} strokeWidth="1" />
    </g>
  );
  return (
    <div className="noren" ref={flapRef} style={{ left: 164, top: 393 }}>
      <svg viewBox="0 0 72 42" width="72" height="42" aria-hidden="true">
        <rect x="0" y="0" width="72" height="4" rx="1.5" fill={P.beam} />
        {[1.5, 25, 48.5].map(panel)}
        <circle cx="36" cy="18" r="8.5" fill={P.mon} />
        <path
          d="M 31.5 24 C 30.5 20 31.5 16.5 33.5 15 L 33 11.5 L 35.2 13.6 L 37.8 13.6 L 40 11.5 L 39.6 15 C 41.6 16.5 42.4 20 41.2 24 Z M 41 22.5 C 43.5 22.2 44.4 20 43.6 18.4"
          fill={P.noren}
          stroke={P.noren}
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
});

// Two koi circling the pond. The ring is squashed into an ellipse for depth.
export const Koi = memo(function Koi({ night }) {
  const P = palette(night);
  const fish = (fill, spot) => (
    <svg viewBox="-12 -5 24 10" width="24" height="10" aria-hidden="true">
      <path d="M -10 0 C -6 -4.6 4 -4.4 8 -1 L 12 -4 L 11 0 L 12 4 L 8 1 C 4 4.4 -6 4.6 -10 0 Z" fill={fill} stroke={P.line} strokeWidth="0.6" />
      <path d={spot} fill={night ? "#d08a96" : "#ef9a9f"} />
      <circle cx="-6.5" cy="-1" r="0.8" fill={P.line} />
    </svg>
  );
  return (
    <div className="koi-pond" style={{ left: 338, top: 612 }}>
      <div className="koi-ring koi-ring--a">
        <div className="koi">{fish(P.koi[0], "M -4 -3 C -1 -4 2 -2 1 0 C -1 1 -3 0 -4 -3 Z")}</div>
      </div>
      <div className="koi-ring koi-ring--b">
        <div className="koi">{fish(P.koi[1], "M 0 -2.6 C 3 -3 5 -1 4 1 C 2 2 0 1 0 -2.6 Z")}</div>
      </div>
    </div>
  );
});

function Fern({ d, leaves, P }) {
  return (
    <g>
      <path d={d} stroke={P.stem} strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {leaves.map(([x, y, rot, s], i) => (
        <path
          key={i}
          d="M 0 0 C 3 -2.2 8 -2 11 0 C 8 2 3 2.2 0 0 Z"
          transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}
          fill={P.fern}
          stroke={P.line}
          strokeWidth={0.45 / s}
        />
      ))}
    </g>
  );
}

function frondLeaves(x0, y0, x1, y1, bend, count, size) {
  const leaves = [];
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const u = 1 - t;
    const cx = (x0 + x1) / 2 + bend;
    const cy = (y0 + y1) / 2;
    const x = u * u * x0 + 2 * u * t * cx + t * t * x1;
    const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    const dx = 2 * u * (cx - x0) + 2 * t * (x1 - cx);
    const dy = 2 * u * (cy - y0) + 2 * t * (y1 - cy);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    const s = size * (1 - t * 0.6);
    leaves.push([x, y, ang - 60, s], [x, y, ang + 60 + 180, s]);
  }
  return { d: `M ${x0} ${y0} Q ${(x0 + x1) / 2 + bend} ${(y0 + y1) / 2} ${x1} ${y1}`, leaves };
}

function Daisy({ x, y, r = 7, P }) {
  const petals = [];
  for (let i = 0; i < 12; i++) petals.push(<ellipse key={i} cx="0" cy={-r * 0.62} rx={r * 0.2} ry={r * 0.5} transform={`rotate(${i * 30})`} />);
  return (
    <g transform={`translate(${x} ${y}) scale(1 0.8)`} fill={P.daisy} stroke={P.line} strokeWidth="0.45">
      {petals}
      <circle r={r * 0.3} fill={P.daisyCenter} />
    </g>
  );
}

function PeachFlower({ x, y, r = 6, P }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke={P.line} strokeWidth="0.45">
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx="0" cy={-r * 0.6} r={r * 0.52} fill={P.peach} transform={`rotate(${a})`} />
      ))}
      <circle r={r * 0.32} fill={P.blossomCenter} />
    </g>
  );
}

// Botanical frame along the bottom edge, in front of the cats: two clusters
// of similar weight, one in each corner.
export const Foreground = memo(function Foreground({ night }) {
  const P = palette(night);
  const left = [frondLeaves(18, 728, 72, 654, -14, 8, 1.1), frondLeaves(30, 730, 102, 678, 10, 7, 0.95), frondLeaves(8, 704, 46, 646, -6, 6, 0.85)];
  const right = [frondLeaves(382, 728, 328, 654, 14, 8, 1.1), frondLeaves(370, 730, 298, 678, -10, 7, 0.95)];
  return (
    <>
      <div className="fg fg--left">
        <svg viewBox="0 600 140 130" width="140" height="130" aria-hidden="true">
          {left.map((f, i) => (
            <Fern key={i} d={f.d} leaves={f.leaves} P={P} />
          ))}
          <path d="M 38 730 Q 42 702 50 688 M 60 730 Q 64 712 76 702" stroke={P.stem} strokeWidth="1.2" fill="none" />
          <Daisy x={76} y={700} r={7.5} P={P} />
          <Daisy x={50} y={686} r={6} P={P} />
          <PeachFlower x={94} y={712} r={6.5} P={P} />
          <path d="M 20 720 C 40 704 54 706 66 724 Z M 80 730 C 90 712 110 712 120 730 Z" fill={P.leaf} stroke={P.line} strokeWidth="0.6" />
        </svg>
      </div>
      <div className="fg fg--right">
        <svg viewBox="260 600 140 130" width="140" height="130" aria-hidden="true">
          {right.map((f, i) => (
            <Fern key={i} d={f.d} leaves={f.leaves} P={P} />
          ))}
          <path d="M 362 730 Q 358 702 350 688 M 340 730 Q 336 712 324 702" stroke={P.stem} strokeWidth="1.2" fill="none" />
          <Daisy x={324} y={700} r={7} P={P} />
          <PeachFlower x={306} y={712} r={6} P={P} />
          <Blossom x={350} y={686} r={5.6} P={P} />
          <path d="M 334 730 C 344 712 362 712 376 730 Z M 280 730 C 290 714 304 714 316 726 Z" fill={P.leaf} stroke={P.line} strokeWidth="0.6" />
        </svg>
      </div>
    </>
  );
});

const PETALS = Array.from({ length: 7 }, (_, i) => ({
  left: 40 + ((i * 61) % 320),
  duration: 17 + ((i * 7) % 9),
  delay: -((i * 37) % 23),
  drift: 50 + ((i * 29) % 70),
  scale: 0.75 + ((i * 13) % 5) / 10,
}));

// Sakura petals drift down slowly; they sway rather than spin.
export const Petals = memo(function Petals({ night }) {
  const P = palette(night);
  return (
    <div className="petals" aria-hidden="true">
      {PETALS.slice(0, night ? 4 : 7).map((p, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: p.left,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            "--drift": `${p.drift}px`,
            "--scale": p.scale,
          }}
        >
          <svg viewBox="-6 -6 12 12" width="12" height="12">
            <path d="M 0 5 C -4 2 -4.5 -3 -1.4 -5 L 0 -3.6 L 1.4 -5 C 4.5 -3 4 2 0 5 Z" fill={P.petal} />
          </svg>
        </span>
      ))}
    </div>
  );
});

// Birds far away in the day sky: just two curved strokes each.
const Birds = memo(function Birds() {
  const bird = (x, y, s, delay) => (
    <path
      key={`${x}-${y}`}
      className="bird"
      style={{ animationDelay: delay }}
      d={`M ${x - 5 * s} ${y} Q ${x - 2.5 * s} ${y - 3.5 * s} ${x} ${y} Q ${x + 2.5 * s} ${y - 3.5 * s} ${x + 5 * s} ${y}`}
    />
  );
  return (
    <div className="birds" aria-hidden="true">
      <div className="flock flock--a">
        <svg viewBox="0 0 60 30" width="60" height="30">
          {bird(10, 16, 1, "0s")}
          {bird(28, 8, 0.85, "-0.5s")}
          {bird(44, 20, 0.75, "-0.9s")}
        </svg>
      </div>
      <div className="flock flock--b">
        <svg viewBox="0 0 40 20" width="40" height="20">
          {bird(10, 12, 0.8, "-0.3s")}
          {bird(28, 7, 0.7, "-0.8s")}
        </svg>
      </div>
    </div>
  );
});

// Now and then a shooting star crosses the night sky, always the same way,
// like a quiet meteor shower.
const SHOOTING = [
  { x: 90, y: 112, angle: 24, duration: 23, delay: -5 },
  { x: 296, y: 96, angle: 28, duration: 37, delay: -21, pink: true },
];

const ShootingStars = memo(function ShootingStars() {
  return (
    <div className="shooting-stars" aria-hidden="true">
      {SHOOTING.map((s) => (
        <span key={s.x} className="shooting-star" style={{ left: s.x, top: s.y, transform: `rotate(${s.angle}deg)` }}>
          <i className={s.pink ? "is-pink" : undefined} style={{ animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s` }} />
        </span>
      ))}
    </div>
  );
});

// Everything behind the cats: sky, Fuji, the inn, lanterns and its curtain.
export function Courtyard({ night, norenRef }) {
  return (
    <>
      <div className="layer-wrap" style={{ zIndex: 0 }}>
        <SkyLayer night={night} />
      </div>
      {night && <ShootingStars />}
      <div className="layer-wrap" style={{ zIndex: 2 }}>
        <FarLayer night={night} />
      </div>
      {!night && <Birds />}
      <div className="layer-wrap mist" style={{ zIndex: 3 }}>
        <MistLayer night={night} />
      </div>
      <div className="layer-wrap" style={{ zIndex: 4 }}>
        <HotelLayer night={night} />
      </div>
      <Lantern x={120} y={389} glyph="猫" night={night} />
      <Lantern x={280} y={389} glyph="宿" night={night} />
      <Noren flapRef={norenRef} night={night} />
    </>
  );
}

const FIREFLIES = Array.from({ length: 7 }, (_, i) => ({
  left: 50 + ((i * 53) % 300),
  top: 470 + ((i * 37) % 170),
  duration: 9 + ((i * 5) % 7),
  delay: -((i * 23) % 13),
}));

// Fireflies drift over the garden at night.
export const Fireflies = memo(function Fireflies() {
  return (
    <div className="fireflies" aria-hidden="true">
      {FIREFLIES.map((f, i) => (
        <span
          key={i}
          className="firefly"
          style={{
            left: f.left,
            top: f.top,
            animationDuration: `${f.duration}s, ${(f.duration / 3).toFixed(2)}s`,
            animationDelay: `${f.delay}s, ${(f.delay / 2).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  );
});

// A butterfly by day, a firefly by night: cats chase it either way.
export const Butterfly = memo(function Butterfly({ innerRef, night }) {
  return (
    <div className="butterfly" ref={innerRef} aria-hidden="true">
      {night ? (
        <span className="firefly firefly--lead" />
      ) : (
        <svg viewBox="-12 -10 24 20" width="20" height="17">
          <g className="wing wing--l">
            <path d="M 0 0 C -6 -10 -12 -6 -10 -1 C -12 4 -6 7 0 1 Z" fill="#f4bccb" stroke="#545a94" strokeWidth="0.6" />
          </g>
          <g className="wing wing--r">
            <path d="M 0 0 C 6 -10 12 -6 10 -1 C 12 4 6 7 0 1 Z" fill="#f4bccb" stroke="#545a94" strokeWidth="0.6" />
          </g>
          <path d="M 0 -4 L 0 4" stroke="#545a94" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
});
