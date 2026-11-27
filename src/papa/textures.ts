import * as THREE from "three";
import { random } from "remotion";

// Textures peintes générées par le code (aucune image externe) — mises en cache.
const cache = new Map<string, THREE.CanvasTexture>();

const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void, repeat?: [number, number]) => {
  const hit = cache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  draw(c, w, h);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  if (repeat) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  cache.set(key, tex);
  return tex;
};

const r = (k: string) => random(k);

// Bois de table usé : veines, nœuds, rayures, taches
export const woodTexture = () =>
  make("wood", 1024, 1024, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#6b3f22");
    g.addColorStop(1, "#5a3219");
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
    // planches
    for (let p = 0; p < 4; p++) {
      const y0 = (p * h) / 4;
      c.fillStyle = `rgba(${40 + r(`pb${p}`) * 30},${20 + r(`pc${p}`) * 15},10,${0.15 + r(`pa${p}`) * 0.15})`;
      c.fillRect(0, y0, w, h / 4);
      c.fillStyle = "rgba(20,8,2,0.7)";
      c.fillRect(0, y0, w, 3);
    }
    // veines
    for (let i = 0; i < 420; i++) {
      const y = r(`vy${i}`) * h;
      c.strokeStyle = `rgba(${r(`vl${i}`) > 0.5 ? "30,12,4" : "170,115,70"},${0.14 + r(`vo${i}`) * 0.26})`;
      c.lineWidth = 0.6 + r(`vw${i}`) * 1.8;
      c.beginPath();
      c.moveTo(0, y);
      for (let x = 0; x <= w; x += 32) c.lineTo(x, y + Math.sin(x / (60 + r(`vf${i}`) * 80) + i) * (2 + r(`va${i}`) * 5));
      c.stroke();
    }
    // nœuds
    for (let k = 0; k < 6; k++) {
      const x = r(`kx${k}`) * w;
      const y = r(`ky${k}`) * h;
      for (let ring = 0; ring < 7; ring++) {
        c.strokeStyle = `rgba(30,12,4,${0.35 - ring * 0.04})`;
        c.lineWidth = 1.5;
        c.beginPath();
        c.ellipse(x, y, 6 + ring * 5, 3 + ring * 2.2, 0, 0, Math.PI * 2);
        c.stroke();
      }
    }
    // rayures et usure
    for (let s = 0; s < 90; s++) {
      c.strokeStyle = `rgba(200,150,100,${0.06 + r(`so${s}`) * 0.12})`;
      c.lineWidth = 0.7;
      const x = r(`sx${s}`) * w;
      const y = r(`sy${s}`) * h;
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (r(`sl${s}`) - 0.5) * 120, y + (r(`sm${s}`) - 0.5) * 30);
      c.stroke();
    }
    // tache de tasse
    c.strokeStyle = "rgba(30,12,4,0.35)";
    c.lineWidth = 5;
    c.beginPath();
    c.arc(w * 0.68, h * 0.42, 70, 0.3, Math.PI * 1.7);
    c.stroke();
  });

