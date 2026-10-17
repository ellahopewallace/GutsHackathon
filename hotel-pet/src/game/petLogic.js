
export const initialPet = {
  hunger: 50,
  happiness: 50,
  energy: 50,
  cleanliness: 50,
  mood: "neutral",
};

const clamp = (value) => Math.max(0, Math.min(100, value));

export function performAction(pet, action) {
  const next = { ...pet };

  switch (action) {
    case "feed":
      next.hunger = clamp(next.hunger - 25);
      next.happiness = clamp(next.happiness + 8);
      break;

    case "play":
      if (next.energy < 15) {
        return { ok: false, reason: "too_tired" };
      }
      next.happiness = clamp(next.happiness + 20);
      next.energy = clamp(next.energy - 15);
      next.hunger = clamp(next.hunger + 10);
      break;

    case "sleep":
      next.energy = clamp(next.energy + 25);
      break;

    case "wash":
      next.cleanliness = clamp(next.cleanliness + 30);
      next.happiness = clamp(next.happiness + 5);
      break;

    default:
      return { ok: false, reason: "invalid_action" };
  }

  next.mood =
    next.happiness >= 80 ? "happy" :
    next.energy <= 20 ? "sleepy" :
    next.hunger >= 80 ? "hungry" :
    next.cleanliness <= 20 ? "scruffy" :
    "neutral";

  return { ok: true, pet: next };
}
