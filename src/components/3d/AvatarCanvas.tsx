import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Float } from '@react-three/drei';

import AvatarModel from './AvatarModel';

export default function AvatarCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.1, 4.8], fov: 32 }}
      style={{ flex: 1, backgroundColor: '#0B0B0F' }}
    >
      <color attach="background" args={['#0B0B0F']} />
      <fog attach="fog" args={['#0B0B0F', 5.5, 10]} />

      <ambientLight intensity={1.2} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={2.2}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <spotLight position={[-5, 8, 4]} angle={0.42} intensity={32} penumbra={1} />

      <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.45}>
        <AvatarModel />
      </Float>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.65, 0]} receiveShadow>
        <circleGeometry args={[3.1, 64]} />
        <meshStandardMaterial color="#12131A" roughness={0.92} metalness={0.2} />
      </mesh>

      <ContactShadows
        position={[0, -2.57, 0]}
        opacity={0.55}
        scale={8}
        blur={3}
        far={5}
      />
    </Canvas>
  );
}
