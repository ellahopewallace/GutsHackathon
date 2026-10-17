import "./PetRoom.css";

// These IDs should match db petLogic.js actions.
const ACTIONS = [
  { id: "feed", icon: "🐟", label: "FEED", hint: "Snack time" },
  { id: "play", icon: "🧶", label: "PLAY", hint: "Have fun" },
  { id: "sleep", icon: "💤", label: "SLEEP", hint: "Recharge" },
  { id: "wash", icon: "🫧", label: "WASH", hint: "Get clean" },
];

function clamp(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
}

function Meter({ label, icon, value, type }) {
  const amount = Math.round(clamp(value));

  return (
    <div className="pixel-pet-meter">
      <div className="pixel-pet-meter-label">
        <span><span aria-hidden="true">{icon}</span> {label}</span>
        <span>{amount}%</span>
      </div>
      <div
        className="pixel-pet-meter-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={amount}
      >
        <div
          className={`pixel-pet-meter-fill pixel-pet-meter-fill--${type}`}
          style={{ width: `${amount}%` }}
        />
      </div>
    </div>
  );
}

// Temporary pixel cat. Person 3 can replace <PixelCat /> with
// <CatCharacter mood={mood} /> without changing the rest of the room.
function PixelCat({ mood }) {
  const sleeping = mood === "sleepy";
  const happy = mood === "happy";
  const hungry = mood === "hungry";

  return (
    <svg
      className="pixel-pet-cat"
      viewBox="0 0 240 240"
      role="img"
      aria-label={`Pixel cat looking ${mood}`}
      shapeRendering="crispEdges"
    >
      {/* Tail and body */}
      <path d="M174 182 H202 V142 H213 V115 H197 V133 H186 V163 H174 Z" fill="#C58E69" stroke="#67544D" strokeWidth="5" strokeLinejoin="miter" />
      <path d="M73 144 H167 V201 H73 Z" fill="#D9A579" stroke="#67544D" strokeWidth="6" />
      <path d="M96 163 H144 V195 H96 Z" fill="#F4D4B1" />
      {/* Ears */}
      <path d="M51 87 V35 H66 V46 H86 V56 H154 V46 H174 V35 H189 V87 Z" fill="#EBC091" stroke="#67544D" strokeWidth="6" strokeLinejoin="miter" />
      <path d="M63 73 V52 H74 V62 H87 V73 Z M153 73 L166 62 H178 V52 H181 V73 Z" fill="#D99082" />
      {/* Head */}
      <path d="M47 86 H193 V139 H183 V155 H165 V162 H75 V155 H57 V139 H47 Z" fill="#EBC091" stroke="#67544D" strokeWidth="6" strokeLinejoin="miter" />
      <path d="M82 88 H95 V105 H82 Z M145 88 H158 V105 H145 Z" fill="#D7A375" />
      {/* Blush */}
      <rect x="61" y="120" width="20" height="8" fill="#E9A79B" />
      <rect x="159" y="120" width="20" height="8" fill="#E9A79B" />
      {/* Eyes */}
      {sleeping ? (
        <g fill="none" stroke="#584942" strokeWidth="5">
          <path d="M82 112 H101 V117 H109 M131 117 H139 V112 H158" />
        </g>
      ) : happy ? (
        <g fill="none" stroke="#584942" strokeWidth="6">
          <path d="M81 113 V107 H88 V100 H95 V107 H102 V113 M138 113 V107 H145 V100 H152 V107 H159 V113" />
        </g>
      ) : (
        <g fill="#584942">
          <rect x="87" y="103" width="9" height={hungry ? 12 : 10} />
          <rect x="144" y="103" width="9" height={hungry ? 12 : 10} />
        </g>
      )}
      {/* Nose, mouth and whiskers */}
      <path d="M114 124 H126 V130 H121 V135 H119 V130 H114 Z" fill="#B86D71" />
      {hungry ? (
        <rect x="116" y="140" width="8" height="9" fill="#584942" />
      ) : (
        <path d="M119 133 V140 H107 V137 M119 140 H131 V137" fill="none" stroke="#584942" strokeWidth="4" />
      )}
      <path d="M55 126 H35 M57 139 H29 M185 126 H205 M183 139 H211" stroke="#67544D" strokeWidth="4" />
      {/* Feet */}
      <path d="M75 190 H107 V211 H75 Z M133 190 H165 V211 H133 Z" fill="#EBC091" stroke="#67544D" strokeWidth="5" />
      <path d="M86 199 V207 M97 199 V207 M144 199 V207 M155 199 V207" stroke="#B78162" strokeWidth="3" />
    </svg>
  );
}

