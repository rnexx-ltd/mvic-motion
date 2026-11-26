import React from "react";
import { Track, useVideoConfig } from "remotion";
import { ArrivalScene, EndCard, FormScene, Hook, ValidateScene } from "./scenes/Scenes";

// Scène test n°1 — « L'argent arrive » (15 s, 9:16).
// Le fond suit l'émotion (idée de V9) : nuit = tension, vert Mvic = l'argent est arrivé.
export const MvicTest: React.FC = () => {
  const { fps } = useVideoConfig();
  return (
    <Track name="Scènes">
      <Hook name="1. Le problème" durationInFrames={3.2 * fps} style={{ backgroundColor: "#0F1923" }} />
      <FormScene name="2. Formulaire Mvic" from={3.2 * fps} durationInFrames={4 * fps} style={{ backgroundColor: "#0F1923" }} />
      <ValidateScene name="3. Validation PIN" from={7.2 * fps} durationInFrames={2.3 * fps} style={{ backgroundColor: "#0F1923" }} />
      <ArrivalScene name="4. L'argent arrive" from={9.5 * fps} durationInFrames={3 * fps} style={{ backgroundColor: "#1A6B5A" }} />
      <EndCard name="5. Signature" from={12.5 * fps} durationInFrames={2.5 * fps} style={{ backgroundColor: "#1A6B5A" }} />
    </Track>
  );
};
