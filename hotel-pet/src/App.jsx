import { useCallback, useEffect, useState } from "react";
import CatPicker from "./components/CatPicker";
import HotelScreen from "./components/hotel/HotelScreen";
import CatGallery from "./components/dev/CatGallery";
import { START_STATS } from "./game/care";
import { defaultCat } from "./data/cats";
import { clearSession, loadSession, newGuestId, saveSession } from "./lib/session";
import { useTheme } from "./lib/theme";

// Two screens: choose and name a cat, then the shared courtyard.
//
// URL switches, handy for demos:
//   ?demo         skip the picker and arrive with a Norwegian Forest Cat
//   ?reset        forget this tab's cat and start again
//   ?hotel=name   a separate courtyard (e.g. one per team)
//   ?residents=0  hide the resident cats
//   ?gallery      the cat design sheet
const params = new URLSearchParams(window.location.search);
const HOTEL_ID = params.get("hotel") || "purr-inn";
const WITH_RESIDENTS = params.get("residents") !== "0";

// A guest is only an anonymous id and a cat. The id keeps multiplayer apart;
// the cat's name is all anyone sees, and two cats may share a name.
function makeProfile(cat) {
  const t = Date.now();
  return { id: newGuestId(), cat, stats: { ...START_STATS, at: t }, joinedAt: t };
}

function initialProfile() {
  if (params.has("reset")) clearSession();
  const saved = loadSession();
  if (saved) return saved;
  if (params.has("demo")) {
    const profile = makeProfile(defaultCat());
    saveSession(profile);
    return { ...profile, arriving: true };
  }
  return null;
}

function Flow() {
  const [profile, setProfile] = useState(initialProfile);
  const [theme, toggleTheme] = useTheme();
  const night = theme === "night";
  const inHotel = Boolean(profile);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [inHotel]);

  // Stats are saved straight to storage (not React state) so the hotel
  // connection isn't rebuilt every time the cat eats.
  const persistStats = useCallback((stats) => {
    const saved = loadSession();
    if (saved) saveSession({ ...saved, stats });
  }, []);

  if (inHotel) {
    return (
      <HotelScreen
        key={profile.id}
        profile={profile}
        hotelId={HOTEL_ID}
        withResidents={WITH_RESIDENTS}
        night={night}
        onToggleTheme={toggleTheme}
        onStatsChange={persistStats}
        onCheckout={() => {
          clearSession();
          setProfile(null);
        }}
      />
    );
  }

  return (
    <CatPicker
      hotelId={HOTEL_ID}
      withResidents={WITH_RESIDENTS}
      night={night}
      onToggleTheme={toggleTheme}
      onConfirm={(cat) => {
        const next = makeProfile(cat);
        saveSession(next);
        // `arriving` plays the door animation and the arrival event once.
        setProfile({ ...next, arriving: true });
      }}
    />
  );
}

export default function App() {
  if (params.has("gallery")) return <CatGallery />;
  return <Flow />;
}
