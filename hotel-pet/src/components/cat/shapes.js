// Path data for the cat illustrations.
// Coordinates are local to the cat: (0, 0) is the ground point under the cat,
// x grows right, y grows down (so the cat lives at negative y).
// Walk and sleep poses face right; the renderer mirrors them for left.
import { cubicAt, fluffArc, hairArc, hairCurve, mirrorX, tailShape, taperStrokes } from "./geometry";

const both = (d) => `${d} ${mirrorX(d)}`;

// Brush-stroke bands across a tail centreline.
function tailBands(curve, halfWidth, ts = [0.4, 0.58, 0.76, 0.92]) {
  return ts
    .map((t) => {
      const a = cubicAt(curve, t - 0.02);
      const b = cubicAt(curve, t + 0.02);
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1;
      const nx = (-dy / l) * halfWidth;
      const ny = (dx / l) * halfWidth;
      const c = cubicAt(curve, t);
      return `M ${(c[0] + nx).toFixed(2)} ${(c[1] + ny).toFixed(2)} L ${(c[0] - nx).toFixed(2)} ${(c[1] - ny).toFixed(2)}`;
    })
    .join(" ");
}

function tailSet(curve, short, long) {
  return {
    curve,
    shape: { short: tailShape({ curve, ...short }), long: tailShape({ curve, ...long }) },
    hairs: hairCurve({ curve, w0: long.w0, w1: long.w1, count: 12, len: 6, seed: long.seed + 2, bulge: long.bulge }),
    bands: {
      short: taperStrokes(tailBands(curve, short.w0 * 0.75), 2.8),
      long: taperStrokes(tailBands(curve, long.w0 * 0.6, [0.5, 0.74]), 3.6),
    },
    calico: taperStrokes(tailBands(curve, long.w0 * 0.8, [0.55, 0.9]), 6),
  };
}

// ---------------------------------------------------------------- sitting
const sitEarLong = "M -19.5 -85 C -20.5 -94 -20 -103 -17.5 -110 C -14 -106 -10 -100 -7 -93.5 Q -13 -88 -19.5 -85 Z";
const sitEarLongLine = "M -19.5 -85 C -20.5 -94 -20 -103 -17.5 -110 C -14 -106 -10 -100 -7 -93.5";
const sitInnerLong = "M -17.2 -88 C -18.2 -95 -17.8 -101 -16.6 -105.5 C -13.8 -102 -11.2 -98 -9.2 -93.5 Z";
const sitEarShort = "M -19.5 -85 C -20.5 -93 -20.2 -100 -18 -106 C -14.5 -103 -10.5 -98.5 -7 -93.5 Q -13 -88 -19.5 -85 Z";
const sitEarShortLine = "M -19.5 -85 C -20.5 -93 -20.2 -100 -18 -106 C -14.5 -103 -10.5 -98.5 -7 -93.5";
const sitInnerShort = "M -17.2 -88 C -18 -94 -17.8 -99 -16.8 -102.5 C -14 -99.5 -11.4 -96.5 -9.2 -93.5 Z";
const sitHaunch = "M -21 -36 C -34 -33 -39 -8 -31 -1.5 C -25 2 -15 1.4 -11.6 -2 C -11 -10 -13 -26 -21 -36 Z";
// Legs are drawn under the torso, which tapers into them, so only the lower
// part shows and the leg outlines continue the chest contour.
const sitLeg = "M -12.4 -26 C -12.6 -16 -12 -9 -12.4 -4.4 C -12.8 -1 -10.4 1 -6.8 1 C -3.4 1 -0.8 -0.4 -0.8 -3.4 C -0.8 -10 -0.8 -18 -0.8 -26 Z";
const sitTorsoSide = "M -12.4 -18 C -16 -22 -23.5 -27 -24.5 -34 C -26 -45 -21 -57 -12 -62";

