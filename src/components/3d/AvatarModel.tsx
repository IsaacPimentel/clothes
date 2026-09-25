import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';

import AvatarOutfit from './AvatarOutfit';
import { useAvatarStore } from '../../stores/avatarStore';

export function PrimitiveAvatar() {
  const groupRef = useRef<Group>(null);
  const { height, bust, waist, hips, skinTone, gender } = useAvatarStore();
  const isMale = gender === 'male';

  useEffect(() => {
    if (!groupRef.current) {
      return;
    }

    const chestScale = isMale ? 1.08 : 0.92;
    const hipScale = isMale ? 0.92 : 1.08;

    groupRef.current.scale.set(
      0.9 + (bust - 80) / 180,
      0.9 + (height - 150) / 180,
      0.9 + (hips - 80) / 180,
    );
    groupRef.current.scale.x *= chestScale;
    groupRef.current.scale.z *= hipScale;
  }, [bust, height, hips, isMale, waist]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.45;
    groupRef.current.position.y = Math.sin(t * 1.5) * 0.06;
  });

  const torsoWidth = isMale ? 0.96 : 0.84;
  const torsoDepth = isMale ? 0.62 : 0.58;
  const shoulderWidth = isMale ? 0.82 : 0.7;
  const hipWidth = isMale ? 0.7 : 0.78;

  return (
    <group ref={groupRef} position={[0, -1.2, 0]} scale={1.1}>
      <mesh position={[0, 2.04, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.28, 18]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[0, 0.8, 0]} castShadow>
        <capsuleGeometry args={[0.28, 1.05, 8, 18]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[0, -0.4, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.9, 8, 18]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[-(shoulderWidth + 0.12), 0.85, 0]} rotation={[0, 0, 0.28]} castShadow>
        <capsuleGeometry args={[0.11, 1.05, 6, 12]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[(shoulderWidth + 0.12), 0.85, 0]} rotation={[0, 0, -0.28]} castShadow>
        <capsuleGeometry args={[0.11, 1.05, 6, 12]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[-0.22, -1.7, 0]} rotation={[0, 0, 0.02]} castShadow>
        <capsuleGeometry args={[0.12, 1.3, 8, 12]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[0.22, -1.7, 0]} rotation={[0, 0, -0.02]} castShadow>
        <capsuleGeometry args={[0.12, 1.3, 8, 12]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>
    </group>
  );
}

export default function AvatarModel() {
  const groupRef = useRef<Group>(null);
  const { height, bust, waist, hips, skinTone, gender } = useAvatarStore();
  const isMale = gender === 'male';

  useEffect(() => {
    if (!groupRef.current) {
      return;
    }

    const chestScale = isMale ? 1.12 : 0.94;
    const hipScale = isMale ? 0.9 : 1.12;
    groupRef.current.scale.set(
      0.95 + (bust - 80) / 180,
      0.9 + (height - 150) / 180,
      0.9 + (hips - 80) / 180,
    );
    groupRef.current.scale.x *= chestScale;
    groupRef.current.scale.z *= hipScale;
  }, [bust, height, hips, isMale, waist]);

  useFrame((state) => {
    if (!groupRef.current) {
      return;
    }

    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = Math.sin(t * 0.8) * 0.45;
    groupRef.current.rotation.x = Math.sin(t * 1.4) * 0.04;
    groupRef.current.position.y = Math.sin(t * 1.6) * 0.08;
  });

  const shoulderWidth = isMale ? 0.84 : 0.72;
  const torsoWidth = isMale ? 0.96 : 0.82;
  const torsoDepth = isMale ? 0.62 : 0.58;
  const hipWidth = isMale ? 0.7 : 0.8;

  return (
    <group ref={groupRef} position={[0, -1.45, 0]}>
      <mesh position={[0, 2.07, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 0.28, 18]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[0, 0.82, 0]} castShadow>
        <capsuleGeometry args={[0.28, 1.05, 8, 18]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[0, -0.42, 0]} castShadow>
        <capsuleGeometry args={[0.26, 0.92, 8, 18]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[-(shoulderWidth + 0.12), 0.86, 0]} rotation={[0, 0, 0.28]} castShadow>
        <capsuleGeometry args={[0.12, 1.02, 6, 12]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[(shoulderWidth + 0.12), 0.86, 0]} rotation={[0, 0, -0.28]} castShadow>
        <capsuleGeometry args={[0.12, 1.02, 6, 12]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[-0.22, -1.72, 0]} rotation={[0, 0, 0.03]} castShadow>
        <capsuleGeometry args={[0.12, 1.32, 8, 12]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <mesh position={[0.22, -1.72, 0]} rotation={[0, 0, -0.03]} castShadow>
        <capsuleGeometry args={[0.12, 1.32, 8, 12]} />
        <meshStandardMaterial color={skinTone} />
      </mesh>

      <AvatarOutfit />
    </group>
  );
}
