// The woodblock-print cat: one SVG holding all three poses (sit, walk,
// sleep). Pose and activity are switched by data attributes and animated in
// Cat.css, so the courtyard can change them every frame without React
// re-rendering. Every colour comes from the cat's `look` (see data/cats.js).
import { memo, useId } from "react";
import { darken, lighten, luminance, mix } from "../../lib/color";
import { SIT, SLEEP, WALK } from "./shapes";
import "./Cat.css";

const ACCENT = "#f8f5f3";
const NIGHT = "#3a3e7a";
// Every line is drawn a little lighter than a woodblock print: soft, not sharp.
const LW = 0.8;
const w = (n) => n * LW;

function catPalette(look, night = false) {
  const dark = luminance(look.coat) < 0.05;
  const tint = (c, k = 0.16) => (night ? mix(c, NIGHT, k) : c);
  const coat = tint(look.coat);
  return {
    // Soft indigo linework, like the pastel prints; dark coats get pale
    // lavender lines so their faces stay readable.
    line: dark ? (night ? "#9a90c2" : "#aa9fcb") : night ? "#2c2b5a" : "#4f4b7c",
    coat,
    shade: dark ? mix(coat, "#000000", 0.16) : darken(coat, 0.1),
    light: lighten(coat, 0.45),
    accent: tint(ACCENT, 0.18),
    accentShade: darken(tint(ACCENT, 0.18), 0.07),
    mark: tint(look.mark),
    mark2: tint(look.mark2),
    hair: dark ? lighten(coat, 0.26) : darken(coat, 0.26),
    hairLight: night ? "#9295bf" : "#cbcce3",
    eyes: look.eyes,
    nose: dark ? "#6f5a72" : "#e59aae",
    innerEar: dark ? "#80637d" : "#f1b9c8",
    blush: "#f2a9bf",
  };
}

// Fill + clipped decoration + soft outline: the basic building block of a print.
function Shape({ id, d, fill, line = d, sw = 1.4, children }) {
  return (
    <>
      {children && (
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      )}
      <path d={d} fill={fill} />
      {children && <g clipPath={`url(#${id})`}>{children}</g>}
      {line && <path d={line} className="cat-ink" strokeWidth={w(sw)} />}
    </>
  );
}

function Patches({ list, pal }) {
  return list.map(([d, n]) => <path key={d} d={d} fill={n === 1 ? pal.mark : pal.mark2} />);
}

function Sakura({ x, y, r, rot = 0, line }) {
  const petal = "M 0 0 C -2.5 -1.6 -2.6 -4.4 -1.1 -5.3 L 0 -4.5 L 1.1 -5.3 C 2.6 -4.4 2.5 -1.6 0 0 Z";
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 5.3})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={petal} transform={`rotate(${a})`} fill="#f7cdd9" stroke={line} strokeWidth={w(0.7)} />
      ))}
      <circle r="1.25" fill="#e595ad" />
    </g>
  );
}

function Crown({ spots, line }) {
  const [a, b, c] = spots;
  return (
    <g className="cat-crown">
      <path
        d={`M ${a[0] - 3} ${a[1] + 2} Q ${b[0]} ${b[1] + 1.5} ${c[0] + 3} ${c[1] + 2}`}
        fill="none"
        stroke="#6f9f98"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d={`M ${a[0] - 4.5} ${a[1] + 1} q -2.5 -2.6 -1 -5 q 2 1.2 1 5 Z M ${c[0] + 4.5} ${c[1] + 1} q 2.5 -2.6 1 -5 q -2 1.2 -1 5 Z`}
        fill="#9ccabd"
        stroke={line}
        strokeWidth={w(0.6)}
      />
      {spots.map(([x, y, r, rot]) => (
        <Sakura key={`${x}-${y}`} x={x} y={y} r={r} rot={rot} line={line} />
      ))}
    </g>
  );
}

