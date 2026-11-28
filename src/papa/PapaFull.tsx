import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { comicFont, uiFont } from "../brand";
import { LogoMark, Wordmark } from "../ui/MvicUi";
import { Fragment } from "./Captions";
import { Lens } from "./Cinema";
import { ImpasseScene, ImpasseShot, FlightScene } from "./Night";
import { CLOSE_LENS, ease, lerp, mic, s, Shot, WIDE_LENS } from "./PapaCut";
import { PapaCanvas } from "./PapaSet";
import { Screen, SonRoomScene } from "./SonRoom";

// « Le vocal de Papa » — test A complet (voix témoins)
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T = { A1: 0, A2: 3.2, A3: 7.4, A4: 12.0, A5: 15.6, A6: 19.6, A7: 24.4, A8: 30.0, A9: 34.0, A10: 38.8, A11: 44.8, END: 50.3 };
export const PAPA_FULL_DURATION = s(T.END);
const PH: [number, number, number] = [0.05, 0.585, 0.25]; // téléphone du fils sur le lit

const Room: React.FC<{ dur: number; cam: (t: number) => { pos: [number, number, number]; look: [number, number, number]; fov: number }; lens: (t: number) => Lens; screen: (t: number) => Screen; green: (t: number) => number }> = (p) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / p.dur);
  return (
    <PapaCanvas>
      <SonRoomScene cam={p.cam(t)} lens={p.lens(t)} screen={p.screen(t)} green={p.green(t)} />
    </PapaCanvas>
  );
};

const Imp: React.FC<{ shot: ImpasseShot; dur: number; variant: number }> = ({ shot, dur, variant }) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / dur);
  const v = variant % 2 ? -1 : 1;
  const cams: Record<ImpasseShot, { pos: [number, number, number]; look: [number, number, number]; fov: number }> = {
    shutter: { pos: [v * 0.6, 1.2, 2.6 - t * 0.2], look: [0, 1.6, -0.6], fov: 50 },
    puddle: { pos: [v * 0.3, 0.45, 1.1 - t * 0.1], look: [0, 0, 0], fov: 50 },
    clock: { pos: [v * 0.1, 1.5, 0.55 - t * 0.05], look: [0, 1.5, -0.3], fov: 45 },
    battery: { pos: [0.02, 0.22 - t * 0.02, 0.05], look: [0, 0, 0], fov: 50 },
    street: { pos: [v * 0.2, 1.5, 2 - t * 0.5], look: [0, 1.3, -8], fov: 50 },
  };
  return (
    <PapaCanvas>
      <ImpasseScene shot={shot} cam={cams[shot]} lens={{ focus: shot === "battery" ? 0.22 : shot === "puddle" ? 1.1 : 2, aperture: 0.03, maxblur: 0.012, bloom: 0.8, bloomRadius: 0.5, bloomThreshold: 0.7 }} />
    </PapaCanvas>
  );
};

const Flight: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame();
  const t = Math.min(1, f / dur);
  return (
    <PapaCanvas>
      <FlightScene t={ease(t)} lens={{ focus: 6, aperture: 0.003, maxblur: 0.006, bloom: 1.1, bloomRadius: 0.7, bloomThreshold: 0.55 }} />
    </PapaCanvas>
  );
};

// étapes Mvic sur la durée du plan A7
const mvicStep = (t: number): Screen => {
  if (t < 0.18) return { mode: "mvic", step: 0, k: t / 0.18 };
  if (t < 0.34) return { mode: "mvic", step: 1, k: 1 };
  if (t < 0.58) return { mode: "mvic", step: 2, k: (t - 0.34) / 0.24 };
  if (t < 0.72) return { mode: "mvic", step: 3, k: 1 };
  return { mode: "mvic", step: 4, k: (t - 0.72) / 0.22 };
};

