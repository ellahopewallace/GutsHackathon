// Procedural fur geometry for the cat illustrations.
// Everything here returns SVG path strings and is computed once at load time.
// "Random" tufts use a seeded generator, so they are identical on every device.
import { mulberry32 as rng } from "../../game/rng";

const r2 = (n) => Math.round(n * 100) / 100;
const pt = (p) => `${r2(p[0])} ${r2(p[1])}`;

const add = (a, b, s = 1) => [a[0] + b[0] * s, a[1] + b[1] * s];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const norm = (v) => {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
};

export function cubicAt([p0, p1, p2, p3], t) {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

function cubicTangent([p0, p1, p2, p3], t) {
  const u = 1 - t;
  return norm([
    3 * u * u * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t * t * (p3[0] - p2[0]),
    3 * u * u * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t * t * (p3[1] - p2[1]),
  ]);
}

// Catmull-Rom spline through points, as cubic Béziers.
function smoothPath(points, closed = false) {
  const n = points.length;
  const get = (i) => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))]);
  let d = `M ${pt(points[0])}`;
  const segments = closed ? n : n - 1;
  for (let i = 0; i < segments; i++) {
    const p0 = get(i - 1);
    const p1 = get(i);
    const p2 = get(i + 1);
    const p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? `${d} Z` : d;
}

// Walks along base points drawing a swept, flame-like tuft between each pair.
// normals[i] points outward at base[i]; leanAt(i) is the signed shift of the
// tip along the edge (positive = toward the next point). Tuft depths vary so
// the edge reads as fur rather than scallops. Returns commands without the M.
function tuftRun(base, normals, depth, leanAt, random) {
  let d = "";
  for (let i = 0; i < base.length - 1; i++) {
    const a = base[i];
    const b = base[i + 1];
    const along = sub(b, a);
    const nMid = norm(add(normals[i], normals[i + 1]));
    const k = depth * (0.35 + random() * 0.95);
    const lean = leanAt(i);
    const forward = lean >= 0;
    const tip = add(add(lerp2(a, b, 0.5), nMid, k), along, lean);
    const c1 = add(a, normals[i], k * (forward ? 0.8 : 0.15));
    const c2 = add(b, normals[i + 1], k * (forward ? 0.15 : 0.8));
    d += ` Q ${pt(c1)} ${pt(tip)} Q ${pt(c2)} ${pt(b)}`;
  }
  return d;
}

// Tufted edge along an elliptical arc (angles in degrees, SVG orientation:
// 0 = right, 90 = down). With `towards`, tufts on both sides sweep toward that
// angle (e.g. 90 makes a ruff hang downward). Returns an open path with M.
export function fluffArc({ cx, cy, rx, ry, from, to, tufts, depth, lean = 0.25, towards, seed = 1 }) {
  const random = rng(seed);
  const base = [];
  const normals = [];
  const angles = [];
  const step = (to - from) / tufts;
  for (let i = 0; i <= tufts; i++) {
    const jitter = i === 0 || i === tufts ? 0 : (random() - 0.5) * step * 0.5;
    const deg = from + step * i + jitter;
    const a = (deg * Math.PI) / 180;
    angles.push(deg);
    base.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
    normals.push(norm([Math.cos(a) / rx, Math.sin(a) / ry]));
  }
  const dir = Math.sign(to - from) || 1;
  const leanAt = (i) => {
    if (towards == null) return lean;
    const mid = (angles[i] + angles[i + 1]) / 2;
    return lean * (Math.sign(towards - mid) || 1) * dir;
  };
  return `M ${pt(base[0])}${tuftRun(base, normals, depth, leanAt, random)}`;
}

// Turns simple stroke paths ("M x y Q cx cy x y" or "M x y L x y" sub-paths)
// into filled, tapered brush strokes, like stripes cut into a woodblock.
export function taperStrokes(d, width) {
  const out = [];
  for (const seg of d.split("M")) {
    const nums = seg
      .replace(/[QL]/g, " ")
      .trim()
      .split(/[\s,]+/)
      .filter(Boolean)
      .map(Number);
    if (nums.length < 4) continue;
    const p0 = [nums[0], nums[1]];
    const quad = nums.length >= 6;
    const p1 = quad ? [nums[4], nums[5]] : [nums[2], nums[3]];
    const c = quad ? [nums[2], nums[3]] : lerp2(p0, p1, 0.5);
    const left = [];
    const right = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const u = 1 - t;
      const p = [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
      const tan = norm([
        2 * u * (c[0] - p0[0]) + 2 * t * (p1[0] - c[0]),
        2 * u * (c[1] - p0[1]) + 2 * t * (p1[1] - c[1]),
      ]);
      const n = [-tan[1], tan[0]];
      // Fuller where the brush presses down, thin where it lifts off.
      const w = (width / 2) * (0.12 + 0.88 * Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.08)), 0.6));
      left.push(add(p, n, w));
      right.push(add(p, n, -w));
    }
    out.push(smoothPath([...left, ...right.slice(1, -1).reverse()], true));
  }
  return out.join(" ");
}

