# Scène test — « Le nom », plans 4 à 8 (≈ 8 s)

> But : **trouver le processus** qui donne le rendu attendu, avant de produire le film entier.
> Critère de réussite : posés côte à côte avec V2 / V9 de Higordo sur un téléphone, les 8 secondes tiennent la comparaison (lumière, expressions, rythme, son).

---

## 1. Le processus testé (6 étapes)

| # | Étape | Qui | Sortie | Contrôle |
|---|---|---|---|---|
| 1 | **Image de style** : une seule image qui fixe toute la direction artistique (trait, couleurs, lumière) | Toi (Nano Banana, mes prompts) → je choisis avec toi | `style-frame.png` | « C'est ça, le look Mvic » |
| 2 | **Fiche personnage** de Mami (face, 3/4, profil), générée **avec l'image de style en référence** | Toi | `mami-sheet.png` | Mêmes traits, mêmes vêtements, même style |
| 3 | **Poses et expressions** : chaque image est une *modification* de la fiche personnage (jamais une génération à partir de rien) | Toi | `mami-*.png` | Le personnage reste identique d'une image à l'autre |
| 4 | **Préparation des calques** : détourage, séparation du personnage et du décor, nettoyage, mise à l'échelle | Moi (ici) | Calques PNG transparents | Bords propres, aucun halo |
| 5 | **Mise en scène en code** (Remotion) : caméra, lumière, ombres, échanges d'expressions, petits mouvements, cadres, typographie, vrais écrans Mvic | Moi | Animatique, puis rendu | Timing validé avec toi à l'image près |
| 6 | **Son** : voix IA, effets, musique, silences, mixage fort (−10 LUFS) | Toi (fichiers) + moi (montage et mixage) | MP4 final | Comparaison avec V2 / V9 |

**Règle d'or de cohérence :** la fiche personnage (étape 2) est **jointe à chaque génération** et on demande toujours une *modification* (« same character, change only… »). On ne régénère jamais le personnage depuis zéro.

**Règle éthique :** les prompts **décrivent le style** (trait, couleurs, lumière). Ils ne citent jamais Higordo ni un autre artiste.

---

## 2. Les prompts Nano Banana

> Les prompts sont en anglais (meilleurs résultats). Génère **2 à 4 variantes** pour l'image de style et la fiche personnage, puis envoie-les-moi toutes : on choisit ensemble.
> **Format :** la plus haute résolution disponible. Pour les personnages, **fond uni gris clair** (`#E6E6E6`), sans ombre au sol, pour faciliter le détourage.

### Prompt 1 — Image de style (le look de référence)

```
2D animated film still, vertical 9:16. A Cameroonian market woman in her mid-40s stands inside her small
grocery stall at golden hour, looking at her smartphone with intense concentration.
Style: modern African 2D animation, clean bold dark-brown outlines with slightly varying thickness,
flat cel-shading with exactly two tones per surface (base + one shadow), subtle soft rim light glowing
warm orange-red around the character's silhouette, warm limited palette (ochre, peach, terracotta,
deep burgundy shadows), soft painted background slightly out of focus, cinematic depth of field,
light film grain. Caricatural but dignified proportions: expressive large eyes, strong eyebrows,
full lips, round warm face.
Character: dark brown skin, headscarf (foulard) tied on top in a bright wax print (green and orange),
colourful wax-print kaba dress, small gold earrings, reading glasses hanging on a cord around her neck.
Background: sacks of rice, cans of oil, a small wooden counter, a calendar on the wall, warm sunlight
from the doorway.
No text, no logos, no watermark.
```

### Prompt 2 — Fiche personnage Mami Nyanga (joindre l'image de style retenue)

```
Using the attached image as the exact art style reference, create a character model sheet of the same
woman: front view, three-quarter view, and side profile, full body, standing neutral pose, arms relaxed.
Keep exactly the same outline style, cel-shading, palette, face, headscarf, wax kaba dress, earrings and
reading glasses on a cord. Plain flat light grey background (#E6E6E6), no floor shadow, no text,
no logos. Even lighting, all three views at the same scale, evenly spaced.
```

