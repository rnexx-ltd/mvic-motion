import React, { useMemo } from "react";
import { random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import "../brand";
import { Model, NightEnvironment, usePbr } from "./assets";
import { CinemaPost, Lens } from "./Cinema";
import { Cam, CameraSetExport as CameraSet } from "./PapaSet";
import { Glow } from "./Props";
import { Smartphone } from "./SonRoom";

// ── Pluie qui tombe (filets lumineux) ──
export const Rain: React.FC<{ frame: number; area: [number, number, number]; center: [number, number, number]; count?: number; color?: string }> = ({ frame, area, center, count = 260, color = "#b9cdf2" }) => (
  <group position={center}>
    {new Array(count).fill(0).map((_, i) => {
      const y = area[1] / 2 - ((random(`ry${i}`) * area[1] + frame * 0.22) % area[1]);
      return (
        <mesh key={i} position={[(random(`rx${i}`) - 0.5) * area[0], y, (random(`rz${i}`) - 0.5) * area[2]]}>
          <boxGeometry args={[0.004, 0.16, 0.004]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} />
        </mesh>
      );
    })}
  </group>
);

// Panneau peint à la main (texte)
const useSign = (text: string, bg: string, fg: string) =>
  useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 256;
    const c = cv.getContext("2d")!;
    c.fillStyle = bg;
    c.fillRect(0, 0, 512, 256);
    c.fillStyle = fg;
    c.font = "bold 130px 'Anton', sans-serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 256, 136);
    for (let i = 0; i < 300; i++) {
      c.fillStyle = `rgba(0,0,0,${random(`sg${i}`) * 0.15})`;
      c.fillRect(random(`sx${i}`) * 512, random(`sy${i}`) * 256, 3, 3);
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, bg, fg]);

// Horloge murale à 23 h 14 (trotteuse vivante)
const useClockFace = (frame: number) => {
  const cv = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 512;
    return c;
  }, []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [cv]);
  const c = cv.getContext("2d")!;
  c.fillStyle = "#efe9dc";
  c.fillRect(0, 0, 512, 512);
  c.strokeStyle = "#222";
  c.lineWidth = 14;
  c.beginPath();
  c.arc(256, 256, 236, 0, Math.PI * 2);
  c.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    c.lineWidth = 10;
    c.beginPath();
    c.moveTo(256 + Math.sin(a) * 190, 256 - Math.cos(a) * 190);
    c.lineTo(256 + Math.sin(a) * 222, 256 - Math.cos(a) * 222);
    c.stroke();
  }
  const hand = (angle: number, len: number, wdt: number, col: string) => {
    c.strokeStyle = col;
    c.lineWidth = wdt;
    c.lineCap = "round";
    c.beginPath();
    c.moveTo(256, 256);
    c.lineTo(256 + Math.sin(angle) * len, 256 - Math.cos(angle) * len);
    c.stroke();
  };
  hand(((11 + 14 / 60) / 12) * Math.PI * 2, 120, 16, "#111");
  hand((14 / 60) * Math.PI * 2, 180, 10, "#111");
  hand((Math.floor(frame / 24) / 60) * Math.PI * 2 + 0.6, 200, 4, "#c0392b");
  tex.needsUpdate = true;
  return tex;
};

export type ImpasseShot = "shutter" | "puddle" | "clock" | "battery" | "street";

