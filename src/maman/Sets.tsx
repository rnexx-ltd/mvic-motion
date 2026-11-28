import React, { useMemo } from "react";
import { random, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Model, usePbr } from "../papa/assets";
import { CinemaPost, Lens } from "../papa/Cinema";
import { Cam, CameraSetExport as CameraSet } from "../papa/PapaSet";
import { Glow } from "../papa/Props";
import { Rain } from "../papa/Night";
import { Pose, Silhouette, Kind } from "./Rig";

export type Actor = { kind: Kind; pose: Pose; position: [number, number, number]; facing?: number; ghost?: boolean; scale?: number; lit?: boolean };

// Ciel peint (dégradé) sur une grande sphère
const useSky = (top: string, mid: string, low: string) =>
  useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 16;
    cv.height = 512;
    const c = cv.getContext("2d")!;
    const g = c.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, top);
    g.addColorStop(0.45, mid);
    g.addColorStop(0.62, low);
    g.addColorStop(1, low);
    c.fillStyle = g;
    c.fillRect(0, 0, 16, 512);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [top, mid, low]);

export const Sky: React.FC<{ top: string; mid: string; low: string }> = (p) => {
  const tex = useSky(p.top, p.mid, p.low);
  return (
    <mesh>
      <sphereGeometry args={[80, 32, 16]} />
      <meshBasicMaterial map={tex} side={THREE.BackSide} fog={false} />
    </mesh>
  );
};

const Actors: React.FC<{ actors: Actor[] }> = ({ actors }) => (
  <>
    {actors.map((a, i) => (
      <Silhouette key={i} {...a} color={a.lit ? "#1a120c" : "#0a0604"} />
    ))}
  </>
);

// ── Le village au crépuscule ──
export const VillageScene: React.FC<{ cam: Cam; lens: Lens; actors: Actor[]; sun: [number, number, number]; fire?: boolean; chickens?: number; phoneGlow?: number; skyK?: number }> = ({
  cam,
  lens,
  actors,
  sun,
  fire = false,
  chickens = 0,
  phoneGlow = 0,
  skyK = 0,
}) => {
  const frame = useCurrentFrame();
  const ground = usePbr("brown_mud_dry", [10, 10]);
  const plaster = usePbr("clay_plaster", [3, 2]);
  const lerpC = (a: string, b: string) => "#" + new THREE.Color(a).lerp(new THREE.Color(b), skyK).getHexString();
  return (
    <>
      <CameraSet cam={cam} />
      <fog attach="fog" args={[lerpC("#d9714a", "#4a2a5a"), 25, 70]} />
      <Sky top={lerpC("#3b2a6b", "#1c1238")} mid={lerpC("#f08a4b", "#b4486a")} low={lerpC("#ffcf7a", "#f07a4a")} />
      <Glow position={[sun[0] * 8, 1.2, -40]} size={14} color="#ffd59a" opacity={1 - skyK * 0.6} />
      <ambientLight intensity={0.35} color="#ff9a6a" />
      <directionalLight position={sun} intensity={2.2} color="#ffb070" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-bias={-0.0004} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial {...ground} color="#a0704a" roughness={1} />
      </mesh>
      {/* la case de Maman : murs en terre, toit de paille */}
      <group position={[-1.6, 0, -2.6]}>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.5, 2.4, 3]} />
          <meshStandardMaterial {...plaster} color="#c48a5a" roughness={1} />
        </mesh>
        <mesh position={[0, 3.0, 0]} castShadow>
          <coneGeometry args={[3.7, 1.8, 4]} />
          <meshStandardMaterial color="#6b4a26" roughness={1} />
        </mesh>
        <mesh position={[1.2, 0.95, 1.51]}>
          <planeGeometry args={[0.8, 1.9]} />
          <meshStandardMaterial color="#2a1a10" roughness={1} />
        </mesh>
      </group>
      {/* arbre */}
      <group position={[3.2, 0, -5]}>
        <mesh position={[0, 1.8, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.22, 3.6, 8]} />
          <meshStandardMaterial color="#2b1a10" />
        </mesh>
        {new Array(7).fill(0).map((_, i) => (
          <mesh key={i} position={[Math.cos(i) * 1.1, 3.7 + Math.sin(i * 2) * 0.4, Math.sin(i) * 0.9]} castShadow>
            <sphereGeometry args={[0.9, 10, 8]} />
            <meshStandardMaterial color="#2c3a1a" roughness={1} />
          </mesh>
        ))}
      </group>
      {/* table, chaise monobloc, téléphone */}
      <mesh position={[1.1, 0.38, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.05, 0.5]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.9} />
      </mesh>
      {[-0.3, 0.3].map((x) =>
        [-0.2, 0.2].map((z) => (
          <mesh key={`${x}${z}`} position={[1.1 + x, 0.18, -0.3 + z]} castShadow>
            <boxGeometry args={[0.04, 0.36, 0.04]} />
            <meshStandardMaterial color="#4a2e1a" />
          </mesh>
        ))
      )}
      <Model id="plastic_monobloc_chair_01" position={[0.35, 0, -0.35]} floorY={0} rotationY={0.4} />
      <mesh position={[1.1, 0.415, -0.25]}>
        <boxGeometry args={[0.07, 0.012, 0.14]} />
        <meshStandardMaterial color="#111" emissive="#4FC9A8" emissiveIntensity={phoneGlow * 3} />
      </mesh>
      {phoneGlow > 0 && <pointLight position={[1.1, 0.5, -0.25]} intensity={phoneGlow * 1.5} decay={2} distance={0} color="#4FC9A8" />}
      {/* poules */}
      {new Array(chickens).fill(0).map((_, i) => {
        const fly = Math.max(0, frame - 8) * 0.03 * (1 + random(`ch${i}`));
        return (
          <mesh key={i} position={[-0.5 + random(`cx${i}`) * 2.5 + fly * (i % 2 ? 1 : -1), 0.15 + fly * 0.8 * random(`cy${i}`), 0.6 + random(`cz${i}`)]} castShadow>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshBasicMaterial color="#0a0604" />
          </mesh>
        );
      })}
      {/* feu de cour : ombres géantes sur le mur de la case */}
      {fire && (
        <group position={[0.2, 0.15, 1.2]}>
          <spotLight position={[0, 0.2, 0]} target-position={[-1.6, 1.5, -1.1]} angle={1.1} penumbra={0.4} intensity={60} decay={2} distance={0} color="#ff9a3a" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
          <Glow position={[0, 0.25, 0]} size={1.2} color="#ff9a3a" opacity={0.9 + 0.1 * Math.sin(frame)} />
          <Glow position={[0, 0.35 + 0.05 * Math.sin(frame * 1.3), 0]} size={0.5} color="#ffe2a8" opacity={1} />
        </group>
      )}
      <Actors actors={actors} />
      <CinemaPost lens={lens} />
    </>
  );
};

