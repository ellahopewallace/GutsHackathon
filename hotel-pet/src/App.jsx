import { useState } from "react";
import "./App.css";
import PetRoom from "./components/PetRoom";
import {
  initialPet as initialStats,
  performAction,
} from "./game/petLogic";

// Temporary data. Later, replace this with Person 2's Firebase hook.
const initialPet = {
  ...initialStats,
  id: "demo-cat",
  name: "Mochi",
};

const demoGuests = [
  { id: "guest-1", name: "Alex" },
  { id: "guest-2", name: "Jamie" },
];

export default function App() {
  const [guestName, setGuestName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [pet, setPet] = useState(initialPet);

  function handleJoin(event) {
    event.preventDefault();
    if (guestName.trim()) setHasJoined(true);
  }

  function handleAction(action) {
    setPet((current) => {
      const result = performAction(current, action);

      if (!result.ok) {
        console.log("Action failed:", result.reason);
        return current;
      }

      return result.pet;
    });
  }

  if (hasJoined) {
    return (
      <PetRoom
        pet={pet}
        guests={[...demoGuests, { id: "me", name: guestName.trim(), isYou: true }]}
        onAction={handleAction}
        onLeave={() => setHasJoined(false)}
      />
    );
  }

  return (
    <>
      <style>{`body { margin: 0; display: block; } #root { width: 100%; min-height: 100vh; }`}</style>
      <main style={styles.page}>
      <form onSubmit={handleJoin} style={styles.card}>
        <div style={styles.cat} role="img" aria-label="Cat">🐱</div>
        <h1 style={styles.heading}>Welcome to Pet Room!</h1>
        <p style={styles.description}>
          Look after Mochi together with your friends.
        </p>
        <label htmlFor="guestName" style={styles.label}>
          Your display name
        </label>
        <input
          id="guestName"
          value={guestName}
          onChange={(event) => setGuestName(event.target.value)}
          placeholder="Enter your name"
          maxLength={20}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Join the room →
        </button>
        <small style={styles.note}>Demo mode · No account required</small>
      </form>
      </main>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(140deg, #f7f1ff, #e7f7f5)",
    display: "grid",
    placeItems: "center",
    padding: 20,
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "white",
    width: "min(100%, 420px)",
    padding: "40px 32px",
    borderRadius: 26,
    boxShadow: "0 16px 48px #6b548021",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxSizing: "border-box",
  },
  cat: { fontSize: 64, textAlign: "center" },
  heading: { fontSize: 27, textAlign: "center", margin: 0, color: "#302b42" },
  description: { textAlign: "center", color: "#767083", margin: "0 0 12px" },
  label: { fontSize: 14, fontWeight: 700, color: "#423b55" },
  input: {
    fontSize: 16,
    padding: "14px 16px",
    border: "1px solid #dbd4e7",
    borderRadius: 12,
    outlineColor: "#8d79d8",
  },
  button: {
    padding: 15,
    marginTop: 4,
    border: 0,
    borderRadius: 12,
    background: "#7862ce",
    color: "white",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
  },
  note: { color: "#9790a1", textAlign: "center", marginTop: 4 },
};
