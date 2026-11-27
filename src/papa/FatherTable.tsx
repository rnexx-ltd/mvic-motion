import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { random, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Bible, Glow, Lantern, Mug, OldPhone, Table } from "./Props";
import { mudWallTexture } from "./textures";
import { CinemaPost, Lens } from "./Cinema";

export type Cam = { pos: [number, number, number]; look: [number, number, number]; fov: number };

export const CameraSet: React.FC<{ cam: Cam }> = ({ cam }) => {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...cam.pos);
    camera.lookAt(...cam.look);
    (camera as THREE.PerspectiveCamera).fov = cam.fov;
    camera.updateProjectionMatrix();
  }, [camera, cam]);
  return null;
};

// La case du père : mur en terre, porte entrouverte sur la nuit, lucioles
const Room: React.FC<{ frame: number }> = ({ frame }) => {
  const wall = mudWallTexture();
  return (
    <group>
      <mesh position={[0, 1.2, -2.2]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      <mesh position={[-3.2, 1.2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial map={wall} roughness={0.95} />
      </mesh>
      {/* photo de famille encadrée : Junior, diplômé */}
      <group position={[-0.15, 1.15, -2.17]} rotation={[0, 0, -0.04]}>
        <mesh castShadow>
          <boxGeometry args={[0.62, 0.78, 0.04]} />
          <meshStandardMaterial color="#3a2414" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.021]}>
          <planeGeometry args={[0.5, 0.66]} />
          <meshStandardMaterial map={photoTexture()} roughness={0.4} />
        </mesh>
      </group>
      {/* sol en terre battue */}
      <mesh position={[0, -1.7, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#4a2c18" roughness={1} />
      </mesh>
      {/* porte entrouverte : nuit bleue + lucioles */}
      <mesh position={[2.3, 0.9, -2.19]}>
        <planeGeometry args={[0.9, 2.4]} />
        <meshBasicMaterial color="#0d1a2e" />
      </mesh>
      <mesh position={[2.85, 0.9, -1.95]} rotation={[0, -0.9, 0]} castShadow>
        <boxGeometry args={[0.9, 2.4, 0.06]} />
        <meshStandardMaterial color="#3a2212" roughness={0.9} />
      </mesh>
      {new Array(9).fill(0).map((_, i) => {
        const x = 2.0 + random(`ff${i}`) * 0.7 + Math.sin(frame / 30 + i) * 0.08;
        const y = 0.2 + random(`fy${i}`) * 1.6 + Math.sin(frame / 22 + i * 2) * 0.06;
        const on = 0.5 + 0.5 * Math.sin(frame / 9 + i * 1.7);
        return (
          <mesh key={i} position={[x, y, -2.3]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color={[3 * on, 4 * on, 1 * on]} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

// Photo jaunie : silhouette en toge et mortier de diplômé, devant un fond de studio
let photo: THREE.CanvasTexture | null = null;
const photoTexture = () => {
  if (photo) return photo;
  const cv = document.createElement("canvas");
  cv.width = 300;
  cv.height = 400;
  const c = cv.getContext("2d")!;
  const g = c.createLinearGradient(0, 0, 0, 400);
  g.addColorStop(0, "#c9a36b");
  g.addColorStop(1, "#8a6a3e");
  c.fillStyle = g;
  c.fillRect(0, 0, 300, 400);
  c.fillStyle = "#2a1a12";
  c.beginPath();
  c.ellipse(150, 170, 48, 58, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(60, 400);
  c.quadraticCurveTo(150, 210, 240, 400);
  c.fill();
  c.fillStyle = "#111";
  c.fillRect(92, 100, 116, 14);
  c.beginPath();
  c.moveTo(150, 78);
  c.lineTo(230, 104);
  c.lineTo(150, 128);
  c.lineTo(70, 104);
  c.closePath();
  c.fill();
  c.strokeStyle = "#d8b24a";
  c.lineWidth = 4;
  c.beginPath();
  c.moveTo(215, 104);
  c.lineTo(222, 160);
  c.stroke();
  c.fillStyle = "rgba(255,240,200,0.12)";
  c.fillRect(0, 0, 300, 400);
  photo = new THREE.CanvasTexture(cv);
  photo.colorSpace = THREE.SRGBColorSpace;
  return photo;
};

// Poussières qui dansent dans la lumière de la lampe
const Dust: React.FC<{ frame: number }> = ({ frame }) => (
  <group>
    {new Array(40).fill(0).map((_, i) => {
      const x = -0.7 + (random(`dx${i}`) - 0.5) * 1.6 + Math.sin(frame / 50 + i) * 0.05;
      const y = 0.15 + ((random(`dy${i}`) * 1.4 + frame * 0.0015 * (0.5 + random(`ds${i}`))) % 1.4);
      const z = -1.2 + (random(`dz${i}`) - 0.3) * 1.4;
      const d = Math.hypot(x + 0.7, z + 1.25);
      return <Glow key={i} position={[x, y, z]} size={0.025} color="#ffd9a0" opacity={Math.max(0, 0.9 - d * 0.7)} />;
    })}
  </group>
);

export type TableState = {
  lines: string[];
  icon: "mic" | "sms" | "none";
  glow: number; // 0…1 : écran allumé
  vibrate: number; // 0…1
  green: number; // 0…1 : reflet vert Mvic sur la scène
};

export const FatherTable: React.FC<{ cam: Cam; state: TableState; lens?: Lens }> = ({ cam, state, lens }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
      <CameraSet cam={cam} />
      <color attach="background" args={["#120a06"]} />
      <fog attach="fog" args={["#1a0d06", 4, 11]} />
      <ambientLight intensity={0.07} color="#5a6b9a" />
      {/* lune par la porte */}
      <directionalLight position={[4, 3, -3]} intensity={0.25} color="#6f86c9" />
      <Room frame={frame} />
      <Dust frame={frame} />
      <Table />
      <Lantern frame={frame} position={[-0.7, 0, -1.25]} />
      <Mug position={[0.28, 0, -0.32]} jitter={state.vibrate > 0 ? Math.sin(frame * 4.1) * 0.004 * state.vibrate : 0} />
      <Bible position={[-0.75, 0, -0.5]} rotY={0.5} />
      <OldPhone frame={frame} lines={state.lines} icon={state.icon} glow={state.glow} vibrate={state.vibrate} position={[0.08, 0.014, 0.3]} rotation={[0, -0.3, 0]} scale={0.42} />
      {lens && <CinemaPost lens={lens} />}
      {state.green > 0 && <pointLight position={[0.08, 0.3, 0.3]} intensity={2.5 * state.green} distance={2.5} color="#4FC9A8" />}
    </ThreeCanvas>
  );
};

// Composition d'essai : un plan fixe de la table
export const FatherTableTest: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 24;
  return (
    <FatherTable
      cam={{ pos: [0.42 - t * 0.008, 0.58 - t * 0.006, 1.38 - t * 0.025], look: [-0.15, 0.28, -0.6], fov: 42 }}
      lens={{ focus: 1.3, aperture: 0.012, maxblur: 0.012, bloom: 0.9, bloomRadius: 0.6, bloomThreshold: 0.55 }}
      state={{ lines: ["Enregistrement…", "00:0" + Math.min(9, Math.floor(t))], icon: "mic", glow: 0.2, vibrate: 0, green: 0 }}
    />
  );
};
