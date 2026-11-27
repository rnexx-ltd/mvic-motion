import React, { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

// Post-production « cinéma » dans le moteur 3D : halo (bloom) + profondeur de champ (bokeh).
// Rendue après le rendu standard de Remotion, à chaque image, de façon déterministe.
export type Lens = { focus: number; aperture: number; maxblur: number; bloom: number; bloomRadius: number; bloomThreshold: number };

export const CinemaPost: React.FC<{ lens: Lens }> = ({ lens }) => {
  const { gl, scene, camera } = useThree();
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const composer = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType, samples: 0 });
    const c = new EffectComposer(gl, target);
    c.setPixelRatio(1);
    c.setSize(width, height);
    c.addPass(new RenderPass(scene, camera));
    const bokeh = new BokehPass(scene, camera, { focus: lens.focus, aperture: lens.aperture, maxblur: lens.maxblur });
    c.addPass(bokeh);
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), lens.bloom, lens.bloomRadius, lens.bloomThreshold);
    c.addPass(bloom);
    c.addPass(new OutputPass());
    return { c, bokeh, bloom };
  }, [gl, scene, camera, width, height]);
  useEffect(() => {
    const u = composer.bokeh.uniforms as Record<string, { value: number }>;
    u.focus.value = lens.focus;
    u.aperture.value = lens.aperture;
    u.maxblur.value = lens.maxblur;
    composer.bloom.strength = lens.bloom;
    composer.bloom.radius = lens.bloomRadius;
    composer.bloom.threshold = lens.bloomThreshold;
    gl.setSize(width, height, false);
    composer.c.render();
  }, [frame, composer, lens, gl, width, height]);
  return null;
};
