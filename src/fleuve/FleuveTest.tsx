import React, { useLayoutEffect } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { comicFont, mvic, uiFont } from "../brand";
import { Grain, Vignette } from "../le-nom/fx";
import { LogoMark, Wordmark } from "../ui/MvicUi";
import { Billet, EyeState, PetitJaune, VieuxOrange } from "./Characters";
import { Bridge, BRIDGE_END, BRIDGE_START, Hills, Landscape, Palm } from "./World";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.cubic);

// Repères temporels (30 i/s)
const T = {
  press: 28, // Petit Jaune valide sur Mvic
  planks: 36, // première planche
  every: 9,
  bridgeDone: 120,
  billetOut: 140,
  onBridge: 156,
  offBridge: 222,
  arrive: 236,
  sms: 256,
  joy: 276,
  phrase: 312,
  end: 375,
};

// Le décor (fleuve, berges, pont) est tourné : le fleuve traverse l'image en diagonale,
// Petit Jaune est au premier plan, Vieux Orange sur l'autre rive.
const THETA = 0.72;
const toWorld = (x: number, z: number): [number, number] => [x * Math.cos(THETA) + z * Math.sin(THETA), -x * Math.sin(THETA) + z * Math.cos(THETA)];
const PJ_LOCAL = -1.7;
const VO_LOCAL = 1.7;
const LANE = 0.35; // axe du pont (z local)
const [PJ_WX, PJ_WZ] = toWorld(PJ_LOCAL - 0.05, LANE - 0.95);
const [VO_WX, VO_WZ] = toWorld(VO_LOCAL + 0.05, LANE - 0.95);

// ── Caméra pilotée image par image (repère monde) ──
const key = (f: number, frames: number[], values: number[]) => interpolate(f, frames, values, { ...clamp, easing: io });

const CameraRig: React.FC<{ frame: number; bx: number; bz: number }> = ({ frame, bx, bz }) => {
  const { camera } = useThree();
  const kf = [0, T.billetOut, T.onBridge, T.offBridge, T.arrive + 6, T.phrase - 8, T.phrase + 22];
  const px = key(frame, kf, [-1.3, -1.1, bx - 0.4, bx - 0.4, VO_WX - 0.6, VO_WX - 0.6, -1.3]);
  const py = key(frame, kf, [1.9, 1.8, 1.3, 1.3, 1.45, 1.45, 1.9]);
  const pz = key(frame, kf, [8.6, 7.8, bz + 3.4, bz + 3.4, VO_WZ + 3.8, VO_WZ + 3.8, 8.6]);
  const lx = key(frame, kf, [-0.55, -0.45, bx, bx, VO_WX, VO_WX, -0.55]);
  const ly = key(frame, kf, [1.55, 1.45, 0.4, 0.4, 1.05, 1.05, 1.6]);
  const lz = key(frame, kf, [-0.5, -0.4, bz, bz, VO_WZ, VO_WZ, -0.5]);
  useLayoutEffect(() => {
    camera.position.set(px, py, pz);
    camera.lookAt(lx, ly, lz);
    camera.updateProjectionMatrix();
  }, [camera, px, py, pz, lx, ly, lz]);
  return null;
};

const eyes = (p: Partial<EyeState>): EyeState => ({ open: 1, look: [0, 0], wide: 1, happy: 0, brow: 0, tears: 0, ...p });
const blink = (f: number, offset: number) => ((f + offset) % 75 > 71 ? 0.1 : 1);