function NeckAccessory({ look, shapes, uid, line }) {
  if (look.accessory === "scarf") {
    return (
      <g className="cat-scarf">
        <clipPath id={`${uid}-scarf`}>
          <path d={shapes.scarf} />
        </clipPath>
        <path d={shapes.scarf} fill="#6b78bd" />
        {shapes.scarfDots && (
          <g clipPath={`url(#${uid}-scarf)`} fill="#f6f3fb">
            {shapes.scarfDots.map(([x, y, r]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
            ))}
          </g>
        )}
        <path d={shapes.scarf} className="cat-ink" strokeWidth={w(1.2)} />
      </g>
    );
  }
  if (look.accessory === "bell") {
    const [bx, by] = shapes.bell;
    return (
      <g className="cat-bell">
        <path d={shapes.collar} fill="none" stroke={line} strokeWidth="4.2" strokeLinecap="round" />
        <path d={shapes.collar} fill="none" stroke="#e793aa" strokeWidth="2.8" strokeLinecap="round" />
        <g className="cat-bell-ball" style={{ transformOrigin: `${bx}px ${by - 3}px` }}>
          <circle cx={bx} cy={by} r="3.4" fill="#e8c878" stroke={line} strokeWidth={w(1)} />
          <path d={`M ${bx - 2} ${by + 0.8} L ${bx + 2} ${by + 0.8}`} stroke={line} strokeWidth={w(0.9)} />
          <circle cx={bx - 1} cy={by - 1.2} r="0.8" fill="#fbf8fd" opacity="0.8" />
        </g>
      </g>
    );
  }
  return null;
}

function Tail({ id, set, look, pal }) {
  const long = look.fur === "long";
  const points = look.markings === "points";
  return (
    <Shape id={id} d={set.shape[look.fur]} fill={points ? pal.mark : pal.coat} sw={long ? 1.2 : 1.4}>
      {look.markings === "tabby" && <path d={set.bands[look.fur]} fill={pal.mark} className="cat-mark" />}
      {look.markings === "patches" && <path d={set.calico} fill={pal.mark} />}
      {long && <path d={set.hairs} className="cat-hair" stroke={pal.hair} />}
    </Shape>
  );
}