// Bâche peinte (sans marque réelle)
const useTarp = () =>
  useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 512;
    const c = cv.getContext("2d")!;
    const cols = ["#d63a2f", "#f2c14e", "#2e86ab", "#f2c14e", "#d63a2f"];
    cols.forEach((col, i) => {
      c.fillStyle = col;
      c.fillRect(0, i * 102, 1024, 102);
    });
    c.fillStyle = "#fff";
    c.font = "bold 120px 'Anton', sans-serif";
    c.textAlign = "center";
    c.fillText("BOISSONS FRAÎCHES", 512, 300);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

export type WallKind = "tole" | "enduit" | "bache";

// ── Les murs de Douala : théâtre d'ombres en plein soleil (ou sous les néons) ──
export const WallScene: React.FC<{ cam: Cam; lens: Lens; wall: WallKind; actors: Actor[]; light: "sun" | "neon"; rain?: boolean; extra?: React.ReactNode; phoneGreen?: number }> = ({
  cam,
  lens,
  wall,
  actors,
  light,
  rain = false,
  extra,
  phoneGreen = 0,
}) => {
  const frame = useCurrentFrame();
  const iron = usePbr("corrugated_iron", [3, 1]);
  const plaster = usePbr("damaged_plaster", [3, 1]);
  const asphalt = usePbr("asphalt_02", [4, 4]);
  const tarp = useTarp();
  const wallMat =
    wall === "tole" ? <meshStandardMaterial {...iron} color="#b8aa96" roughness={0.6} metalness={0.4} /> : wall === "enduit" ? <meshStandardMaterial {...plaster} color="#d9b48a" roughness={1} /> : <meshStandardMaterial map={tarp} roughness={0.8} />;
  return (
    <>
      <CameraSet cam={cam} />
      <color attach="background" args={[light === "sun" ? "#f3c890" : "#0a0810"]} />
      <ambientLight intensity={light === "sun" ? 0.45 : 0.08} color={light === "sun" ? "#ffd8b0" : "#5a4a8a"} />
      {light === "sun" ? (
        <directionalLight position={[2.5, 1.6, 4]} intensity={3.2} color="#ffc68a" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5} shadow-bias={-0.0004} />
      ) : (
        <>
          <pointLight position={[0.6, 2.3, 0.3]} intensity={7 * (0.9 + 0.1 * Math.sin(frame * 1.7))} decay={2} distance={0} color="#ff3d8b" castShadow />
          <Glow position={[0.6, 2.4, -0.55]} size={0.45} color="#ff3d8b" opacity={0.5} />
          <pointLight position={[-0.3, 0.45, 1.6]} intensity={1.6} decay={2} distance={0} color="#ff7aa8" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <pointLight position={[-1.4, 2.6, 1]} intensity={2} decay={2} distance={0} color="#4f86ff" />
        </>
      )}
      <mesh position={[0, 1.6, -0.6]} receiveShadow>
        <planeGeometry args={[9, 3.2]} />
        {wallMat}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial {...asphalt} color={light === "sun" ? "#8a7a6a" : "#2a2c33"} roughness={light === "sun" ? 0.9 : 0.25} metalness={light === "sun" ? 0 : 0.3} />
      </mesh>
      {/* marche de boutique */}
      {light === "neon" && (
        <mesh position={[0, 0.12, -0.35]} castShadow receiveShadow>
          <boxGeometry args={[3, 0.24, 0.5]} />
          <meshStandardMaterial color="#4a4a50" roughness={0.8} />
        </mesh>
      )}
      {phoneGreen > 0 && <pointLight position={[0.1, 0.75, 0.35]} intensity={phoneGreen * 2.5} decay={2} distance={0} color="#4FC9A8" />}
      {rain && <Rain frame={frame} area={[5, 4, 3]} center={[0, 2, 0.5]} count={300} />}
      {extra}
      <Actors actors={actors} />
      <CinemaPost lens={lens} />
    </>
  );
};