export default function PetRoom({ pet = {}, guests = [], onAction, onLeave }) {
  const name = pet.name || "Mochi";
  // Person 2 stores HUNGER (high = hungry), so invert it to display FULLNESS.
  // The fallback also supports the earlier fake-data App.jsx (`fullness`).
  const fullness = pet.hunger != null ? 100 - clamp(pet.hunger) : clamp(pet.fullness ?? 50);
  const happiness = clamp(pet.happiness ?? 50);
  const energy = clamp(pet.energy ?? 50);
  const hasCleanliness = pet.cleanliness != null;
  const cleanliness = clamp(pet.cleanliness ?? 50);

  const mood = pet.mood || (
    happiness >= 80 ? "happy" :
    energy <= 20 ? "sleepy" :
    fullness <= 20 ? "hungry" :
    hasCleanliness && cleanliness <= 20 ? "scruffy" : "neutral"
  );
  const guestList = Array.isArray(guests) ? guests : [];

  return (
    <div className="pixel-pet-page">
      <main className="pixel-pet-shell">
        <header className="pixel-pet-header">
          <div>
            <div className="pixel-pet-eyebrow">★ THE LITTLE LOBBY ★</div>
            <h1>CAT CLUB <span aria-hidden="true">♥</span></h1>
            <p>ONE HOTEL. ONE CAT. EVERYONE CARES.</p>
          </div>
          {onLeave && (
            <button className="pixel-pet-exit" type="button" onClick={onLeave}>
              ← EXIT
            </button>
          )}
        </header>

        <div className="pixel-pet-layout">
          <section className="pixel-pet-stage" aria-label={`${name}'s room`}>
            <div className="pixel-pet-stage-label">ROOM 01 / {name.toUpperCase()}</div>
            <div className="pixel-pet-window" aria-hidden="true">
              <span className="pixel-pet-cloud pixel-pet-cloud--one" />
              <span className="pixel-pet-cloud pixel-pet-cloud--two" />
              <span className="pixel-pet-window-cross" />
            </div>
            <div className="pixel-pet-picture" aria-hidden="true">♥</div>
            <span className="pixel-pet-sparkle pixel-pet-sparkle--one" aria-hidden="true">✦</span>
            <span className="pixel-pet-sparkle pixel-pet-sparkle--two" aria-hidden="true">✧</span>
            <div className="pixel-pet-floor-line" aria-hidden="true" />
            <div className="pixel-pet-rug" aria-hidden="true" />

            <div className="pixel-pet-cat-area">
              <div className="pixel-pet-mood">{mood === "sleepy" ? "Z z z" : mood === "hungry" ? "🐟 ?" : mood === "happy" ? "♥ ♥" : "♥"} <span>{mood.toUpperCase()}</span></div>
              <div className="pixel-pet-cat-space">
                {/* PERSON 3: Replace only <PixelCat ... /> with <CatCharacter mood={mood} /> */}
                <PixelCat mood={mood} />
              </div>
              <div className="pixel-pet-name-tag">♥ {name.toUpperCase()} ♥</div>
            </div>
            <div className="pixel-pet-stage-bottom">HOME IS WHERE THE PAWS ARE ♪</div>
          </section>

          <aside className="pixel-pet-sidebar">
            <section className="pixel-pet-panel pixel-pet-stats" aria-label="Pet status">
              <div className="pixel-pet-section-heading">
                <h2>CAT STATUS</h2><span aria-hidden="true">✿</span>
              </div>
              <Meter icon="🐟" label="FULLNESS" value={fullness} type="fullness" />
              <Meter icon="♥" label="HAPPINESS" value={happiness} type="happiness" />
              <Meter icon="⚡" label="ENERGY" value={energy} type="energy" />
              {hasCleanliness && <Meter icon="✦" label="CLEAN" value={cleanliness} type="cleanliness" />}
            </section>

            <section className="pixel-pet-panel pixel-pet-action-panel" aria-label="Care actions">
              <div className="pixel-pet-section-heading"><h2>LET'S PLAY!</h2><span aria-hidden="true">🐾</span></div>
              <div className="pixel-pet-actions">
                {ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    disabled={!onAction}
                    className={`pixel-pet-action pixel-pet-action--${action.id}`}
                    onClick={() => onAction?.(action.id)}
                    aria-label={action.label.toLowerCase()}
                    title={action.hint}
                  >
                    <span className="pixel-pet-action-icon" aria-hidden="true">{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="pixel-pet-panel pixel-pet-guests" aria-label="Guests in room">
              <div className="pixel-pet-section-heading"><h2>GUESTS</h2><span className="pixel-pet-count">{guestList.length} ONLINE</span></div>
              <div className="pixel-pet-guest-list">
                {guestList.length === 0 ? (
                  <p className="pixel-pet-empty">No guests yet. Be the first!</p>
                ) : (
                  guestList.map((guest, index) => {
                    const guestName = typeof guest === "string" ? guest : guest?.name || "Guest";
                    return (
                      <div className="pixel-pet-guest" key={guest?.id ?? `${guestName}-${index}`}>
                        <span className={`pixel-pet-avatar pixel-pet-avatar--${index % 4}`} aria-hidden="true">{guestName.charAt(0).toUpperCase()}</span>
                        <span>{guestName}{guest?.isYou ? " (YOU)" : ""}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </aside>
        </div>
        <footer className="pixel-pet-footer">✦ TAKE CARE OF OUR LITTLE FRIEND ✦</footer>
      </main>
    </div>
  );
}