function SitPose({ look, pal, uid }) {
  const long = look.fur === "long";
  const white = look.white;
  const tabby = look.markings === "tabby";
  const patches = look.markings === "patches";
  const points = look.markings === "points";
  const id = (name) => `${uid}-s-${name}`;
  const earFill = (side) => (points ? pal.mark : patches ? (side === "L" ? pal.mark : pal.mark2) : pal.coat);
  const legFill = white === "lots" ? pal.accent : pal.coat;
  const pawFill = white === "none" ? (points ? pal.mark : pal.coat) : pal.accent;

  return (
    <g className="cat-pose cat-pose--sit">
      <ellipse className="cat-shadow" cx="3" cy="1" rx="38" ry="4.8" />

      <g className="sit-tail">
        <Tail id={id("tail")} set={SIT.tail} look={look} pal={pal} />
      </g>

      <g className="sit-body">
        {[["L", SIT.haunchL], ["R", SIT.haunchR]].map(([side, d]) => (
          <Shape key={side} id={id(`haunch${side}`)} d={d} fill={pal.coat} sw={1.35}>
            {tabby && <path d={SIT.tabbyHaunch} fill={pal.mark} className="cat-mark" />}
            {patches && <Patches list={SIT.patchesHaunch} pal={pal} />}
            {points && <path d={d} fill={pal.mark} opacity="0.35" />}
          </Shape>
        ))}
        {SIT.hindPaws.map(([x, y]) => (
          <ellipse key={x} cx={x} cy={y} rx="7.4" ry="3.4" fill={pawFill} className="cat-ink-fill" />
        ))}
        {[["L", SIT.legL], ["R", SIT.legR]].map(([side, d]) => (
          <g key={side} className={`sit-leg sit-leg--${side.toLowerCase()}`}>
            <Shape id={id(`leg${side}`)} d={d} fill={legFill} sw={1.35}>
              {tabby && white !== "lots" && <path d={SIT.tabbyLegs} fill={pal.mark} className="cat-mark" />}
              {white === "bib" && <path d={SIT.socks} fill={pal.accent} />}
              {points && <rect x="-14" y="-26" width="28" height="30" fill={`url(#${uid}-s-legfade)`} />}
            </Shape>
          </g>
        ))}
        <path d={SIT.toes} className="cat-ink" strokeWidth={w(0.8)} />
        <Shape id={id("body")} d={SIT.body} fill={pal.coat} line={SIT.bodyLine}>
          {tabby && <path d={SIT.tabbyBody} fill={pal.mark} className="cat-mark" />}
          {tabby && white === "none" && <path d={SIT.tabbyChest} fill={pal.mark} className="cat-mark" />}
          {patches && <Patches list={SIT.patchesBody} pal={pal} />}
          {white === "bib" && <path d={SIT.bib} fill={pal.accent} />}
          {white === "lots" && <path d={SIT.belly} fill={pal.accent} />}
          <path d={long ? SIT.longHairs : SIT.shortHairs} className="cat-hair" stroke={pal.hair} />
        </Shape>

        {long && (
          <g className="sit-ruff">
            <path d={SIT.ruff} fill={white === "none" ? pal.light : pal.accent} />
            <path d={SIT.ruffHairs} className="cat-hair" stroke={white === "none" ? pal.hair : pal.hairLight} />
            <path d={SIT.ruffLine} className="cat-ink" strokeWidth={w(1)} />
          </g>
        )}
        <NeckAccessory look={look} shapes={SIT} uid={id("acc")} line={pal.line} />
        <path className="cat-scruff cat-ink" d={SIT.scruff} strokeWidth={w(1)} />
      </g>

      <g className="sit-head">
        {long && (
          <>
            <path d={SIT.cheekL} fill={pal.coat} />
            <path d={SIT.cheekLineL} className="cat-ink" strokeWidth={w(1.1)} />
            <g transform="scale(-1 1)">
              <path d={SIT.cheekL} fill={pal.coat} />
              <path d={SIT.cheekLineL} className="cat-ink" strokeWidth={w(1.1)} />
            </g>
          </>
        )}
        <g className="sit-ear sit-ear--l">
          <path d={SIT.earL[look.fur]} fill={earFill("L")} />
          <path d={SIT.innerL[look.fur]} fill={pal.innerEar} />
          <path d={SIT.earLineL[look.fur]} className="cat-ink" strokeWidth={w(1.45)} />
        </g>
        <g className="sit-ear sit-ear--r">
          <path d={SIT.earR[look.fur]} fill={earFill("R")} />
          <path d={SIT.innerR[look.fur]} fill={pal.innerEar} />
          <path d={SIT.earLineR[look.fur]} className="cat-ink" strokeWidth={w(1.45)} />
        </g>
        {long && (
          <>
            <path d={SIT.earTufts} className="cat-ink" strokeWidth={w(1)} />
            <path d={SIT.earFurnish} className="cat-hair" stroke={pal.accent} strokeWidth="0.7" />
          </>
        )}

        <Shape id={id("head")} d={SIT.head} fill={pal.coat} line={SIT.headLine} sw={1.5}>
          {tabby && <path d={SIT.tabbyHead} fill={pal.mark} className="cat-mark" />}
          {tabby && <path d={SIT.eyeLiner} className="cat-liner" stroke={pal.mark} />}
          {patches && <Patches list={SIT.patchesHead} pal={pal} />}
          {points && <ellipse cx="0" cy="-68" rx="17" ry="15" fill={`url(#${uid}-s-mask)`} />}
          {white === "bib" && <path d={SIT.muzzle} fill={pal.accent} />}
          {white === "lots" && <path d={SIT.blaze} fill={pal.accent} />}
        </Shape>

        <g className="cat-blush" fill={pal.blush}>
          <ellipse cx="-13.5" cy="-67.5" rx="3.8" ry="2" />
          <ellipse cx="13.5" cy="-67.5" rx="3.8" ry="2" />
        </g>
        <g className="cat-eyes cat-eyes--sit">
          <g className="eye-open">
            <path d={SIT.eyeL} fill={pal.eyes} />
            <path d={SIT.eyeR} fill={pal.eyes} />
            <path d={SIT.eyeL} fill={`url(#${uid}-iris)`} />
            <path d={SIT.eyeR} fill={`url(#${uid}-iris)`} />
            {SIT.pupils.map(([x, y]) => (
              <ellipse key={x} className="cat-pupil" cx={x} cy={y} rx="1.2" ry="3" fill={pal.line} />
            ))}
            {SIT.shines.map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="0.95" fill="#fdfcff" />
            ))}
            <path d={SIT.eyeL} className="cat-ink" strokeWidth={w(0.8)} />
            <path d={SIT.eyeR} className="cat-ink" strokeWidth={w(0.8)} />
            <path d={SIT.lids} className="cat-ink" strokeWidth={w(1.7)} />
          </g>
          <path className="eye-happy cat-ink" d={SIT.happyEyes} strokeWidth={w(1.7)} />
          <path className="eye-closed cat-ink" d={SIT.closedEyes} strokeWidth={w(1.6)} />
        </g>
        <path d={SIT.nose} fill={pal.nose} stroke={pal.line} strokeWidth={w(0.8)} strokeLinejoin="round" />
        <path className="cat-mouth cat-ink" d={SIT.mouth} strokeWidth={w(0.9)} />
        <ellipse className="cat-mouth-open" cx={SIT.openMouth[0]} cy={SIT.openMouth[1]} rx="2.3" ry="1.9" fill="#6d4a63" stroke={pal.line} strokeWidth={w(0.8)} />
        <path className="cat-tongue" d={SIT.tongue} fill="#ec9cb0" stroke={pal.line} strokeWidth={w(0.6)} />
        <path className="cat-whiskers cat-ink" d={SIT.whiskers} />
        {look.accessory === "sakura" && <Crown spots={SIT.crown} line={pal.line} />}
      </g>

      <g className="cat-bowl">
        <path d="M -16 -7 L 16 -7 L 12.5 2.5 Q 0 4.5 -12.5 2.5 Z" fill="#efb3c4" stroke={pal.line} strokeWidth={w(1.2)} strokeLinejoin="round" />
        <path d="M -6 -1.6 Q -2 -4 2 -1.6 Q -2 0.8 -6 -1.6 Z M 2 -1.6 L 5 -3.6 L 5 0.4 Z" fill="#fbf8fd" />
        <ellipse cx="0" cy="-7" rx="16" ry="2.8" fill="#eef0fa" stroke={pal.line} strokeWidth={w(1.2)} />
        <path d="M -9 -7.6 Q -5 -10 -1 -7.8 Q 3 -10.4 8 -7.6" fill="#d9ae8f" stroke={pal.line} strokeWidth={w(0.8)} />
      </g>
    </g>
  );
}

