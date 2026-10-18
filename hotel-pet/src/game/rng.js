// Deterministic randomness. Every device in the hotel derives the same "random"
// choices from the same keys, so cats behave identically everywhere without
// sending positions over the network.

export function hashString(str) {
  // FNV-1a, 32-bit
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A seeded generator for a key built from any number of parts.
export function rng(...parts) {
  return mulberry32(hashString(parts.join("|")));
}

// A single number in [0, 1) for a key.
export function rand(...parts) {
  return rng(...parts)();
}

export function pick(list, r) {
  return list[Math.floor(r * list.length) % list.length];
}

export function pickWeighted(entries, r) {
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let x = r * total;
  for (const [value, w] of entries) {
    x -= w;
    if (x <= 0) return value;
  }
  return entries[entries.length - 1][0];
}

export function shuffle(list, next) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