const sitRuffArc = fluffArc({
  cx: 0, cy: -59, rx: 24, ry: 18, from: -15, to: 195, tufts: 8, depth: 6, lean: 0.45, towards: 90, seed: 11,
});
const sitCheekArc = fluffArc({
  cx: 0, cy: -73, rx: 21, ry: 16, from: 200, to: 118, tufts: 4, depth: 3.6, lean: 0.3, towards: 100, seed: 31,
});

export const SIT = {
  head:
    "M -21 -74 C -21.5 -78 -21 -82 -19.5 -85 C -16 -90 -12 -92.5 -7 -93.5 C -3 -94.5 3 -94.5 7 -93.5 " +
    "C 12 -92.5 16 -90 19.5 -85 C 21 -82 21.5 -78 21 -74 C 20.5 -65 12 -57.5 0 -57 C -12 -57.5 -20.5 -65 -21 -74 Z",
  // The outline skips the ear bases so ears grow out of the head without a seam.
  headLine:
    "M -7 -93.5 C -3 -94.5 3 -94.5 7 -93.5 M 19.5 -85 C 21 -82 21.5 -78 21 -74 C 20.5 -65 12 -57.5 0 -57 " +
    "C -12 -57.5 -20.5 -65 -21 -74 C -21.5 -78 -21 -82 -19.5 -85",
  earL: { long: sitEarLong, short: sitEarShort },
  earLineL: { long: sitEarLongLine, short: sitEarShortLine },
  innerL: { long: sitInnerLong, short: sitInnerShort },
  earR: { long: mirrorX(sitEarLong), short: mirrorX(sitEarShort) },
  earLineR: { long: mirrorX(sitEarLongLine), short: mirrorX(sitEarShortLine) },
  innerR: { long: mirrorX(sitInnerLong), short: mirrorX(sitInnerShort) },
  earTufts: both("M -17.5 -110 Q -17.6 -112.6 -18.8 -115"),
  earFurnish: both("M -9.6 -94 Q -11.8 -98 -15 -101.2 M -11.6 -93 Q -13.2 -97 -15.6 -99.4 M -13.4 -91.6 Q -14.8 -95 -16.8 -97.4"),
  body:
    "M -12 -62 C -21 -57 -26 -45 -24.5 -34 C -23.5 -27 -16 -22 -12.4 -18 L 12.4 -18 " +
    "C 16 -22 23.5 -27 24.5 -34 C 26 -45 21 -57 12 -62 Z",
  bodyLine: both(sitTorsoSide),
  haunchL: sitHaunch,
  haunchR: mirrorX(sitHaunch),
  hindPaws: [[-26, -1.6], [26, -1.6]],
  legL: sitLeg,
  legR: mirrorX(sitLeg),
  toes: both("M -8.8 -2.6 L -8.8 0.6 M -5 -2.8 L -5 0.8"),
  tail: tailSet(
    [[18, -10], [40, -6], [50, -17], [44, -33]],
    { w0: 8, w1: 6, bulge: 0.08 },
    { w0: 12, w1: 11, fluff: 4, tufts: 5, bulge: 0.38, lean: 0.5, seed: 21 },
  ),
  tailPivot: [22, -10],
  ruff: `${sitRuffArc} C -25 -72 -16 -78 0 -78 C 16 -78 25 -72 23.18 -63.66 Z`,
  ruffLine: sitRuffArc,
  ruffHairs: hairArc({ cx: 0, cy: -59, rx: 21, ry: 15, from: 20, to: 160, count: 18, len: 6.5, curl: 0.15, inset: 3, seed: 12 }),
  cheekL: `${sitCheekArc} Q -10 -70 -19.73 -78.47 Z`,
  cheekLineL: sitCheekArc,
  longHairs:
    "M -6 -36 Q -5 -33 -6.2 -30 M 6 -36 Q 7 -33 5.8 -30 " +
    both("M -30 -26 Q -27 -23 -27.4 -19 M -33 -14 Q -30 -11 -30.2 -7"),
  shortHairs: both("M -29 -24 Q -27 -21.6 -27.4 -18.4") + " M -4 -46 Q -3.4 -43.4 -4.4 -41",
  // face
  eyeL: "M -13.8 -78.2 C -12 -82.3 -5.6 -81.6 -3.6 -76.6 C -6.6 -74.2 -11.6 -74.6 -13.8 -78.2 Z",
  eyeR: mirrorX("M -13.8 -78.2 C -12 -82.3 -5.6 -81.6 -3.6 -76.6 C -6.6 -74.2 -11.6 -74.6 -13.8 -78.2 Z"),
  lids: both("M -13.8 -78.2 C -12 -82.3 -5.6 -81.6 -3.6 -76.6"),
  pupils: [[-8.7, -77.8], [8.7, -77.8]],
  shines: [[-7.4, -79.3], [10, -79.3]],
  happyEyes: both("M -13.4 -76.4 Q -8.7 -81.6 -4 -76.4"),
  closedEyes: both("M -13.6 -77.6 Q -8.7 -74.4 -3.8 -77.6"),
  nose: "M -2.7 -69.6 Q 0 -70.8 2.7 -69.6 Q 1.4 -67.2 0 -66.7 Q -1.4 -67.2 -2.7 -69.6 Z",
  mouth: "M 0 -66.7 L 0 -65.2 M 0 -65.2 Q -1.4 -62.6 -4.2 -63.5 M 0 -65.2 Q 1.4 -62.6 4.2 -63.5",
  openMouth: [0, -63.4],
  tongue: "M -1.7 -63.6 Q 0 -59.6 1.7 -63.6 Z",
  whiskers: both("M -6.5 -66.4 Q -18 -69.5 -31 -68.6 M -6.5 -65.4 Q -18 -66 -32 -63.6 M -7 -64.4 Q -17 -62.4 -29 -58.6"),
  muzzle:
    "M -10.5 -66.5 C -8 -71 -3 -71.2 0 -69 C 3 -71.2 8 -71 10.5 -66.5 C 10 -60.5 5 -57.4 0 -57.4 C -5 -57.4 -10 -60.5 -10.5 -66.5 Z",
  blaze: "M 0 -91 C -2.5 -84 -7 -77 -12 -67 C -11 -60 -5 -57 0 -57 C 5 -57 11 -60 12 -67 C 7 -77 2.5 -84 0 -91 Z",
  bib: "M -11 -61 C -14 -50 -10 -36 0 -30 C 10 -36 14 -50 11 -61 Z",
  belly: "M -13 -61 C -17 -42 -14 -24 -12.4 -18 L 12.4 -18 C 14 -24 17 -42 13 -61 Z",
  socks: "M -13.4 -6.4 L -0.5 -6.4 L -0.5 2 L -13.4 2 Z M 13.4 -6.4 L 0.5 -6.4 L 0.5 2 L 13.4 2 Z",
  // tabby markings as tapered brush strokes
  tabbyHead: taperStrokes(
    "M -4.6 -92 L -3.6 -85.6 M 0 -93.6 L 0 -86.2 M 4.6 -92 L 3.6 -85.6 " +
      both("M -21.4 -72 Q -17.6 -71.4 -14.6 -69.6 M -20.8 -67.6 Q -17.4 -67 -15.2 -65.4"),
    2.3,
  ),
  eyeLiner: both("M -14 -78.2 Q -17.4 -78.8 -19.8 -80.8"),
  tabbyBody: taperStrokes(
    both("M -25 -44 Q -20 -42 -16.6 -46 M -25 -35 Q -20 -33 -16.4 -36.6 M -22 -27 Q -18 -25.6 -14.6 -28.4"),
    3.8,
  ),
  tabbyHaunch: taperStrokes(both("M -36.4 -20 Q -31 -22.6 -27 -18 M -35.6 -9.6 Q -30.6 -12.4 -26.4 -8.4"), 3.6),
  tabbyChest: taperStrokes("M -10 -50 Q 0 -46 10 -50 M -11 -42 Q 0 -38 11 -42 M -11 -33 Q 0 -29.4 11 -33", 2.6),
  tabbyLegs: taperStrokes(both("M -12.4 -14 Q -6.6 -12.8 -0.8 -14 M -12.4 -7.6 Q -6.6 -6.4 -0.8 -7.6"), 2.4),
  // calico patches: [path, which colour]
  patchesBody: [
    ["M -25 -48 C -18 -52 -12 -40 -16 -31 C -19 -25 -25 -28 -25.6 -36 C -25.8 -41 -25.6 -45 -25 -48 Z", 1],
    ["M 13 -60 C 22 -53 26 -42 24 -35 C 18 -34 13 -42 12.2 -51 C 12 -55 12.2 -58 13 -60 Z", 2],
  ],
  patchesHaunch: [
    ["M 24 -36 C 34 -34 40 -18 36 -6 C 30 -1 22 -4 20 -10 C 19 -18 19 -30 24 -36 Z", 1],
    ["M -30 -30 C -24 -32 -20 -24 -22 -18 C -25 -14 -31 -16 -33 -21 C -34 -25 -33 -28 -30 -30 Z", 2],
  ],
  patchesHead: [
    ["M -22 -96 C -12 -100 -5 -90 -9 -81 C -13 -77 -21 -78 -23 -84 C -24 -88 -24 -93 -22 -96 Z", 1],
    ["M 7 -97 C 16 -100 23 -92 22 -84 C 18 -80 11 -83 8 -88 C 6.6 -91 6.4 -94 7 -97 Z", 2],
  ],
  scruff: both("M -16 -94.6 L -18.4 -99 M -11.6 -95.4 L -12.4 -99.6 M -30 -30 L -34.4 -28.6 M -33.6 -16 L -38 -16.4 M -21 -66 L -25 -64"),
  // accessories
  scarf: "M -14.5 -61.5 Q 0 -54.5 14.5 -61.5 L 13 -57.5 Q 6 -50 1.5 -43.5 Q 0 -42 -1.5 -43.5 Q -6 -50 -13 -57.5 Z",
  scarfDots: [[-6, -55.4, 0.95], [0, -52.6, 0.95], [6, -55.4, 0.95], [-3, -49, 0.75], [3, -49, 0.75], [0, -45.8, 0.6]],
  collar: "M -13 -61 Q 0 -54.6 13 -61",
  bell: [0, -55.2],
  crown: [[-10, -92.5, 3.6, -22], [0, -95.8, 4.1, 0], [10, -92.5, 3.6, 22]],
  emoteY: -124,
};

