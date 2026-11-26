import React from "react";
import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { comicFont, mvic, uiFont } from "../brand";
import { LogoMark, PhoneField, RecipientCheck, Wordmark } from "../ui/MvicUi";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Tape un texte caractère par caractère entre deux frames
const typed = (text: string, frame: number, start: number, end: number) =>
  text.slice(0, Math.round(interpolate(frame, [start, end], [0, text.length], clamp)));

// Carte blanche de l'app (TransferForm / StatusScreen : bord gray-100, ombre douce, rayon 18-24)
const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: "white",
      border: `2px solid ${mvic.gray100}`,
      borderRadius: 56,
      boxShadow: "0 10px 58px rgba(15,25,35,0.08)",
      padding: 44,
      ...style,
    }}
  >
    {children}
  </div>
);

// ───────────────────────── Scène 1 : le problème (hook) ─────────────────────────
const HookInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      <Interactive.Div
        name="Bulle maman"
        style={{
          position: "absolute",
          top: 230,
          left: 70,
          maxWidth: 720,
          background: "white",
          color: mvic.night,
          fontFamily: uiFont,
          fontSize: 50,
          fontWeight: 600,
          lineHeight: 1.25,
          padding: "34px 40px",
          borderRadius: "48px 48px 48px 12px",
          scale: interpolate(frame, [0.1 * fps, 0.5 * fps], [0.6, 1], { ...clamp, easing: Easing.spring({ damping: 12 }), output: "perceptual-scale" }),
          opacity: interpolate(frame, [0.1 * fps, 0.3 * fps], [0, 1], clamp),
        }}
      >
        Mon fils, l'hôpital demande 25 000 avant ce soir…
      </Interactive.Div>
      <Interactive.Div
        name="Bulle fils"
        style={{
          position: "absolute",
          top: 640,
          right: 70,
          maxWidth: 700,
          background: mvic.ga,
          color: mvic.night,
          fontFamily: uiFont,
          fontSize: 50,
          fontWeight: 600,
          lineHeight: 1.25,
          padding: "34px 40px",
          borderRadius: "48px 48px 12px 48px",
          scale: interpolate(frame, [1.3 * fps, 1.7 * fps], [0.6, 1], { ...clamp, easing: Easing.spring({ damping: 12 }), output: "perceptual-scale" }),
          opacity: interpolate(frame, [1.3 * fps, 1.5 * fps], [0, 1], clamp),
        }}
      >
        Maman, toi tu es Orange… moi je suis MTN !
      </Interactive.Div>
      <Interactive.Div
        name="Onomatopée EKIEU"
        style={{
          position: "absolute",
          top: 1060,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontFamily: comicFont,
          fontSize: 260,
          color: mvic.gold,
          letterSpacing: 4,
          textShadow: `8px 8px 0 ${mvic.night}`,
          rotate: "-6deg",
          scale: interpolate(frame, [2.2 * fps, 2.5 * fps], [2.4, 1], { ...clamp, easing: Easing.bezier(0.2, 1.4, 0.4, 1), output: "perceptual-scale" }),
          opacity: interpolate(frame, [2.2 * fps, 2.3 * fps], [0, 1], clamp),
        }}
      >
        EKIEU !
      </Interactive.Div>
    </>
  );
};
export const Hook = Interactive.create({ Component: HookInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// ───────────────────────── Scène 2 : le vrai formulaire Mvic ─────────────────────────
const FormInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const amount = typed("25 000", frame, 0.3 * fps, 0.9 * fps);
  const sender = typed("6 77 12 34 56", frame, 1.1 * fps, 1.8 * fps);
  const recipient = typed("6 95 88 90 12", frame, 2.0 * fps, 2.7 * fps);
  const senderDone = frame > 1.8 * fps;
  const recipientDone = frame > 2.8 * fps;
  return (
    <AbsoluteFill style={{ fontFamily: uiFont, color: mvic.gray800, padding: "120px 60px 0" }}>
      <div style={{ textAlign: "center", fontSize: 54, fontWeight: 600, letterSpacing: -1, marginBottom: 44, color: "white" }}>
        Mvic Money — Envoyer de l'argent
      </div>
      <Card>
        <div style={{ textAlign: "center", fontSize: 30, fontWeight: 600, letterSpacing: 3, color: mvic.gray400, textTransform: "uppercase" }}>
          Montant à envoyer
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16, marginTop: 10 }}>
          <span style={{ fontSize: 124, fontWeight: 900, letterSpacing: -3, color: amount ? mvic.gray800 : mvic.gray200 }}>{amount || "0"}</span>
          <span style={{ fontSize: 40, fontWeight: 500, color: mvic.gray400 }}>FCFA</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 34, marginTop: 40 }}>
          <PhoneField label="Numéro expéditeur" value={sender} op={senderDone ? "mtn" : undefined} focused={frame > 1.0 * fps && !senderDone} />
          <div>
            <PhoneField label="Numéro destinataire" value={recipient} op={recipientDone ? "orange" : undefined} focused={frame > 1.9 * fps && !recipientDone} />
            {recipientDone ? <RecipientCheck op="orange" holder="Mama Florence N." /> : null}
          </div>
        </div>
        <Interactive.Div
          name="Bouton Continuer"
          style={{
            marginTop: 40,
            borderRadius: 29,
            background: mvic.g,
            color: "white",
            textAlign: "center",
            fontSize: 42,
            fontWeight: 600,
            padding: "36px 0",
            scale: interpolate(frame, [3.3 * fps, 3.4 * fps, 3.6 * fps], [1, 0.94, 1], { ...clamp, output: "perceptual-scale" }),
          }}
        >
          Continuer
        </Interactive.Div>
      </Card>
      <Interactive.Div
        name="Légende détection"
        style={{
          position: "absolute",
          bottom: 90,
          left: 60,
          right: 60,
          textAlign: "center",
          fontSize: 46,
          fontWeight: 700,
          color: "white",
          opacity: interpolate(frame, [2.9 * fps, 3.1 * fps], [0, 1], clamp),
        }}
      >
        <span style={{ background: mvic.ga, color: mvic.night, padding: "6px 18px", borderRadius: 12 }}>L'opérateur est détecté tout seul</span>
      </Interactive.Div>
    </AbsoluteFill>
  );
};
export const FormScene = Interactive.create({ Component: FormInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// ───────────────────────── Scène 3 : validation sur son téléphone ─────────────────────────
const ValidateInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: uiFont, justifyContent: "center", padding: "0 60px" }}>
      <Card style={{ textAlign: "center", padding: 64 }}>
        <div style={{ fontSize: 46, fontWeight: 600, color: mvic.gray800 }}>Transfert en cours</div>
        <div style={{ marginTop: 14, fontSize: 34, color: mvic.gray400, lineHeight: 1.4 }}>
          Ne fermez pas cette page, cela prend quelques secondes.
        </div>
        <div style={{ marginTop: 44, borderRadius: 29, background: "linear-gradient(135deg,#FFF8E8,#FFF0CE)", padding: "44px 30px", color: "#9A6500" }}>
          <div
            style={{
              margin: "0 auto 26px",
              width: 86,
              height: 116,
              borderRadius: 24,
              border: `6px solid ${mvic.gold}`,
              background: "white",
              scale: String(interpolate(frame % fps, [0, fps / 2, fps], [1, 1.08, 1])),
            }}
          />
          <div style={{ fontSize: 40, fontWeight: 700 }}>Validez sur votre téléphone</div>
          <div style={{ marginTop: 10, fontSize: 30 }}>Demande de paiement · MTN Mobile Money</div>
        </div>
      </Card>
      <Interactive.Div
        name="Légende PIN"
        style={{
          position: "absolute",
          bottom: 150,
          left: 60,
          right: 60,
          textAlign: "center",
          fontSize: 46,
          fontWeight: 700,
          color: "white",
          opacity: interpolate(frame, [0.6 * fps, 0.8 * fps], [0, 1], clamp),
        }}
      >
        Tu tapes ton code. Toi seul.
      </Interactive.Div>
    </AbsoluteFill>
  );
};
export const ValidateScene = Interactive.create({ Component: ValidateInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// ───────────────────────── Scène 4 : l'argent arrive ─────────────────────────
const ArrivalInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ fontFamily: uiFont }}>
      <Interactive.Div
        name="SMS de réception"
        style={{
          position: "absolute",
          top: 150,
          left: 50,
          right: 50,
          background: "rgba(255,255,255,0.97)",
          borderRadius: 44,
          padding: "34px 40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          color: mvic.night,
          translate: interpolate(frame, [0, 0.35 * fps], ["0px -420px", "0px 0px"], { ...clamp, easing: Easing.spring({ damping: 14 }) }),
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, color: mvic.gray400, fontWeight: 600 }}>
          <span>Orange Money · SMS</span>
          <span>maintenant</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 44, fontWeight: 700 }}>Vous avez reçu 25 000 FCFA.</div>
      </Interactive.Div>
      <Interactive.Div
        name="Carte transfert terminé"
        style={{
          position: "absolute",
          top: 560,
          left: 60,
          right: 60,
          background: "white",
          borderRadius: 56,
          padding: 64,
          textAlign: "center",
          scale: interpolate(frame, [0.6 * fps, 1.0 * fps], [0.7, 1], { ...clamp, easing: Easing.spring({ damping: 12 }), output: "perceptual-scale" }),
          opacity: interpolate(frame, [0.6 * fps, 0.75 * fps], [0, 1], clamp),
        }}
      >
        <div style={{ margin: "0 auto 30px", width: 170, height: 170, borderRadius: 999, background: mvic.gp, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, color: mvic.g, fontWeight: 700 }}>
          ✓
        </div>
        <div style={{ fontSize: 50, fontWeight: 600, color: mvic.gray800 }}>Transfert terminé</div>
        <div style={{ marginTop: 14, fontSize: 34, color: mvic.gray400 }}>Votre argent a été envoyé avec succès.</div>
      </Interactive.Div>
      <Interactive.Div
        name="Onomatopée ÇA A ATTERRI"
        style={{
          position: "absolute",
          top: 1310,
          left: 0,
          width: "100%",
          textAlign: "center",
          fontFamily: comicFont,
          fontSize: 190,
          lineHeight: 1,
          color: "white",
          textShadow: `8px 8px 0 ${mvic.night}`,
          rotate: "-4deg",
          scale: interpolate(frame, [1.2 * fps, 1.5 * fps], [2.2, 1], { ...clamp, easing: Easing.bezier(0.2, 1.4, 0.4, 1), output: "perceptual-scale" }),
          opacity: interpolate(frame, [1.2 * fps, 1.3 * fps], [0, 1], clamp),
        }}
      >
        ÇA A ATTERRI !
      </Interactive.Div>
    </AbsoluteFill>
  );
};
export const ArrivalScene = Interactive.create({ Component: ArrivalInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });

// ───────────────────────── Scène 5 : signature ─────────────────────────
const EndInner: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: uiFont }}>
      <Interactive.Div
        name="Logo"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 34,
          scale: interpolate(frame, [0, 0.5 * fps], [0.8, 1], { ...clamp, easing: Easing.spring({ damping: 200 }), output: "perceptual-scale" }),
          opacity: interpolate(frame, [0, 0.3 * fps], [0, 1], clamp),
        }}
      >
        <LogoMark size={150} />
        <Wordmark size={112} dark />
      </Interactive.Div>
      <Interactive.Div
        name="Appel à l'action"
        style={{
          marginTop: 90,
          fontSize: 52,
          fontWeight: 600,
          color: "white",
          textAlign: "center",
          lineHeight: 1.35,
          opacity: interpolate(frame, [0.6 * fps, 0.9 * fps], [0, 1], clamp),
          translate: interpolate(frame, [0.6 * fps, 0.9 * fps], ["0px 30px", "0px 0px"], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }),
        }}
      >
        Tape <span style={{ background: mvic.ga, color: mvic.night, padding: "4px 16px", borderRadius: 12 }}>Mvic Money</span> sur Google
      </Interactive.Div>
    </AbsoluteFill>
  );
};
export const EndCard = Interactive.create({ Component: EndInner, layout: "absolute-fill", schema: { ...Interactive.backgroundSchema } });