export const FleuveTest: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // ── Le billet : trajet berge → pont → berge ──
  const billetX = interpolate(f, [T.billetOut, T.onBridge, T.offBridge, T.arrive], [PJ_LOCAL + 0.35, BRIDGE_START, BRIDGE_END, VO_LOCAL - 0.35], clamp);
  const [bwx, bwz] = toWorld(billetX, LANE);
  const onDeck = f >= T.onBridge && f <= T.offBridge;
  const hopIn = f > T.billetOut && f < T.onBridge ? Math.sin(((f - T.billetOut) / (T.onBridge - T.billetOut)) * Math.PI) * 0.45 : 0;
  const hopOut = f > T.offBridge && f < T.arrive ? Math.sin(((f - T.offBridge) / (T.arrive - T.offBridge)) * Math.PI) * 0.45 : 0;
  const runBob = onDeck ? Math.abs(Math.sin(f * 0.9)) * 0.06 : 0;
  const billetVisible = f >= T.billetOut && f < T.arrive + 4;
  const billetScale = interpolate(f, [T.billetOut, T.billetOut + 6, T.arrive, T.arrive + 4], [0, 1, 1, 0], clamp);

  // ── Petit Jaune ──
  const pjSquash = f >= T.press && f < T.press + 14 ? -Math.sin(((f - T.press) / 14) * Math.PI) * 0.12 : Math.sin(f / 9) * 0.015;
  const pjLook: [number, number] =
    f < T.press ? [0.9, 0] : f < T.bridgeDone ? [interpolate(f, [T.planks, T.bridgeDone], [-0.2, 0.9], clamp), -0.6] : f < T.arrive ? [Math.max(-1, Math.min(1, (billetX - PJ_LOCAL) / 2)), -0.4] : [1, 0];
  const pjEyes = eyes({
    open: blink(f, 0),
    look: pjLook,
    wide: f >= T.bridgeDone - 6 && f < T.bridgeDone + 20 ? 1.15 : 1,
    happy: f >= T.joy + 10 ? 1 : 0,
    brow: f < T.press ? 0.2 : -0.1,
  });

  // ── Vieux Orange ──
  const vibrating = f >= T.arrive + 6 && f < T.sms + 10;
  const voShake = vibrating ? Math.sin(f * 2.6) * 0.05 : 0;
  const dance = f >= T.joy ? Math.sin((f - T.joy) / 4.2) : 0;
  const voSquash = f >= T.joy ? Math.abs(Math.sin((f - T.joy) / 4.2)) * 0.09 - 0.03 : vibrating ? Math.sin(f * 1.3) * 0.02 : Math.sin(f / 10) * 0.012;
  const voEyes = eyes({
    open: blink(f, 30),
    look: f < T.bridgeDone ? [-0.9, -0.5] : f < T.sms ? [-0.8, -0.2] : [0, 0.3],
    wide: f >= T.bridgeDone - 4 && f < T.sms ? 1.2 : f >= T.sms && f < T.joy ? 1.45 : 1,
    brow: f < T.bridgeDone - 4 ? -0.8 : 0.1,
    happy: f >= T.joy + 12 ? 1 : 0,
    tears: f >= T.joy ? ((f - T.joy) / 40) % 1 : 0,
  });

  return (
    <AbsoluteFill style={{ background: "linear-gradient(#f3b779 0%, #f0a065 38%, #e07a4f 62%, #b4533b 100%)" }}>
      {/* soleil */}
      <div style={{ position: "absolute", left: 540 - 230, top: 520, width: 460, height: 460, borderRadius: 999, background: "radial-gradient(circle, #fff3c8 0%, #ffd58a 45%, rgba(255,190,110,0) 70%)" }} />
      {/* nuages */}
      {[
        [80, 300, 380, 0.25],
        [620, 220, 420, 0.18],
        [400, 420, 300, 0.32],
      ].map(([x, y, w, s], i) => (
        <div key={i} style={{ position: "absolute", left: (x as number) + f * (s as number), top: y, width: w, height: (w as number) * 0.28, borderRadius: 999, background: "#ffd9b0", opacity: 0.75, filter: "blur(2px)" }} />
      ))}

      <ThreeCanvas width={width} height={height} camera={{ fov: 40, position: [2.2, 2.3, 7.6] }}>
        <CameraRig frame={f} bx={bwx} bz={bwz} />
        <fog attach="fog" args={["#eea06a", 12, 40]} />
        <ambientLight intensity={0.65} color="#ffe0bf" />
        <directionalLight position={[-6, 7, 6]} intensity={1.5} color="#fff0d8" />
        <directionalLight position={[4, 3, -8]} intensity={1.1} color="#ff8a55" />
        <Hills />
        <group rotation={[0, THETA, 0]}>
          <Landscape frame={f} />
          {[
            [-4.0, -2.5, 3.2],
            [-6.0, 1.5, 3.8],
            [-5.0, -6, 3.0],
            [4.4, -3, 3.4],
            [6.5, 2.5, 3.9],
            [3.6, -7.5, 2.8],
            [5.2, 6.5, 3.1],
          ].map(([x, z, h], i) => (
            <Palm key={i} position={[x, 0, z]} height={h} sway={Math.sin(f / 22 + i)} />
          ))}
          <Bridge frame={f} startAt={T.planks} every={T.every} />
        </group>
        {/* herbes au premier plan */}
        {[
          [-3.0, 4.6, 0.7],
          [-2.3, 5.4, 0.5],
          [0.6, 5.2, 0.6],
          [1.3, 4.4, 0.55],
        ].map(([x, z, h], i) =>
          new Array(5).fill(0).map((_, k) => (
            <mesh key={`${i}-${k}`} position={[x + (k - 2) * 0.09, h / 2, z]} rotation={[0, 0, (k - 2) * 0.2 + Math.sin(f / 15 + i + k) * 0.05]}>
              <coneGeometry args={[0.05, h, 4]} />
              <meshToonMaterial color={k % 2 ? "#6f8230" : "#8a9a3c"} />
            </mesh>
          ))
        )}
        <group rotation={[0, 0.35, 0]} position={[PJ_WX, 0, PJ_WZ]}>
          <PetitJaune position={[0, 0, 0]} eyes={pjEyes} squash={pjSquash} tilt={Math.sin(f / 13) * 0.04} screenGlow={interpolate(f, [T.press - 6, T.press, T.press + 20, T.press + 40], [0, 1, 1, 0.25], clamp)} />
        </group>
        <group rotation={[0, -0.25, 0]} position={[VO_WX, 0, VO_WZ]}>
          <VieuxOrange position={[0, 0, 0]} eyes={voEyes} squash={voSquash} tilt={f < T.bridgeDone ? -0.08 : 0} shake={voShake} sway={dance} />
        </group>
        {billetVisible && (
          <group position={[bwx, onDeck ? 0.15 : 0, bwz]} rotation={[0, 0.75, 0]} scale={billetScale}>
            <Billet position={[0, 0, 0]} run={f * 0.9} hop={hopIn + hopOut + runBob} eyes={eyes({ open: 1, look: [1, 0], happy: f > T.offBridge ? 1 : 0 })} facing={0} />
          </group>
        )}
      </ThreeCanvas>

      {/* ── Onomatopées et textes 2D ── */}
      {f >= T.planks + 9 && f < T.bridgeDone + 10 && (
        <div style={{ position: "absolute", top: 360, width: "100%", textAlign: "center", fontFamily: comicFont, fontSize: 120, color: "#fff6e0", WebkitTextStroke: "6px #2a1208", textShadow: "8px 8px 0 #2a1208", rotate: "-5deg" }}>
          {["TOC", "TOC", "TOC", "TOC", "TOC"].slice(0, Math.min(5, Math.floor((f - T.planks) / (T.every * 1.8)) + 1)).join(" ")} !
        </div>
      )}
      {vibrating && (
        <div style={{ position: "absolute", top: 700 + Math.sin(f) * 6, right: 70, fontFamily: comicFont, fontSize: 120, color: "#FFD34D", WebkitTextStroke: "6px #2a1208", textShadow: "6px 6px 0 #2a1208", rotate: `${8 + Math.sin(f * 2) * 4}deg` }}>
          BZZZ !
        </div>
      )}
      {f >= T.sms && f < T.phrase + 6 && (
        <div
          style={{
            position: "absolute",
            top: 150,
            left: 60,
            right: 60,
            background: "rgba(255,255,255,0.97)",
            borderRadius: 40,
            padding: "30px 38px",
            boxShadow: "0 18px 50px rgba(60,20,0,0.35)",
            fontFamily: uiFont,
            color: mvic.night,
            translate: interpolate(f, [T.sms, T.sms + 10], ["0px -380px", "0px 0px"], { ...clamp, easing: Easing.bezier(0.2, 1.3, 0.4, 1) }),
            opacity: interpolate(f, [T.phrase - 4, T.phrase + 6], [1, 0], clamp),
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: mvic.gray400, fontWeight: 600 }}>
            <span>Orange Money · SMS</span>
            <span>maintenant</span>
          </div>
          <div style={{ marginTop: 10, fontSize: 46, fontWeight: 700 }}>Vous avez reçu 10 000 FCFA.</div>
        </div>
      )}
      {f >= T.phrase && (
        <div style={{ position: "absolute", top: 230, left: 70, right: 70, textAlign: "center", fontFamily: uiFont }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.12,
              color: "white",
              textShadow: "0 5px 0 rgba(60,15,0,0.75), 0 0 30px rgba(80,20,0,0.5)",
              opacity: interpolate(f, [T.phrase, T.phrase + 12], [0, 1], clamp),
              translate: interpolate(f, [T.phrase, T.phrase + 14], ["0px 30px", "0px 0px"], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
            }}
          >
            Entre Orange et MTN,
            <br />
            il n'y a plus de <span style={{ color: "#8fffe0" }}>fleuve</span>.
          </div>
          <div
            style={{
              marginTop: 50,
              display: "inline-flex",
              alignItems: "center",
              gap: 18,
              background: "rgba(15,25,35,0.82)",
              padding: "18px 30px",
              borderRadius: 30,
              opacity: interpolate(f, [T.phrase + 22, T.phrase + 34], [0, 1], clamp),
            }}
          >
            <LogoMark size={70} />
            <Wordmark size={54} dark />
          </div>
        </div>
      )}
      <Vignette strength={0.45} />
      <Grain opacity={0.08} />
      <Audio src={staticFile("fleuve/fleuve-test-audio.wav")} />
    </AbsoluteFill>
  );
};

export const FLEUVE_TEST_DURATION = T.end;
