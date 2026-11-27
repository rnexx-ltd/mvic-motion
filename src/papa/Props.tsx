import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";
import { drawLcd, enamelTexture, leatherTexture, woodTexture } from "./textures";

// Bruit de flamme déterministe (pas d'aléatoire non piloté par l'image)
export const flicker = (f: number, seed = 0) =>
  0.78 + 0.12 * Math.sin(f * 0.9 + seed) + 0.07 * Math.sin(f * 2.3 + seed * 3) + 0.05 * (random(`fl${Math.floor(f / 2)}-${seed}`) - 0.5);

// ── Vieux téléphone à clavier, écran LCD vivant ──
export const OldPhone: React.FC<{ frame: number; lines: string[]; icon: "mic" | "sms" | "none"; glow: number; vibrate: number; position: [number, number, number]; rotation?: [number, number, number]; scale?: number }> = ({
  frame,
  lines,
  icon,
  glow,
  vibrate,
  position,
  rotation,
  scale = 1,
}) => {
  const canvas = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 200;
    return cv;
  }, []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [canvas]);
  drawLcd(canvas, lines, icon, frame);
  tex.needsUpdate = true;
  const shake = vibrate > 0 ? Math.sin(frame * 3.1) * 0.006 * vibrate : 0;
  const keys = useMemo(() => new Array(15).fill(0), []);
  return (
    <group position={[position[0] + shake, position[1], position[2]]} rotation={rotation} scale={scale}>
      {/* coque */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.06, 1.05]} />
        <meshStandardMaterial color="#2b2d30" roughness={0.45} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.031, -0.02]}>
        <boxGeometry args={[0.46, 0.002, 1.0]} />
        <meshStandardMaterial color="#3a3c40" roughness={0.6} />
      </mesh>
      {/* écran */}
      <mesh position={[0, 0.033, -0.25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.36, 0.28]} />
        <meshStandardMaterial map={tex} emissive="#c9f2a4" emissiveMap={tex} emissiveIntensity={0.18 + glow * 0.9} roughness={0.3} />
      </mesh>
      {/* clavier */}
      {keys.map((_, i) => (
        <mesh key={i} position={[(i % 3 - 1) * 0.12, 0.036, 0.05 + Math.floor(i / 3) * 0.085]} castShadow>
          <boxGeometry args={[0.095, 0.012, 0.06]} />
          <meshStandardMaterial color={i < 3 ? "#5a5e63" : "#7c8087"} roughness={0.5} />
        </mesh>
      ))}
      {/* lumière de l'écran */}
      <pointLight position={[0, 0.15, -0.25]} intensity={0.25 + glow * 2.2} distance={1.6} color={glow > 0.5 ? "#bff5d8" : "#c9f2a4"} />
    </group>
  );
};

// ── Tasse émaillée ──
export const Mug: React.FC<{ position: [number, number, number]; jitter?: number }> = ({ position, jitter = 0 }) => {
  const geo = useMemo(() => {
    const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.17, 0), new THREE.Vector2(0.18, 0.02), new THREE.Vector2(0.18, 0.3), new THREE.Vector2(0.17, 0.3), new THREE.Vector2(0.17, 0.03), new THREE.Vector2(0, 0.03)];
    return new THREE.LatheGeometry(pts, 40);
  }, []);
  const tex = enamelTexture();
  return (
    <group position={[position[0] + jitter, position[1], position[2]]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.25} metalness={0.05} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.2, 0.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.07, 0.018, 12, 24, Math.PI]} />
        <meshStandardMaterial color="#efeae0" roughness={0.3} />
      </mesh>
      {/* café */}
      <mesh position={[0, 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.165, 32]} />
        <meshStandardMaterial color="#2a1408" roughness={0.1} />
      </mesh>
    </group>
  );
};

