import React, { useMemo } from "react";
import * as THREE from "three";

// ── Rendu « dessin animé » : aplats de lumière (3 paliers) + contour noir ──

let gradientCache: THREE.DataTexture | null = null;
export const toonGradient = () => {
  if (gradientCache) return gradientCache;
  const data = new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]);
  const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  gradientCache = tex;
  return tex;
};

export const INK = "#2a1208";

export const Toon: React.FC<{ color: string; emissive?: string; emissiveIntensity?: number }> = ({ color, emissive, emissiveIntensity }) => (
  <meshToonMaterial color={color} gradientMap={toonGradient()} emissive={emissive ?? "#000000"} emissiveIntensity={emissiveIntensity ?? 0} />
);

// Maillage avec contour par coque inversée
export const Ink: React.FC<{
  geometry: THREE.BufferGeometry;
  color: string;
  outline?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  emissive?: string;
  emissiveIntensity?: number;
}> = ({ geometry, color, outline = 0.035, position, rotation, scale, emissive, emissiveIntensity }) => {
  const s = typeof scale === "number" ? [scale, scale, scale] : scale ?? [1, 1, 1];
  return (
    <group position={position} rotation={rotation} scale={s as [number, number, number]}>
      <mesh geometry={geometry}>
        <Toon color={color} emissive={emissive} emissiveIntensity={emissiveIntensity} />
      </mesh>
      {outline > 0 && (
        <mesh geometry={geometry} scale={1 + outline}>
          <meshBasicMaterial color={INK} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
};

// Boîte arrondie extrudée (corps de téléphone, planches…)
export const useRoundedBox = (w: number, h: number, d: number, r: number) =>
  useMemo(() => {
    const shape = new THREE.Shape();
    const x = -w / 2;
    const y = -h / 2;
    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);
    const bevel = Math.min(0.05, d / 3);
    const g = new THREE.ExtrudeGeometry(shape, { depth: d - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 4, curveSegments: 12 });
    g.translate(0, 0, -(d - bevel * 2) / 2);
    g.computeVertexNormals();
    return g;
  }, [w, h, d, r]);

// Ombre portée douce (disque sombre au sol)
export const BlobShadow: React.FC<{ position: [number, number, number]; size: number; opacity?: number }> = ({ position, size, opacity = 0.28 }) => (
  <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[size, 32]} />
    <meshBasicMaterial color="#3a1206" transparent opacity={opacity} depthWrite={false} />
  </mesh>
);