function WalkPose({ look, pal, uid }) {
  const long = look.fur === "long";
  const white = look.white;
  const tabby = look.markings === "tabby";
  const patches = look.markings === "patches";
  const points = look.markings === "points";
  const id = (name) => `${uid}-w-${name}`;
  const farFill = white === "lots" ? pal.accentShade : points ? darken(pal.mark, 0.1) : pal.shade;
  const nearLegFill = white === "lots" ? pal.accent : pal.coat;
  const earFill = (near) => (points ? pal.mark : patches ? (near ? pal.mark : pal.mark2) : pal.coat);
  const pointFade = points ? <rect x="-40" y="-24" width="80" height="28" fill={`url(#${uid}-w-legfade)`} /> : null;

  const leg = (key, d, fill, className, decoration) => (
    <g className={className}>
      <Shape id={id(key)} d={d} fill={fill} sw={1.35}>
        {decoration}
      </Shape>
    </g>
  );

  return (
    <g className="cat-pose cat-pose--walk">
      <ellipse className="cat-shadow" cx="0" cy="1" rx="38" ry="4.6" />
      <g className="walk-bob">
        <g transform="translate(5 0)">{leg("lbf", WALK.legBack, farFill, "walk-leg walk-leg--back-far", null)}</g>
        <g transform="translate(-5 0)">{leg("lff", WALK.legFront, farFill, "walk-leg walk-leg--front-far", null)}</g>

        <g className="walk-tail">
          <Tail id={id("tail")} set={WALK.tail} look={look} pal={pal} />
        </g>

        <Shape id={id("body")} d={WALK.body} fill={pal.coat}>
          {tabby && <path d={WALK.tabbyBody} fill={pal.mark} className="cat-mark" />}
          {patches && <Patches list={WALK.patchesBody} pal={pal} />}
          {white !== "none" && <path d={WALK.bib} fill={pal.accent} />}
          {white === "lots" && <path d={WALK.belly} fill={pal.accent} />}
          <path d={WALK.backHairs} className="cat-hair" stroke={pal.hair} />
        </Shape>
        {long && (
          <>
            <path d={WALK.bellyFluff} fill={white === "lots" ? pal.accent : pal.coat} />
            <path d={WALK.bellyFluffLine} className="cat-ink" strokeWidth={w(1.05)} />
          </>
        )}

        {leg(
          "lbn",
          WALK.legBack,
          nearLegFill,
          "walk-leg walk-leg--back-near",
          <>
            {tabby && white !== "lots" && <path d={WALK.tabbyBack} fill={pal.mark} className="cat-mark" />}
            {patches && <path d={WALK.patchesBody[0][0]} fill={pal.mark} />}
            {white === "bib" && <path d={WALK.sockBack} fill={pal.accent} />}
            {pointFade}
          </>,
        )}
        {long && (
          <g className="walk-leg walk-leg--back-near">
            <path d={WALK.britches} fill={nearLegFill} />
            <path d={WALK.britchesLine} className="cat-ink" strokeWidth={w(1.05)} />
          </g>
        )}
        {leg(
          "lfn",
          WALK.legFront,
          nearLegFill,
          "walk-leg walk-leg--front-near",
          <>
            {tabby && white !== "lots" && <path d={WALK.tabbyFront} fill={pal.mark} className="cat-mark" />}
            {white === "bib" && <path d={WALK.sock} fill={pal.accent} />}
            {pointFade}
          </>,
        )}

        {long && (
          <>
            <path d={WALK.ruff} fill={white === "none" ? pal.light : pal.accent} />
            <path d={WALK.ruffHairs} className="cat-hair" stroke={white === "none" ? pal.hair : pal.hairLight} />
            <path d={WALK.ruffLine} className="cat-ink" strokeWidth={w(1.1)} />
          </>
        )}
        <NeckAccessory look={look} shapes={WALK} uid={id("acc")} line={pal.line} />

        <g className="walk-head">
          <g transform={WALK.headScale}>
            <path d={WALK.earNear} fill={earFill(true)} />
            <path d={WALK.innerNear} fill={pal.innerEar} />
            <path d={WALK.earNearLine} className="cat-ink" strokeWidth={w(1.35)} />
            <path d={WALK.earFar} fill={earFill(false)} />
            <path d={WALK.innerFar} fill={pal.innerEar} />
            <path d={WALK.earFarLine} className="cat-ink" strokeWidth={w(1.35)} />
            {long && <path d={WALK.earTufts} className="cat-ink" strokeWidth={w(0.95)} />}
            <Shape id={id("head")} d={WALK.head} fill={pal.coat} line={WALK.headLine} sw={1.4}>
              {tabby && <path d={WALK.tabbyHead} fill={pal.mark} className="cat-mark" />}
              {tabby && <path d={WALK.eyeLiner} className="cat-liner" stroke={pal.mark} />}
              {patches && <Patches list={WALK.patchesHead} pal={pal} />}
              {points && <ellipse cx="40" cy="-54" rx="13" ry="12" fill={`url(#${uid}-w-mask)`} />}
              {white === "bib" && <path d={WALK.muzzle} fill={pal.accent} />}
              {white === "lots" && <path d={WALK.blaze} fill={pal.accent} />}
            </Shape>
            <g className="cat-eyes cat-eyes--walk">
              <g className="eye-open">
                <path d={WALK.eyeNear} fill={pal.eyes} />
                <path d={WALK.eyeFar} fill={pal.eyes} />
                {WALK.pupils.map(([x, y, rx, ry]) => (
                  <ellipse key={x} className="cat-pupil" cx={x} cy={y} rx={rx} ry={ry} fill={pal.line} />
                ))}
                {WALK.shines.map(([x, y, r]) => (
                  <circle key={x} cx={x} cy={y} r={r} fill="#fdfcff" />
                ))}
                <path d={WALK.eyeNear} className="cat-ink" strokeWidth={w(0.8)} />
                <path d={WALK.eyeFar} className="cat-ink" strokeWidth={w(0.8)} />
                <path d={WALK.lids} className="cat-ink" strokeWidth={w(1.6)} />
              </g>
              <path className="eye-happy cat-ink" d={WALK.happyEyes} strokeWidth={w(1.6)} />
            </g>
            <path d={WALK.nose} fill={pal.nose} stroke={pal.line} strokeWidth={w(0.8)} strokeLinejoin="round" />
            <path d={WALK.mouth} className="cat-ink" strokeWidth={w(0.9)} />
            <path className="cat-whiskers cat-ink" d={WALK.whiskers} />
            {look.accessory === "sakura" && <Crown spots={WALK.crown} line={pal.line} />}
          </g>
        </g>
        <path className="cat-scruff cat-ink" d={WALK.scruff} strokeWidth={w(1)} />
      </g>
    </g>
  );
}

