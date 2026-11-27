import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { comicFont, mvic, uiFont } from "../brand";
import { LogoMark, OperatorBadge, Wordmark } from "../ui/MvicUi";
import { Dust, Grain, useShake, Vignette, WordCaption } from "./fx";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.33, 0, 0.2, 1);

// Durées des plans (30 i/s)
const S1 = 96; // boutique, hésitation
const S2 = 72; // gros plan concentré
const S3 = 96; // écran Mvic : le nom apparaît
const S4 = 78; // HEIN ?!
const S5 = 75; // L'EX
const S6 = 93; // signature

// ───────── Plan 1 : la boutique, elle hésite ─────────
const Shop: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a140e", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          scale: String(interpolate(f, [0, S1], [1.02, 1.16], { ...clamp, easing: ease })),
          transformOrigin: "52% 44%",
        }}
      >
        <Img src={staticFile("le-nom/style-frame-v1.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {/* lumière froide du téléphone qui palpite */}
        <div
          style={{
            position: "absolute",
            left: "62%",
            top: "60%",
            width: 520,
            height: 520,
            marginLeft: -260,
            marginTop: -260,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(170,220,255,0.55) 0%, rgba(170,220,255,0) 65%)",
            mixBlendMode: "screen",
            opacity: interpolate(Math.sin(f / 5), [-1, 1], [0.55, 0.9]),
          }}
        />
      </AbsoluteFill>
      <Dust />
      <Vignette strength={0.6} />
      <WordCaption
        until={S1 - 2}
        words={[
          { text: "Le", at: 8 },
          { text: "numéro", at: 13 },
          { text: "de", at: 20 },
          { text: "Tonton…", at: 24 },
          { text: "c'était", at: 48 },
          { text: "88…", at: 58 },
          { text: "ou", at: 72 },
          { text: "98 ?", at: 78 },
        ]}
      />
    </AbsoluteFill>
  );
};

// ───────── Plan 2 : gros plan, concentration ─────────
const CloseUp: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a140e", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: "1.35", filter: "blur(28px) brightness(0.8) saturate(1.1)" }}>
        <Img src={staticFile("le-nom/style-frame-v1.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          scale: String(interpolate(f, [0, S2], [1.04, 1.13], { ...clamp, easing: ease })),
          rotate: `${interpolate(Math.sin(f / 14), [-1, 1], [-0.6, 0.6])}deg`,
          transformOrigin: "50% 45%",
        }}
      >
        <Img
          src={staticFile("le-nom/mami-cu-focus.png")}
          style={{ position: "absolute", bottom: 0, left: 0, width: 1080, height: 1922, objectFit: "cover" }}
        />
      </AbsoluteFill>
      {/* lumière du téléphone par en dessous */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to top, rgba(150,205,255,0.35), rgba(150,205,255,0) 45%)",
          mixBlendMode: "screen",
          opacity: interpolate(Math.sin(f / 4), [-1, 1], [0.7, 1]),
        }}
      />
      <Vignette strength={0.5} />
      <WordCaption until={S2} bottom={240} words={[{ text: "Hmm…", at: 10 }, { text: "98.", at: 40 }]} />
    </AbsoluteFill>
  );
};

// ───────── Plan 3 : le vrai écran Mvic, le nom apparaît ─────────
const typed = (t: string, f: number, a: number, b: number) =>
  t.slice(0, Math.round(interpolate(f, [a, b], [0, t.length], clamp)));

