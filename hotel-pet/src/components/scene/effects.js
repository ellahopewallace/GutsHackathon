import { depthScale } from "../../game/world";

// Little in-world effects: mood icons, sound words, particles, the hand that
// pets and the comb that brushes. They are plain DOM nodes that remove
// themselves when their CSS animation ends.

// How tall each pose is (in cat units), for placing things above the head.
export const POSE_HEIGHT = { sit: 122, walk: 98, sleep: 58 };

const LINE = "#545a94";
const HEART = "M 8 13.5 C 3 10 1 7.5 1 5 C 1 3 2.6 1.6 4.4 1.6 C 5.8 1.6 7.2 2.6 8 4 C 8.8 2.6 10.2 1.6 11.6 1.6 C 13.4 1.6 15 3 15 5 C 15 7.5 13 10 8 13.5 Z";
const FISH = "M 1.5 8 C 4 4.4 9 4.4 11 7 L 14.6 4.6 L 13.6 8 L 14.6 11.4 L 11 9 C 9 11.6 4 11.6 1.5 8 Z";
const petals = (fill) =>
  [0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-3.6" rx="2.4" ry="3.4" fill="${fill}" transform="rotate(${a})"/>`).join("");

// Icons in a 16 x 16 box, shared by mood bubbles, name cues and particles.
const ICONS = {
  heart: `<path d="${HEART}" fill="#ec9bb2"/>`,
  zzz: '<path d="M 2 4 H 7 L 2 10 H 7 M 9 7 H 13 L 9 12 H 13" fill="none" stroke="#7d89c9" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>',
  fish: `<path d="${FISH}" fill="#86a3d6"/><circle cx="4.6" cy="7.4" r="0.9" fill="#f8f6fc"/>`,
  note: '<path d="M 6.6 12.4 a 2.3 1.9 0 1 1 -0.1 0 Z M 8.8 12.3 V 3 L 13.6 2 V 4.6 L 8.8 5.6" fill="#7179b8" stroke="#7179b8" stroke-width="1.1" stroke-linejoin="round"/>',
  sparkle: '<path d="M 8 1 L 9.4 6.6 L 15 8 L 9.4 9.4 L 8 15 L 6.6 9.4 L 1 8 L 6.6 6.6 Z" fill="#ecc97f"/>',
  exclaim: '<path d="M 6.8 2 H 9.2 L 8.7 10 H 7.3 Z" fill="#e3879f"/><circle cx="8" cy="13" r="1.4" fill="#e3879f"/>',
  flower: `<g transform="translate(8 8)">${petals("#f6c6d4")}<circle r="1.4" fill="#e08fa8"/></g>`,
  lantern: `<ellipse cx="8" cy="8.5" rx="5" ry="6" fill="#f2b0c1"/><rect x="5" y="1.5" width="6" height="2" rx="1" fill="${LINE}"/><rect x="5" y="13.5" width="6" height="2" rx="1" fill="${LINE}"/>`,
};

export const icon = (name) => `<svg viewBox="0 0 16 16" aria-hidden="true">${ICONS[name] ?? ""}</svg>`;

// Which icon goes with a name cue ("Kenji ♥" over your cat).
const CUE = { pet: "heart", treat: "fish", arrive: "lantern" };

const HAND =
  `<svg viewBox="0 0 32 32"><g fill="#f8d3dc" stroke="${LINE}" stroke-width="1.2"><path d="M 16 27 C 10.4 27 8.6 23.4 9.8 20.6 C 11 17.8 13.6 16.8 16 16.8 C 18.4 16.8 21 17.8 22.2 20.6 C 23.4 23.4 21.6 27 16 27 Z"/>` +
  '<ellipse cx="8.4" cy="13.6" rx="2.6" ry="3.4" transform="rotate(-20 8.4 13.6)"/><ellipse cx="13" cy="8.8" rx="2.6" ry="3.4"/><ellipse cx="19" cy="8.8" rx="2.6" ry="3.4"/><ellipse cx="23.6" cy="13.6" rx="2.6" ry="3.4" transform="rotate(20 23.6 13.6)"/></g></svg>';
const COMB =
  `<svg viewBox="0 0 32 32"><path d="M 5.5 17.5 C 6 10 11 6 16 6 C 21 6 26 10 26.5 17.5 Z" fill="#efd394" stroke="${LINE}" stroke-width="1.2"/>` +
  `<path d="M 7.5 17.5 V 24 M 10.2 17.5 V 24.6 M 12.9 17.5 V 25 M 15.6 17.5 V 25.2 M 18.3 17.5 V 25 M 21 17.5 V 24.6 M 23.7 17.5 V 24" stroke="${LINE}" stroke-width="1.2" stroke-linecap="round"/></svg>`;

// Bowls and toys in the courtyard.
export const PROP_SVG = {
  bowl:
    `<svg viewBox="-17 -10 34 16" width="34" height="16"><path d="M -15 -5 L 15 -5 L 11.5 4 Q 0 6 -11.5 4 Z" fill="#efb3c4" stroke="${LINE}" stroke-width="1" stroke-linejoin="round"/>` +
    `<path d="M -6 0 Q -2 -2.4 2 0 Q -2 2.4 -6 0 Z M 2 0 L 5 -2 L 5 2 Z" fill="#f8f6fc"/><ellipse cx="0" cy="-5" rx="15" ry="2.8" fill="#eef0fa" stroke="${LINE}" stroke-width="1"/>` +
    `<path d="M -9 -5.6 Q -5 -8 -1 -5.8 Q 3 -8.4 8 -5.6" fill="#d9ae8f" stroke="${LINE}" stroke-width="0.7"/></svg>`,
  toy:
    `<svg viewBox="-9 -9 18 18" width="18" height="18"><g><circle r="7.5" fill="#f2acc0" stroke="${LINE}" stroke-width="1"/>` +
    '<path d="M -6 -3 Q 0 -6 6 -3 M -7 1 Q 0 -3 7 1 M -5 5 Q 0 1 5 5 M -2 -7 Q 3 0 -2 7" fill="none" stroke="#fbe3ea" stroke-width="0.9"/></g></svg>',
};

// Floating "sound words" for moments worth celebrating, Japanese style.
const SOUNDS = {
  purr: "ゴロゴロ",
  munch: "パクパク",
  fluffy: "ふわふわ",
  sleep: "スヤスヤ",
  meow: "ニャー",
  welcome: "ようこそ",
  play: "ワクワク",
};

// Restart a one-shot CSS animation that is keyed on a data attribute.
export function replay(el, attr) {
  if (!el) return;
  el.dataset[attr] = "0";
  requestAnimationFrame(() => {
    el.dataset[attr] = "1";
  });
}

function spawn(layer, className, x, y, html) {
  if (!layer) return null;
  const node = document.createElement("div");
  node.className = className;
  node.style.left = `${x}px`;
  node.style.top = `${y}px`;
  if (html) node.innerHTML = html;
  layer.appendChild(node);
  node.addEventListener("animationend", (e) => e.target === node && node.remove());
  return node;
}

export function spawnRipple(layer, x, y) {
  spawn(layer, "fx-ripple", x, y);
}

export function spawnStroke(layer, kind, x, y) {
  spawn(layer, kind === "hand" ? "fx-hand" : "fx-comb", x, y, kind === "hand" ? HAND : COMB);
}

export function spawnName(layer, x, y, name, kind) {
  const node = spawn(layer, "fx-name", x, y, icon(CUE[kind] ?? "heart"));
  if (node) node.append(document.createTextNode(name ?? ""));
}

// One sound word at a time in any part of the courtyard, never a pile.
const recentWords = [];

function spawnText(layer, x, y, word) {
  const t = performance.now();
  while (recentWords.length && t - recentWords[0].t > 1800) recentWords.shift();
  if (recentWords.some((w) => Math.hypot(w.x - x, w.y - y) < 90)) return;
  recentWords.push({ x, y, t });
  const node = spawn(layer, "fx-text", x, y);
  if (node) {
    const b = document.createElement("b");
    b.textContent = word;
    node.append(b);
  }
}

function spawnBurst(layer, x, y, kind, count) {
  for (let i = 0; i < count; i++) {
    const node = spawn(layer, `fx-particle fx-particle--${kind}`, x, y, kind === "fluff" ? "" : icon(kind));
    if (!node) return;
    node.style.animationDelay = `${i * 150}ms`;
    node.style.setProperty("--dx", `${(i - (count - 1) / 2) * 9}px`);
  }
}

// Little celebrations when a cat's state changes. Your own cat gets the full
// set; other cats only purr when loved and say hello when they arrive, so
// the courtyard stays calm.
export function spawnForTransition(layer, prev, next, x, y, mine) {
  if (!layer) return;
  const s = depthScale(y);
  const top = y - (POSE_HEIGHT[next.pose] ?? 110) * s;
  if (next.emote === "heart" && prev.emote !== "heart") {
    spawnBurst(layer, x, top, "heart", mine ? 3 : 2);
    if (next.act === "happy") spawnText(layer, x, top - 12, SOUNDS.purr);
    return;
  }
  if (next.emote === "flower" && prev.pose === "walk" && next.act === "happy") {
    spawnText(layer, x, top - 12, SOUNDS.welcome);
    return;
  }
  if (!mine) return;
  if (next.emote === "sparkle" && prev.emote !== "sparkle") {
    spawnBurst(layer, x, top + 26 * s, "sparkle", 4);
    spawnBurst(layer, x, y - 46 * s, "fluff", 3);
    spawnText(layer, x, top - 12, SOUNDS.fluffy);
  } else if (next.emote === "zzz" && prev.emote !== "zzz") {
    spawnText(layer, x, top - 8, SOUNDS.sleep);
  } else if (next.emote === "note" && prev.emote !== "note") {
    spawnBurst(layer, x, top, "note", 2);
    spawnText(layer, x, top - 12, SOUNDS.play);
  } else if (next.act === "beg" && prev.act !== "beg") {
    spawnText(layer, x, top - 8, SOUNDS.meow);
  }
  if (next.act === "eat" && prev.act !== "eat") spawnText(layer, x, top - 8, SOUNDS.munch);
}
