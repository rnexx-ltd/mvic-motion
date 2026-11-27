import React, { useMemo } from "react";
import { useLoader } from "@react-three/fiber";
import { staticFile } from "remotion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

// Modèles et matières Poly Haven (CC0), chargés depuis public/ph
export const phModel = (id: string) => staticFile(`ph/models/${id}/${id}_1k.gltf`);

// Place un modèle : base posée à `floorY`, centré en x/z sur `position`
export const Model: React.FC<{
  id: string;
  position: [number, number, number];
  rotationY?: number;
  scale?: number;
  floorY?: number;
  tint?: string;
  matte?: boolean;
}> = ({ id, position, rotationY = 0, scale = 1, floorY, matte }) => {
  const gltf = useLoader(GLTFLoader, phModel(id));
  const object = useMemo(() => {
    const o = gltf.scene.clone(true);
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = true;
        if (matte) {
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          m.material = mats.map((mat) => {
            const c = (mat as THREE.MeshStandardMaterial).clone();
            c.metalness = 0;
            c.roughness = 0.82;
            c.envMapIntensity = 0.2;
            return c;
          })[0];
        }
      }
    });
    return o;
  }, [gltf, matte]);
  const box = useMemo(() => new THREE.Box3().setFromObject(gltf.scene), [gltf]);
  const center = box.getCenter(new THREE.Vector3());
  const y = floorY !== undefined ? floorY - box.min.y * scale : position[1];
  return (
    <group position={[position[0], y, position[2]]} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={object} position={[-center.x, 0, -center.z]} />
    </group>
  );
};

// Hauteur d'un modèle (pour poser des objets dessus)
export const useModelBox = (id: string) => {
  const gltf = useLoader(GLTFLoader, phModel(id));
  return useMemo(() => new THREE.Box3().setFromObject(gltf.scene), [gltf]);
};

// Matière PBR (diffuse + normale + rugosité) répétée
export const usePbr = (id: string, repeat: [number, number]) => {
  const [diff, nor, rough] = useLoader(THREE.TextureLoader, [staticFile(`ph/textures/${id}/diff.jpg`), staticFile(`ph/textures/${id}/nor.jpg`), staticFile(`ph/textures/${id}/rough.jpg`)]);
  return useMemo(() => {
    [diff, nor, rough].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(repeat[0], repeat[1]);
      t.anisotropy = 8;
    });
    diff.colorSpace = THREE.SRGBColorSpace;
    return { map: diff, normalMap: nor, roughnessMap: rough };
  }, [diff, nor, rough, repeat]);
};

// Éclairage d'environnement (nuit) pour des reflets crédibles
export const NightEnvironment: React.FC<{ intensity?: number }> = ({ intensity = 0.15 }) => {
  const hdr = useLoader(RGBELoader, staticFile("ph/hdri/dikhololo_night.hdr"));
  useMemo(() => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
  }, [hdr]);
  return <primitive attach="environment" object={hdr} environmentIntensity={intensity} />;
};
