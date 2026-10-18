// Cat presets and customisation options.
// A "look" fully describes how a cat is drawn:
//   fur        "long" | "short"
//   coat       base fur colour
//   markings   "tabby" | "patches" | "points" | "none"
//   mark       stripe / first patch / colour-point colour
//   mark2      second patch colour (calico)
//   white      "none" | "bib" | "lots"   (white chest, muzzle and socks)
//   eyes       iris colour
//   accessory  "scarf" | "bell" | "sakura" | "none"
// Colours are deliberately soft: the cats should feel like a quiet print,
// not a sticker sheet.

export const BREEDS = [
  {
    id: "nfc",
    name: "Norwegian Forest Cat",
    jp: "ノルウェージャン",
    look: {
      fur: "long",
      coat: "#e0ab84",
      markings: "tabby",
      mark: "#c18a63",
      mark2: "#4a4550",
      white: "bib",
      eyes: "#8fb8a2",
      accessory: "sakura",
    },
  },
  {
    id: "mike",
    name: "Calico",
    jp: "三毛猫",
    look: {
      fur: "short",
      coat: "#f6f1ea",
      markings: "patches",
      mark: "#e4b590",
      mark2: "#4a4550",
      white: "none",
      eyes: "#d6ab55",
      accessory: "sakura",
    },
  },
  {
    id: "kuro",
    name: "Black Cat",
    jp: "黒猫",
    look: {
      fur: "short",
      coat: "#3d3a45",
      markings: "none",
      mark: "#2a2832",
      mark2: "#2a2832",
      white: "none",
      eyes: "#dcb75a",
      accessory: "bell",
    },
  },
  {
    id: "hachiware",
    name: "Tuxedo",
    jp: "ハチワレ",
    look: {
      fur: "short",
      coat: "#3d3a45",
      markings: "none",
      mark: "#2a2832",
      mark2: "#2a2832",
      white: "lots",
      eyes: "#a3c086",
      accessory: "none",
    },
  },
  {
    id: "chatora",
    name: "Ginger Tabby",
    jp: "茶トラ",
    look: {
      fur: "short",
      coat: "#e6bb92",
      markings: "tabby",
      mark: "#cc9a6e",
      mark2: "#4a4550",
      white: "none",
      eyes: "#dab560",
      accessory: "scarf",
    },
  },
  {
    id: "siamese",
    name: "Siamese",
    jp: "シャム猫",
    look: {
      fur: "short",
      coat: "#f1e8d8",
      markings: "points",
      mark: "#6f5d55",
      mark2: "#6f5d55",
      white: "none",
      eyes: "#84b0d6",
      accessory: "none",
    },
  },
  {
    id: "sabatora",
    name: "Silver Tabby",
    jp: "サバトラ",
    look: {
      fur: "short",
      coat: "#c6c5c9",
      markings: "tabby",
      mark: "#6c6b75",
      mark2: "#4a4550",
      white: "bib",
      eyes: "#a3c086",
      accessory: "sakura",
    },
  },
];

export const COATS = [
  { id: "apricot", label: "Apricot", coat: "#e0ab84", mark: "#c18a63" },
  { id: "ginger", label: "Ginger", coat: "#e6bb92", mark: "#cc9a6e" },
  { id: "brown", label: "Brown", coat: "#a88c74", mark: "#6b5849" },
  { id: "cream", label: "Cream", coat: "#eddcc2", mark: "#d2b490" },
  { id: "silver", label: "Silver", coat: "#c6c5c9", mark: "#6c6b75" },
  { id: "blue", label: "Blue", coat: "#9a9fb0", mark: "#6d7285" },
  { id: "black", label: "Black", coat: "#3d3a45", mark: "#2a2832" },
  { id: "snow", label: "Snow", coat: "#f6f1ea", mark: "#dcd4c8" },
];

export const PATTERNS = [
  { id: "tabby", label: "Tabby" },
  { id: "none", label: "Solid" },
  { id: "patches", label: "Calico" },
  { id: "points", label: "Points" },
];

export const WHITES = [
  { id: "none", label: "No white" },
  { id: "bib", label: "White bib" },
  { id: "lots", label: "Tuxedo" },
];

export const FURS = [
  { id: "short", label: "Short fur" },
  { id: "long", label: "Long fur" },
];

export const EYES = [
  { id: "jade", label: "Jade", color: "#8fb8a2" },
  { id: "gold", label: "Gold", color: "#dcb75a" },
  { id: "amber", label: "Amber", color: "#d39a52" },
  { id: "moss", label: "Moss", color: "#a3c086" },
  { id: "sky", label: "Sky", color: "#84b0d6" },
  { id: "copper", label: "Copper", color: "#c58457" },
];

export const ACCESSORIES = [
  { id: "sakura", label: "Sakura crown" },
  { id: "bell", label: "Bell collar" },
  { id: "scarf", label: "Indigo scarf" },
  { id: "none", label: "Nothing" },
];

// Names the dice suggests on the nameplate.
export const CAT_NAMES = [
  "Jiji", "Freya", "Mochi", "Yuzu", "Sakura", "Tofu", "Miso", "Odin", "Hana",
  "Kuro", "Sora", "Loki", "Nori", "Kiki", "Momo", "Ume", "Bjørn",
];

export function breedById(id) {
  return BREEDS.find((b) => b.id === id) ?? BREEDS[0];
}

// The cat every new traveller starts from: a Norwegian Forest Cat called Jiji.
export function defaultCat() {
  const breed = BREEDS[0];
  return { name: "Jiji", breed: breed.id, look: { ...breed.look } };
}