// ── Le seul « visage » du film : Maman en profil, à contre-jour du couchant, éclairée par en dessous par l'écran vert ──
export const MamanFace: React.FC<{ cam: Cam; lens: Lens; t: number }> = ({ cam, lens, t }) => {
  const ink = "#0b0605";
  const hand = Math.min(1, Math.max(0, (t - 0.25) / 0.35));
  const he = hand * hand * (3 - 2 * hand);
  const green = 0.6 + t * 1.6;
  const m = <meshStandardMaterial color={ink} roughness={0.45} />;
  return (
    <>
      <CameraSet cam={cam} />
      <color attach="background" args={["#1a0f22"]} />
      <Sky top="#2a1a55" mid="#d0606a" low="#ffb070" />
      <Glow position={[-0.9, 1.25, -6]} size={3.2} color="#ffd59a" opacity={0.9} />
      <ambientLight intensity={0.02} color="#ff8a5a" />
      <directionalLight position={[-1, 1.8, -3]} intensity={1.2} color="#ff9a5a" />
      <pointLight position={[0.2, 1.12, 0.08]} intensity={green * 0.35} decay={2} distance={0} color="#4FC9A8" />
      <group position={[0, 1.55, 0]}>
        {/* profil découpé (théâtre d'ombres) : foulard noué, front, nez, lèvres, menton */}
        <mesh position={[0, 0, -0.09]}>
          <extrudeGeometry args={[profileShape(he), { depth: 0.18, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.03, bevelSegments: 4, curveSegments: 24 }]} />
          {m}
        </mesh>
        {/* cou, épaules, pagne */}
        <mesh position={[-0.01, -0.36, 0]} scale={[1.15, 1, 2.2]}>
          <sphereGeometry args={[0.17, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          {m}
        </mesh>
        {/* le téléphone dans l'autre main, écran vers elle */}
        <group position={[0.2, -0.38, -0.04]} rotation={[0, 0, 0.9]}>
          <mesh>
            <boxGeometry args={[0.075, 0.15, 0.01]} />
            <meshBasicMaterial color={[0.3 * green, 1.0 * green, 0.75 * green]} toneMapped={false} />
          </mesh>
        </group>
        <Glow position={[0.2, -0.38, 0.02]} size={0.18} color="#4FC9A8" opacity={0.35 + t * 0.3} />
      </group>
      <CinemaPost lens={lens} />
    </>
  );
};
// Profil de visage, tourné vers +x ; « open » ouvre la bouche de surprise
const profileShape = (open: number) => {
  const d = open * 0.018;
  const sh = new THREE.Shape();
  sh.moveTo(-0.06, -0.24);
  sh.lineTo(-0.065, -0.07);
  sh.quadraticCurveTo(-0.17, 0.02, -0.15, 0.16);
  sh.quadraticCurveTo(-0.13, 0.27, -0.04, 0.3);
  sh.quadraticCurveTo(-0.02, 0.4, 0.05, 0.4);
  sh.quadraticCurveTo(0.09, 0.36, 0.05, 0.3);
  sh.quadraticCurveTo(0.12, 0.27, 0.125, 0.15);
  sh.lineTo(0.115, 0.13);
  sh.quadraticCurveTo(0.125, 0.09, 0.128, 0.055);
  sh.quadraticCurveTo(0.122, 0.035, 0.13, 0.02);
  sh.quadraticCurveTo(0.162, -0.012, 0.158, -0.028);
  sh.quadraticCurveTo(0.15, -0.038, 0.132, -0.036);
  sh.quadraticCurveTo(0.145, -0.048, 0.14, -0.058);
  sh.lineTo(0.128, -0.064 - d * 0.3);
  sh.quadraticCurveTo(0.143, -0.072 - d, 0.135, -0.085 - d);
  sh.quadraticCurveTo(0.122, -0.092 - d, 0.13, -0.11 - d);
  sh.quadraticCurveTo(0.128, -0.13 - d, 0.09, -0.135 - d);
  sh.quadraticCurveTo(0.05, -0.14, 0.045, -0.24);
  sh.closePath();
  return sh;
};
