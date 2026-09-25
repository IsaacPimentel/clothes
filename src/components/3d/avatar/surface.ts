import { BufferAttribute, BufferGeometry, Vector3 } from 'three';

/** Parametric surface: `u` runs along the part, `w` runs around it. Both are in [0, 1]. */
export type SurfaceSampler = (u: number, w: number, target: Vector3) => void;

type TubeOptions = {
  lengthSegments: number;
  radialSegments: number;
  capStart?: boolean;
  capEnd?: boolean;
};

const scratchA = new Vector3();
const scratchB = new Vector3();
const scratchC = new Vector3();

function ringCentroid(positions: Float32Array, ring: number, radial: number, target: Vector3) {
  target.set(0, 0, 0);
  for (let j = 0; j < radial; j += 1) {
    const index = (ring * radial + j) * 3;
    target.x += positions[index];
    target.y += positions[index + 1];
    target.z += positions[index + 2];
  }
  return target.multiplyScalar(1 / radial);
}

function triangleNormal(positions: Float32Array, a: number, b: number, c: number, target: Vector3) {
  scratchA.fromArray(positions, a * 3);
  scratchB.fromArray(positions, b * 3).sub(scratchA);
  scratchC.fromArray(positions, c * 3).sub(scratchA);
  return target.crossVectors(scratchB, scratchC);
}

/**
 * Builds a closed tube (rings around an axis) from a sampler. Winding is
 * detected automatically so faces always point outwards, whatever frame the
 * sampler uses. The seam shares vertices, so normals stay smooth all around.
 */
