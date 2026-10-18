// Layout of the hotel courtyard in world units (the scene is 400 x 720 and is
// scaled to fit the screen). y is depth: larger y = closer to the viewer.

export const WORLD = { width: 400, height: 720 };

// Walkable ground: the engawa deck plus the gravel garden.
const FLOOR = { top: 458, bottom: 662, left: 32, right: 368 };

const POND = { cx: 338, cy: 612, rx: 96, ry: 52 };
const LANTERN = { x: 44, y: 486, rx: 46, ry: 40 };

export const ENTRANCE = { x: 200, y: 452 };
export const ARRIVAL = { x: 200, y: 506 };

export const NAP_SPOTS = [
  { x: 106, y: 522 }, // vermillion cushion
  { x: 226, y: 640 }, // indigo cushion
  { x: 198, y: 566 }, // sunny patch
  { x: 300, y: 466 }, // on the deck by the shoji
];

export const WATCH_SPOTS = [
  { x: 234, y: 606 },
  { x: 254, y: 572 },
];

export const FOOD = { x: 80, y: 612 };

export function bowlSpot(index) {
  const slots = [
    { x: 64, y: 606 },
    { x: 100, y: 614 },
    { x: 80, y: 632 },
    { x: 118, y: 634 },
  ];
  return slots[index % slots.length];
}

// Cats get a little smaller as they walk toward the back of the courtyard.
export function depthScale(y) {
  const t = Math.max(0, Math.min(1, (y - FLOOR.top) / (FLOOR.bottom - FLOOR.top)));
  return 0.5 + t * 0.22;
}

export function isWalkable(x, y) {
  if (y < FLOOR.top || y > FLOOR.bottom || x < FLOOR.left || x > FLOOR.right) return false;
  const p = ((x - POND.cx) / POND.rx) ** 2 + ((y - POND.cy) / POND.ry) ** 2;
  if (p < 1) return false;
  const l = ((x - LANTERN.x) / LANTERN.rx) ** 2 + ((y - LANTERN.y) / LANTERN.ry) ** 2;
  return l >= 1;
}

export function randomFloorPoint(next, margin = 10) {
  for (let i = 0; i < 40; i++) {
    const x = FLOOR.left + margin + next() * (FLOOR.right - FLOOR.left - margin * 2);
    const y = FLOOR.top + 14 + next() * (FLOOR.bottom - FLOOR.top - 26);
    if (isWalkable(x, y)) return { x, y };
  }
  return { x: 200, y: 560 };
}

export function clampToFloor(p) {
  const x = Math.max(FLOOR.left, Math.min(FLOOR.right, p.x));
  const y = Math.max(FLOOR.top + 8, Math.min(FLOOR.bottom, p.y));
  if (isWalkable(x, y)) return { x, y };
  // Step sideways off the pond or the lantern's moss mound.
  return x > 200 ? { x: Math.min(x, 236), y } : { x: Math.max(x, 94), y };
}

// The butterfly drifts on a fixed loop, so every device sees it in the same
// place and cats can chase it.
export function butterflyAt(t, index = 0) {
  const s = t / 1000 + index * 37;
  return {
    x: 200 + Math.sin(s * 0.21) * 120 + Math.sin(s * 0.53) * 26,
    y: 520 + Math.sin(s * 0.17 + 1.3) * 46 + Math.cos(s * 0.61) * 10,
    lift: 34 + Math.sin(s * 1.7) * 9,
  };
}