function SleepPose({ look, pal, uid }) {
  const long = look.fur === "long";
  const white = look.white;
  const tabby = look.markings === "tabby";
  const patches = look.markings === "patches";
  const points = look.markings === "points";
  const id = (name) => `${uid}-z-${name}`;
  const earFill = (near) => (points ? pal.mark : patches ? (near ? pal.mark : pal.mark2) : pal.coat);

  return (
    <g className="cat-pose cat-pose--sleep">
      <ellipse className="cat-shadow" cx="0" cy="1.5" rx="40" ry="5" />
      <g className="sleep-breathe">
        {long && (
          <>
            <path d={SLEEP.backFluff} fill={pal.coat} />
            <path d={SLEEP.backFluffLine} className="cat-ink" strokeWidth={w(1.1)} />
          </>
        )}
        <Shape id={id("body")} d={SLEEP.body} fill={pal.coat}>
          {tabby && <path d={SLEEP.tabbyBody} fill={pal.mark} className="cat-mark" />}
          {patches && <Patches list={SLEEP.patchesBody} pal={pal} />}
          {white !== "none" && <path d={SLEEP.bellyWhite} fill={pal.accent} />}
        </Shape>
        <path d={SLEEP.haunch} className="cat-ink" strokeWidth={w(1.2)} />
        <g className="sleep-tail">
          <Tail id={id("tail")} set={SLEEP.tail} look={look} pal={pal} />
        </g>
        {long && (
          <>
            <path d={SLEEP.ruff} fill={white === "none" ? pal.light : pal.accent} />
            <path d={SLEEP.ruffLine} className="cat-ink" strokeWidth={w(1.05)} />
          </>
        )}
        <NeckAccessory look={look} shapes={SLEEP} uid={id("acc")} line={pal.line} />
        <path d={SLEEP.paws} fill={white === "none" ? (points ? pal.mark : pal.coat) : pal.accent} className="cat-ink-fill" />
        <g className="sleep-head" transform={SLEEP.headScale}>
          <path d={SLEEP.earNear} fill={earFill(true)} className="cat-ink-fill" />
          <path d={SLEEP.innerNear} fill={pal.innerEar} />
          <path d={SLEEP.earFar} fill={earFill(false)} className="cat-ink-fill" />
          <path d={SLEEP.innerFar} fill={pal.innerEar} />
          {long && <path d={SLEEP.earTufts} className="cat-ink" strokeWidth={w(0.95)} />}
          <Shape id={id("head")} d={SLEEP.head} fill={pal.coat} sw={1.4}>
            {tabby && <path d={SLEEP.tabbyHead} fill={pal.mark} className="cat-mark" />}
            {patches && <Patches list={SLEEP.patchesHead} pal={pal} />}
            {points && <ellipse cx="24.5" cy="-16" rx="12" ry="10" fill={`url(#${uid}-z-mask)`} />}
            {white === "bib" && <path d={SLEEP.muzzle} fill={pal.accent} />}
            {white === "lots" && <path d={SLEEP.blaze} fill={pal.accent} />}
          </Shape>
          <g fill={pal.blush} opacity="0.5">
            <ellipse cx="14" cy="-17" rx="2.6" ry="1.4" />
            <ellipse cx="34.5" cy="-17.5" rx="2.4" ry="1.3" />
          </g>
          <path d={SLEEP.eyes} className="cat-ink" strokeWidth={w(1.4)} />
          <path d={SLEEP.nose} fill={pal.nose} stroke={pal.line} strokeWidth={w(0.7)} />
          <path d={SLEEP.mouth} className="cat-ink" strokeWidth={w(0.8)} />
          <path className="cat-whiskers cat-ink" d={SLEEP.whiskers} />
          {look.accessory === "sakura" && <Crown spots={SLEEP.crown} line={pal.line} />}
        </g>
      </g>
    </g>
  );
}

