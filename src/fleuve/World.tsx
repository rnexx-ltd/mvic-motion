import React, { useMemo } from "react";
import { random } from "remotion";
import * as THREE from "three";
import { Ink, Toon, useRoundedBox } from "./toon";

export const RIVER_HALF = 0.95; // demi-largeur du fleuve

// ── Berges, fleuve, collines ──
export const Landscape: React.FC<{ frame: number }> = ({ frame }) => (
  <group>
    {/* berges */}
    {[-1, 1].map((side) => (
      <group key={side}>
        <mesh position={[side * (RIVER_HALF + 5.5), -0.6, -6]}>
          <boxGeometry args={[11, 1.2, 34]} />
          <Toon color="#c98a4b" />
        </mesh>
        {/* talus herbeux le long de l'eau */}
        <mesh position={[side * (RIVER_HALF + 0.12), -0.05, -6]}>
          <boxGeometry args={[0.28, 0.14, 34]} />
          <Toon color="#7d8f3a" />
        </mesh>
      </group>
    ))}
    {/* lit du fleuve + eau */}
    <mesh position={[0, -0.9, -6]}>
      <boxGeometry args={[RIVER_HALF * 2, 0.6, 34]} />
      <Toon color="#2f6f8c" />
    </mesh>
    <mesh position={[0, -0.32, -6]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[RIVER_HALF * 2, 34]} />
      <Toon color="#3f97b8" />
    </mesh>
    {/* reflets qui coulent */}
    {new Array(28).fill(0).map((_, i) => {
      const z = ((random(`wz${i}`) * 34 + frame * 0.05) % 34) - 23;
      const x = (random(`wx${i}`) - 0.5) * RIVER_HALF * 1.6;
      const len = 0.25 + random(`wl${i}`) * 0.5;
      return (
        <mesh key={i} position={[x, -0.31, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, len]} />
          <meshBasicMaterial color="#c8f0ff" transparent opacity={0.8} />
        </mesh>
      );
    })}
    {/* touffes d'herbe */}
    {new Array(40).fill(0).map((_, i) => {
      const side = i % 2 ? 1 : -1;
      const x = side * (RIVER_HALF + 0.4 + random(`gx${i}`) * 5);
      const z = 2 - random(`gz${i}`) * 14;
      const h = 0.12 + random(`gh${i}`) * 0.2;
      return (
        <mesh key={i} position={[x, h / 2, z]}>
          <coneGeometry args={[0.07, h, 5]} />
          <Toon color="#8a9a3c" />
        </mesh>
      );
    })}
  </group>
);

// ── Collines lointaines (repère monde) ──
export const Hills: React.FC = () => (
  <group>
    {[
      [-12, -24, 8, "#b5604a"],
      [-3, -30, 11, "#a8564a"],
      [9, -26, 9, "#b86a4e"],
      [18, -20, 7, "#a95a45"],
    ].map(([x, z, r, c], i) => (
      <mesh key={i} position={[x as number, -2.2, z as number]} scale={[1, 0.42, 1]}>
        <sphereGeometry args={[r as number, 24, 16]} />
        <Toon color={c as string} />
      </mesh>
    ))}
  </group>
);

// ── Palmier stylisé ──
export const Palm: React.FC<{ position: [number, number, number]; height: number; sway: number }> = ({ position, height, sway }) => {
  const leaf = useMemo(() => {
    const g = new THREE.ConeGeometry(0.22, 1.5, 4, 1);
    g.rotateZ(-Math.PI / 2);
    g.translate(0.75, 0, 0);
    g.scale(1, 0.25, 1);
    return g;
  }, []);
  const trunk = useMemo(() => new THREE.CylinderGeometry(0.07, 0.12, height, 8), [height]);
  return (
    <group position={position} rotation={[0, 0, sway * 0.05]}>
      <Ink geometry={trunk} color="#8b5a35" position={[0, height / 2, 0]} outline={0.06} />
      <group position={[0, height, 0]}>
        {new Array(7).fill(0).map((_, i) => (
          <group key={i} rotation={[0, (i / 7) * Math.PI * 2, -0.35 + Math.sin(sway + i) * 0.05]}>
            <Ink geometry={leaf} color="#5f8a33" outline={0.05} />
          </group>
        ))}
      </group>
    </group>
  );
};

// ── Le pont Mvic qui se construit ──
const PLANKS = 9;
export const BRIDGE_START = -1.15;
export const BRIDGE_END = 1.15;

export const Bridge: React.FC<{ frame: number; startAt: number; every: number }> = ({ frame, startAt, every }) => {
  const plank = useRoundedBox(0.26, 0.09, 1.25, 0.03);
  const step = (BRIDGE_END - BRIDGE_START) / (PLANKS - 1);
  const railProgress = Math.min(1, Math.max(0, (frame - startAt - every * 2) / (every * (PLANKS - 1))));
  return (
    <group position={[0, 0.06, 0.35]}>
      {new Array(PLANKS).fill(0).map((_, i) => {
        const t0 = startAt + i * every;
        const p = (frame - t0) / 9; // 0 → 1 pendant la chute
        if (p < 0) return null;
        const fall = p >= 1 ? 0 : 3.2 * (1 - p) * (1 - p);
        const bounce = p >= 1 && p < 1.8 ? Math.sin((p - 1) * Math.PI * 1.25) * 0.08 * (1.8 - p) : 0;
        return (
          <group key={i} position={[BRIDGE_START + i * step, fall + Math.max(0, bounce), 0]} rotation={[0, 0, p < 1 ? (1 - p) * 0.6 * (i % 2 ? 1 : -1) : 0]}>
            <Ink geometry={plank} color={i % 2 ? "#4FC9A8" : "#1A6B5A"} rotation={[0, Math.PI / 2, 0]} outline={0.05} />
          </group>
        );
      })}
      {/* garde-corps */}
      {[-0.62, 0.62].map((z) => (
        <group key={z} position={[BRIDGE_START, 0.46, z]}>
          <mesh position={[((BRIDGE_END - BRIDGE_START) * railProgress) / 2, 0, 0]} scale={[Math.max(0.001, railProgress), 1, 1]}>
            <boxGeometry args={[BRIDGE_END - BRIDGE_START, 0.09, 0.09]} />
            <Toon color="#4FC9A8" />
          </mesh>
          {new Array(5).fill(0).map((_, k) => {
            const kx = ((BRIDGE_END - BRIDGE_START) * k) / 4;
            const vis = railProgress * (BRIDGE_END - BRIDGE_START) >= kx - 0.01;
            return vis ? (
              <mesh key={k} position={[kx, -0.21, 0]}>
                <boxGeometry args={[0.09, 0.46, 0.09]} />
                <Toon color="#1A6B5A" />
              </mesh>
            ) : null;
          })}
        </group>
      ))}
    </group>
  );
};
