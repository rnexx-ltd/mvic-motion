import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Model, NightEnvironment, useModelBox, usePbr } from "./assets";
import { CinemaPost, Lens } from "./Cinema";
import { Bible, flicker, Glow, OldPhone } from "./Props";
import { oilclothTexture } from "./textures";

export type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number };

const CameraSet: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    camera.lookAt(...cam.look);
    (camera as THREE.PerspectiveCamera).fov = cam.fov;
    (camera as THREE.PerspectiveCamera).near = 0.02;
    camera.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

export const TABLE_SCALE = 2.2;
// Hauteur du plateau (m), lue sur le modèle
export const useTableTop = () => useModelBox("WoodenTable_02").max.y * TABLE_SCALE;

export type PapaState = {
  lines: string[];
  icon: "mic" | "sms" | "none";
  glow: number; // écran allumé 0…1
  vibrate: number; // 0…1
  green: number; // reflet vert Mvic 0…1
};

// Murs, sol, porte entrouverte sur la nuit, lucioles
const Hut: React.FC<{ frame: number }> = ({ frame }) => {
  const plaster = usePbr("clay_plaster", [3, 2]);
  const ground = usePbr("brown_mud_dry", [4, 4]);
  return (
    <group>
      <mesh position={[0, 1.3, -0.95]} receiveShadow>
        <planeGeometry args={[4.5, 2.8]} />
        <meshStandardMaterial {...plaster} color="#c08a5c" roughness={1} />
      </mesh>
      <mesh position={[-1.5, 1.3, 0.5]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[3.5, 2.8]} />
        <meshStandardMaterial {...plaster} color="#b98256" roughness={1} />
      </mesh>
      <mesh position={[0, 0, 0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[5, 4]} />
        <meshStandardMaterial {...ground} color="#9a7556" roughness={1} />
      </mesh>
      {/* porte entrouverte : la nuit, la lune bleue, des lucioles */}
      <mesh position={[1.25, 1.0, -0.94]}>
        <planeGeometry args={[0.8, 2.0]} />
        <meshBasicMaterial color="#0b1628" />
      </mesh>
      <mesh position={[1.62, 1.0, -0.72]} rotation={[0, -1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 2.0, 0.04]} />
        <meshStandardMaterial color="#4a2c16" roughness={0.9} />
      </mesh>
      {new Array(10).fill(0).map((_, i) => {
        const on = 0.5 + 0.5 * Math.sin(frame / 9 + i * 1.7);
        return (
          <Glow
            key={i}
            position={[1.0 + random(`fx${i}`) * 0.5 + Math.sin(frame / 30 + i) * 0.04, 0.3 + random(`fy${i}`) * 1.4 + Math.sin(frame / 20 + i) * 0.04, -1.0]}
            size={0.05}
            color="#d8ff7a"
            opacity={0.9 * on}
          />
        );
      })}
    </group>
  );
};

// Poussières dans la lumière de la lampe
const Dust: React.FC<{ frame: number; center: [number, number, number] }> = ({ frame, center }) => (
  <group>
    {new Array(60).fill(0).map((_, i) => {
      const x = center[0] + (random(`dx${i}`) - 0.5) * 0.9 + Math.sin(frame / 60 + i) * 0.02;
      const y = center[1] - 0.2 + ((random(`dy${i}`) * 0.9 + frame * 0.0006 * (0.4 + random(`ds${i}`))) % 0.9);
      const z = center[2] + (random(`dz${i}`) - 0.5) * 0.9;
      const d = Math.hypot(x - center[0], y - center[1], z - center[2]);
      return <Glow key={i} position={[x, y, z]} size={0.006} color="#ffdcae" opacity={Math.max(0, 0.8 - d * 1.6)} />;
    })}
  </group>
);

export const PapaScene: React.FC<{ cam: Cam; state: PapaState; lens: Lens }> = ({ cam, state, lens }) => {
  const frame = useCurrentFrame();
  const top = useTableTop();
  const k = flicker(frame);
  const lantern: [number, number, number] = [-0.22, top, -0.24];
  const flame: [number, number, number] = [lantern[0], top + 0.13, lantern[2]];
  const jitter = state.vibrate > 0 ? Math.sin(frame * 4.1) * 0.0015 * state.vibrate : 0;
  return (
    <>
      <CameraSet cam={cam} />
      <color attach="background" args={["#0b0604"]} />
      <fog attach="fog" args={["#120904", 2.2, 6]} />
      <NightEnvironment intensity={0.12} />
      <ambientLight intensity={0.02} color="#6a7fb0" />
      {/* clair de lune par la porte */}
      <directionalLight position={[2.5, 2.2, -2.5]} intensity={0.35} color="#7d95d6" />
      <Hut frame={frame} />
      <Model id="WoodenTable_02" position={[0, 0, 0]} floorY={0} scale={TABLE_SCALE} matte />
      {/* toile cirée */}
      <mesh position={[0, top + 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0.12]} receiveShadow>
        <planeGeometry args={[0.72, 0.72]} />
        <meshStandardMaterial map={oilclothTexture()} roughness={0.55} metalness={0} envMapIntensity={0.25} color="#cfc3b0" />
      </mesh>
      <Model id="Lantern_01" position={lantern} floorY={top} scale={1.15} rotationY={0.6} />
      <Model id="metal_jug" position={[0.22 + jitter * 0.5, 0, -0.2]} floorY={top} scale={0.75} rotationY={-0.5 + jitter * 2} />
      <Model id="plastic_monobloc_chair_01" position={[0.75, 0, -0.55]} floorY={0} rotationY={-0.7} />
      <Model id="hanging_picture_frame_02" position={[-0.05, 1.45, -0.93]} rotationY={0} scale={0.6} />
      <group position={[-0.02, top, 0.02]} rotation={[0, 0.45, 0]} scale={0.21}>
        <Bible position={[0, 0, 0]} rotY={0} />
      </group>
      <group position={[0.06 + jitter, top + 0.003, 0.17]} rotation={[0, -0.25 + jitter * 6, 0]}>
        <OldPhone frame={frame} lines={state.lines} icon={state.icon} glow={state.glow} vibrate={0} position={[0, 0, 0]} scale={0.1} lightIntensity={0.003 + state.glow * 0.012} />
      </group>
      {/* flamme : lumière physique + halo */}
      <pointLight position={flame} intensity={0.85 * k} distance={0} decay={2} color="#ffa24c" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0005} shadow-radius={4} />
      <Glow position={flame} size={0.07} color="#ffe6b0" opacity={k} />
      {state.green > 0 && <pointLight position={[0.06, top + 0.12, 0.17]} intensity={0.5 * state.green} distance={0} decay={2} color="#4FC9A8" />}
      <Dust frame={frame} center={flame} />
      <CinemaPost lens={lens} />
    </>
  );
};

export const PapaCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      shadows={{ type: THREE.PCFSoftShadowMap }}
      gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
    >
      {children}
    </ThreeCanvas>
  );
};

// Plan d'essai A1 : très gros plan sur le vieux téléphone
export const PapaSetTest: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 24;
  return (
    <PapaCanvas>
      <PapaSceneTest t={t} />
    </PapaCanvas>
  );
};

const PapaSceneTest: React.FC<{ t: number }> = ({ t }) => {
  const top = useTableTop();
  return (
    <PapaScene
      cam={{ pos: [0.17 - t * 0.002, top + 0.12 - t * 0.002, 0.42 - t * 0.006], look: [0.03, top + 0.035, 0.1], fov: 40 }}
      lens={{ focus: 0.3, aperture: 0.04, maxblur: 0.012, bloom: 0.45, bloomRadius: 0.35, bloomThreshold: 0.9 }}
      state={{ lines: ["Enregistrement…", "00:0" + Math.min(9, Math.floor(t))], icon: "mic", glow: 0.25, vibrate: 0, green: 0 }}
    />
  );
};
