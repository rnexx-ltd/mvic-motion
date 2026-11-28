import React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { uiFont } from "../brand";
import { LogoMark, Wordmark } from "../ui/MvicUi";
import { Fragment } from "./Captions";
import { Cam, PapaCanvas, PapaScene, PapaState, useTableTop } from "./PapaSet";
import { Lens } from "./Cinema";

// « Le vocal de Papa » — séquence de la table du père (montage de référence, voix témoins)
const FPS = 24;
export const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.inOut(Easing.sin);

export const CLOSE_LENS: Lens = { focus: 0.3, aperture: 0.05, maxblur: 0.014, bloom: 0.45, bloomRadius: 0.35, bloomThreshold: 0.9 };
export const WIDE_LENS: Lens = { focus: 1.3, aperture: 0.012, maxblur: 0.01, bloom: 0.5, bloomRadius: 0.4, bloomThreshold: 0.88 };

type ShotProps = { dur: number; cam: (t: number, top: number) => Cam; lens: (t: number) => Lens; state: (t: number) => PapaState };

const ShotInner: React.FC<ShotProps> = ({ dur, cam, lens, state }) => {
  const f = useCurrentFrame();
  const top = useTableTop();
  const t = Math.min(1, f / dur);
  return <PapaScene cam={cam(t, top)} lens={lens(t)} state={state(t)} />;
};

export const Shot: React.FC<ShotProps> = (p) => (
  <PapaCanvas>
    <ShotInner {...p} />
  </PapaCanvas>
);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mic = (t: number, glow = 0.25): PapaState => ({ lines: ["Enregistrement…", `00:0${Math.min(9, Math.floor(t * 4))}`], icon: "mic", glow, vibrate: 0, green: 0 });

export const PAPA_CUT_DURATION = s(28.5);