export function buildTubeGeometry(
  sample: SurfaceSampler,
  { lengthSegments, radialSegments, capStart = false, capEnd = false }: TubeOptions,
) {
  const rings = lengthSegments + 1;
  const vertexCount = rings * radialSegments + (capStart ? 1 : 0) + (capEnd ? 1 : 0);
  const positions = new Float32Array(vertexCount * 3);
  const point = new Vector3();

  for (let i = 0; i < rings; i += 1) {
    const u = i / lengthSegments;
    for (let j = 0; j < radialSegments; j += 1) {
      sample(u, j / radialSegments, point);
      point.toArray(positions, (i * radialSegments + j) * 3);
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < lengthSegments; i += 1) {
    for (let j = 0; j < radialSegments; j += 1) {
      const next = (j + 1) % radialSegments;
      const a = i * radialSegments + j;
      const b = i * radialSegments + next;
      const c = (i + 1) * radialSegments + j;
      const d = (i + 1) * radialSegments + next;
      indices.push(a, c, b, b, c, d);
    }
  }

  // Orientation check on the middle ring: normals must point away from the axis.
  const middle = Math.floor(lengthSegments / 2);
  const centroid = ringCentroid(positions, middle, radialSegments, new Vector3());
  const normal = new Vector3();
  const outward = new Vector3();
  let alignment = 0;
  for (let j = 0; j < radialSegments; j += 1) {
    const a = middle * radialSegments + j;
    const b = middle * radialSegments + ((j + 1) % radialSegments);
    const c = (middle + 1) * radialSegments + j;
    triangleNormal(positions, a, c, b, normal);
    outward.fromArray(positions, a * 3).sub(centroid);
    alignment += normal.dot(outward);
  }
  if (alignment < 0) {
    for (let k = 0; k < indices.length; k += 3) {
      const swap = indices[k + 1];
      indices[k + 1] = indices[k + 2];
      indices[k + 2] = swap;
    }
  }

  let nextVertex = rings * radialSegments;
  const addCap = (ring: number, neighbourRing: number) => {
    const pole = nextVertex;
    nextVertex += 1;
    const center = ringCentroid(positions, ring, radialSegments, new Vector3());
    center.toArray(positions, pole * 3);

    const away = center
      .clone()
      .sub(ringCentroid(positions, neighbourRing, radialSegments, new Vector3()));
    const capIndices: number[] = [];
    for (let j = 0; j < radialSegments; j += 1) {
      const a = ring * radialSegments + j;
      const b = ring * radialSegments + ((j + 1) % radialSegments);
      capIndices.push(pole, a, b);
    }
    triangleNormal(positions, capIndices[0], capIndices[1], capIndices[2], normal);
    const flip = normal.dot(away) < 0;
    for (let k = 0; k < capIndices.length; k += 3) {
      indices.push(capIndices[k], flip ? capIndices[k + 2] : capIndices[k + 1], flip ? capIndices[k + 1] : capIndices[k + 2]);
    }
  };

  if (capStart) addCap(0, 1);
  if (capEnd) addCap(lengthSegments, lengthSegments - 1);

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Open grid patch (pockets, plackets). Render it with a double sided material. */
export function buildPatchGeometry(
  sample: SurfaceSampler,
  uSegments: number,
  wSegments: number,
) {
  const positions = new Float32Array((uSegments + 1) * (wSegments + 1) * 3);
  const point = new Vector3();

  for (let i = 0; i <= uSegments; i += 1) {
    for (let j = 0; j <= wSegments; j += 1) {
      sample(i / uSegments, j / wSegments, point);
      point.toArray(positions, (i * (wSegments + 1) + j) * 3);
    }
  }

  const indices: number[] = [];
  for (let i = 0; i < uSegments; i += 1) {
    for (let j = 0; j < wSegments; j += 1) {
      const a = i * (wSegments + 1) + j;
      const b = a + 1;
      const c = a + wSegments + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

type OffsetOptions = {
  /** Distance from the base surface in meters, evaluated in base parameters. */
  offset: number | ((u: number, w: number) => number);
  /** Maps the output (u, w) grid to the base surface parameters (partial shells). */
  remap?: (u: number, w: number, target: { u: number; w: number }) => void;
  /** Final tweak of each point, e.g. flattening a shoe sole. */
  post?: (point: Vector3, u: number, w: number) => void;
};

/**
 * Offsets a surface along its true 3D normal. That keeps garments at an even
 * distance from the skin, including sloped areas such as shoulders.
 */
export function offsetSurface(base: SurfaceSampler, { offset, remap, post }: OffsetOptions): SurfaceSampler {
  const step = 1e-3;
  const mapped = { u: 0, w: 0 };
  const du = new Vector3();
  const dw = new Vector3();
  const p0 = new Vector3();
  const p1 = new Vector3();
  const normal = new Vector3();
  const lastNormal = new Vector3(0, 1, 0);
  let orientation = 0;

  // Samplers extrapolate outside [0, 1], so central differences work at the edges too.
  const surfaceNormal = (u: number, w: number, target: Vector3) => {
    base(u + step, w, p1);
    base(u - step, w, p0);
    du.subVectors(p1, p0);
    base(u, (w + step) % 1, p1);
    base(u, (w - step + 1) % 1, p0);
    dw.subVectors(p1, p0);
    return target.crossVectors(du, dw);
  };

  const resolveOrientation = () => {
    const centroid = new Vector3();
    const point = new Vector3();
    for (let j = 0; j < 24; j += 1) {
      base(0.5, j / 24, point);
      centroid.add(point);
    }
    centroid.multiplyScalar(1 / 24);

    let alignment = 0;
    const n = new Vector3();
    for (let j = 0; j < 8; j += 1) {
      const w = j / 8;
      surfaceNormal(0.5, w, n);
      base(0.5, w, point);
      alignment += n.dot(point.sub(centroid));
    }
    orientation = alignment >= 0 ? 1 : -1;
  };

  return (u, w, target) => {
    if (orientation === 0) resolveOrientation();

    if (remap) {
      remap(u, w, mapped);
    } else {
      mapped.u = u;
      mapped.w = w;
    }

    surfaceNormal(mapped.u, mapped.w, normal);
    if (normal.lengthSq() < 1e-14) {
      normal.copy(lastNormal);
    } else {
      normal.normalize().multiplyScalar(orientation);
      lastNormal.copy(normal);
    }

    base(mapped.u, mapped.w, target);
    const distance = typeof offset === 'number' ? offset : offset(mapped.u, mapped.w);
    target.addScaledVector(normal, distance);

    if (post) post(target, mapped.u, mapped.w);
  };
}

/** Remap helper for shells that cover only part of a surface (per angle). */
export function rangeRemap(
  start: number | ((w: number) => number),
  end: number | ((w: number) => number),
) {
  return (u: number, w: number, target: { u: number; w: number }) => {
    const from = typeof start === 'number' ? start : start(w);
    const to = typeof end === 'number' ? end : end(w);
    target.u = from + (to - from) * u;
    target.w = w;
  };
}