// A tail (or any limb-like plume) built around a cubic centreline.
// Short fur gets a smooth outline; long fur gets tufted edges and a brush tip.
export function tailShape({ curve, w0, w1, fluff = 0, tufts = 7, bulge = 0.2, lean = 0.45, seed = 3 }) {
  const random = rng(seed);
  const steps = fluff ? tufts : 10;
  const left = [];
  const right = [];
  const nl = [];
  const nr = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = cubicAt(curve, t);
    const tan = cubicTangent(curve, t);
    const n = [-tan[1], tan[0]];
    const w = ((w0 + (w1 - w0) * t) / 2) * (1 + bulge * Math.sin(Math.PI * Math.min(t * 1.1, 1)));
    left.push(add(p, n, w));
    right.push(add(p, n, -w));
    nl.push(n);
    nr.push([-n[0], -n[1]]);
  }
  const end = cubicAt(curve, 1);
  const endTan = cubicTangent(curve, 1);
  const tip = add(end, endTan, (w1 / 2) * (fluff ? 1.5 : 0.9));

  if (!fluff) {
    const outline = [...left, tip, ...right.reverse()];
    return smoothPath(outline, false) + " Z";
  }
  // Fur flows toward the tip on both edges.
  const leftRun = tuftRun(left, nl, fluff, () => lean, random);
  const rightBack = [...right].reverse();
  const nrBack = [...nr].reverse();
  const rightRun = tuftRun(rightBack, nrBack, fluff, () => -lean, random);
  const last = left[left.length - 1];
  const capCtrl = add(last, endTan, w1 * 0.9);
  const capCtrl2 = add(rightBack[0], endTan, w1 * 0.9);
  return (
    `M ${pt(left[0])}${leftRun}` +
    ` Q ${pt(capCtrl)} ${pt(tip)} Q ${pt(capCtrl2)} ${pt(rightBack[0])}` +
    `${rightRun} Z`
  );
}

// Fine "kebori" hair strokes radiating from an elliptical arc.
export function hairArc({ cx, cy, rx, ry, from, to, count, len, curl = 0.3, seed = 5, inset = 0 }) {
  const random = rng(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const a = ((from + (to - from) * t + (random() - 0.5) * 6) * Math.PI) / 180;
    const n = norm([Math.cos(a) / rx, Math.sin(a) / ry]);
    const tan = [-n[1], n[0]];
    const start = [cx + (rx - inset) * Math.cos(a), cy + (ry - inset) * Math.sin(a)];
    const l = len * (0.7 + random() * 0.6);
    const endP = add(add(start, n, l), tan, l * curl);
    const ctrl = add(start, n, l * 0.6);
    d += `M ${pt(start)} Q ${pt(ctrl)} ${pt(endP)} `;
  }
  return d.trim();
}

// Hair strokes along a cubic centreline (for tails), on both edges.
export function hairCurve({ curve, w0, w1, count, len, seed = 9, bulge = 0.2 }) {
  const random = rng(seed);
  let d = "";
  for (let i = 0; i < count; i++) {
    const t = 0.12 + (0.8 * i) / Math.max(1, count - 1);
    const p = cubicAt(curve, t);
    const tan = cubicTangent(curve, t);
    const n = [-tan[1], tan[0]];
    const w = ((w0 + (w1 - w0) * t) / 2) * (1 + bulge * Math.sin(Math.PI * t)) * 0.55;
    const side = i % 2 ? 1 : -1;
    const start = add(p, n, side * w);
    const l = len * (0.7 + random() * 0.5);
    const endP = add(add(start, tan, l), n, side * l * 0.35);
    d += `M ${pt(start)} Q ${pt(add(start, tan, l * 0.6))} ${pt(endP)} `;
  }
  return d.trim();
}

// Mirror a path horizontally (x -> -x). Only handles absolute M/L/C/Q/Z
// commands with coordinate pairs, which is all the hand-drawn shapes use.
export function mirrorX(d) {
  return d.replace(/(-?\d*\.?\d+)[\s,]+(-?\d*\.?\d+)/g, (_, x, y) => `${r2(-parseFloat(x))} ${y}`);
}
