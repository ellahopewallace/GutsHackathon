// Tiny colour helpers. Cats derive their shading by mixing toward a deep
// indigo and a pale lavender paper rather than black/white, which keeps every
// coat in the soft pastel palette.
const INK = "#2c2b4d";
const PAPER = "#f8f6fc";

function toRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb) {
  return (
    "#" +
    rgb
      .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function mix(a, b, t) {
  const A = toRgb(a);
  const B = toRgb(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
}

export const darken = (color, t) => mix(color, INK, t);
export const lighten = (color, t) => mix(color, PAPER, t);

// Relative luminance (0 = black, 1 = white), used to pick readable fur strokes.
export function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
