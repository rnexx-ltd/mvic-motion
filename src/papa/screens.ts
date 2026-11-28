// Écrans du smartphone dessinés en haute définition (texture du téléphone 3D).
// Messagerie générique (aucun code visuel d'une marque réelle) et parcours Mvic fidèle à l'app.
const G = "#1A6B5A";
const GA = "#4FC9A8";
const GP = "#E8F5F1";
const NIGHT = "#0F1923";
const GRAY = "#75726B";

const rr = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
};

const statusBar = (c: CanvasRenderingContext2D, w: number, dark: boolean, battery = 34, time = "23:12") => {
  c.fillStyle = dark ? "#e8e8e8" : NIGHT;
  c.font = "600 38px 'DM Sans'";
  c.textAlign = "left";
  c.fillText(time, 60, 70);
  c.textAlign = "right";
  c.fillText(`${battery} %`, w - 60, 70);
};

// 1) Messagerie : notes vocales de « Papa »
export const drawVoiceNotes = (c: CanvasRenderingContext2D, w: number, h: number, t: number, opts: { labels: boolean }) => {
  c.fillStyle = "#14181d";
  c.fillRect(0, 0, w, h);
  statusBar(c, w, true);
  c.fillStyle = "#1f252c";
  c.fillRect(0, 100, w, 150);
  c.fillStyle = "#8a6a4e";
  c.beginPath();
  c.arc(110, 175, 46, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#f2efe8";
  c.font = "700 50px 'DM Sans'";
  c.textAlign = "left";
  c.fillText("Papa", 180, 168);
  c.fillStyle = "#9aa3ad";
  c.font = "400 32px 'DM Sans'";
  c.fillText(opts.labels ? "Orange" : "en ligne", 180, 212);
  // trois notes vocales
  for (let i = 0; i < 3; i++) {
    const y = 380 + i * 230;
    c.fillStyle = "#2a3138";
    rr(c, 60, y, w - 260, 150, 40);
    c.fill();
    c.fillStyle = "#e9e4da";
    c.beginPath();
    c.moveTo(120, y + 50);
    c.lineTo(120, y + 100);
    c.lineTo(160, y + 75);
    c.fill();
    for (let b = 0; b < 26; b++) {
      const amp = 12 + 30 * Math.abs(Math.sin(b * 1.7 + i * 2));
      const played = i === 2 && b / 26 < (t % 1);
      c.fillStyle = played ? GA : "#8d959e";
      c.fillRect(200 + b * 22, y + 75 - amp / 2, 12, amp);
    }
    c.fillStyle = "#9aa3ad";
    c.font = "400 28px 'DM Sans'";
    c.fillText(["0:07", "0:09", "0:05"][i], w - 330, y + 135);
  }
  if (opts.labels) {
    c.fillStyle = "#9aa3ad";
    c.font = "500 34px 'DM Sans'";
    c.textAlign = "center";
    c.fillText("Vous · MTN", w / 2, h - 180);
  }
};

// 2) Batterie faible
export const drawBattery = (c: CanvasRenderingContext2D, w: number, h: number) => {
  c.fillStyle = "#0b0d10";
  c.fillRect(0, 0, w, h);
  statusBar(c, w, true, 9, "23:14");
  c.strokeStyle = "#e74c3c";
  c.lineWidth = 16;
  rr(c, w / 2 - 170, h / 2 - 90, 320, 180, 28);
  c.stroke();
  c.fillStyle = "#e74c3c";
  c.fillRect(w / 2 + 158, h / 2 - 40, 24, 80);
  c.fillRect(w / 2 - 150, h / 2 - 70, 32, 140);
  c.font = "800 120px 'DM Sans'";
  c.textAlign = "center";
  c.fillText("9 %", w / 2, h / 2 + 300);
};

// 3) Parcours Mvic (step 0 → 4), fidèle aux écrans de l'app
export const drawMvic = (c: CanvasRenderingContext2D, w: number, h: number, step: number, k: number) => {
  c.fillStyle = "#F9F9F8";
  c.fillRect(0, 0, w, h);
  statusBar(c, w, false);
  c.textAlign = "center";
  c.fillStyle = "#2C2A26";
  c.font = "600 46px 'DM Sans'";
  c.fillText(step < 3 ? "Mvic Money — Envoyer de l'argent" : step === 3 ? "Confirmer le transfert" : "Transfert en cours", w / 2, 190);
  const card = (y: number, hh: number) => {
    c.fillStyle = "#ffffff";
    rr(c, 50, y, w - 100, hh, 44);
    c.fill();
    c.strokeStyle = "#F0EFEC";
    c.lineWidth = 3;
    c.stroke();
  };
  const field = (y: number, label: string, value: string, op: string | null, focus: boolean) => {
    c.textAlign = "left";
    c.fillStyle = "#6B6760";
    c.font = "600 34px 'DM Sans'";
    c.fillText(label, 100, y);
    c.fillStyle = "#F9F9F8";
    rr(c, 90, y + 20, w - 180, 110, 28);
    c.fill();
    c.strokeStyle = focus ? G : "#E2E0DB";
    c.lineWidth = 5;
    c.stroke();
    let x = 130;
    if (op) {
      // pastille d'opérateur neutre (pas de couleur de marque)
      c.fillStyle = "#E2E0DB";
      rr(c, x, y + 45, 140, 60, 18);
      c.fill();
      c.fillStyle = NIGHT;
      c.font = "700 30px 'DM Sans'";
      c.textAlign = "center";
      c.fillText(op, x + 70, y + 86);
      x += 165;
    }
    c.textAlign = "left";
    c.fillStyle = "#2C2A26";
    c.font = "500 44px 'DM Sans'";
    c.fillText(value, x, y + 92);
  };
  if (step <= 2) {
    card(240, 1150);
    c.textAlign = "center";
    c.fillStyle = GRAY;
    c.font = "600 30px 'DM Sans'";
    c.fillText("MONTANT À ENVOYER", w / 2, 320);
    const amount = step === 0 ? "25 000".slice(0, Math.max(1, Math.round(k * 6))) : "25 000";
    c.fillStyle = "#2C2A26";
    c.font = "900 130px 'DM Sans'";
    c.fillText(amount, w / 2 - 40, 460);
    c.fillStyle = GRAY;
    c.font = "500 44px 'DM Sans'";
    c.fillText("FCFA", w / 2 + 250, 460);
    const send = step >= 1 ? "6 77 •• •• ••" : "";
    field(560, "Numéro expéditeur", send, step >= 1 ? "MTN" : null, step === 1);
    const rec = step >= 2 ? "6 95 •• •• ••" : "";
    field(760, "Numéro destinataire", rec, step >= 2 ? "Orange" : null, step === 2 && k < 0.5);
    if (step === 2 && k >= 0.45) {
      c.fillStyle = GP;
      rr(c, 90, 920, w - 180, 170, 26);
      c.fill();
      c.textAlign = "left";
      c.fillStyle = G;
      c.font = "500 32px 'DM Sans'";
      c.fillText("Orange Money", 130, 975);
      c.fillStyle = NIGHT;
      c.font = "700 46px 'DM Sans'";
      c.fillText("ATANGANA PIERRE", 130, 1045);
    }
    c.fillStyle = G;
    rr(c, 90, 1180, w - 180, 130, 30);
    c.fill();
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.font = "600 46px 'DM Sans'";
    c.fillText("Continuer", w / 2, 1262);
  } else if (step === 3) {
    card(240, 900);
    c.fillStyle = GRAY;
    c.font = "600 30px 'DM Sans'";
    c.fillText("VOUS ENVOYEZ", w / 2, 330);
    c.fillStyle = "#2C2A26";
    c.font = "900 120px 'DM Sans'";
    c.fillText("25 000 FCFA", w / 2, 470);
    c.textAlign = "left";
    c.fillStyle = GRAY;
    c.font = "600 30px 'DM Sans'";
    c.fillText("EXPÉDITEUR", 110, 600);
    c.fillText("DESTINATAIRE", w / 2 + 40, 600);
    c.fillStyle = "#2C2A26";
    c.font = "600 42px 'DM Sans'";
    c.fillText("Vous", 110, 660);
    c.fillText("ATANGANA P.", w / 2 + 40, 660);
    c.fillStyle = GRAY;
    c.font = "500 32px 'DM Sans'";
    c.fillText("MTN Mobile Money → Orange Money", 110, 760);
    c.fillStyle = G;
    rr(c, 90, 1180, w - 180, 130, 30);
    c.fill();
    c.fillStyle = "#fff";
    c.textAlign = "center";
    c.font = "600 42px 'DM Sans'";
    c.fillText("Confirmer et payer", w / 2, 1262);
  } else {
    card(240, 900);
    c.fillStyle = "#2C2A26";
    c.font = "600 46px 'DM Sans'";
    c.fillText("Transfert en cours", w / 2, 360);
    c.fillStyle = GRAY;
    c.font = "400 32px 'DM Sans'";
    c.fillText("Ne fermez pas cette page.", w / 2, 420);
    c.fillStyle = "#FFF4DA";
    rr(c, 90, 500, w - 180, 520, 34);
    c.fill();
    c.strokeStyle = "#F5A623";
    c.lineWidth = 10;
    rr(c, w / 2 - 60, 560, 120, 170, 26);
    c.stroke();
    c.fillStyle = "#9A6500";
    c.font = "700 46px 'DM Sans'";
    c.fillText("Validez sur votre téléphone", w / 2, 820);
    // code PIN masqué qui se remplit
    for (let d = 0; d < 4; d++) {
      c.fillStyle = d < Math.floor(k * 5) ? "#9A6500" : "#e9d6a8";
      c.beginPath();
      c.arc(w / 2 - 120 + d * 80, 920, 22, 0, Math.PI * 2);
      c.fill();
    }
  }
};
