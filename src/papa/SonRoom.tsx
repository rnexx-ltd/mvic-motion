import React, { useMemo } from "react";
import { random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import "../brand";
import { Model, NightEnvironment, usePbr } from "./assets";
import { CinemaPost, Lens } from "./Cinema";
import { Cam, CameraSetExport as CameraSet } from "./PapaSet";
import { Glow } from "./Props";
import { drawBattery, drawContacts, drawMvic, drawVoiceNotes, MvicCfg } from "./screens";
import { fabricTexture } from "./textures";

export type Screen = { mode: "voice" | "voice-labels" | "battery" | "mvic" | "contacts"; step?: number; k?: number; cfg?: MvicCfg };

// Smartphone générique (aucune marque), écran haute définition
export const Smartphone: React.FC<{ screen: Screen; brightness: number; position: [number, number, number]; rotation: [number, number, number] }> = ({ screen, brightness, position, rotation }) => {
  const frame = useCurrentFrame();
  const canvas = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1080;
    cv.height = 2200;
    return cv;
  }, []);
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  const c = canvas.getContext("2d")!;
  if (screen.mode === "battery") drawBattery(c, canvas.width, canvas.height);
  else if (screen.mode === "mvic") drawMvic(c, canvas.width, canvas.height, screen.step ?? 0, screen.k ?? 1, screen.cfg);
  else if (screen.mode === "contacts") drawContacts(c, canvas.width, canvas.height);
  else drawVoiceNotes(c, canvas.width, canvas.height, frame / 30, { labels: screen.mode === "voice-labels" });
  tex.needsUpdate = true;
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.075, 0.009, 0.158]} />
        <meshStandardMaterial color="#121417" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.0047, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.069, 0.15]} />
        <meshBasicMaterial map={tex} color={new THREE.Color(brightness, brightness, brightness)} />
      </mesh>
    </group>
  );
};

// Pluie sur la vitre : gouttes immobiles + filets qui coulent
const RainOnGlass: React.FC<{ frame: number; w: number; h: number; tint: THREE.Color }> = ({ frame, w, h, tint }) => (
  <group>
    {new Array(140).fill(0).map((_, i) => (
      <mesh key={`d${i}`} position={[(random(`gx${i}`) - 0.5) * w, (random(`gy${i}`) - 0.5) * h, 0.004]}>
        <circleGeometry args={[0.004 + random(`gr${i}`) * 0.006, 10]} />
        <meshBasicMaterial color={tint} transparent opacity={0.15 + random(`go${i}`) * 0.25} />
      </mesh>
    ))}
    {new Array(26).fill(0).map((_, i) => {
      const speed = 0.002 + random(`s${i}`) * 0.004;
      const y = h / 2 - ((random(`sy${i}`) * h + frame * speed * 10) % h);
      const len = 0.05 + random(`sl${i}`) * 0.12;
      return (
        <mesh key={`s${i}`} position={[(random(`sx${i}`) - 0.5) * w, y, 0.005]}>
          <planeGeometry args={[0.004, len]} />
          <meshBasicMaterial color={tint} transparent opacity={0.3} />
        </mesh>
      );
    })}
  </group>
);

// La ville la nuit, floue derrière la fenêtre (bokeh)
const CityBokeh: React.FC<{ frame: number; green: number }> = ({ frame, green }) => (
  <group position={[0.15, 1.35, -1.6]}>
    {new Array(90).fill(0).map((_, i) => {
      const warm = random(`c${i}`) > 0.35;
      const col = green > 0.5 && i % 3 === 0 ? "#6dffcf" : warm ? (random(`cw${i}`) > 0.5 ? "#ffb35c" : "#ffd89c") : "#7fb4ff";
      return (
        <Glow
          key={i}
          position={[(random(`x${i}`) - 0.5) * 2.4, (random(`y${i}`) - 0.55) * 1.6, -random(`z${i}`) * 3]}
          size={0.18 + random(`s${i}`) * 0.4}
          color={col}
          opacity={0.45 + 0.25 * Math.sin(frame / (15 + random(`f${i}`) * 20) + i)}
        />
      );
    })}
  </group>
);

