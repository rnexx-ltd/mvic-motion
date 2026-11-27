import React from "react";
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

loadFont({ family: "Anton", url: staticFile("fonts/Anton-latin.woff2"), weight: "400" });

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fragment de texte : 2 à 5 mots, majuscules, apparition au mot, calé sur la voix
export const Fragment: React.FC<{ text: string; from: number; to: number; size?: number; color?: string; bottom?: number }> = ({ text, from, to, size = 92, color = "#fff4e6", bottom = 330 }) => {
  const f = useCurrentFrame();
  if (f < from || f > to) return null;
  const words = text.split(" ");
  const step = Math.max(2, Math.min(5, Math.floor((to - from) / (words.length * 3))));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: bottom, pointerEvents: "none" }}>
      <div
        style={{
          fontFamily: "Anton",
          fontSize: size,
          lineHeight: 1.05,
          letterSpacing: 1,
          color,
          textAlign: "center",
          maxWidth: 900,
          textShadow: "0 4px 18px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
          opacity: interpolate(f, [to - 6, to], [1, 0], clamp),
        }}
      >
        {words.map((w, i) => {
          const at = from + i * step;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 22,
                opacity: interpolate(f, [at, at + 4], [0, 1], clamp),
                translate: interpolate(f, [at, at + 6], ["0px 18px", "0px 0px"], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
