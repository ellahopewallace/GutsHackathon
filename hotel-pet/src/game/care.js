// How a cat's needs change. Stats run 0..100: hunger (higher = hungrier),
// happiness, energy and cleanliness. They drift slowly over time, and each
// care action nudges them. Pet and treat can be given to anyone's cat; the
// rest are for your own.

export const START_STATS = { hunger: 38, happiness: 66, energy: 72, cleanliness: 70 };

// Drift per minute while nobody is looking after the cat.
const PER_MINUTE = { hunger: 2.6, happiness: -1.5, energy: -1.8, cleanliness: -1.3 };

// What each action does to the stats.
const EFFECTS = {
  feed: { hunger: -25, happiness: 8 },
  play: { happiness: 20, energy: -15, hunger: 10 },
  nap: { energy: 25 },
  brush: { cleanliness: 30, happiness: 5 },
  pet: { happiness: 6 },
  treat: { hunger: -8, happiness: 4 },
};
// Below this much energy a cat is too tired to play.
const PLAY_MIN_ENERGY = 15;

const clamp = (value) => Math.max(0, Math.min(100, value));

// Stats as they are at `now`, given when they were last set (`stats.at`).
export function decay(stats, now) {
  const minutes = Math.max(0, (now - (stats.at ?? now)) / 60000);
  return {
    hunger: clamp(stats.hunger + PER_MINUTE.hunger * minutes),
    happiness: clamp(stats.happiness + PER_MINUTE.happiness * minutes),
    energy: clamp(stats.energy + PER_MINUTE.energy * minutes),
    cleanliness: clamp(stats.cleanliness + PER_MINUTE.cleanliness * minutes),
    at: now,
  };
}

// Apply a care action at time `now`: { ok, stats } or { ok: false, reason }.
export function applyCare(stats, action, now) {
  const effect = EFFECTS[action];
  if (!effect) return { ok: false, reason: "invalid_action" };
  const next = decay(stats, now);
  if (action === "play" && next.energy < PLAY_MIN_ENERGY) return { ok: false, reason: "too_tired" };
  for (const [key, delta] of Object.entries(effect)) next[key] = clamp(next[key] + delta);
  return { ok: true, stats: next };
}

// Everything as "higher is better", which is what the gauges and moods use.
export function wellbeing(stats) {
  return {
    fullness: 100 - stats.hunger,
    happiness: stats.happiness,
    energy: stats.energy,
    cleanliness: stats.cleanliness,
  };
}

// How the cat is doing overall, 0..100: the ring around its face in the dock.
export function overall(stats) {
  const w = wellbeing(stats);
  return Math.round(Math.max(0, Math.min(100, (w.fullness + w.happiness + w.energy + w.cleanliness) / 4)));
}

// The one need that shows on the cat's face (most urgent first).
export function moodOf(stats) {
  const w = wellbeing(stats);
  if (w.energy <= 20) return "sleepy";
  if (w.fullness <= 20) return "hungry";
  if (w.cleanliness <= 20) return "scruffy";
  if (w.happiness >= 75) return "happy";
  if (w.happiness <= 30) return "lonely";
  return "content";
}