// ── La rafale de l'impasse : 5 petits décors nocturnes sous la pluie ──
export const ImpasseScene: React.FC<{ shot: ImpasseShot; cam: Cam; lens: Lens }> = ({ shot, cam, lens }) => {
  const frame = useCurrentFrame();
  const asphalt = usePbr("asphalt_02", [3, 3]);
  const iron = usePbr("corrugated_iron", [2, 1]);
  const sign = useSign("FERMÉ", "#d9c9a3", "#8f1d16");
  const clock = useClockFace(frame);
  const flick = 0.85 + 0.15 * Math.sin(frame * 1.3) * (random(`nf${Math.floor(frame / 3)}`) > 0.2 ? 1 : 0.3);
  return (
    <>
      <CameraSet cam={cam} />
      <color attach="background" args={["#04060a"]} />
      <fog attach="fog" args={["#06080f", 2, 10]} />
      <NightEnvironment intensity={0.15} />
      <ambientLight intensity={0.03} color="#4d5f99" />
      {/* sol mouillé (reflets) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial {...asphalt} color="#3a3d44" roughness={0.25} metalness={0.35} />
      </mesh>
      {shot === "shutter" && (
        <group>
          <Model id="rollershutter_door" position={[0, 0, -0.8]} floorY={0} />
          <mesh position={[0, 2.25, -0.62]}>
            <planeGeometry args={[0.9, 0.45]} />
            <meshStandardMaterial map={sign} roughness={0.8} />
          </mesh>
          {/* néon rose qui grésille */}
          <pointLight position={[0.9, 2.3, 0.2]} intensity={2.5 * flick} decay={2} distance={0} color="#ff3d8b" />
          <Glow position={[0.9, 2.3, -0.55]} size={0.6} color="#ff3d8b" opacity={0.8 * flick} />
          <pointLight position={[-1.2, 2.8, 0.8]} intensity={1.2} decay={2} distance={0} color="#5d8dff" />
        </group>
      )}
      {shot === "puddle" && (
        <group>
          <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.7, 48]} />
            <meshStandardMaterial color="#05070b" roughness={0.02} metalness={0.9} />
          </mesh>
          {new Array(6).fill(0).map((_, i) => {
            const p = ((frame / 24 + i * 0.37) % 1.1) / 1.1;
            const x = (random(`px${i}`) - 0.5) * 0.9;
            const z = (random(`pz${i}`) - 0.5) * 0.9;
            return (
              <mesh key={i} position={[x, 0.004, z]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[p * 0.18, p * 0.18 + 0.006, 40]} />
                <meshBasicMaterial color="#cfe0ff" transparent opacity={(1 - p) * 0.7} />
              </mesh>
            );
          })}
          <pointLight position={[0.6, 1.4, -0.8]} intensity={2.2 * flick} decay={2} distance={0} color="#ff3d8b" />
          <pointLight position={[-0.8, 1.6, -0.6]} intensity={1.6} decay={2} distance={0} color="#4f86ff" />
        </group>
      )}
      {shot === "clock" && (
        <group>
          <mesh position={[0, 1.5, -0.3]}>
            <planeGeometry args={[3, 3]} />
            <meshStandardMaterial {...iron} color="#6d6458" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[0, 1.5, -0.27]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.22, 0.22, 0.04, 48]} />
            <meshStandardMaterial color="#3b3b3b" roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh position={[0, 1.5, -0.248]}>
            <circleGeometry args={[0.2, 48]} />
            <meshStandardMaterial map={clock} roughness={0.3} />
          </mesh>
          <pointLight position={[0.5, 1.9, 0.6]} intensity={1.4} decay={2} distance={0} color="#ffd6a0" />
        </group>
      )}
      {shot === "battery" && (
        <group>
          <Smartphone screen={{ mode: "battery" }} brightness={1.1} position={[0, 0.02, 0]} rotation={[0, 0.2, 0]} />
          <pointLight position={[0, 0.25, 0]} intensity={0.01} decay={2} distance={0} color="#ff6a5a" />
        </group>
      )}
      {shot === "street" && (
        <group>
          {[-1.2, 1.2].map((x) => (
            <mesh key={x} position={[x, 1.2, -3]} rotation={[0, x > 0 ? -Math.PI / 2 : Math.PI / 2, 0]} receiveShadow>
              <planeGeometry args={[10, 2.4]} />
              <meshStandardMaterial {...iron} color="#5a544d" roughness={0.5} metalness={0.5} />
            </mesh>
          ))}
          {[-1, -4, -7].map((z, i) => (
            <group key={z}>
              <pointLight position={[0.8, 2.6, z]} intensity={2.2} decay={2} distance={0} color={i === 1 ? "#ff3d8b" : "#ffb466"} />
              <Glow position={[0.8, 2.6, z]} size={0.5} color={i === 1 ? "#ff3d8b" : "#ffb466"} opacity={0.9} />
            </group>
          ))}
        </group>
      )}
      <Rain frame={frame} area={[4, 4, 5]} center={[0, 2, -1]} />
      <CinemaPost lens={lens} />
    </>
  );
};

