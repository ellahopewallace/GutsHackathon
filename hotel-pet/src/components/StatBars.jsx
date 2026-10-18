import { wellbeing } from "../game/care";
import { BrushIcon, FeedIcon, HeartIcon, NapIcon } from "./ui/icons";
import "./StatBars.css";

// One ring per need, each with its own soft colour and an icon instead of a word.
const GAUGES = [
  { key: "fullness", label: "Fullness", Icon: FeedIcon, color: "#e8c27a" },
  { key: "happiness", label: "Happiness", Icon: HeartIcon, color: "#ec9bb2" },
  { key: "energy", label: "Energy", Icon: NapIcon, color: "#8f9fe0" },
  { key: "cleanliness", label: "Fluff", Icon: BrushIcon, color: "#8fcbbf" },
];

const clamp = (v) => Math.round(Math.max(0, Math.min(100, v)));
const R = 24;
const C = 2 * Math.PI * R;

// Four soft ring gauges, one per need. A ring pulses gently when it runs low.
export default function StatBars({ stats }) {
  const w = wellbeing(stats);
  return (
    <div className="gauges">
      {GAUGES.map(({ key, label, Icon, color }) => {
        const value = clamp(w[key]);
        return (
          <div
            key={key}
            className={`gauge ${value <= 20 ? "gauge--low" : ""}`}
            role="meter"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
          >
            <svg viewBox="0 0 56 56" aria-hidden="true">
              <circle className="gauge-track" cx="28" cy="28" r={R} />
              <circle
                className="gauge-fill"
                cx="28"
                cy="28"
                r={R}
                stroke={color}
                strokeDasharray={C}
                strokeDashoffset={C * (1 - value / 100)}
                transform="rotate(-90 28 28)"
              />
            </svg>
            <span className="gauge-icon">
              <Icon size={26} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
