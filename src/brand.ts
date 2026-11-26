import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Polices locales (public/fonts) : le navigateur de rendu n'a pas accès à Google Fonts.
// DM Sans = interface Mvic (identique à l'app, police variable), Bangers = onomatopées style BD.
export const uiFont = "DM Sans";
export const comicFont = "Bangers";

for (const weight of ["400", "500", "600", "700", "900"]) {
  loadFont({ family: uiFont, url: staticFile("fonts/DMSans-latin.woff2"), weight });
}
loadFont({ family: comicFont, url: staticFile("fonts/Bangers-latin.woff2"), weight: "400" });

// Tokens Mvic relevés dans mvic-web/src/index.css (ne pas modifier sans l'app).
export const mvic = {
  g: "#1A6B5A",
  ga: "#4FC9A8",
  gp: "#E8F5F1",
  night: "#0F1923",
  gold: "#F5A623",
  gray50: "#F9F9F8",
  gray100: "#F0EFEC",
  gray200: "#E2E0DB",
  gray400: "#75726B",
  gray600: "#6B6760",
  gray800: "#2C2A26",
  mtn: "#FFCB05",
  orange: "#FF6600",
};