// ── Vol de nuit : ville → route → forêt → village, guidé par la lumière verte ──
export const FlightScene: React.FC<{ t: number; lens: Lens }> = ({ t, lens }) => {
  const frame = useCurrentFrame();
  // trajectoire : on avance de z = 4 à z = -90
  const z = 4 - t * 94;
  const camY = 15 - Math.sin(t * Math.PI) * 5;
  const orbZ = z - 6;
  const cam: Cam = { pos: [Math.sin(t * 3) * 1.2, camY, z], look: [0, camY - 7, z - 14], fov: 55 };
  const city = useMemo(
    () =>
      new Array(140).fill(0).map((_, i) => {
        const side = i % 2 ? 1 : -1;
        return { x: side * (3 + random(`bx${i}`) * 14), z: -random(`bz${i}`) * 30, w: 1.5 + random(`bw${i}`) * 2.5, h: 2 + random(`bh${i}`) * 14, d: 1.5 + random(`bd${i}`) * 2.5 };
      }),
    []
  );
  return (
    <>
      <CameraSet cam={cam} />
      <color attach="background" args={["#060a16"]} />
      <fog attach="fog" args={["#0c1428", 14, 70]} />
      <ambientLight intensity={0.35} color="#4a64a8" />
      <directionalLight position={[-10, 20, -20]} intensity={0.8} color="#7c95d6" />
      {/* lune */}
      <Glow position={[-18, 30, -120]} size={14} color="#c9d8ff" opacity={0.9} />
      {/* sol */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -45]}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#0b0f14" roughness={0.9} />
      </mesh>
      {/* la ville : immeubles aux fenêtres allumées */}
      {city.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color="#1c2436" roughness={0.9} />
          </mesh>
          {new Array(Math.floor(b.h / 1.2)).fill(0).map((_, k) =>
            random(`wl${i}-${k}`) > 0.35 ? (
              <React.Fragment key={k}>
                <Glow position={[(random(`wx${i}-${k}`) - 0.5) * b.w * 0.8, -b.h / 2 + 0.8 + k * 1.2, b.d / 2 + 0.05]} size={0.9} color={random(`wc${i}-${k}`) > 0.3 ? "#ffcf8a" : "#9fd0ff"} opacity={0.95} />
                <Glow position={[-Math.sign(b.x) * (b.w / 2 + 0.05), -b.h / 2 + 0.8 + k * 1.2, (random(`wz${i}-${k}`) - 0.5) * b.d * 0.8]} size={0.9} color={random(`wd${i}-${k}`) > 0.3 ? "#ffcf8a" : "#9fd0ff"} opacity={0.9} />
              </React.Fragment>
            ) : null
          )}
          {/* toit éclairé par la ville */}
          <Glow position={[0, b.h / 2 + 0.3, 0]} size={random(`rf${i}`) > 0.8 ? 1.2 : 0.01} color="#ff5a3a" opacity={0.8} />
        </group>
      ))}
      {/* la route : lampadaires */}
      {new Array(18).fill(0).map((_, i) => (
        <Glow key={i} position={[i % 2 ? 2.2 : -2.2, 3, -32 - i * 2.5]} size={0.9} color="#ffb466" opacity={0.9} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -55]}>
        <planeGeometry args={[3.5, 50]} />
        <meshStandardMaterial color="#1c1f24" roughness={0.35} metalness={0.3} />
      </mesh>
      {/* la forêt */}
      {new Array(160).fill(0).map((_, i) => {
        const side = i % 2 ? 1 : -1;
        const h = 3 + random(`th${i}`) * 5;
        return (
          <mesh key={i} position={[side * (3 + random(`tx${i}`) * 18), h / 2, -50 - random(`tz${i}`) * 30]}>
            <coneGeometry args={[0.9 + random(`tr${i}`), h, 7]} />
            <meshStandardMaterial color="#0f1a1a" roughness={1} />
          </mesh>
        );
      })}
      {/* le village : cases et fenêtres chaudes */}
      {new Array(9).fill(0).map((_, i) => (
        <group key={i} position={[(i - 4) * 3 + random(`vx${i}`) * 1.5, 0, -84 - random(`vz${i}`) * 6]}>
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2.2, 2, 2]} />
            <meshStandardMaterial color="#2a1c12" roughness={1} />
          </mesh>
          <mesh position={[0, 2.6, 0]}>
            <coneGeometry args={[1.9, 1.3, 4]} />
            <meshStandardMaterial color="#1a1410" roughness={1} />
          </mesh>
          <Glow position={[0.4, 1.1, 1.05]} size={i === 4 ? 4 : 2} color="#ffab55" opacity={i === 4 ? 1 : 0.8} />
          <pointLight position={[0.4, 1.4, 1.6]} intensity={i === 4 ? 25 : 8} decay={2} distance={0} color="#ffab55" />
        </group>
      ))}
      {/* la lumière verte de Mvic qui file devant la caméra */}
      <Glow position={[Math.sin(t * 5) * 0.8, camY - 4, orbZ]} size={2.2} color="#4FC9A8" opacity={1} />
      <Glow position={[Math.sin(t * 5) * 0.8, camY - 4, orbZ]} size={0.6} color="#e6fff6" opacity={1} />
      {new Array(14).fill(0).map((_, i) => (
        <Glow key={i} position={[Math.sin((t - i * 0.004) * 5) * 0.8, camY - 4 + i * 0.04, orbZ + i * 0.6]} size={1.5 - i * 0.08} color="#4FC9A8" opacity={0.5 - i * 0.03} />
      ))}
      <pointLight position={[0, camY - 4, orbZ]} intensity={120} decay={2} distance={0} color="#4FC9A8" />
      {t < 0.35 && <Rain frame={frame} area={[10, 10, 10]} center={[0, camY - 3, z - 6]} count={200} />}
      <CinemaPost lens={lens} />
    </>
  );
};
