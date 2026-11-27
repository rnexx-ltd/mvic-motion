import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { uiFont } from "../brand";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Grain de film animé (change à chaque image)
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`g${frame % 8}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 8} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${frame % 8})`} />
      </svg>
    </AbsoluteFill>
  );
};

// Vignettage cinéma
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(20,6,2,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

// Poussières en suspension dans la lumière
export const Dust: React.FC<{ count?: number }> = ({ count = 26 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {new Array(count).fill(0).map((_, i) => {
        const x = random(`x${i}`) * width + Math.sin((frame + i * 20) / 40) * 30;
        const y = (random(`y${i}`) * height - frame * (0.4 + random(`s${i}`) * 0.6) + height) % height;
        const r = 2 + random(`r${i}`) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: r,
              height: r,
              borderRadius: 99,
              background: "rgba(255,214,160,0.55)",
              filter: "blur(1.5px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Sous-titres mot à mot (style réseaux)
export type Word = { text: string; at: number };
export const WordCaption: React.FC<{ words: Word[]; until: number; bottom?: number; boxed?: boolean }> = ({ words, until, bottom = 300, boxed }) => {
  const frame = useCurrentFrame();
  if (frame < words[0].at || frame > until) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        bottom,
        textAlign: "center",
        fontFamily: uiFont,
        fontWeight: 800,
        fontSize: 62,
        lineHeight: 1.2,
        color: "white",
        textShadow: "0 4px 0 rgba(0,0,0,0.85), 0 0 24px rgba(0,0,0,0.6)",
      }}
    >
      <span style={boxed ? { display: "inline-block", background: "rgba(30,10,5,0.82)", borderRadius: 26, padding: "18px 30px 18px 46px" } : undefined}>
      {words.map((w, i) => {
        const shown = frame >= w.at;
        const isLast = shown && (i === words.length - 1 || frame < words[i + 1].at);
        return (
          <span
            key={i}
            style={{
              opacity: shown ? 1 : 0,
              color: isLast ? "#FFD34D" : "white",
              display: "inline-block",
              marginRight: 16,
              scale: String(shown ? interpolate(frame, [w.at, w.at + 4], [1.25, 1], clamp) : 1),
            }}
          >
            {w.text}
          </span>
        );
      })}
      </span>
    </div>
  );
};

// Tremblement de caméra
export const useShake = (from: number, to: number, amp: number) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return "0px 0px";
  const k = interpolate(frame, [from, to], [1, 0], clamp);
  return `${(random(`sx${frame}`) - 0.5) * amp * k}px ${(random(`sy${frame}`) - 0.5) * amp * k}px`;
};