const Screen: React.FC = () => {
  const f = useCurrentFrame();
  const number = typed("6 95 88 •• ••", f, 4, 34);
  const op = f >= 40;
  const holder = f >= 52;
  return (
    <AbsoluteFill style={{ backgroundColor: "#1d0f0a", overflow: "hidden" }}>
      <AbsoluteFill style={{ scale: "1.4", filter: "blur(36px) brightness(0.45)" }}>
        <Img src={staticFile("le-nom/style-frame-v1.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          scale: String(interpolate(f, [0, 56, S3], [1, 1.04, 1.32], { ...clamp, easing: ease })),
          transformOrigin: "50% 62%",
        }}
      >
        {/* téléphone */}
        <div
          style={{
            width: 860,
            height: 1500,
            borderRadius: 110,
            background: "#111",
            padding: 26,
            boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 80px rgba(150,205,255,0.25)",
          }}
        >
          <div style={{ width: "100%", height: "100%", borderRadius: 86, background: mvic.gray50, padding: "90px 50px", fontFamily: uiFont, color: mvic.gray800 }}>
            <div style={{ textAlign: "center", fontSize: 40, fontWeight: 600 }}>Mvic Money — Envoyer de l'argent</div>
            <div style={{ marginTop: 40, background: "white", borderRadius: 44, border: `2px solid ${mvic.gray100}`, padding: 40 }}>
              <div style={{ textAlign: "center", fontSize: 26, fontWeight: 600, letterSpacing: 3, color: mvic.gray400 }}>MONTANT À ENVOYER</div>
              <div style={{ textAlign: "center", fontSize: 104, fontWeight: 900, letterSpacing: -3 }}>
                150 000 <span style={{ fontSize: 36, fontWeight: 500, color: mvic.gray400 }}>FCFA</span>
              </div>
              <div style={{ marginTop: 30, fontSize: 30, fontWeight: 600, color: mvic.gray600 }}>Numéro expéditeur</div>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 18, borderRadius: 26, border: `4px solid ${mvic.gray200}`, background: mvic.gray50, padding: "26px 26px" }}>
                <OperatorBadge op="mtn" size={46} />
                <span style={{ fontSize: 40, fontWeight: 500 }}>6 77 •• •• ••</span>
              </div>
              <div style={{ marginTop: 30, fontSize: 30, fontWeight: 600, color: mvic.gray600 }}>Numéro destinataire</div>
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  borderRadius: 26,
                  border: `4px solid ${holder ? mvic.gray200 : mvic.g}`,
                  background: mvic.gray50,
                  padding: "26px 26px",
                }}
              >
                {op ? <OperatorBadge op="orange" size={46} /> : null}
                <span style={{ fontSize: 40, fontWeight: 500 }}>{number}</span>
              </div>
              {/* bloc réel : opérateur + nom officiel du titulaire */}
              <div
                style={{
                  marginTop: 16,
                  borderRadius: 22,
                  background: mvic.gp,
                  padding: "22px 26px",
                  opacity: holder ? 1 : 0,
                  translate: holder ? interpolate(f, [52, 60], ["0px 24px", "0px 0px"], { ...clamp, easing: ease }) : "0px 24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, fontWeight: 500, color: mvic.g }}>
                  <OperatorBadge op="orange" size={38} /> Orange Money
                </div>
                <div style={{ marginTop: 8, fontSize: 44, fontWeight: 700, color: mvic.night }}>NDONGO PAUL ARMAND</div>
              </div>
              <div style={{ marginTop: 34, borderRadius: 26, background: mvic.g, color: "white", textAlign: "center", fontSize: 38, fontWeight: 600, padding: "30px 0" }}>Continuer</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <Vignette strength={0.6} />
    </AbsoluteFill>
  );
};

// ───────── Plan 4 : HEIN ?! ─────────
const Hein: React.FC = () => {
  const f = useCurrentFrame();
  const shake = useShake(4, 40, 46);
  return (
    <AbsoluteFill style={{ backgroundColor: "#7a0f0f", overflow: "hidden" }}>
      {/* fond d'alerte rouge avec traits de vitesse */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #ff4a3d 0%, #b3140f 45%, #4a0505 100%)" }} />

      <AbsoluteFill
        style={{
          translate: shake,
          scale: String(interpolate(f, [0, 4, 60], [1.0, 1.55, 1.62], { ...clamp, easing: ease })),
          transformOrigin: "52% 50%",
        }}
      >
        <Img src={staticFile("le-nom/mami-cu-focus.png")} style={{ position: "absolute", bottom: 0, left: 0, width: 1080, height: 1922 }} />
      </AbsoluteFill>
      {/* teinte d'alerte rouge sur l'image */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, rgba(255,90,60,0.15) 0%, rgba(200,20,15,0.55) 55%, rgba(60,0,0,0.85) 100%)", mixBlendMode: "multiply" }} />
      <AbsoluteFill style={{ rotate: `${f * 1.5}deg`, opacity: 0.45, mixBlendMode: "screen" }}>
        <svg width="100%" height="100%" viewBox="-540 -960 1080 1920">
          {new Array(36).fill(0).map((_, i) => {
            const a = (i / 36) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 260} y1={Math.sin(a) * 260} x2={Math.cos(a) * 1500} y2={Math.sin(a) * 1500} stroke="#ffd34d" strokeWidth={i % 2 ? 6 : 14} />;
          })}
        </svg>
      </AbsoluteFill>
      {/* flash blanc d'impact */}
      <AbsoluteFill style={{ background: "white", opacity: interpolate(f, [0, 2, 6], [1, 0.8, 0], clamp) }} />
      <div
        style={{
          position: "absolute",
          top: 150,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontFamily: comicFont,
          fontSize: 330,
          lineHeight: 1,
          color: "#FFD34D",
          WebkitTextStroke: "10px #2a0505",
          textShadow: "14px 14px 0 #2a0505",
          rotate: "-7deg",
          translate: shake,
          scale: String(interpolate(f, [2, 9], [2.6, 1], { ...clamp, easing: Easing.bezier(0.2, 1.5, 0.4, 1) })),
          opacity: f >= 2 ? 1 : 0,
        }}
      >
        HEIN ?!
      </div>
      <WordCaption until={S4} bottom={230} words={[{ text: "C'est", at: 34 }, { text: "Ndongo", at: 40 }, { text: "ça !", at: 50 }]} />
      <Vignette strength={0.4} />
    </AbsoluteFill>
  );
};

