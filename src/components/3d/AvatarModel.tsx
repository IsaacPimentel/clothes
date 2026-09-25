import React, { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber/native';
import type { Group } from 'three';

import AvatarOutfit from './AvatarOutfit';
import HumanBody from './HumanBody';
import { createBodyModel, type BodyShape } from './avatar/bodyModel';
import type { OutfitMode } from './avatar/outfitGeometry';
import { useAvatarStore } from '../../stores/avatarStore';

export type RotationState = {
  target: number;
  velocity: number;
  dragging: boolean;
};

// Rebuilding the body takes tens of ms on a phone. While a slider is dragged the
// measurements are applied at most every REBUILD_INTERVAL ms (the last value always wins).
const REBUILD_INTERVAL = 90;

function useThrottledShape({ gender, height, bust, waist, hips }: BodyShape): BodyShape {
  const [applied, setApplied] = useState<BodyShape>({ gender, height, bust, waist, hips });
  const lastAppliedRef = useRef(0);

  useEffect(() => {
    const wait = Math.max(0, REBUILD_INTERVAL - (Date.now() - lastAppliedRef.current));
    const timer = setTimeout(() => {
      lastAppliedRef.current = Date.now();
      setApplied((previous) =>
        previous.gender === gender &&
        previous.height === height &&
        previous.bust === bust &&
        previous.waist === waist &&
        previous.hips === hips
          ? previous
          : { gender, height, bust, waist, hips },
      );
    }, wait);
    return () => clearTimeout(timer);
  }, [gender, height, bust, waist, hips]);

  return applied;
}

type AvatarModelProps = {
  outfitMode: OutfitMode;
  rotationRef: RefObject<RotationState>;
};

export default function AvatarModel({ outfitMode, rotationRef }: AvatarModelProps) {
  const turntableRef = useRef<Group>(null);
  const bodyRef = useRef<Group>(null);

  const gender = useAvatarStore((state) => state.gender);
  const height = useAvatarStore((state) => state.height);
  const bust = useAvatarStore((state) => state.bust);
  const waist = useAvatarStore((state) => state.waist);
  const hips = useAvatarStore((state) => state.hips);
  const skinTone = useAvatarStore((state) => state.skinTone);

  const shape = useThrottledShape({ gender, height, bust, waist, hips });
  const model = useMemo(() => createBodyModel(shape), [shape]);

  useFrame((state, delta) => {
    const turntable = turntableRef.current;
    const body = bodyRef.current;
    const spin = rotationRef.current;
    if (!turntable || !body || !spin) {
      return;
    }

    // Drag to rotate, with inertia after release.
    if (!spin.dragging) {
      spin.target += spin.velocity * delta;
      spin.velocity *= Math.exp(-3.5 * delta);
    }
    turntable.rotation.y += (spin.target - turntable.rotation.y) * (1 - Math.exp(-12 * delta));

    // Subtle idle: weight shift and breathing.
    const t = state.clock.elapsedTime;
    body.rotation.z = Math.sin(t * 0.6) * 0.006;
    body.scale.y = 1 + Math.sin(t * 1.4) * 0.0025;
  });

  return (
    <group ref={turntableRef}>
      <group ref={bodyRef}>
        <HumanBody model={model} skinTone={skinTone} />
        <AvatarOutfit model={model} mode={outfitMode} />
      </group>
    </group>
  );
}
