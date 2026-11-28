import React, { useMemo } from "react";
import * as THREE from "three";

// ── Silhouettes articulées (théâtre d'ombres) ──
// Une pose = angles en radians. Les personnages sont des formes simples : c'est la silhouette qui compte.
export type Pose = {
  y: number; // hauteur du bassin (accroupi / assis)
  lean: number; // inclinaison du buste (avant +)
  side: number; // inclinaison latérale
  turn: number; // rotation du corps (y)
  head: number; // inclinaison de la tête
  armL: [number, number]; // épaule (avant/arrière), coude
  armR: [number, number];
  armLout: number; // écart latéral des bras
  armRout: number;
  legL: [number, number]; // hanche, genou
  legR: [number, number];
};

export const rest: Pose = { y: 0, lean: 0, side: 0, turn: 0, head: 0, armL: [0, 0.1], armR: [0, 0.1], armLout: 0.12, armRout: 0.12, legL: [0, 0], legR: [0, 0] };

export const mix = (a: Pose, b: Pose, t: number): Pose => {
  const l = (x: number, y: number) => x + (y - x) * t;
  return {
    y: l(a.y, b.y),
    lean: l(a.lean, b.lean),
    side: l(a.side, b.side),
    turn: l(a.turn, b.turn),
    head: l(a.head, b.head),
    armL: [l(a.armL[0], b.armL[0]), l(a.armL[1], b.armL[1])],
    armR: [l(a.armR[0], b.armR[0]), l(a.armR[1], b.armR[1])],
    armLout: l(a.armLout, b.armLout),
    armRout: l(a.armRout, b.armRout),
    legL: [l(a.legL[0], b.legL[0]), l(a.legL[1], b.legL[1])],
    legR: [l(a.legR[0], b.legR[0]), l(a.legR[1], b.legR[1])],
  };
};

// Cycles de mouvement
export const walk = (ph: number, amp = 1, run = false): Pose => {
  const s = Math.sin(ph);
  const k = run ? 1.6 : 1;
  return {
    ...rest,
    y: -Math.abs(Math.cos(ph)) * 0.03 * k,
    lean: run ? 0.28 : 0.04,
    armL: [-s * 0.5 * amp * k, run ? 1.3 : 0.35],
    armR: [s * 0.5 * amp * k, run ? 1.3 : 0.35],
    legL: [s * 0.45 * amp * k, Math.max(0, -Math.cos(ph)) * 0.9 * k],
    legR: [-s * 0.45 * amp * k, Math.max(0, Math.cos(ph)) * 0.9 * k],
  };
};
export const sit: Pose = { ...rest, y: -0.42, lean: 0.05, legL: [1.5, 1.55], legR: [1.5, 1.55], armL: [0.6, 0.9], armR: [0.6, 0.9] };
export const clutch: Pose = { ...rest, lean: -0.15, head: -0.25, armL: [1.2, 2.2], armR: [1.0, 2.3], armLout: 0.05, armRout: 0.05 };
export const phoneEar: Pose = { ...rest, head: 0.1, armR: [0.5, 2.4], armRout: 0.35, armL: [0.1, 0.2] };
export const slump: Pose = { ...sit, lean: 0.45, head: 0.4, armL: [0.9, 1.4], armR: [0.9, 1.4] };
export const joy: Pose = { ...rest, armL: [2.8, 0.3], armR: [2.8, 0.3], armLout: 0.5, armRout: 0.5, head: -0.2 };
export const dance = (ph: number): Pose => ({
  ...rest,
  y: -Math.abs(Math.sin(ph)) * 0.08,
  side: Math.sin(ph) * 0.18,
  turn: Math.sin(ph * 0.5) * 0.4,
  head: Math.sin(ph + 0.5) * 0.15,
  armL: [2.2 + Math.sin(ph) * 0.5, 0.6 + Math.sin(ph * 2) * 0.4],
  armR: [2.2 - Math.sin(ph) * 0.5, 0.6 - Math.sin(ph * 2) * 0.4],
  armLout: 0.45,
  armRout: 0.45,
  legL: [Math.max(0, Math.sin(ph)) * 0.5, Math.max(0, Math.sin(ph)) * 0.9],
  legR: [Math.max(0, -Math.sin(ph)) * 0.5, Math.max(0, -Math.sin(ph)) * 0.9],
});

export type Kind = "maman" | "junior" | "frere" | "voisine" | "vieille";

// Matériau de silhouette : noir, ou « fantôme » (invisible mais projette son ombre)
const useInk = (ghost: boolean, color: string, lit = false) =>
  useMemo(() => {
    const m = lit ? new THREE.MeshStandardMaterial({ color, roughness: 0.6 }) : new THREE.MeshBasicMaterial({ color });
    if (ghost) {
      m.colorWrite = false;
      m.depthWrite = false;
    }
    return m;
  }, [ghost, color, lit]);

