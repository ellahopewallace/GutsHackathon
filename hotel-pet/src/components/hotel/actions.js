import { BrushIcon, FeedIcon, NapIcon, PetIcon, PlayIcon, TreatIcon } from "../ui/icons";

// The five ways to look after your own cat, in dock order. Labels are only
// for screen readers; on screen every action is its icon.
export const ACTIONS = [
  { id: "feed", label: "Feed", Icon: FeedIcon },
  { id: "play", label: "Play", Icon: PlayIcon },
  { id: "brush", label: "Brush", Icon: BrushIcon },
  { id: "nap", label: "Nap", Icon: NapIcon },
  { id: "pet", label: "Pet", Icon: PetIcon },
];

// The icon that floats from a button to the cat for each action, including
// the treat you can give someone else's cat.
export const ACTION_ICON = Object.fromEntries([...ACTIONS.map((a) => [a.id, a.Icon]), ["treat", TreatIcon]]);
