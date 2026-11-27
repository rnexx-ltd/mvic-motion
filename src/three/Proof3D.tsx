import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import * as THREE from "three";

// Matériau « dessin animé » : 3 paliers de lumière, comme des aplats
const useToonGradient = () =>
  useMemo(() => {
    const data = new Uint8Array([90, 90, 90, 255, 180, 180, 180, 255, 255, 255, 255, 255]);
    const tex = new THREE.DataTexture(data, 3, 1, THREE.RGBAFormat);
    tex.minFilter = THREE.NearestFilter;
    tex.magFilter = THREE.NearestFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

// Contour noir par « coque inversée »
const Outline: React.FC<{ children: React.ReactNode; scale?: number }> = ({ children, scale = 1.04 }) => (
  <group scale={scale}>
    {children}
  </group>
);

const RoundedBox = (w: number, h: number, d: number, r: number) => {
  const shape = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 4, curveSegments: 16 });
  g.translate(0, 0, -d / 2);
  return g;
};

// Un téléphone-personnage : coque colorée, écran avec deux yeux
const PhoneChar: React.FC<{ color: string; x: number; lookX: number; bounce: number; blink: boolean; tilt: number }> = ({ color, x, lookX, bounce, blink, tilt }) => {
  const grad = useToonGradient();
  const body = useMemo(() => RoundedBox(1.1, 2.1, 0.18, 0.22), []);
  const squash = 1 + bounce * 0.08;
  return (
    <group position={[x, 1.05 + bounce * 0.25, 0]} rotation={[0, 0, tilt]} scale={[1 / squash, squash, 1]}>
      {/* contour */}
      <Outline>
        <mesh geometry={body}>
          <meshBasicMaterial color="#2a1208" side={THREE.BackSide} />
        </mesh>
      </Outline>
      <mesh geometry={body}>
        <meshToonMaterial color={color} gradientMap={grad} />
      </mesh>
      {/* écran */}
      <mesh position={[0, 0.05, 0.135]}>
        <planeGeometry args={[0.88, 1.7]} />
        <meshBasicMaterial color="#1b1f24" />
      </mesh>
      {/* yeux */}
      {[-0.2, 0.2].map((ex) => (
        <group key={ex} position={[ex, 0.25, 0.14]}>
          <mesh scale={[1, blink ? 0.12 : 1, 1]}>
            <circleGeometry args={[0.14, 32]} />
            <meshBasicMaterial color="white" />
          </mesh>
          {!blink && (
            <mesh position={[lookX * 0.06, 0, 0.001]}>
              <circleGeometry args={[0.065, 32]} />
              <meshBasicMaterial color="#111" />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

export const Proof3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const grad = useToonGradient();
  const camX = interpolate(frame, [0, 3 * fps], [-0.6, 0.6], { easing: Easing.inOut(Easing.cubic) });
  const bounceL = Math.max(0, Math.sin(frame / 4)) * (frame < 45 ? 1 : 0.2);
  const bounceR = Math.max(0, Math.sin(frame / 5 + 1)) * 0.5;
  return (
    <div style={{ width, height, background: "linear-gradient(#f6c48a, #e8925a 55%, #b5583a)" }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [camX, 2.6, 12], fov: 38 }}>
        <ambientLight intensity={0.55} color="#ffe2c0" />
        <directionalLight position={[-4, 6, 5]} intensity={1.6} color="#fff1dc" />
        <directionalLight position={[5, 2, -4]} intensity={0.9} color="#ff7a4a" />
        {/* deux berges */}
        <mesh position={[-2.6, -0.25, 0]}>
          <boxGeometry args={[4, 0.5, 6]} />
          <meshToonMaterial color="#c9763f" gradientMap={grad} />
        </mesh>
        <mesh position={[2.6, -0.25, 0]}>
          <boxGeometry args={[4, 0.5, 6]} />
          <meshToonMaterial color="#c9763f" gradientMap={grad} />
        </mesh>
        {/* le fleuve */}
        <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.2, 6]} />
          <meshToonMaterial color="#3d8fb0" gradientMap={grad} />
        </mesh>
        <PhoneChar color="#FFCB05" x={-1.3} lookX={1} bounce={bounceL} blink={frame % 60 > 56} tilt={Math.sin(frame / 10) * 0.06} />
        <PhoneChar color="#FF6600" x={1.3} lookX={-1} bounce={bounceR} blink={(frame + 20) % 70 > 66} tilt={Math.sin(frame / 12 + 2) * 0.05} />
      </ThreeCanvas>
    </div>
  );
};
