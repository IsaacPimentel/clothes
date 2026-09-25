import type { BufferGeometry } from 'three';

import type { BodyModel } from './bodyModel';
import { buildTubeGeometry, offsetSurface, rangeRemap } from './surface';

export type BodyGeometries = {
  torso: BufferGeometry;
  neck: BufferGeometry;
  head: BufferGeometry;
  hair: BufferGeometry;
  ponytail: BufferGeometry | null;
  arm: BufferGeometry;
  thumb: BufferGeometry;
  leg: BufferGeometry;
  foot: BufferGeometry;
};

export function buildBodyGeometries(model: BodyModel): BodyGeometries {
  const hair = offsetSurface(model.head, {
    remap: rangeRemap((w) => model.hairStart(model.headAngle(w)), 1),
    offset: (t, w) => model.hairOffset(t, model.headAngle(w)),
  });

  return {
    torso: buildTubeGeometry(model.torso(), {
      lengthSegments: 84,
      radialSegments: 72,
      capStart: true,
    }),
    neck: buildTubeGeometry(model.neck, { lengthSegments: 12, radialSegments: 40 }),
    head: buildTubeGeometry(model.head, {
      lengthSegments: 56,
      radialSegments: 96,
      capStart: true,
      capEnd: true,
    }),
    hair: buildTubeGeometry(hair, { lengthSegments: 36, radialSegments: 96, capEnd: true }),
    ponytail: model.ponytail
      ? buildTubeGeometry(model.ponytail, {
          lengthSegments: 32,
          radialSegments: 20,
          capStart: true,
          capEnd: true,
        })
      : null,
    arm: buildTubeGeometry(model.arm, {
      lengthSegments: 96,
      radialSegments: 32,
      capStart: true,
      capEnd: true,
    }),
    thumb: buildTubeGeometry(model.thumb, {
      lengthSegments: 10,
      radialSegments: 12,
      capStart: true,
      capEnd: true,
    }),
    leg: buildTubeGeometry(model.leg(), { lengthSegments: 72, radialSegments: 40 }),
    foot: buildTubeGeometry(model.foot, {
      lengthSegments: 36,
      radialSegments: 32,
      capStart: true,
      capEnd: true,
    }),
  };
}

export function disposeGeometries(geometries: Record<string, BufferGeometry | null | undefined>) {
  Object.values(geometries).forEach((geometry) => geometry?.dispose());
}