export const SonRoomScene: React.FC<{ cam: Cam; lens: Lens; screen: Screen; green: number }> = ({ cam, lens, screen, green }) => {
  const frame = useCurrentFrame();
  const wall = usePbr("damaged_plaster", [2, 2]);
  const sheet = fabricTexture();
  const phonePos: [number, number, number] = [0.05, 0.585, 0.25];
  const greenTint = new THREE.Color("#a9c6ff").lerp(new THREE.Color("#5cffc8"), green);
  const screenGlow = screen.mode === "mvic" ? 0.9 : 0.85;
  return (
    <>
      <CameraSet cam={cam} />
      <color attach="background" args={["#05070c"]} />
      <fog attach="fog" args={["#05070c", 3, 12]} />
      <NightEnvironment intensity={0.08} />
      <ambientLight intensity={0.08} color="#4d5f99" />
      <pointLight position={[0.15, 1.4, -0.6]} intensity={0.35} decay={2} distance={0} color="#8fb0ff" />
      {/* lumière bleue de la rue, par la fenêtre */}
      <directionalLight position={[0.4, 2.2, -2.5]} intensity={1.4 * (1 - green * 0.6)} color="#7d9be8" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      {/* murs */}
      {/* mur percé : ouverture de fenêtre centrée en (0.15, 1.35), 1.26 × 1.26 */}
      {[
        [-1.32, 1.3, 2.7 - 0.84, 2.8],
        [1.67, 1.3, 1.78, 2.8],
        [0.15, 0.36, 1.26, 0.72],
        [0.15, 2.34, 1.26, 0.72],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x, y, -0.95]} receiveShadow>
          <planeGeometry args={[w, h]} />
          <meshStandardMaterial {...wall} color="#6f7f9a" roughness={1} />
        </mesh>
      ))}
      {/* vitre très légère */}
      <mesh position={[0.15, 1.35, -0.94]}>
        <planeGeometry args={[1.26, 1.26]} />
        <meshStandardMaterial color="#9fb7e0" transparent opacity={0.08} roughness={0.05} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial color="#2a2622" roughness={0.9} />
      </mesh>
      {/* fenêtre : cadre, vitre mouillée, ville derrière */}
      <group position={[0.15, 1.35, -0.94]}>
        {[
          [0, 0.62, 1.32, 0.06],
          [0, -0.62, 1.32, 0.06],
          [-0.63, 0, 0.06, 1.3],
          [0.63, 0, 0.06, 1.3],
          [0, 0, 0.04, 1.24],
        ].map(([x, y, w, h], i) => (
          <mesh key={i} position={[x, y, 0.02]} castShadow>
            <boxGeometry args={[w, h, 0.05]} />
            <meshStandardMaterial color="#d9d6cf" roughness={0.7} />
          </mesh>
        ))}
        <RainOnGlass frame={frame} w={1.2} h={1.2} tint={greenTint} />
      </group>
      <CityBokeh frame={frame} green={green} />
      {/* le lit */}
      <Model id="old_bed_frame" position={[0.1, 0, 0.35]} floorY={0} rotationY={Math.PI / 2} />
      <mesh position={[0.1, 0.5, 0.35]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.16, 0.88]} />
        <meshStandardMaterial map={sheet} roughness={0.95} color="#5d6680" />
      </mesh>
      <mesh position={[-0.65, 0.62, 0.35]} rotation={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.1, 0.6]} />
        <meshStandardMaterial color="#cfd3dc" roughness={1} />
      </mesh>
      <Smartphone screen={screen} brightness={screenGlow} position={phonePos} rotation={[0, 0.35, 0]} />
      {/* lumière de l'écran ; elle devient la lumière verte Mvic */}
      <pointLight position={[phonePos[0], phonePos[1] + 0.12, phonePos[2]]} intensity={0.012 + green * 0.35} decay={2} distance={0} color={green > 0.2 ? "#4FC9A8" : "#cfe0ff"} />
      {green > 0 && <pointLight position={[0.1, 1.2, 0.6]} intensity={green * 1.2} decay={2} distance={0} color="#4FC9A8" />}
      <CinemaPost lens={lens} />
    </>
  );
};

// Plan d'essai A3
import { PapaCanvas } from "./PapaSet";
export const SonRoomTest: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 72;
  return (
    <PapaCanvas>
      <SonRoomScene
        cam={{ pos: [0.4 - t * 0.12, 0.8 - t * 0.02, 0.98 - t * 0.12], look: [0.08, 0.78, -0.4], fov: 44 }}
        lens={{ focus: 0.72, aperture: 0.035, maxblur: 0.016, bloom: 0.7, bloomRadius: 0.55, bloomThreshold: 0.7 }}
        screen={{ mode: "voice" }}
        green={0}
      />
    </PapaCanvas>
  );
};