### Prompts 3 — Expressions et poses (joindre la fiche personnage retenue à CHAQUE fois)

| Fichier | Prompt (à ajouter après : *« Same character as the attached model sheet, same art style, plain light grey background #E6E6E6, no text. »*) |
|---|---|
| `mami-cu-focus.png` | `Extreme close-up of her face, three-quarter view, looking down at a phone (phone not visible), intense concentration, slightly squinting, lips pressed, a single drop of sweat on her temple. Reading glasses on her nose.` |
| `mami-cu-eyes-wide.png` | `Exactly the same framing and pose as the previous close-up, but her eyes are wide open in shock, pupils small, eyebrows raised high, reading glasses slipping down her nose.` *(joindre aussi `mami-cu-focus.png`)* |
| `mami-cu-blink.png` | `Exactly the same framing and pose as the concentration close-up, eyes closed (blink).` *(joindre `mami-cu-focus.png`)* |
| `mami-hein.png` | `Medium shot, waist up, she has just jumped up from her stool: body leaning back, both arms thrown up and out, hands open, mouth wide open shouting, eyes huge, headscarf slightly tilted, dynamic pose with strong silhouette.` |
| `mami-hein-mouth-closed.png` | `Exactly the same pose as the attached shouting image, but mouth closed in an outraged pout.` *(joindre `mami-hein.png`)* |
| `mami-hein-mouth-o.png` | `Exactly the same pose as the attached shouting image, mouth in a round "O" shape.` *(joindre `mami-hein.png`)* |

> Les variantes de bouche et d'yeux sur **la même pose** permettent d'animer les dialogues et les clignements en code, sans que le personnage « saute ».

### Prompt 4 — Ndongo (l'ex), en photo souvenir jaunie

```
Same art style as the attached style reference. A Cameroonian man in his mid-30s posing proudly in front
of a shiny car that obviously isn't his: dark sunglasses, thin gold chain, shirt unbuttoned too low,
one hand on the car, confident smirk. Composition: vertical 4:5. Treat it as an old printed photo:
warm yellowed colours, slight fading. Comedic but not mean. No text, no logos, no license plate text.
```

### Prompt 5 — Décor de la boutique, vide (pour les plans larges)

```
Same art style as the attached style reference. The interior of a small Cameroonian grocery stall at
golden hour, empty (no people): wooden counter in the foreground, a low wooden stool, sacks of rice,
stacked oil cans, soap bars, a wall calendar, a doorway with warm sunlight streaming in, slightly out of
focus background. Vertical 9:16. No text, no logos, no brand names.
```

---

## 3. Ce que je fais ici, en parallèle et en attendant tes images

- Je reconstruis en code le **bloc réel « nom du titulaire »** (badge Orange + nom officiel en majuscules) et la frappe du numéro `6 95 88 •• ••`.
- J'installe le **détourage automatique** (modèle open source, en local) et je le teste.
- Je prépare la **mise en scène des 8 secondes** sur des images provisoires (animatique), pour valider le timing **avant** les images définitives.

## 4. Son nécessaire pour la scène test

| Fichier | Contenu |
|---|---|
| `mami-hein.mp3` | « **HEIN ?!** C'est **Ndongo** ça ! » (femme ≈ 45 ans, accent camerounais, indignée et comique) |
| `mami-franc.mp3` | « Celui-là ne va pas toucher **un franc** de l'école de mon fils ! » |
| `musique-test.mp3` | ≈ 20 s d'afro-pop légère, que je couperai net au plan 4 |
| Effets | « tic » de notification, « woosh », impact comique, bruit de lunettes qui glissent (optionnel) |

## 5. Grille d'évaluation (on note chaque point de 1 à 5 en comparant à Higordo)

1. Le personnage reste-t-il **identique** d'une image à l'autre ?
2. Les **expressions** sont-elles lisibles et drôles ?
3. La **lumière** fait-elle « cinéma » (halo, virage de couleur, profondeur) ?
4. Le **rythme** (silence → explosion) fonctionne-t-il ?
5. Le **vrai écran Mvic** s'intègre-t-il naturellement dans le monde dessiné ?
6. Le **son** porte-t-il la scène ?
7. Note globale : publiable tel quel ?
