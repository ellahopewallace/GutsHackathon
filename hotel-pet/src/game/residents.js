// Resident cats: a few cats that live at the inn (and one that keeps coming
// and going) so the courtyard never feels empty, even with a single phone.
// Everything here is a pure function of the clock, so every device sees the
// same residents doing the same things at the same moments. Turn them off
// with ?residents=0.
import { breedById } from "../data/cats";
import { hashString, pickWeighted, rng } from "./rng";

function resident(id, catName, breed, visit) {
  return {
    id,
    resident: true,
    cat: { name: catName, breed, look: { ...breedById(breed).look } },
    visit,
  };
}

const RESIDENTS = [
  resident("res-hana", "Mochi", "mike"),
  resident("res-sofia", "Yuzu", "chatora"),
  resident("res-amara", "Tofu", "siamese"),
  resident("res-lars", "Hachi", "hachiware"),
  // Kuro checks in and out on a loop, so an arrival happens during any demo.
  resident("res-kenji", "Kuro", "kuro", { period: 150000, duration: 112000, offset: 41000 }),
];

// Whether a visiting resident is in the hotel at time t, and since when.
function visitAt(r, t) {
  if (!r.visit) return { present: true, since: 0 };
  const { period, duration, offset } = r.visit;
  const shifted = t + offset;
  const phase = shifted - Math.floor(shifted / period) * period;
  return { present: phase < duration, since: t - phase };
}

// Residents present at time t, shaped like real guests.
export function residentsAt(t) {
  const list = [];
  for (const r of RESIDENTS) {
    const v = visitAt(r, t);
    if (!v.present) continue;
    list.push({ id: r.id, resident: true, online: true, joinedAt: v.since, cat: r.cat, stats: residentStats(r.id, t) });
  }
  return list;
}

// Smoothly wandering stats, so residents' cats get sleepy or hungry too.
export function residentStats(id, t) {
  const h = hashString(id);
  const s = t / 1000;
  return {
    hunger: 42 + 30 * Math.sin(s / 83 + (h % 7)),
    happiness: 64 + 24 * Math.sin(s / 61 + (h % 5)),
    energy: 58 + 34 * Math.sin(s / 97 + (h % 3)),
    cleanliness: 68 + 22 * Math.sin(s / 113 + (h % 11)),
    at: t,
  };
}

const ACTIONS = [["feed", 3], ["pet", 4], ["brush", 2], ["play", 2.5], ["nap", 1]];

/**
 * Resident actions, arrivals and departures that happen in (from, to].
 * `catIds` is every cat currently in the hotel (residents may pet them).
 * Events look exactly like real guests' events: `by` is the acting guest's
 * id and `byCat` the name of their cat, which is how they are shown.
 */
export function residentEventsBetween(from, to, catIds) {
  const out = [];
  for (const r of RESIDENTS) {
    // Each resident acts about once per period, at a seeded moment in it.
    const h = hashString(r.id);
    const period = 26000 + (h % 15000);
    const offset = h % period;
    const first = Math.floor((from - offset) / period);
    for (let k = first; k * period + offset <= to; k++) {
      const next = rng("res", r.id, k);
      const at = k * period + offset + Math.floor(next() * 5000);
      if (at <= from || at > to) continue;
      const v = visitAt(r, at);
      if (!v.present || at - v.since < 6000) continue;
      if (next() > 0.72) continue;
      const type = pickWeighted(ACTIONS, next());
      let catId = r.id;
      let catName = r.cat.name;
      if (type === "pet" && next() < 0.45) {
        const others = catIds.filter((id) => id !== r.id).sort();
        if (others.length) {
          catId = others[Math.floor(next() * others.length)];
          catName = null; // filled in by whoever renders the diary
        }
      }
      out.push({ id: `res:${r.id}:${k}`, type, at, by: r.id, byCat: r.cat.name, catId, catName, resident: true, seed: Math.floor(next() * 1e9) });
    }
    // The visiting resident's arrivals and departures.
    if (r.visit) {
      const { period, duration, offset } = r.visit;
      const firstVisit = Math.floor((from + offset) / period);
      for (let i = firstVisit; i * period - offset <= to; i++) {
        const at = i * period - offset;
        const shared = { by: r.id, byCat: r.cat.name, catId: r.id, catName: r.cat.name, resident: true };
        if (at > from && at <= to) out.push({ id: `arrive:${r.id}:${i}`, type: "arrive", at, ...shared });
        const leaveAt = at + duration;
        if (leaveAt > from && leaveAt <= to) out.push({ id: `leave:${r.id}:${i}`, type: "leave", at: leaveAt, ...shared });
      }
    }
  }
  return out.sort((a, b) => a.at - b.at);
}