// Mur en terre / crépi : ocre, taches, fissures
export const mudWallTexture = () =>
  make(
    "mud",
    1024,
    1024,
    (c, w, h) => {
      c.fillStyle = "#7d5032";
      c.fillRect(0, 0, w, h);
      // grandes zones d'humidité, très douces
      for (let i = 0; i < 26; i++) {
        const x = r(`mx${i}`) * w;
        const y = r(`my${i}`) * h;
        const rad = 120 + r(`mr${i}`) * 260;
        const g = c.createRadialGradient(x, y, 0, x, y, rad);
        const dark = r(`mc${i}`) > 0.5;
        g.addColorStop(0, dark ? "rgba(50,28,14,0.22)" : "rgba(150,100,60,0.18)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        c.fillStyle = g;
        c.fillRect(0, 0, w, h);
      }
      // grain de la terre
      for (let i = 0; i < 9000; i++) {
        c.fillStyle = `rgba(${r(`gc${i}`) > 0.5 ? "30,15,6" : "170,120,80"},${0.06 + r(`go${i}`) * 0.1})`;
        c.fillRect(r(`gx${i}`) * w, r(`gy${i}`) * h, 1 + r(`gw${i}`) * 2, 1 + r(`gh${i}`) * 2);
      }
      // traces de truelle horizontales
      for (let i = 0; i < 40; i++) {
        c.strokeStyle = `rgba(40,22,10,${0.05 + r(`tr${i}`) * 0.08})`;
        c.lineWidth = 6 + r(`tw${i}`) * 14;
        const y = r(`ty${i}`) * h;
        c.beginPath();
        c.moveTo(r(`tx${i}`) * w, y);
        c.quadraticCurveTo(r(`tq${i}`) * w, y + 10, r(`tz${i}`) * w, y + 4);
        c.stroke();
      }
      for (let f = 0; f < 14; f++) {
        c.strokeStyle = "rgba(40,20,10,0.45)";
        c.lineWidth = 1.2;
        let x = r(`fx${f}`) * w;
        let y = r(`fy${f}`) * h;
        c.beginPath();
        c.moveTo(x, y);
        for (let s = 0; s < 8; s++) {
          x += (r(`fdx${f}${s}`) - 0.5) * 60;
          y += r(`fdy${f}${s}`) * 40;
          c.lineTo(x, y);
        }
        c.stroke();
      }
    },
    [2, 2]
  );

// Émail blanc à liseré bleu, petits éclats
export const enamelTexture = () =>
  make("enamel", 512, 256, (c, w, h) => {
    c.fillStyle = "#efeae0";
    c.fillRect(0, 0, w, h);
    c.fillStyle = "#1f4e8c";
    c.fillRect(0, 0, w, 14);
    for (let i = 0; i < 7; i++) {
      c.fillStyle = "#1b1b1b";
      c.beginPath();
      c.ellipse(r(`ex${i}`) * w, 20 + r(`ey${i}`) * (h - 40), 3 + r(`er${i}`) * 7, 2 + r(`es${i}`) * 5, 0, 0, Math.PI * 2);
      c.fill();
    }
    // motif de fleurs bleues
    for (let i = 0; i < 4; i++) {
      const x = 60 + i * 120;
      for (let p = 0; p < 5; p++) {
        c.fillStyle = "#3a6db0";
        c.beginPath();
        c.ellipse(x + Math.cos((p / 5) * Math.PI * 2) * 12, 130 + Math.sin((p / 5) * Math.PI * 2) * 12, 9, 5, (p / 5) * Math.PI * 2, 0, Math.PI * 2);
        c.fill();
      }
    }
  });

// Couverture de Bible en cuir usé
export const leatherTexture = () =>
  make("leather", 512, 512, (c, w, h) => {
    c.fillStyle = "#3b1f14";
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      c.fillStyle = `rgba(${r(`lc${i}`) > 0.5 ? "90,55,35" : "20,10,6"},${0.05 + r(`lo${i}`) * 0.15})`;
      c.fillRect(r(`lx${i}`) * w, r(`ly${i}`) * h, 2 + r(`lw${i}`) * 6, 2 + r(`lh${i}`) * 6);
    }
    c.strokeStyle = "rgba(190,150,80,0.85)";
    c.lineWidth = 10;
    c.beginPath();
    c.moveTo(w / 2, h * 0.25);
    c.lineTo(w / 2, h * 0.7);
    c.moveTo(w * 0.36, h * 0.38);
    c.lineTo(w * 0.64, h * 0.38);
    c.stroke();
  });

// Tissu de pagne (draps du fils)
export const fabricTexture = () =>
  make(
    "fabric",
    512,
    512,
    (c, w, h) => {
      c.fillStyle = "#2a3d6b";
      c.fillRect(0, 0, w, h);
      for (let y = 0; y < 4; y++)
        for (let x = 0; x < 4; x++) {
          const cx = x * 128 + 64;
          const cy = y * 128 + 64;
          c.strokeStyle = "#d89b3c";
          c.lineWidth = 8;
          c.beginPath();
          c.arc(cx, cy, 36, 0, Math.PI * 2);
          c.stroke();
          c.fillStyle = "#8f2f2a";
          c.beginPath();
          c.arc(cx, cy, 16, 0, Math.PI * 2);
          c.fill();
        }
    },
    [3, 3]
  );

// Écran du vieux téléphone (LCD vert monochrome) — redessiné à chaque image
export const drawLcd = (canvas: HTMLCanvasElement, lines: string[], icon: "mic" | "sms" | "none", t: number) => {
  const c = canvas.getContext("2d")!;
  const w = canvas.width;
  const h = canvas.height;
  c.fillStyle = "#a9c98a";
  c.fillRect(0, 0, w, h);
  c.fillStyle = "rgba(0,0,0,0.06)";
  for (let y = 0; y < h; y += 4) c.fillRect(0, y, w, 1);
  c.fillStyle = "#1d2a14";
  c.font = "bold 34px monospace";
  c.textAlign = "center";
  // barre de statut
  c.font = "bold 22px monospace";
  c.textAlign = "left";
  c.fillText("▮▮▮▯", 14, 30);
  c.textAlign = "right";
  c.fillText("23:12", w - 14, 30);
  c.textAlign = "center";
  if (icon === "mic") {
    const pulse = 0.6 + 0.4 * Math.sin(t * 0.4);
    c.globalAlpha = pulse;
    c.beginPath();
    c.arc(w / 2, h * 0.38, 26, 0, Math.PI * 2);
    c.fill();
    c.globalAlpha = 1;
  }
  if (icon === "sms") {
    c.strokeStyle = "#1d2a14";
    c.lineWidth = 5;
    c.strokeRect(w / 2 - 34, h * 0.3, 68, 44);
    c.beginPath();
    c.moveTo(w / 2 - 34, h * 0.3);
    c.lineTo(w / 2, h * 0.3 + 26);
    c.lineTo(w / 2 + 34, h * 0.3);
    c.stroke();
  }
  c.font = "bold 30px monospace";
  lines.forEach((l, i) => c.fillText(l, w / 2, h * 0.62 + i * 38));
};
