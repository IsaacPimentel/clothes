import React, { useEffect, useMemo } from 'react';
import {
  Color,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  type BufferGeometry,
  type Material,
} from 'three';

import type { BodyModel } from './avatar/bodyModel';
import { buildBodyGeometries, disposeGeometries } from './avatar/bodyGeometry';
import { buildPonytailTie } from './avatar/outfitGeometry';

const HAIR_COLORS = {
  female: '#2A1C14',
  male: '#1E1611',
} as const;

const WHITE = new Color('#ffffff');

type PartProps = {
  geometry: BufferGeometry | null;
  material: Material;
  mirror?: boolean;
  /** Small features (nose, ears, hair) look blocky in real-time shadow maps. */
  castShadow?: boolean;
};

function Part({ geometry, material, mirror = false, castShadow = true }: PartProps) {
  if (!geometry) {
    return null;
  }

  const mesh = (
    <mesh geometry={geometry} material={material} castShadow={castShadow} receiveShadow={castShadow} />
  );

  return mirror ? (
    <>
      {mesh}
      <group scale={[-1, 1, 1]}>{mesh}</group>
    </>
  ) : (
    mesh
  );
}

type HumanBodyProps = {
  model: BodyModel;
  skinTone: string;
};

export default function HumanBody({ model, skinTone }: HumanBodyProps) {
  const geometries = useMemo(() => buildBodyGeometries(model), [model]);
  const extras = useMemo(
    () => ({ ear: new SphereGeometry(1, 16, 12), tie: buildPonytailTie(model) }),
    [model],
  );

  const skin = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: skinTone,
        roughness: 0.55,
        metalness: 0,
        sheen: 0.35,
        sheenRoughness: 0.6,
        sheenColor: new Color(skinTone).lerp(WHITE, 0.4),
        clearcoat: 0.06,
        clearcoatRoughness: 0.5,
      }),
    [skinTone],
  );
  const hair = useMemo(
    () => new MeshStandardMaterial({ color: HAIR_COLORS[model.gender], roughness: 0.62 }),
    [model.gender],
  );

  useEffect(() => () => disposeGeometries(geometries), [geometries]);
  useEffect(() => () => disposeGeometries(extras), [extras]);
  useEffect(() => () => skin.dispose(), [skin]);
  useEffect(() => () => hair.dispose(), [hair]);

  const { ear } = model;

  return (
    <group>
      <Part geometry={geometries.torso} material={skin} />
      <Part geometry={geometries.neck} material={skin} />
      <Part geometry={geometries.head} material={skin} castShadow={false} />
      <Part geometry={geometries.arm} material={skin} mirror />
      <Part geometry={geometries.thumb} material={skin} mirror />
      <Part geometry={geometries.leg} material={skin} mirror />
      <Part geometry={geometries.foot} material={skin} mirror />
      {ear.visible &&
        [1, -1].map((side) => (
          <group key={side} scale={[side, 1, 1]}>
            <mesh
              geometry={extras.ear}
              material={skin}
              position={ear.position}
              rotation={[0, ear.rotationY, 0]}
              scale={ear.scale}
            />
          </group>
        ))}

      <Part geometry={geometries.hair} material={hair} castShadow={false} />
      <Part geometry={geometries.ponytail} material={hair} />
      <Part geometry={extras.tie} material={hair} castShadow={false} />
    </group>
  );
}