const Limb: React.FC<{ len: number; r: number; mat: THREE.Material }> = ({ len, r, mat }) => (
  <mesh position={[0, -len / 2, 0]} material={mat} castShadow>
    <capsuleGeometry args={[r, len, 4, 10]} />
  </mesh>
);

export const Silhouette: React.FC<{ kind: Kind; pose: Pose; position: [number, number, number]; facing?: number; ghost?: boolean; color?: string; scale?: number; lit?: boolean }> = ({
  kind,
  pose,
  position,
  facing = 0,
  ghost = false,
  color = "#0a0604",
  scale = 1,
  lit = false,
}) => {
  const mat = useInk(ghost, color, lit);
  const kid = kind === "frere";
  const s = (kid ? 0.62 : 1) * scale;
  const hips = kind === "maman" ? 0.2 : kind === "voisine" || kind === "vieille" ? 0.18 : 0.13;
  const legLen = 0.42;
  const pelvisY = 0.92 + pose.y;
  const arm = (side: 1 | -1, a: [number, number], out: number) => (
    <group position={[side * 0.2, 0.5, 0]} rotation={[-a[0], 0, side * out]}>
      <Limb len={0.27} r={0.045} mat={mat} />
      <group position={[0, -0.3, 0]} rotation={[-a[1], 0, 0]}>
        <Limb len={0.25} r={0.04} mat={mat} />
        {kind === "vieille" && side === 1 && (
          <mesh position={[0, -0.5, 0.05]} rotation={[0.1, 0, 0]} material={mat} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.95, 6]} />
          </mesh>
        )}
      </group>
    </group>
  );
  const leg = (side: 1 | -1, l: [number, number]) => (
    <group position={[side * hips * 0.55, 0, 0]} rotation={[-l[0], 0, 0]}>
      <Limb len={legLen} r={0.06} mat={mat} />
      <group position={[0, -legLen - 0.04, 0]} rotation={[l[1], 0, 0]}>
        <Limb len={legLen} r={0.05} mat={mat} />
        <mesh position={[0, -legLen - 0.04, 0.05]} material={mat} castShadow>
          <boxGeometry args={[0.08, 0.05, 0.2]} />
        </mesh>
      </group>
    </group>
  );
  return (
    <group position={position} rotation={[0, facing + pose.turn, 0]} scale={s}>
      <group position={[0, pelvisY, 0]}>
        {leg(1, pose.legL)}
        {leg(-1, pose.legR)}
        {/* bassin + pagne */}
        {kind === "maman" || kind === "voisine" || kind === "vieille" ? (
          <mesh position={[0, -0.25, 0]} material={mat} castShadow>
            <cylinderGeometry args={[hips + 0.04, hips + 0.12, 0.62, 16]} />
          </mesh>
        ) : (
          <mesh material={mat} castShadow>
            <sphereGeometry args={[0.15, 12, 10]} />
          </mesh>
        )}
        {/* buste */}
        <group rotation={[pose.lean + (kind === "vieille" ? 0.35 : 0), 0, pose.side]}>
          <mesh position={[0, 0.3, 0]} scale={[1, 1, 0.7]} material={mat} castShadow>
            <capsuleGeometry args={[kind === "maman" ? 0.17 : 0.14, 0.32, 4, 12]} />
          </mesh>
          {arm(1, pose.armL, pose.armLout)}
          {arm(-1, pose.armR, pose.armRout)}
          {kind === "junior" && (
            <mesh position={[0, 0.32, -0.17]} material={mat} castShadow>
              <boxGeometry args={[0.3, 0.38, 0.2]} />
            </mesh>
          )}
          {/* tête */}
          <group position={[0, 0.66, 0]} rotation={[pose.head, 0, 0]}>
            <mesh material={mat} castShadow>
              <sphereGeometry args={[0.11, 16, 14]} />
            </mesh>
            {kind === "maman" && (
              <>
                <mesh position={[0, 0.08, -0.02]} scale={[1.15, 0.8, 1.15]} material={mat} castShadow>
                  <sphereGeometry args={[0.12, 14, 12]} />
                </mesh>
                <mesh position={[0.02, 0.2, -0.02]} rotation={[0, 0, 0.3]} material={mat} castShadow>
                  <coneGeometry args={[0.09, 0.16, 8]} />
                </mesh>
                <mesh position={[-0.08, 0.17, 0]} rotation={[0, 0, 1]} material={mat} castShadow>
                  <coneGeometry args={[0.05, 0.14, 8]} />
                </mesh>
              </>
            )}
            {kind === "junior" && (
              <mesh position={[0, 0.07, 0.06]} rotation={[0.2, 0, 0]} material={mat} castShadow>
                <cylinderGeometry args={[0.12, 0.13, 0.06, 16]} />
              </mesh>
            )}
            {kind === "voisine" && (
              <mesh position={[0, 0.2, 0]} material={mat} castShadow>
                <cylinderGeometry args={[0.16, 0.12, 0.2, 16]} />
              </mesh>
            )}
          </group>
        </group>
      </group>
    </group>
  );
};
