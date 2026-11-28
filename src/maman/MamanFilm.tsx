import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { comicFont, uiFont } from "../brand";
import { LogoMark, Wordmark } from "../ui/MvicUi";
import { Fragment } from "../papa/Captions";
import { Lens } from "../papa/Cinema";
import { PapaCanvas } from "../papa/PapaSet";
import { Smartphone } from "../papa/SonRoom";
import { MvicCfg } from "../papa/screens";
import { clutch, dance, joy, mix, phoneEar, rest, sit, slump, walk } from "./Rig";
import { Actor, MamanFace, VillageScene, WallKind, WallScene } from "./Sets";

// « Qu'est-ce que tu m'as fait ?! » — test B (silhouettes, voix témoins)
const FPS = 24;
const s = (x: number) => Math.round(x * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const io = Easing.inOut(Easing.sin);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const MAMAN_DURATION = s(40);

const LENS: Lens = { focus: 5, aperture: 0.006, maxblur: 0.008, bloom: 0.7, bloomRadius: 0.6, bloomThreshold: 0.72 };
const CFG: MvicCfg = { amount: "10 000", from: "Orange", to: "MTN", holder: "NGO BIYONG MARIE", short: "NGO BIYONG M.", numFrom: "6 99 •• •• ••", numTo: "6 77 •• •• ••" };
const MAMAN_POS: [number, number, number] = [0.35, 0, 0.05];

// Hook générique : t local 0…1 de la séquence
const useT = (dur: number) => Math.min(1, useCurrentFrame() / dur);

const Village: React.FC<{ dur: number; build: (t: number, f: number) => React.ComponentProps<typeof VillageScene> }> = ({ dur, build }) => {
  const f = useCurrentFrame();
  return (
    <PapaCanvas>
      <VillageScene {...build(Math.min(1, f / dur), f)} />
    </PapaCanvas>
  );
};
const Wall: React.FC<{ dur: number; build: (t: number, f: number) => React.ComponentProps<typeof WallScene> }> = ({ dur, build }) => {
  const f = useCurrentFrame();
  return (
    <PapaCanvas>
      <WallScene {...build(Math.min(1, f / dur), f)} />
    </PapaCanvas>
  );
};

// Maman qui s'effondre sur la chaise (B1)
const collapse = (t: number) => (t < 0.3 ? mix(rest, clutch, t / 0.3) : t < 0.7 ? mix(clutch, sit, (t - 0.3) / 0.4) : mix(sit, slump, Math.min(1, (t - 0.7) / 0.3)));

// Moto-taxi en ombre (B6)
const Moto: React.FC<{ x: number; umbrellaFly: number }> = ({ x, umbrellaFly }) => (
  <group position={[x, 0, 0.3]}>
    {[-0.55, 0.55].map((wx) => (
      <mesh key={wx} position={[wx, 0.32, 0]} castShadow>
        <torusGeometry args={[0.28, 0.06, 8, 24]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    ))}
    <mesh position={[0, 0.62, 0]} castShadow>
      <boxGeometry args={[1.0, 0.22, 0.2]} />
      <meshBasicMaterial colorWrite={false} depthWrite={false} />
    </mesh>
    {/* parapluie fixé au guidon, qui s'envole */}
    <group position={[0.5 - umbrellaFly * 1.5, 1.6 + umbrellaFly * 1.6, 0]} rotation={[0, 0, umbrellaFly * 2.5]}>
      <mesh castShadow>
        <coneGeometry args={[0.6, 0.3, 16]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.45, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
    </group>
  </group>
);

type RafaleShot = { kind: "run" | "moto" | "queue" | "shutter"; wall: WallKind; light: "sun" | "neon"; rain: boolean };
const RAFALE: RafaleShot[] = [
  { kind: "run", wall: "enduit", light: "sun", rain: false },
  { kind: "moto", wall: "tole", light: "neon", rain: true },
  { kind: "queue", wall: "bache", light: "sun", rain: false },
  { kind: "run", wall: "tole", light: "sun", rain: false },
  { kind: "shutter", wall: "tole", light: "neon", rain: true },
  { kind: "moto", wall: "enduit", light: "neon", rain: true },
  { kind: "queue", wall: "enduit", light: "sun", rain: false },
  { kind: "run", wall: "tole", light: "neon", rain: true },
  { kind: "moto", wall: "tole", light: "neon", rain: true },
  { kind: "shutter", wall: "tole", light: "neon", rain: true },
  { kind: "queue", wall: "enduit", light: "neon", rain: true },
  { kind: "run", wall: "enduit", light: "neon", rain: true },
  { kind: "shutter", wall: "tole", light: "neon", rain: true },
  { kind: "run", wall: "tole", light: "neon", rain: true },
];

const Rafale: React.FC<{ shot: RafaleShot; dur: number }> = ({ shot, dur }) => (
  <Wall
    dur={dur}
    build={(t, f) => {
      const cam = { pos: [0, 1.4, 3.4 - t * 0.3] as [number, number, number], look: [0, 1.3, -0.6] as [number, number, number], fov: 50 };
      const actors: Actor[] = [];
      let extra: React.ReactNode = null;
      if (shot.kind === "run") actors.push({ kind: "junior", pose: walk(f * 0.7, 1, true), position: [lerp(-2.5, 2.5, t), 0, 0.5], facing: Math.PI / 2, ghost: true });
      if (shot.kind === "moto") extra = <Moto x={lerp(-3, 3, t)} umbrellaFly={Math.max(0, (t - 0.4) * 2)} />;
      if (shot.kind === "queue")
        for (let i = 0; i < 8; i++) actors.push({ kind: i % 3 === 0 ? "maman" : i === 7 ? "junior" : "voisine", pose: mix(rest, walk(f * 0.1 + i, 0.2), 0.3), position: [-2.6 + i * 0.6, 0, 0.6], facing: Math.PI / 2, ghost: true });
      if (shot.kind === "shutter")
        extra = (
          <mesh position={[0, lerp(3.2, 1.2, Math.min(1, t * 1.4)), -0.55]} castShadow>
            <boxGeometry args={[2.2, 2.4, 0.04]} />
            <meshStandardMaterial color="#8a8070" metalness={0.6} roughness={0.5} />
          </mesh>
        );
      return { cam, lens: LENS, wall: shot.wall, light: shot.light, rain: shot.rain, actors, extra };
    }}
  />
);

const PhoneClose: React.FC<{ dur: number; mode: "contacts" | "mvic" }> = ({ dur, mode }) => {
  const t = useT(dur);
  const step = t < 0.22 ? 0 : t < 0.4 ? 1 : t < 0.62 ? 2 : t < 0.76 ? 3 : 4;
  const k = step === 0 ? t / 0.22 : step === 2 ? (t - 0.4) / 0.22 : step === 4 ? (t - 0.76) / 0.2 : 1;
  return (
    <PapaCanvas>
      <WallScene
        cam={{ pos: [0.03, 0.24 - t * 0.03, 0.62], look: [0, 0.02, 0.55], fov: 42 }}
        lens={{ focus: 0.22, aperture: 0.05, maxblur: 0.015, bloom: 0.3, bloomRadius: 0.4, bloomThreshold: 0.96 }}
        wall="enduit"
        light={mode === "mvic" ? "neon" : "sun"}
        actors={[]}
        phoneGreen={mode === "mvic" ? 0.6 + t * 0.4 : 0}
        extra={<Smartphone screen={mode === "mvic" ? { mode: "mvic", step, k, cfg: CFG } : { mode: "contacts" }} brightness={0.9} position={[0, 0.006, 0.55]} rotation={[0, 0.15, 0]} />}
      />
    </PapaCanvas>
  );
};

const Face: React.FC<{ dur: number }> = ({ dur }) => {
  const t = useT(dur);
  return (
    <PapaCanvas>
      <MamanFace cam={{ pos: [0.02, 1.5, lerp(1.45, 1.2, io(t))], look: [0.02, 1.55, 0], fov: 40 }} lens={{ focus: lerp(1.45, 1.2, io(t)), aperture: 0.02, maxblur: 0.01, bloom: 0.7, bloomRadius: 0.6, bloomThreshold: 0.75 }} t={t} />
    </PapaCanvas>
  );
};

export const MamanFilm: React.FC = () => {
  const f = useCurrentFrame();
  const { width } = useVideoConfig();
  const slot = s(0.5);
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a0f0a" }}>
      {/* B1 — « JUNIOR ! QU'EST-CE QUE TU M'AS FAIT ?! » */}
      <Sequence name="B1" from={0} durationInFrames={s(2.5)}>
        <Village dur={s(2.5)} build={(t) => ({ cam: { pos: [lerp(0.95, 0.85, t), 0.4, lerp(3.0, 2.7, t)], look: [0.4, 1.1, -1], fov: 38 }, lens: LENS, sun: [0.6, 1.4, -6], chickens: 4, actors: [{ kind: "maman", pose: collapse(t), position: MAMAN_POS, facing: 0.5 }] })} />
      </Sequence>
      {/* B2 — les ombres des voisines courent sur le mur */}
      <Sequence name="B2" from={s(2.5)} durationInFrames={s(1.5)}>
        <Village
          dur={s(1.5)}
          build={(t, fr) => ({
            cam: { pos: [lerp(0.2, -2.4, io(t)), 1.3, 2.4], look: [lerp(-0.6, -2.4, io(t)), 1.3, -1.1], fov: 46 },
            lens: LENS,
            sun: [4, 1.4, 7],
            actors: [
              { kind: "voisine", pose: walk(fr * 0.8, 1, true), position: [lerp(1, -3.5, t), 0, 0.2], facing: -Math.PI / 2, ghost: true },
              { kind: "vieille", pose: walk(fr * 0.6, 0.8), position: [lerp(1.8, -2, t), 0, 0.6], facing: -Math.PI / 2, ghost: true },
            ],
          })}
        />
      </Sequence>
      {/* B3 — carton « 3 HEURES PLUS TÔT » */}
      <Sequence name="B3" from={s(4)} durationInFrames={s(1.5)}>
        <AbsoluteFill style={{ background: "radial-gradient(circle, #f6d7a3 0%, #d9965a 100%)", justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontFamily: comicFont, fontSize: 150, lineHeight: 1, color: "#2a1208", textAlign: "center", rotate: "-4deg", textShadow: "6px 6px 0 #fff3dc" }}>
            3 HEURES
            <br />
            PLUS TÔT
          </div>
        </AbsoluteFill>
      </Sequence>
      {/* B4 — l'ombre de Junior au téléphone, sur la tôle */}
      <Sequence name="B4" from={s(5.5)} durationInFrames={s(3)}>
        <Wall dur={s(3)} build={(t, fr) => ({ cam: { pos: [0.3, 1.4, 3.4 - t * 0.4], look: [0, 1.3, -0.6], fov: 44 }, lens: LENS, wall: "tole", light: "sun", actors: [{ kind: "junior", pose: mix(phoneEar, walk(fr * 0.15, 0.2), 0.2), position: [0.4, 0, 0.6], facing: Math.PI / 2, ghost: true }] })} />
      </Sequence>
      {/* B5 — lui : Orange, Maman : MTN */}
      <Sequence name="B5" from={s(8.5)} durationInFrames={s(1.5)}>
        <PhoneClose dur={s(1.5)} mode="contacts" />
      </Sequence>
      {/* B6 — l'odyssée en théâtre d'ombres */}
      {RAFALE.map((shot, i) => (
        <Sequence key={i} name={`B6-${i}`} from={s(10) + i * slot} durationInFrames={slot}>
          <Rafale shot={shot} dur={slot} />
        </Sequence>
      ))}
      {/* B7 — trempé sur une marche ; le petit frère arrive */}
      <Sequence name="B7" from={s(17)} durationInFrames={s(2)}>
        <Wall
          dur={s(2)}
          build={(t, fr) => ({
            cam: { pos: [0.4, 1.0, 3.2], look: [0, 0.9, -0.4], fov: 42 },
            lens: LENS,
            wall: "enduit",
            light: "neon",
            rain: true,
            actors: [
              { kind: "junior", pose: { ...slump, y: -0.56 }, position: [-0.25, 0, -0.1], facing: 0.2 },
              { kind: "frere", pose: t < 0.6 ? walk(fr * 0.5, 0.8) : mix(walk(0, 0.2), { ...sit, y: -0.36 }, Math.min(1, (t - 0.6) / 0.3)), position: [lerp(2.2, 0.35, Math.min(1, t / 0.6)), 0, -0.1], facing: t < 0.6 ? -Math.PI / 2 : -0.2 },
            ],
          })}
        />
      </Sequence>
      {/* B8 — l'écran Mvic s'allume : la lumière verte éclaire les deux silhouettes */}
      <Sequence name="B8a" from={s(19)} durationInFrames={s(1.2)}>
        <Wall
          dur={s(1.2)}
          build={(t) => ({
            cam: { pos: [0.2, 0.95, 2.4 - t * 0.3], look: [0.05, 0.85, -0.2], fov: 40 },
            lens: LENS,
            wall: "enduit",
            light: "neon",
            rain: true,
            phoneGreen: 0.3 + t * 0.7,
            actors: [
              { kind: "junior", pose: { ...sit, y: -0.56, lean: 0.35, head: 0.4, armL: [1.1, 1.6], armR: [1.1, 1.6] }, position: [-0.25, 0, -0.1], facing: 0.2 },
              { kind: "frere", pose: { ...sit, y: -0.36, lean: 0.3, head: 0.35 }, position: [0.35, 0, -0.1], facing: -0.2 },
            ],
          })}
        />
      </Sequence>
      <Sequence name="B8b" from={s(20.2)} durationInFrames={s(3)}>
        <PhoneClose dur={s(3)} mode="mvic" />
      </Sequence>
      <Sequence name="B8c" from={s(23.2)} durationInFrames={s(0.8)}>
        <Wall
          dur={s(0.8)}
          build={() => ({
            cam: { pos: [0.2, 0.95, 2.1], look: [0.05, 0.85, -0.2], fov: 40 },
            lens: { ...LENS, bloom: 1.2 },
            wall: "enduit",
            light: "neon",
            rain: true,
            phoneGreen: 1.6,
            actors: [
              { kind: "junior", pose: { ...sit, y: -0.56, lean: 0.35, head: 0.4, armL: [1.1, 1.6], armR: [1.1, 1.6] }, position: [-0.25, 0, -0.1], facing: 0.2 },
              { kind: "frere", pose: { ...sit, y: -0.36, lean: 0.3, head: 0.35, armL: [2.6, 0.3] }, position: [0.35, 0, -0.1], facing: -0.2 },
            ],
          })}
        />
      </Sequence>
      {/* B9 — retour au village : le téléphone vibre, puis le visage de Maman */}
      <Sequence name="B9a" from={s(24)} durationInFrames={s(1.2)}>
        <Village dur={s(1.2)} build={(t) => ({ cam: { pos: [0.95, 0.45, 2.8 - t * 0.4], look: [0.6, 0.9, -1], fov: 38 }, lens: LENS, sun: [0.6, 1.4, -6], skyK: 0.3, phoneGlow: 0.6 + 0.4 * Math.sin(t * 40), actors: [{ kind: "maman", pose: slump, position: MAMAN_POS, facing: 0.5 }] })} />
      </Sequence>
      <Sequence name="B9b" from={s(25.2)} durationInFrames={s(1.8)}>
        <Face dur={s(1.8)} />
      </Sequence>
      {/* B10 — « Ma'a, qu'est-ce qu'il t'a fait ?! » — « IL M'A FAIT PLAISIR !!! » */}
      <Sequence name="B10" from={s(27)} durationInFrames={s(3)}>
        <Village
          dur={s(3)}
          build={(t, fr) => ({
            cam: { pos: [0.7, 0.45, 3.3], look: [0.1, 1.05, -1], fov: 44 },
            lens: LENS,
            sun: [0.6, 1.4, -6],
            skyK: 0.4,
            phoneGlow: 0.5,
            actors: [
              { kind: "maman", pose: t < 0.5 ? slump : mix(sit, joy, Math.min(1, (t - 0.5) / 0.12)), position: MAMAN_POS, facing: 0.5 },
              { kind: "voisine", pose: t < 0.4 ? walk(fr * 0.8, 1, true) : rest, position: [lerp(-3, -0.6, Math.min(1, t / 0.4)), 0, 0.4], facing: Math.PI / 2 },
            ],
          })}
        />
      </Sequence>
      {/* B11–B12 — les ombres dansent en géant sur le mur de la case */}
      <Sequence name="B11" from={s(30)} durationInFrames={s(10)}>
        <Village
          dur={s(10)}
          build={(t, fr) => ({
            cam: { pos: [lerp(1.4, 2.2, io(t)), lerp(1.1, 1.8, io(t)), lerp(3.2, 5.4, io(t))], look: [-0.9, 1.4, -1.1], fov: 46 },
            lens: LENS,
            sun: [-3, 1.0, -6],
            skyK: 0.75,
            fire: true,
            actors: [
              { kind: "maman", pose: dance(fr * 0.32), position: [-0.3, 0, 0.3], facing: 0.4 },
              { kind: "voisine", pose: dance(fr * 0.32 + 1.6), position: [-1.3, 0, 0.5], facing: 0.6 },
              { kind: "vieille", pose: dance(fr * 0.28 + 3), position: [0.6, 0, 0.6], facing: 0.2 },
            ],
          })}
        />
      </Sequence>

      {/* ── Textes en fragments ── */}
      <Fragment text="JUNIOR !" from={s(0.2)} to={s(1.0)} size={110} />
      <Fragment text="QU'EST-CE QUE TU M'AS FAIT ?!" from={s(1.0)} to={s(2.45)} />
      <Fragment text="MA'A ! QU'EST-CE QUI SE PASSE ?!" from={s(2.6)} to={s(3.95)} size={80} />
      <Fragment text="JUNIOR, ENVOIE-MOI MÊME 10 000," from={s(5.8)} to={s(7.4)} size={80} />
      <Fragment text="LE CAR PART À 18 H…" from={s(7.4)} to={s(8.45)} />
      <Fragment text="LUI : ORANGE. MAMAN : MTN." from={s(8.55)} to={s(9.95)} size={80} />
      <Fragment text="GRAND FRÈRE… TU CONNAIS PAS MVIC ?" from={s(17.6)} to={s(18.95)} size={78} />
      <Fragment text="10 000 FCFA" from={s(20.3)} to={s(21.1)} color="#d9ffe9" />
      <Fragment text="ORANGE → MTN" from={s(21.2)} to={s(22.0)} color="#d9ffe9" />
      <Fragment text="TON CODE. TOI SEUL." from={s(22.3)} to={s(23.15)} color="#d9ffe9" />
      <Fragment text="VOUS AVEZ REÇU 10 000 FCFA" from={s(25.4)} to={s(26.95)} size={78} color="#d9ffe9" />
      <Fragment text="MA'A, QU'EST-CE QU'IL T'A FAIT ?!" from={s(27.2)} to={s(28.6)} size={80} />
      <Fragment text="IL M'A FAIT PLAISIR !!!" from={s(28.8)} to={s(29.95)} size={104} />
      <Fragment text="ENTRE ORANGE ET MTN…" from={s(35.0)} to={s(37.0)} />
      <Fragment text="IL Y A MAINTENANT MVIC." from={s(37.0)} to={s(39.9)} size={100} />

      {/* ── Onomatopées ── */}
      {[
        { t: 10.5, d: 0.5, txt: "VROUM", c: "#fff3dc" },
        { t: 10.75, d: 0.4, txt: "FLOP !", c: "#ffd34d" },
        { t: 12.0, d: 0.5, txt: "FERMÉ !", c: "#ff5a4a" },
        { t: 13.0, d: 0.5, txt: "VROUM", c: "#fff3dc" },
        { t: 14.5, d: 0.5, txt: "FERMÉ !", c: "#ff5a4a" },
        { t: 16.0, d: 0.5, txt: "FERMÉ !", c: "#ff5a4a" },
        { t: 23.25, d: 0.75, txt: "FWIIIP !", c: "#e6fff6" },
        { t: 31.0, d: 2.0, txt: "EKIEU !", c: "#ffd34d" },
      ].map((o, i) =>
        f >= s(o.t) && f < s(o.t + o.d) ? (
          <AbsoluteFill key={i} style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 360 }}>
            <div style={{ fontFamily: comicFont, fontSize: 170, color: o.c, rotate: "-6deg", WebkitTextStroke: "6px #1a0a04", textShadow: o.txt.startsWith("FWI") ? "0 0 40px #4FC9A8" : "8px 8px 0 #1a0a04", scale: String(interpolate(f, [s(o.t), s(o.t) + 4], [1.6, 1], clamp)) }}>{o.txt}</div>
          </AbsoluteFill>
        ) : null
      )}
      {f >= s(37.6) && (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 240 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, fontFamily: uiFont, opacity: interpolate(f, [s(37.6), s(38.2)], [0, 1], clamp) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(20,10,20,0.6)", padding: "18px 30px", borderRadius: 30, width: width * 0.62, justifyContent: "center" }}>
              <LogoMark size={74} />
              <Wordmark size={60} dark />
            </div>
            <div style={{ fontSize: 40, fontWeight: 600, color: "#fff3e6", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>Orange ou MTN, ton argent passe.</div>
          </div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile("maman/maman-audio.wav")} />
    </AbsoluteFill>
  );
};