export const PapaCut: React.FC = () => {
  const { width } = useVideoConfig();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b0604" }}>
      {/* A1 — très gros plan : « Junior… C'est Papa. » */}
      <Sequence name="A1" from={0} durationInFrames={s(3.2)}>
        <Shot
          dur={s(3.2)}
          cam={(t, top) => ({ pos: [lerp(0.17, 0.16, t), top + lerp(0.12, 0.11, t), lerp(0.42, 0.38, ease(t))], look: [0.03, top + 0.035, 0.1], fov: 40 })}
          lens={() => CLOSE_LENS}
          state={(t) => mic(t)}
        />
      </Sequence>
      {/* A2 — la pudeur */}
      <Sequence name="A2" from={s(3.2)} durationInFrames={s(4.2)}>
        <Shot
          dur={s(4.2)}
          cam={(t, top) => ({ pos: [lerp(-0.12, -0.04, ease(t)), top + 0.17, lerp(0.46, 0.43, t)], look: [0.02, top + 0.04, 0.08], fov: 38 })}
          lens={() => ({ ...CLOSE_LENS, focus: 0.38 })}
          state={(t) => mic(t)}
        />
      </Sequence>
      {/* A6 — plan large : « Dieu va faire. » */}
      <Sequence name="A6" from={s(7.4)} durationInFrames={s(4.8)}>
        <Shot
          dur={s(4.8)}
          cam={(t, top) => ({ pos: [lerp(0.05, -0.08, ease(t)), lerp(1.15, 1.1, t), lerp(1.7, 1.55, ease(t))], look: [0.18, top + 0.15, -0.5], fov: 46 })}
          lens={() => WIDE_LENS}
          state={(t) => mic(t, 0.2)}
        />
      </Sequence>
      {/* A9 — le vieux téléphone vibre : l'argent est arrivé */}
      <Sequence name="A9" from={s(12.2)} durationInFrames={s(4.8)}>
        <Shot
          dur={s(4.8)}
          cam={(t, top) => ({ pos: [lerp(0.2, 0.12, ease(t)), top + lerp(0.16, 0.12, ease(t)), lerp(0.46, 0.3, ease(t))], look: [0.05, top + 0.01, 0.15], fov: 38 })}
          lens={(t) => ({ ...CLOSE_LENS, focus: lerp(0.36, 0.2, ease(t)) })}
          state={(t) => {
            const vib = t > 0.08 && t < 0.43 ? 1 : 0;
            const sms = t >= 0.45;
            return { lines: sms ? ["Vous avez reçu", "25 000 FCFA"] : ["", "1 message"], icon: sms ? "none" : "sms", glow: sms ? 0.7 : 0.45, vibrate: vib, green: sms ? 0.22 : 0 };
          }}
        />
      </Sequence>
      {/* A10 — « Mon fils… Je suis fier de toi. » */}
      <Sequence name="A10" from={s(17)} durationInFrames={s(6)}>
        <Shot
          dur={s(6)}
          cam={(t, top) => ({ pos: [lerp(0.32, 0.18, ease(t)), top + lerp(0.22, 0.13, ease(t)), lerp(0.62, 0.4, ease(t))], look: [0.03, top + 0.03, 0.1], fov: 38 })}
          lens={(t) => ({ ...CLOSE_LENS, focus: lerp(0.62, 0.34, ease(t)) })}
          state={(t) => ({ ...mic(t, 0.3), green: 0.12 })}
        />
      </Sequence>
      {/* A11 — maxime et marque */}
      <Sequence name="A11" from={s(23)} durationInFrames={s(5.5)}>
        <Shot
          dur={s(5.5)}
          cam={(t, top) => ({ pos: [lerp(0.55, 0.62, t), lerp(top + 0.45, top + 0.5, t), lerp(0.95, 1.02, t)], look: [0, top + 0.05, -0.1], fov: 38 })}
          lens={() => ({ ...WIDE_LENS, focus: 1.05 })}
          state={() => ({ lines: ["Vous avez reçu", "25 000 FCFA"], icon: "none", glow: 0.4, vibrate: 0, green: 0.1 })}
        />
      </Sequence>

      {/* ── Textes en fragments (calés sur les voix) ── */}
      <Fragment text="JUNIOR…" from={s(0.35)} to={s(1.8)} />
      <Fragment text="C'EST PAPA." from={s(1.9)} to={s(3.15)} />
      <Fragment text="JE N'AIME PAS TE DEMANDER." from={s(3.5)} to={s(5.7)} />
      <Fragment text="TU SAIS ÇA." from={s(5.9)} to={s(7.3)} />
      <Fragment text="SI TU NE PEUX PAS," from={s(7.7)} to={s(9.0)} />
      <Fragment text="CE N'EST PAS GRAVE HEIN." from={s(9.0)} to={s(10.6)} />
      <Fragment text="DIEU VA FAIRE." from={s(10.8)} to={s(12.15)} />
      <Fragment text="VOUS AVEZ REÇU 25 000 FCFA" from={s(14.5)} to={s(16.9)} size={78} color="#d9ffe9" />
      <Fragment text="MON FILS…" from={s(17.6)} to={s(19.6)} />
      <Fragment text="JE SUIS FIER DE TOI." from={s(20.3)} to={s(22.9)} />
      <Fragment text="TU NE CHOISIS PAS LE RÉSEAU DE TON PÈRE." from={s(23.2)} to={s(25.6)} size={80} />
      <Fragment text="TU CHOISIS D'ÊTRE LÀ." from={s(25.7)} to={s(28.4)} size={96} />
      {/* marque */}
      {f >= s(26.6) && (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 260 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 22,
              fontFamily: uiFont,
              opacity: interpolate(f, [s(26.6), s(27.2)], [0, 1], clamp),
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(8,14,12,0.6)", padding: "18px 30px", borderRadius: 30, width: width * 0.62, justifyContent: "center" }}>
              <LogoMark size={74} />
              <Wordmark size={60} dark />
            </div>
            <div style={{ fontSize: 40, fontWeight: 600, color: "#e8fff6", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>Orange ou MTN, ton argent passe.</div>
          </div>
        </AbsoluteFill>
      )}

      {/* ── Son : voix témoins + ambiance ── */}
      <Audio src={staticFile("papa/papa-cut-ambience.wav")} />
      <Sequence from={s(0.35)} layout="none"><Audio src={staticFile("papa/vo/1a.wav")} /></Sequence>
      <Sequence from={s(1.9)} layout="none"><Audio src={staticFile("papa/vo/1b.wav")} /></Sequence>
      <Sequence from={s(3.5)} layout="none"><Audio src={staticFile("papa/vo/2a.wav")} /></Sequence>
      <Sequence from={s(5.9)} layout="none"><Audio src={staticFile("papa/vo/2b.wav")} /></Sequence>
      <Sequence from={s(7.7)} layout="none"><Audio src={staticFile("papa/vo/4a.wav")} /></Sequence>
      <Sequence from={s(10.8)} layout="none"><Audio src={staticFile("papa/vo/4b.wav")} /></Sequence>
      <Sequence from={s(17.6)} layout="none"><Audio src={staticFile("papa/vo/5.wav")} /></Sequence>
      <Sequence from={s(20.3)} layout="none"><Audio src={staticFile("papa/vo/6.wav")} /></Sequence>
    </AbsoluteFill>
  );
};