// ── Bible fermée ──
export const Bible: React.FC<{ position: [number, number, number]; rotY: number }> = ({ position, rotY }) => {
  const tex = leatherTexture();
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
        <boxGeometry args={[0.7, 0.12, 0.95]} />
        <meshStandardMaterial color="#3b1f14" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.121, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.95]} />
        <meshStandardMaterial map={tex} roughness={0.75} />
      </mesh>
      {/* tranche des pages */}
      <mesh position={[0.351, 0.06, 0]}>
        <boxGeometry args={[0.005, 0.1, 0.9]} />
        <meshStandardMaterial color="#e2d3b0" roughness={0.9} />
      </mesh>
      {/* signet */}
      <mesh position={[0.1, 0.0, 0.5]} rotation={[0.6, 0, 0]}>
        <boxGeometry args={[0.04, 0.003, 0.25]} />
        <meshStandardMaterial color="#8f1f1f" />
      </mesh>
    </group>
  );
};

// Texture de halo (dégradé radial) pour les sources lumineuses
let haloTex: THREE.CanvasTexture | null = null;
export const halo = () => {
  if (haloTex) return haloTex;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const c = cv.getContext("2d")!;
  const g = c.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.15, "rgba(255,220,160,0.7)");
  g.addColorStop(0.45, "rgba(255,150,60,0.18)");
  g.addColorStop(1, "rgba(255,120,40,0)");
  c.fillStyle = g;
  c.fillRect(0, 0, 256, 256);
  haloTex = new THREE.CanvasTexture(cv);
  return haloTex;
};

export const Glow: React.FC<{ position: [number, number, number]; size: number; color: string; opacity: number }> = ({ position, size, color, opacity }) => (
  <sprite position={position} scale={[size, size, 1]}>
    <spriteMaterial map={halo()} color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
  </sprite>
);

// ── Lampe-tempête : la seule vraie source de lumière de la case ──
export const Lantern: React.FC<{ frame: number; position: [number, number, number] }> = ({ frame, position }) => {
  const k = flicker(frame);
  const globe = useMemo(() => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 16; i++) {
      const y = i / 16;
      pts.push(new THREE.Vector2(0.11 + Math.sin(y * Math.PI) * 0.09, y * 0.42));
    }
    return new THREE.LatheGeometry(pts, 32);
  }, []);
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.2, 0.22, 0.14, 32]} />
        <meshStandardMaterial color="#7a2c1c" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh geometry={globe} position={[0, 0.14, 0]}>
        <meshStandardMaterial color="#ffd9a0" transparent opacity={0.35} roughness={0.05} emissive="#ff9c3a" emissiveIntensity={0.6 * k} side={THREE.DoubleSide} />
      </mesh>
      {/* flamme */}
      <mesh position={[0, 0.3 + 0.01 * Math.sin(frame * 1.7), 0]} scale={[1, 1 + 0.25 * (k - 0.78), 1]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshBasicMaterial color={[6 * k, 3.2 * k, 0.9 * k]} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.37, 0]} scale={[0.6, 1.6 + 0.3 * Math.sin(frame * 1.3), 0.6]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={[5 * k, 2.2 * k, 0.5 * k]} toneMapped={false} transparent opacity={0.9} />
      </mesh>
      <Glow position={[0, 0.33, 0.02]} size={0.32} color="#ffe2a8" opacity={0.95 * k} />
      <Glow position={[0, 0.33, 0.02]} size={1.6} color="#ff8a3a" opacity={0.35 * k} />
      {/* chapeau + anse */}
      <mesh castShadow position={[0, 0.6, 0]}>
        <coneGeometry args={[0.19, 0.12, 32]} />
        <meshStandardMaterial color="#7a2c1c" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, 0.72, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.15, 0.008, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 0.34, 0]} intensity={5.2 * k} distance={8} decay={1.7} color="#ffa451" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.002} />
    </group>
  );
};

export const Table: React.FC = () => {
  const tex = woodTexture();
  return (
    <group>
      <mesh receiveShadow castShadow position={[0, -0.06, 0]}>
        <boxGeometry args={[4.4, 0.12, 2.6]} />
        <meshStandardMaterial map={tex} roughness={0.78} />
      </mesh>
      {[-1.9, 1.9].map((x) =>
        [-1.1, 1.1].map((z) => (
          <mesh key={`${x}${z}`} castShadow position={[x, -0.9, z]}>
            <boxGeometry args={[0.12, 1.6, 0.12]} />
            <meshStandardMaterial color="#4a2914" roughness={0.85} />
          </mesh>
        ))
      )}
    </group>
  );
};