export const PapaFull: React.FC = () => {
  const f = useCurrentFrame();
  const { width } = useVideoConfig();
  const rafale: ImpasseShot[] = ["shutter", "puddle", "clock", "battery", "street", "shutter", "puddle", "clock", "battery", "street"];
  const slot = (T.A6 - T.A5) / rafale.length;
  return (
    <AbsoluteFill style={{ backgroundColor: "#06080c" }}>
      <Sequence name="A1" from={s(T.A1)} durationInFrames={s(T.A2 - T.A1)}>
        <Shot dur={s(3.2)} cam={(t, top) => ({ pos: [lerp(0.17, 0.16, t), top + lerp(0.12, 0.11, t), lerp(0.42, 0.38, ease(t))], look: [0.03, top + 0.035, 0.1], fov: 40 })} lens={() => CLOSE_LENS} state={(t) => mic(t)} />
      </Sequence>
      <Sequence name="A2" from={s(T.A2)} durationInFrames={s(T.A3 - T.A2)}>
        <Shot dur={s(4.2)} cam={(t, top) => ({ pos: [lerp(-0.1, -0.03, ease(t)), top + 0.17, lerp(0.5, 0.47, t)], look: [0.04, top + 0.04, 0.1], fov: 40 })} lens={() => ({ ...CLOSE_LENS, focus: 0.4 })} state={(t) => mic(t)} />
      </Sequence>
      <Sequence name="A3" from={s(T.A3)} durationInFrames={s(T.A4 - T.A3)}>
        <Room dur={s(4.6)} cam={(t) => ({ pos: [lerp(0.25, 0.1, ease(t)), 0.84 - t * 0.04, lerp(1.1, 0.9, ease(t))], look: [0.06, 0.66, -0.3], fov: 46 })} lens={() => ({ focus: 0.72, aperture: 0.035, maxblur: 0.016, bloom: 0.7, bloomRadius: 0.55, bloomThreshold: 0.7 })} screen={() => ({ mode: "voice" })} green={() => 0} />
      </Sequence>
      <Sequence name="A4" from={s(T.A4)} durationInFrames={s(T.A5 - T.A4)}>
        <Room dur={s(3.6)} cam={(t) => ({ pos: [PH[0] + 0.03, PH[1] + lerp(0.26, 0.21, ease(t)), PH[2] + 0.09], look: [PH[0], PH[1], PH[2] - 0.005], fov: 40 })} lens={(t) => ({ focus: lerp(0.27, 0.22, t), aperture: 0.06, maxblur: 0.015, bloom: 0.35, bloomRadius: 0.4, bloomThreshold: 0.95 })} screen={() => ({ mode: "voice-labels" })} green={() => 0} />
      </Sequence>
      {rafale.map((shot, i) => (
        <Sequence key={i} name={`A5-${i}`} from={s(T.A5 + i * slot)} durationInFrames={Math.max(1, s(slot))}>
          <Imp shot={shot} dur={s(slot)} variant={i} />
        </Sequence>
      ))}
      <Sequence name="A6" from={s(T.A6)} durationInFrames={s(T.A7 - T.A6)}>
        <Shot dur={s(4.8)} cam={(t, top) => ({ pos: [lerp(0.05, -0.08, ease(t)), lerp(1.15, 1.1, t), lerp(1.7, 1.55, ease(t))], look: [0.18, top + 0.15, -0.5], fov: 46 })} lens={() => WIDE_LENS} state={(t) => mic(t, 0.2)} />
      </Sequence>
      <Sequence name="A7" from={s(T.A7)} durationInFrames={s(T.A8 - T.A7)}>
        <Room
          dur={s(5.6)}
          cam={(t) => {
            const back = ease(Math.max(0, (t - 0.8) / 0.2));
            return { pos: [PH[0] + lerp(0.03, 0.45, back), PH[1] + lerp(0.22, 0.45, back), PH[2] + lerp(0.09, 0.95, back)], look: [PH[0], PH[1] + back * 0.2, PH[2] - back * 0.4], fov: 40 + back * 6 };
          }}
          lens={(t) => ({ focus: t < 0.8 ? 0.23 : lerp(0.23, 1.0, (t - 0.8) / 0.2), aperture: 0.05, maxblur: 0.015, bloom: t < 0.8 ? 0.3 : 0.8, bloomRadius: 0.5, bloomThreshold: t < 0.8 ? 0.97 : 0.78 })}
          screen={mvicStep}
          green={(t) => interpolate(t, [0, 0.2, 0.9, 1], [0.15, 0.4, 0.8, 1], clamp)}
        />
      </Sequence>
      <Sequence name="A8" from={s(T.A8)} durationInFrames={s(T.A9 - T.A8)}>
        <Flight dur={s(4)} />
      </Sequence>
      <Sequence name="A9" from={s(T.A9)} durationInFrames={s(T.A10 - T.A9)}>
        <Shot
          dur={s(4.8)}
          cam={(t, top) => ({ pos: [lerp(0.2, 0.12, ease(t)), top + lerp(0.16, 0.12, ease(t)), lerp(0.46, 0.3, ease(t))], look: [0.05, top + 0.01, 0.15], fov: 38 })}
          lens={(t) => ({ ...CLOSE_LENS, focus: lerp(0.36, 0.2, ease(t)) })}
          state={(t) => {
            const sms = t >= 0.45;
            return { lines: sms ? ["Vous avez reçu", "25 000 FCFA"] : ["", "1 message"], icon: sms ? "none" : "sms", glow: sms ? 0.7 : 0.45, vibrate: t > 0.08 && t < 0.43 ? 1 : 0, green: sms ? 0.22 : 0 };
          }}
        />
      </Sequence>
      <Sequence name="A10" from={s(T.A10)} durationInFrames={s(T.A11 - T.A10)}>
        <Shot dur={s(6)} cam={(t, top) => ({ pos: [lerp(0.32, 0.18, ease(t)), top + lerp(0.22, 0.13, ease(t)), lerp(0.62, 0.4, ease(t))], look: [0.03, top + 0.03, 0.1], fov: 38 })} lens={(t) => ({ ...CLOSE_LENS, focus: lerp(0.62, 0.34, ease(t)) })} state={(t) => ({ ...mic(t, 0.3), green: 0.12 })} />
      </Sequence>
      <Sequence name="A11" from={s(T.A11)} durationInFrames={s(T.END - T.A11)}>
        <Shot dur={s(5.5)} cam={(t, top) => ({ pos: [lerp(0.55, 0.62, t), lerp(top + 0.45, top + 0.5, t), lerp(0.95, 1.02, t)], look: [0, top + 0.05, -0.1], fov: 38 })} lens={() => ({ ...WIDE_LENS, focus: 1.05 })} state={() => ({ lines: ["Vous avez reçu", "25 000 FCFA"], icon: "none", glow: 0.4, vibrate: 0, green: 0.1 })} />
      </Sequence>

      {/* ── Textes en fragments ── */}
      <Fragment text="JUNIOR…" from={s(0.35)} to={s(1.8)} />
      <Fragment text="C'EST PAPA." from={s(1.9)} to={s(3.15)} />
      <Fragment text="JE N'AIME PAS TE DEMANDER." from={s(3.5)} to={s(5.7)} />
      <Fragment text="TU SAIS ÇA." from={s(5.9)} to={s(7.3)} />
      <Fragment text="MAIS TA PETITE SŒUR…" from={s(7.8)} to={s(9.9)} />
      <Fragment text="LE CONCOURS FERME DEMAIN MATIN." from={s(10.0)} to={s(11.95)} />
      <Fragment text="IL MANQUE… 25 000." from={s(12.4)} to={s(14.2)} />
      <Fragment text="LUI : MTN." from={s(14.25)} to={s(14.95)} />
      <Fragment text="PAPA : ORANGE." from={s(14.95)} to={s(15.55)} />
      <Fragment text="SI TU NE PEUX PAS," from={s(19.9)} to={s(21.2)} />
      <Fragment text="CE N'EST PAS GRAVE HEIN." from={s(21.2)} to={s(22.9)} />
      <Fragment text="DIEU VA FAIRE." from={s(23.0)} to={s(24.35)} />
      <Fragment text="25 000 FCFA" from={s(24.6)} to={s(25.8)} color="#d9ffe9" />
      <Fragment text="MTN → ORANGE" from={s(26.0)} to={s(27.6)} color="#d9ffe9" />
      <Fragment text="TON CODE. TOI SEUL." from={s(28.5)} to={s(29.95)} color="#d9ffe9" />
      <Fragment text="VOUS AVEZ REÇU 25 000 FCFA" from={s(36.3)} to={s(38.7)} size={78} color="#d9ffe9" />
      <Fragment text="MON FILS…" from={s(39.4)} to={s(41.4)} />
      <Fragment text="JE SUIS FIER DE TOI." from={s(42.1)} to={s(44.7)} />
      <Fragment text="TU NE CHOISIS PAS LE RÉSEAU DE TON PÈRE." from={s(45.0)} to={s(47.4)} size={80} />
      <Fragment text="TU CHOISIS D'ÊTRE LÀ." from={s(47.5)} to={s(50.2)} size={96} />
      {/* onomatopée du départ de l'argent */}
      {f >= s(29.8) && f < s(30.9) && (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ fontFamily: comicFont, fontSize: 190, color: "#e6fff6", textShadow: "0 0 40px #4FC9A8, 0 0 80px #1A6B5A", rotate: "-6deg", scale: String(interpolate(f, [s(29.8), s(30.1)], [0.6, 1.1], clamp)), opacity: interpolate(f, [s(30.5), s(30.9)], [1, 0], clamp) }}>
            FWIIIP !
          </div>
        </AbsoluteFill>
      )}
      {f >= s(48.4) && (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 260 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, fontFamily: uiFont, opacity: interpolate(f, [s(48.4), s(49.0)], [0, 1], clamp) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(8,14,12,0.6)", padding: "18px 30px", borderRadius: 30, width: width * 0.62, justifyContent: "center" }}>
              <LogoMark size={74} />
              <Wordmark size={60} dark />
            </div>
            <div style={{ fontSize: 40, fontWeight: 600, color: "#e8fff6", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>Orange ou MTN, ton argent passe.</div>
          </div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile("papa/papa-full-audio.wav")} />
    </AbsoluteFill>
  );
};
