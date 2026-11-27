import React, { useMemo } from "react";
import * as THREE from "three";
import { BlobShadow, Ink, INK, useRoundedBox } from "./toon";

// ── Yeux expressifs (dessinés sur l'écran) ──
export type EyeState = {
  open: number; // 0 fermé … 1 ouvert
  look: [number, number]; // direction du regard (-1…1)
  wide: number; // 1 normal, >1 écarquillé
  happy: number; // 0 … 1 : yeux en « ^ ^ »
  brow: number; // angle des sourcils (-1 triste … 1 fâché)
  tears: number; // 0 … 1 progression des larmes
};

const Eye: React.FC<{ x: number; s: EyeState; side: 1 | -1; size: number }> = ({ x, s, side, size }) => {
  const r = size * s.wide;
  const happyArc = useMemo(() => new THREE.RingGeometry(r * 0.75, r, 32, 1, Math.PI * 0.1, Math.PI * 0.8), [r]);
  return (
    <group position={[x, 0, 0]}>
      {s.happy < 0.5 ? (
        <>
          <mesh scale={[1, Math.max(0.08, s.open), 1]}>
            <circleGeometry args={[r, 40]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {s.open > 0.2 && (
            <mesh position={[s.look[0] * r * 0.38, s.look[1] * r * 0.3, 0.002]} scale={[1, Math.min(1, s.open * 1.3), 1]}>
              <circleGeometry args={[r * 0.48, 32]} />
              <meshBasicMaterial color="#141414" />
            </mesh>
          )}
          {s.open > 0.2 && (
            <mesh position={[s.look[0] * r * 0.38 + r * 0.16, s.look[1] * r * 0.3 + r * 0.16, 0.004]}>
              <circleGeometry args={[r * 0.13, 16]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          )}
        </>
      ) : (
        <mesh geometry={happyArc}>
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      )}
      {/* sourcil */}
      <mesh position={[0, r * 1.45 + (s.wide - 1) * r * 0.8, 0.003]} rotation={[0, 0, side * s.brow * 0.45]}>
        <planeGeometry args={[r * 1.6, r * 0.28]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* larmes */}
      {s.tears > 0 &&
        [0, 0.5].map((o) => {
          const p = (s.tears * 1.6 + o) % 1;
          return (
            <mesh key={o} position={[side * r * 0.7, -r * 0.9 - p * r * 2.4, 0.006]} scale={[1, 1.3, 1]}>
              <circleGeometry args={[r * 0.22 * (1 - p * 0.4), 16]} />
              <meshBasicMaterial color="#8fd8ff" transparent opacity={1 - p} />
            </mesh>
          );
        })}
    </group>
  );
};

export const Eyes: React.FC<{ s: EyeState; size?: number; gap?: number; position?: [number, number, number] }> = ({ s, size = 0.13, gap = 0.2, position }) => (
  <group position={position}>
    <Eye x={-gap} s={s} side={-1} size={size} />
    <Eye x={gap} s={s} side={1} size={size} />
  </group>
);

// ── Petit Jaune : smartphone MTN de Junior (coque jaune, écran-visage) ──
export const PetitJaune: React.FC<{
  position: [number, number, number];
  eyes: EyeState;
  squash: number;
  tilt: number;
  screenGlow: number;
}> = ({ position, eyes, squash, tilt, screenGlow }) => {
  const body = useRoundedBox(1.05, 2.0, 0.16, 0.2);
  const sq = 1 + squash;
  return (
    <group position={position}>
      <BlobShadow position={[0, 0.02, 0.1]} size={0.75} />
      <group position={[0, 1.0 * sq, 0]} rotation={[0, 0.25, tilt]} scale={[1 / Math.sqrt(sq), sq, 1]}>
        <Ink geometry={body} color="#FFCB05" />
        <mesh position={[0, 0.04, 0.085]}>
          <planeGeometry args={[0.86, 1.66]} />
          <meshBasicMaterial color={new THREE.Color("#16201f").lerp(new THREE.Color("#1A6B5A"), screenGlow)} />
        </mesh>
        <Eyes s={eyes} position={[0, 0.25, 0.09]} />
        {/* bouton */}
        <mesh position={[0.54, 0.35, 0]}>
          <boxGeometry args={[0.04, 0.26, 0.06]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>
    </group>
  );
};

// ── Vieux Orange : téléphone à touches de Maman (coque orange, petit écran, clavier) ──
export const VieuxOrange: React.FC<{
  position: [number, number, number];
  eyes: EyeState;
  squash: number;
  tilt: number;
  shake: number;
  sway: number;
}> = ({ position, eyes, squash, tilt, shake, sway }) => {
  const body = useRoundedBox(0.95, 1.9, 0.3, 0.3);
  const key = useRoundedBox(0.2, 0.12, 0.05, 0.05);
  const sq = 1 + squash;
  return (
    <group position={position}>
      <BlobShadow position={[0, 0.02, 0.1]} size={0.7} />
      <group position={[shake + sway * 0.25, 0.95 * sq, 0]} rotation={[0, -0.25, tilt + sway * 0.12]} scale={[1 / Math.sqrt(sq), sq, 1]}>
        <Ink geometry={body} color="#FF6600" />
        {/* petit écran */}
        <mesh position={[0, 0.42, 0.158]}>
          <planeGeometry args={[0.66, 0.62]} />
          <meshBasicMaterial color="#c9e8c0" />
        </mesh>
        <Eyes s={eyes} size={0.1} gap={0.15} position={[0, 0.42, 0.162]} />
        {/* clavier 3x4 */}
        {new Array(12).fill(0).map((_, i) => (
          <group key={i} position={[(i % 3 - 1) * 0.25, -0.15 - Math.floor(i / 3) * 0.17, 0.16]}>
            <mesh geometry={key}>
              <meshToonMaterial color="#ffe1c2" />
            </mesh>
          </group>
        ))}
        {/* antenne */}
        <mesh position={[0.3, 1.05, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.25, 12]} />
          <meshBasicMaterial color={INK} />
        </mesh>
      </group>
    </group>
  );
};

// ── Le billet de 10 000 qui court (petites jambes) ──
export const Billet: React.FC<{ position: [number, number, number]; run: number; hop: number; eyes: EyeState; facing: number }> = ({ position, run, hop, eyes, facing }) => {
  const note = useRoundedBox(0.62, 0.34, 0.03, 0.04);
  const legA = Math.sin(run) * 0.6;
  const legB = Math.sin(run + Math.PI) * 0.6;
  return (
    <group position={position} rotation={[0, facing, 0]}>
      <BlobShadow position={[0, 0.01, 0]} size={0.28} opacity={0.22} />
      <group position={[0, 0.36 + hop, 0]} rotation={[0, 0, -0.12 + Math.sin(run * 2) * 0.05]}>
        <Ink geometry={note} color="#7bbf8a" outline={0.06} />
        {/* motif du billet */}
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[0.1, 24]} />
          <meshBasicMaterial color="#4f9b62" />
        </mesh>
        <Eyes s={eyes} size={0.045} gap={0.075} position={[0.12, 0.05, 0.022]} />
        {/* jambes */}
        {[legA, legB].map((a, i) => (
          <group key={i} position={[i ? 0.12 : -0.12, -0.17, 0]} rotation={[0, 0, a]}>
            <mesh position={[0, -0.09, 0]}>
              <boxGeometry args={[0.035, 0.18, 0.035]} />
              <meshBasicMaterial color={INK} />
            </mesh>
            <mesh position={[0.03, -0.18, 0]}>
              <boxGeometry args={[0.08, 0.035, 0.05]} />
              <meshBasicMaterial color={INK} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};
