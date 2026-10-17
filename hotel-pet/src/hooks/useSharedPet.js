
import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { performAction } from "../game/petLogic";

export function useSharedPet(roomId = "hotel") {
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const petRef = doc(db, "pet", roomId);

    const unsubscribe = onSnapshot(
      petRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setPet(snapshot.data());
          setError("");
        } else {
          setPet(null);
          setError("Pet document not found in Firestore.");
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [roomId]);

  async function act(action) {
    setError("");

    try {
      const petRef = doc(db, "pet", roomId);

      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(petRef);

        if (!snapshot.exists()) {
          throw new Error("Pet document not found.");
        }

        const result = performAction(snapshot.data(), action);

        if (!result.ok) {
          throw new Error(
            result.reason === "too_tired"
              ? "The cat is too tired to play!"
              : "Invalid action."
          );
        }

        transaction.update(petRef, result.pet);
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
  }

  return { pet, loading, error, act };
}
