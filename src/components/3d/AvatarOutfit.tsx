import React, { useEffect, useMemo } from 'react';
import { Color, DoubleSide, MeshPhysicalMaterial, type MeshPhysicalMaterialParameters } from 'three';

import type { BodyModel } from './avatar/bodyModel';
import {
  buildOutfitPieces,
  disposePieces,
  type Fabric,
  type GarmentPiece,
  type OutfitMode,
} from './avatar/outfitGeometry';
import { useOutfitStore } from '../../stores/outfitStore';

const FABRICS: Record<Fabric, MeshPhysicalMaterialParameters> = {
  cotton: { roughness: 0.9, sheen: 0.5, sheenRoughness: 0.8 },
  fleece: { roughness: 0.96, sheen: 0.8, sheenRoughness: 0.9 },
  denim: { roughness: 0.86, sheen: 0.3, sheenRoughness: 0.7 },
  twill: { roughness: 0.8, sheen: 0.35, sheenRoughness: 0.7 },
  rib: { roughness: 0.88, sheen: 0.45, sheenRoughness: 0.8 },
  leather: { roughness: 0.5, clearcoat: 0.12, clearcoatRoughness: 0.5 },
  rubber: { roughness: 0.7 },
  metal: { roughness: 0.28, metalness: 0.85 },
  lens: { roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.55 },
};

const WHITE = new Color('#ffffff');

function GarmentMesh({ piece }: { piece: GarmentPiece }) {
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: piece.color,
        sheenColor: new Color(piece.color).lerp(WHITE, 0.35),
        side: DoubleSide,
        ...FABRICS[piece.fabric],
      }),
    [piece.color, piece.fabric],
  );

  useEffect(() => () => material.dispose(), [material]);

  const mesh = (
    <mesh
      geometry={piece.geometry}
      material={material}
      castShadow={piece.fabric !== 'lens'}
      receiveShadow
    />
  );

  return piece.mirror ? (
    <>
      {mesh}
      <group scale={[-1, 1, 1]}>{mesh}</group>
    </>
  ) : (
    mesh
  );
}

type AvatarOutfitProps = {
  model: BodyModel;
  /** 'base' shows neutral underwear for the body builder, 'outfit' the selected clothes. */
  mode: OutfitMode;
};

export default function AvatarOutfit({ model, mode }: AvatarOutfitProps) {
  const top = useOutfitStore((state) => state.top);
  const bottom = useOutfitStore((state) => state.bottom);
  const shoes = useOutfitStore((state) => state.shoes);
  const accessory = useOutfitStore((state) => state.accessory);
  const garmentColor = useOutfitStore((state) => state.garmentColor);

  const pieces = useMemo(
    () => buildOutfitPieces(model, { top, bottom, shoes, accessory, garmentColor }, mode),
    [model, top, bottom, shoes, accessory, garmentColor, mode],
  );

  useEffect(() => () => disposePieces(pieces), [pieces]);

  return (
    <group>
      {pieces.map((piece) => (
        <GarmentMesh key={piece.id} piece={piece} />
      ))}
    </group>
  );
}
