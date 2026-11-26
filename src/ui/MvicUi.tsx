import React from "react";
import { mvic, uiFont } from "../brand";

// Reconstructions fidèles des éléments de l'app Mvic (mvic-web), à l'échelle ×2.4
// (une largeur d'app de 390 px ≈ 936 px dans la vidéo).

export const LogoMark: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="8" fill={mvic.g} />
    <circle cx="16" cy="16" r="9" stroke={mvic.ga} strokeWidth="2" />
    <path d="M11 16l3 3 7-7" stroke={mvic.ga} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Wordmark: React.FC<{ size: number; dark?: boolean }> = ({ size, dark }) => (
  <span style={{ fontFamily: "'Helvetica Neue', Helvetica, " + uiFont, fontSize: size, letterSpacing: -0.5 }}>
    <strong style={{ fontWeight: 700, color: dark ? mvic.ga : mvic.g }}>Mvic</strong>
    <span style={{ fontWeight: 300, color: dark ? "white" : mvic.gray800 }}> Money</span>
  </span>
);

export const OperatorBadge: React.FC<{ op: "mtn" | "orange"; size?: number }> = ({ op, size = 48 }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: size * 0.3,
      background: op === "mtn" ? mvic.mtn : mvic.orange,
      color: op === "mtn" ? "black" : "white",
      fontWeight: 700,
      fontSize: size * 0.32,
      flexShrink: 0,
    }}
  >
    {op === "mtn" ? "MTN" : "OM"}
  </span>
);

// Champ numéro (TransferForm : label + boîte bordée gris, badge opérateur détecté)
export const PhoneField: React.FC<{ label: string; value: string; op?: "mtn" | "orange"; focused?: boolean }> = ({
  label,
  value,
  op,
  focused,
}) => (
  <div>
    <div style={{ fontSize: 34, fontWeight: 600, color: mvic.gray600, marginBottom: 14 }}>{label}</div>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        borderRadius: 29,
        border: `4px solid ${focused ? mvic.g : mvic.gray200}`,
        background: mvic.gray50,
        padding: "30px 30px",
        minHeight: 64,
      }}
    >
      {op ? <OperatorBadge op={op} /> : null}
      <span style={{ fontSize: 40, fontWeight: 500, color: value ? mvic.gray800 : mvic.gray400 }}>
        {value || "6 •• •• •• ••"}
      </span>
    </div>
  </div>
);

// Bloc réel sous le destinataire : badge + nom de l'opérateur + nom du titulaire (fond vert pâle)
export const RecipientCheck: React.FC<{ op: "mtn" | "orange"; holder: string }> = ({ op, holder }) => (
  <div style={{ marginTop: 16, borderRadius: 24, background: mvic.gp, padding: "22px 26px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 500, color: mvic.g }}>
      <OperatorBadge op={op} size={42} />
      {op === "mtn" ? "MTN Mobile Money" : "Orange Money"}
    </div>
    <div style={{ marginTop: 10, fontSize: 40, fontWeight: 700, color: mvic.night }}>{holder}</div>
  </div>
);