function Gradients({ uid, pal }) {
  const fade = (key, y0, y1) => (
    <linearGradient id={`${uid}-${key}-legfade`} x1="0" y1={y0} x2="0" y2={y1} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor={pal.mark} stopOpacity="0" />
      <stop offset="0.55" stopColor={pal.mark} stopOpacity="0.85" />
      <stop offset="1" stopColor={pal.mark} stopOpacity="1" />
    </linearGradient>
  );
  const mask = (key, cx, cy, r) => (
    <radialGradient id={`${uid}-${key}-mask`} cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor={pal.mark} stopOpacity="0.95" />
      <stop offset="0.6" stopColor={pal.mark} stopOpacity="0.75" />
      <stop offset="1" stopColor={pal.mark} stopOpacity="0" />
    </radialGradient>
  );
  return (
    <defs>
      {fade("s", -26, 2)}
      {fade("w", -24, 2)}
      {mask("s", 0, -67, 17)}
      {mask("w", 40, -54, 13)}
      {mask("z", 24.5, -16, 12)}
      <linearGradient id={`${uid}-iris`} x1="0" y1="-82" x2="0" y2="-74" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={pal.line} stopOpacity="0.4" />
        <stop offset="0.5" stopColor={pal.line} stopOpacity="0" />
      </linearGradient>
    </defs>
  );
}

/**
 * A woodblock-print cat. Pose and activity are driven by data attributes so the
 * courtyard can change them every frame without re-rendering React:
 *   data-pose  sit | walk | sleep        data-gait  walk | run
 *   data-act   idle | groom | eat | happy | meow | beg | play | boop
 * Pass `pose`/`act` props when using it standalone (picker, avatars).
 */
function CatFigure({ look, pose, act, scruffy, night = false, className = "", title, variant }) {
  const uid = "c" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const pal = catPalette(look, night);
  const isHead = variant === "head";
  return (
    <svg
      className={`cat ${isHead ? "cat--head" : ""} ${className}`}
      viewBox={isHead ? "46 14 68 72" : "0 0 160 150"}
      data-pose={pose}
      data-act={act}
      data-scruffy={scruffy ? "true" : undefined}
      style={{ "--cat-line": pal.line }}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <Gradients uid={uid} pal={pal} />
      <g transform="translate(80 140)">
        <SitPose look={look} pal={pal} uid={uid} />
        {!isHead && <WalkPose look={look} pal={pal} uid={uid} />}
        {!isHead && <SleepPose look={look} pal={pal} uid={uid} />}
      </g>
    </svg>
  );
}

export default memo(CatFigure);
