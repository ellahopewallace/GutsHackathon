import Cat from "../cat/Cat";
import { BREEDS } from "../../data/cats";

// Design reference sheet: every breed in every pose. Open with ?gallery
const ROWS = [
  { pose: "sit", act: "idle", label: "Sit" },
  { pose: "walk", act: "idle", label: "Walk" },
  { pose: "sleep", act: "idle", label: "Sleep" },
  { pose: "sit", act: "happy", label: "Happy" },
  { pose: "sit", act: "eat", label: "Eat" },
  { pose: "sit", act: "groom", label: "Groom" },
  { pose: "walk", act: "play", label: "Play" },
  { pose: "walk", act: "boop", label: "Boop" },
  { pose: "sit", act: "meow", label: "Meow" },
];

export default function CatGallery() {
  const params = new URLSearchParams(window.location.search);
  const only = params.get("gallery");
  const breeds = only && only !== "1" ? BREEDS.filter((b) => b.id === only) : BREEDS;
  const big = breeds.length === 1;
  return (
    <main style={{ padding: 16, display: "grid", gap: 18 }}>
      <h1 style={{ fontSize: 22 }}>Cat sheet</h1>
      {breeds.map((breed) => (
        <section key={breed.id}>
          <h2 style={{ fontSize: 15, marginBottom: 6 }}>
            {breed.name} <span style={{ opacity: 0.6 }}>{breed.jp}</span>
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ROWS.map((row) => (
              <figure
                key={row.label}
                style={{
                  margin: 0,
                  width: big ? 300 : 150,
                  height: big ? 280 : 140,
                  background: "var(--surface)",
                  border: "1px solid var(--hairline)",
                  borderRadius: 10,
                  position: "relative",
                }}
              >
                <Cat look={breed.look} pose={row.pose} act={row.act} />
                <figcaption style={{ position: "absolute", top: 4, left: 8, fontSize: 11, opacity: 0.6 }}>
                  {row.label}
                </figcaption>
              </figure>
            ))}
            <figure style={{ margin: 0, width: 90, height: 100, background: "var(--surface)", borderRadius: 10 }}>
              <Cat look={breed.look} pose="sit" variant="head" />
            </figure>
          </div>
        </section>
      ))}
    </main>
  );
}