// ───────── Plan 5 : L'EX (tampon) ─────────
const Ex: React.FC = () => {
  const f = useCurrentFrame();
  const shake = useShake(10, 22, 24);
  return (
    <AbsoluteFill style={{ backgroundColor: "#F3E3C8", justifyContent: "center", alignItems: "center", fontFamily: uiFont, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.6), rgba(160,100,50,0.25))" }} />
      <div style={{ translate: shake, textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 600, color: mvic.gray600, letterSpacing: 3 }}>TITULAIRE DU COMPTE</div>
        <div style={{ marginTop: 18, background: mvic.gp, borderRadius: 30, padding: "34px 44px", fontSize: 66, fontWeight: 800, color: mvic.night }}>
          NDONGO PAUL ARMAND
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: 1050,
          fontFamily: comicFont,
          fontSize: 230,
          color: "#C0392B",
          border: "14px solid #C0392B",
          borderRadius: 30,
          padding: "0 50px",
          rotate: "-12deg",
          opacity: f >= 10 ? 0.92 : 0,
          scale: String(interpolate(f, [10, 15], [3, 1], { ...clamp, easing: Easing.bezier(0.3, 1.3, 0.5, 1) })),
          mixBlendMode: "multiply",
        }}
      >
        L'EX
      </div>
      <WordCaption
        boxed
        until={S5}
        bottom={260}
        words={[
          { text: "Celui-là", at: 22 },
          { text: "ne", at: 30 },
          { text: "va", at: 33 },
          { text: "pas", at: 36 },
          { text: "toucher", at: 40 },
          { text: "un", at: 47 },
          { text: "franc !", at: 50 },
        ]}
      />
      <Grain opacity={0.12} />
    </AbsoluteFill>
  );
};

// ───────── Plan 6 : signature ─────────
const End: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: mvic.night, justifyContent: "center", alignItems: "center", fontFamily: uiFont }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${mvic.g} 0%, #0d3b31 55%, ${mvic.night} 100%)`, opacity: interpolate(f, [0, 20], [0, 1], clamp) }} />
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 30, opacity: interpolate(f, [4, 16], [0, 1], clamp), scale: String(interpolate(f, [4, 24], [0.85, 1], { ...clamp, easing: ease })) }}>
        <LogoMark size={140} />
        <Wordmark size={104} dark />
      </div>
      <div style={{ position: "relative", marginTop: 70, fontSize: 60, fontWeight: 700, color: "white", textAlign: "center", opacity: interpolate(f, [22, 34], [0, 1], clamp) }}>
        Tu vois le nom
        <br />
        avant d'envoyer.
      </div>
      <div style={{ position: "relative", marginTop: 80, fontSize: 44, fontWeight: 600, color: "white", opacity: interpolate(f, [44, 56], [0, 1], clamp) }}>
        Tape <span style={{ background: mvic.ga, color: mvic.night, padding: "4px 16px", borderRadius: 12 }}>Mvic Money</span> sur Google
      </div>
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};

export const SceneTestDuration = S1 + S2 + S3 + S4 + S5 + S6;

export const LeNomSceneTest: React.FC = () => {
  let t = 0;
  const at = (d: number) => {
    const from = t;
    t += d;
    return from;
  };
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <Sequence name="1. Boutique" from={at(S1)} durationInFrames={S1}><Shop /></Sequence>
      <Sequence name="2. Gros plan" from={at(S2)} durationInFrames={S2}><CloseUp /></Sequence>
      <Sequence name="3. Écran : le nom" from={at(S3)} durationInFrames={S3}><Screen /></Sequence>
      <Sequence name="4. HEIN" from={at(S4)} durationInFrames={S4}><Hein /></Sequence>
      <Sequence name="5. L'EX" from={at(S5)} durationInFrames={S5}><Ex /></Sequence>
      <Sequence name="6. Signature" from={at(S6)} durationInFrames={S6}><End /></Sequence>
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
};