// ---------------------------------------------------------------- walking (faces right)
const walkRuffArc = fluffArc({
  cx: 31, cy: -45, rx: 9.5, ry: 13, from: -80, to: 125, tufts: 7, depth: 4.2, lean: 0.3, towards: 90, seed: 41,
});
const britchesArc = fluffArc({
  cx: -25, cy: -27, rx: 7, ry: 9.5, from: 95, to: 215, tufts: 4, depth: 3.2, lean: 0.3, towards: 150, seed: 43,
});
const bellyArc = fluffArc({ cx: 0, cy: -28, rx: 22, ry: 6, from: 150, to: 30, tufts: 5, depth: 2.6, lean: 0.35, seed: 45 });

export const WALK = {
  body:
    "M -30 -36 C -32 -47 -22 -52 -10 -51 C 2 -50 14 -53 24 -50.5 C 33 -48 37 -39 34 -31 C 31 -24 23 -22 13 -22.5 " +
    "C 1 -23 -11 -22 -20 -23 C -28 -24 -30 -29 -30 -36 Z",
  legFront:
    "M 15.5 -31 C 15 -22 16 -12 16 -5 C 16 -1.5 18.4 0.8 22.4 0.8 C 26 0.8 27 -1.4 25.4 -3 C 24.6 -10 25 -21 26.5 -30 Z",
  legBack:
    "M -30.5 -33 C -33.5 -23 -30 -17 -26 -13 C -25 -8.5 -25.6 -4 -25 -1.6 C -24.2 0.8 -19.6 0.8 -17.4 0.4 " +
    "C -15.2 -0.4 -15.8 -2.4 -17.4 -3.4 C -17.8 -9 -16.4 -15 -12.5 -25 Z",
  // The head is drawn at its original size and scaled up around this point.
  headScale: "translate(34 -58) scale(1.12) translate(-34 58)",
  head:
    "M 19 -56 C 18.5 -60 19.3 -63.5 21 -66 C 23.5 -69.3 26.5 -71.2 29.5 -72 C 32 -72.8 34.5 -73.2 37 -73 " +
    "C 41 -72.3 44.5 -70.3 46.5 -67.5 C 49.2 -64 51 -60.5 50.5 -57 C 50 -49.5 44 -44 37 -43.5 C 28 -43.5 19.5 -49 19 -56 Z",
  headLine:
    "M 29.5 -72 C 32 -72.8 34.5 -73.2 37 -73 M 46.5 -67.5 C 49.2 -64 51 -60.5 50.5 -57 C 50 -49.5 44 -44 37 -43.5 " +
    "C 28 -43.5 19.5 -49 19 -56 C 18.5 -60 19.3 -63.5 21 -66",
  earNear: "M 21 -66 C 20.5 -74 20.8 -81 22 -86.5 C 25.5 -82 28 -77 29.5 -72 Q 25 -67 21 -66 Z",
  earNearLine: "M 21 -66 C 20.5 -74 20.8 -81 22 -86.5 C 25.5 -82 28 -77 29.5 -72",
  innerNear: "M 22.6 -69.5 C 22.3 -75.5 22.6 -80.5 23.4 -83.5 C 25.4 -80.6 27 -77.6 28 -73.5 Z",
  earFar: "M 37 -73 C 39.5 -78.5 42.5 -83.5 45.5 -87.5 C 46.8 -81 47 -74 46.5 -67.5 Q 41.5 -69 37 -73 Z",
  earFarLine: "M 37 -73 C 39.5 -78.5 42.5 -83.5 45.5 -87.5 C 46.8 -81 47 -74 46.5 -67.5",
  innerFar: "M 39.6 -73.6 C 41.4 -77.6 43.4 -81.2 45 -84.2 C 45.6 -79.6 45.6 -75 45.2 -70.4 Z",
  earTufts: "M 22 -86.5 Q 21.8 -88.8 20.8 -90.8 M 45.5 -87.5 Q 46 -89.8 45.4 -92",
  eyeNear: "M 27.6 -61.6 C 29.2 -65.4 35 -65 36.5 -60.4 C 34 -58 29.6 -58.4 27.6 -61.6 Z",
  eyeFar: "M 41.2 -60.8 C 42.4 -64.8 46.4 -65 47.8 -62.2 C 46.8 -58.8 43.1 -58.2 41.2 -60.8 Z",
  lids: "M 27.6 -61.6 C 29.2 -65.4 35 -65 36.5 -60.4 M 41.2 -60.8 C 42.4 -64.8 46.4 -65 47.8 -62.2",
  pupils: [[32.2, -61.3, 1.15, 2.8], [44.7, -61.6, 1, 2.6]],
  shines: [[33.4, -62.9, 0.9], [45.7, -63.1, 0.8]],
  happyEyes: "M 28 -60.6 Q 32 -65.4 36 -60.6 M 41.6 -60.4 Q 44.7 -64.8 47.6 -61.4",
  nose: "M 38.2 -55.6 Q 41 -56.8 43.4 -55.4 Q 42 -53.2 40.8 -52.8 Q 39.4 -53.3 38.2 -55.6 Z",
  mouth: "M 40.8 -52.8 L 40.8 -51.4 M 40.8 -51.4 Q 39.6 -49.2 37 -49.8 M 40.8 -51.4 Q 42.2 -49.2 44.8 -50",
  whiskers: "M 45 -53.2 Q 52 -56 61 -56 M 45 -52.2 Q 53 -52.6 62 -50.6 M 44.6 -51.2 Q 51.6 -49.4 59 -45.8",
  muzzle:
    "M 34 -53.5 C 36 -57.5 40 -57.6 41 -55.6 C 43 -57.6 47.6 -57.2 48.6 -54 C 48 -48 43.6 -44.2 38.6 -44 C 34 -44.5 32.5 -49 34 -53.5 Z",
  blaze: "M 39 -73 C 37.5 -67 35 -61 32.5 -54 C 32 -47 36 -43.6 39 -43.6 C 44 -44 48.5 -48 49 -54 C 45 -60 41 -67 39 -73 Z",
  bib: "M 25 -50 C 34 -48 38 -39 34.5 -31 C 31.5 -25 27 -23 22 -22.5 C 24 -30 24.5 -40 25 -50 Z",
  belly: "M -22 -25 C -10 -28.5 12 -28.5 26 -25 L 26 -18 L -22 -18 Z",
  sock: "M 10 -7 L 31 -7 L 31 3 L 10 3 Z",
  sockBack: "M -33 -6 L -12 -6 L -12 3 L -33 3 Z",
  tail: tailSet(
    [[-27, -42], [-41, -46], [-48, -59], [-43, -73]],
    { w0: 8, w1: 5.5, bulge: 0.08 },
    { w0: 12.5, w1: 10, fluff: 3.8, tufts: 5, bulge: 0.34, lean: 0.5, seed: 47 },
  ),
  ruff: `${walkRuffArc} Q 18 -45 32.65 -57.8 Z`,
  ruffLine: walkRuffArc,
  ruffHairs: hairArc({ cx: 31, cy: -45, rx: 8.5, ry: 12, from: -40, to: 110, count: 8, len: 5, curl: 0.3, inset: 2, seed: 42 }),
  britches: `${britchesArc} Z`,
  britchesLine: britchesArc,
  bellyFluff: `${bellyArc} Z`,
  bellyFluffLine: bellyArc,
  backHairs: "M -20 -50.6 Q -16 -53 -12 -52.2 M -6 -50.8 Q -2 -52.8 2 -51.6 M 8 -51.6 Q 12 -53.4 16 -52.2",
  tabbyHead: taperStrokes(
    "M 35 -71.6 L 35.4 -66.2 M 38.8 -72.6 L 38.8 -66.6 M 42.4 -71.6 L 41.9 -66.2 " +
      "M 19.6 -56 Q 23.2 -55.4 25.8 -53.8 M 20.2 -51.8 Q 23.4 -51.2 25.6 -49.6",
    2.2,
  ),
  eyeLiner: "M 27.4 -61.6 Q 24.4 -62.4 22.4 -64.6",
  tabbyBody: taperStrokes(
    "M -24 -50.6 Q -26 -40 -22.6 -26 M -14 -51.4 Q -16 -40 -12.6 -24.6 M -4 -51 Q -6 -40 -3 -24 " +
      "M 6 -50.8 Q 4 -40.4 7 -25 M 15.4 -51.6 Q 13.6 -42 16 -33",
    4,
  ),
  tabbyFront: taperStrokes("M 15.6 -22 Q 20.6 -21 25.2 -22.4 M 15.9 -13 Q 20.9 -12 25 -13.4", 2.6),
  tabbyBack: taperStrokes("M -31 -26 Q -25.5 -25 -20.5 -22 M -26 -12.6 Q -21.6 -11.6 -17.6 -13.4", 2.6),
  patchesBody: [
    ["M -31 -40 C -26 -53 -9 -53 -7 -43 C -7 -34 -19 -29 -27 -31 C -30 -33 -32 -37 -31 -40 Z", 1],
    ["M 6 -51 C 16 -54 27 -50 25 -41 C 21 -35 10 -35 6 -41 C 4.6 -44 4.8 -48.6 6 -51 Z", 2],
  ],
  patchesHead: [
    ["M 20 -64 C 22 -72 30 -75 34 -72 C 34 -66 29 -62 24 -60 C 21.6 -59 20 -61 20 -64 Z", 1],
    ["M 39 -73.5 C 44 -74 50 -69 50 -62 C 46 -61 42 -64 40 -68 C 39.2 -70 38.8 -72 39 -73.5 Z", 2],
  ],
  scruff: "M 24 -70 L 21 -74.6 M -24 -51 L -27 -55 M -10 -51.4 L -11 -56 M 31 -30 L 35.6 -28",
  scarf: "M 23.5 -51 Q 29.5 -47 36 -48.6 L 34.6 -43 Q 32.4 -37 29.4 -32.6 Q 27.8 -31.6 26.8 -33.6 Q 25 -41 23.5 -51 Z",
  scarfDots: [[29.8, -44.6, 0.8], [28.4, -38.6, 0.7], [32.4, -40.6, 0.6]],
  collar: "M 24 -51.4 Q 30 -46.8 37 -48.8",
  bell: [31.8, -45.2],
  crown: [[25, -74, 3, -25], [33, -76.6, 3.5, 0], [41.4, -75.2, 3, 22]],
  emoteY: -104,
};

// ---------------------------------------------------------------- sleeping (faces right)
const sleepRuffArc = fluffArc({
  cx: 23.5, cy: -15, rx: 15.5, ry: 8.5, from: 12, to: 168, tufts: 7, depth: 3.2, lean: 0.25, towards: 90, seed: 51,
});
const sleepBackArc = fluffArc({ cx: -2, cy: -6, rx: 34.5, ry: 29.5, from: 192, to: 318, tufts: 8, depth: 2.6, lean: -0.3, seed: 53 });

export const SLEEP = {
  body:
    "M -36 -3 C -40 -19 -27 -35 -3 -35.5 C 21 -36 37 -25 36 -8 C 35.5 -1.5 30 0.8 0 0.8 C -28 0.8 -35 -0.5 -36 -3 Z",
  haunch: "M -26 -6 C -24 -16 -12 -20 -4 -14",
  backFluff: `${sleepBackArc} Z`,
  backFluffLine: sleepBackArc,
  tail: tailSet(
    [[-31, -8], [-28, 4], [14, 6.5], [29, -3]],
    { w0: 7.5, w1: 5.5, bulge: 0.08 },
    { w0: 9.5, w1: 8.5, fluff: 3, tufts: 5, bulge: 0.25, lean: 0.5, seed: 55 },
  ),
  ruff: `${sleepRuffArc} Z`,
  ruffLine: sleepRuffArc,
  paws:
    "M 14 -7.6 C 14 -10.6 19 -11.8 22 -10 C 24.6 -8.4 23.6 -5.4 20 -5.4 C 16.4 -5.4 14 -5.8 14 -7.6 Z " +
    "M 22.5 -7.2 C 22.6 -10 27 -11 29.8 -9.6 C 32.2 -8.2 31.4 -5.4 28 -5.4 C 25 -5.4 22.4 -5.6 22.5 -7.2 Z",
  headScale: "translate(23.5 -14) scale(1.2) translate(-23.5 14)",
  head: "M 9 -22 C 9 -30.5 15.5 -35.5 23.5 -35.5 C 31.5 -35.5 38 -30 38 -21.5 C 38 -13.5 31.5 -9.5 23.5 -9.5 C 15.5 -9.5 9 -14 9 -22 Z",
  earNear: "M 12 -28 C 10.6 -33 10.8 -38 12 -42.5 C 15.6 -40.2 18.6 -37.4 20.4 -33.8 Z",
  innerNear: "M 13 -31.5 C 12.4 -35 12.6 -37.8 13.2 -40 C 15.2 -38.4 16.8 -36.8 18 -34.6 Z",
  earFar: "M 27.4 -34.6 C 30.4 -38 33.4 -41 36.4 -42.8 C 37.2 -38.6 37 -34.2 35.6 -30.2 Z",
  innerFar: "M 29.4 -35 C 31.4 -37.4 33.4 -39.4 35.2 -40.6 C 35.6 -37.8 35.4 -35 34.6 -32.4 Z",
  earTufts: "M 12 -42.5 Q 11.8 -44.4 10.9 -46 M 36.4 -42.8 Q 37.2 -44.6 38.4 -45.6",
  eyes: "M 15.4 -22.4 Q 18.6 -19.8 21.8 -22.4 M 26.6 -22.6 Q 29.6 -20.2 32.6 -22.8",
  nose: "M 22.6 -17.8 Q 24.6 -18.8 26.6 -17.8 Q 25.6 -16 24.6 -15.7 Q 23.6 -16 22.6 -17.8 Z",
  mouth: "M 24.6 -15.7 L 24.6 -14.6 M 24.6 -14.6 Q 23.6 -12.9 21.8 -13.4 M 24.6 -14.6 Q 25.6 -12.9 27.4 -13.4",
  whiskers:
    "M 28.5 -15.6 Q 36 -17.6 43 -17 M 28.5 -14.8 Q 36 -14.6 43.5 -12.6 M 20.5 -15.6 Q 13 -17.2 6 -16.4 M 20.4 -14.8 Q 13 -14.4 6.4 -12.4",
  muzzle:
    "M 18.4 -16.8 C 20 -20 23.4 -20.2 24.6 -18.4 C 25.8 -20.2 29.2 -20 30.8 -16.8 C 30.2 -12.4 27.6 -10 24.6 -10 C 21.6 -10 19 -12.4 18.4 -16.8 Z",
  blaze:
    "M 24.6 -35.5 C 23 -30 20 -24 17 -17 C 18 -11.6 21.4 -9.6 24.6 -9.6 C 27.8 -9.6 31.2 -11.6 32.2 -17 C 29.2 -24 26.2 -30 24.6 -35.5 Z",
  bellyWhite: "M 6 -4 C 14 -12 26 -12 34 -6 L 34 2 L 6 2 Z",
  tabbyHead: taperStrokes("M 20.4 -33.6 L 21 -28.6 M 23.6 -35.2 L 23.6 -29 M 26.8 -33.6 L 26.2 -28.6", 2.2),
  tabbyBody: taperStrokes(
    "M -28 -26 Q -26 -16 -30 -6 M -18 -32 Q -15 -20 -20 -8 M -7 -35 Q -4 -22 -9 -10 M 4 -35 Q 6 -24 3 -14",
    4.2,
  ),
  patchesBody: [
    ["M -36 -10 C -34 -26 -20 -34 -12 -30 C -8 -22 -16 -10 -26 -6 C -31 -4 -35 -6 -36 -10 Z", 1],
    ["M 2 -35.5 C 14 -36 24 -32 22 -26 C 16 -22 6 -24 2 -30 C 1 -32 1.2 -34 2 -35.5 Z", 2],
  ],
  patchesHead: [["M 10 -24 C 10 -32 16 -36 20 -34 C 21 -30 18 -26 14 -24 C 12.4 -23.4 10.8 -23.4 10 -24 Z", 1]],
  scarf: "M 13.6 -12.4 Q 24 -6.4 34.4 -12.4 L 33 -8.6 Q 27 -3.6 24 -1.6 Q 21 -3.6 15 -8.6 Z",
  collar: "M 13 -12.6 Q 24 -7.2 35 -12.6",
  bell: [24, -8.6],
  crown: [[17, -36, 2.8, -20], [24, -38, 3.2, 0], [31, -36.4, 2.8, 22]],
  emoteY: -60,
};
