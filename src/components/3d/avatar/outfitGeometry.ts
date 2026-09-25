import {
  BufferGeometry,
  CatmullRomCurve3,
  CircleGeometry,
  Color,
  CylinderGeometry,
  ExtrudeGeometry,
  Quaternion,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';

import { BOTTOM_COLORS, SHOE_COLORS, SOLE_COLORS, type Outfit } from '../../../types/outfit';
import type { BodyModel } from './bodyModel';
import { BACK, FRONT, TAU, clamp, gaussian, lerp, pairBump, smoothstep, wrapAngle } from './math';
import {
  buildPatchGeometry,
  buildTubeGeometry,
  offsetSurface,
  rangeRemap,
  type SurfaceSampler,
} from './surface';

export type Fabric = 'cotton' | 'fleece' | 'denim' | 'twill' | 'rib' | 'leather' | 'rubber' | 'metal' | 'lens';

export type GarmentPiece = {
  id: string;
  geometry: BufferGeometry;
  color: string;
  fabric: Fabric;
  /** Also render a mirrored copy for the left side of the body. */
  mirror?: boolean;
};

export type OutfitMode = 'base' | 'outfit';

const BASE_LAYER_COLOR = '#2B2B33';
const BASE_LAYER_ACCENT = '#7C3AED';

const shade = (hex: string, amount: number) =>
  `#${new Color(hex).lerp(new Color(amount < 0 ? '#000000' : '#ffffff'), Math.abs(amount)).getHexString()}`;

const UP = new Vector3(0, 1, 0);

/** Cylinder between two points (glasses temples, drawstrings, laces). */
function rod(from: Vector3, to: Vector3, radius: number, radialSegments = 8) {
  const direction = to.clone().sub(from);
  const geometry = new CylinderGeometry(radius, radius, direction.length(), radialSegments);
  geometry.applyQuaternion(new Quaternion().setFromUnitVectors(UP, direction.normalize()));
  geometry.translate((from.x + to.x) / 2, (from.y + to.y) / 2, (from.z + to.z) / 2);
  return geometry;
}

/** Tube along a curve with a variable radius and closed ends. */
function tubeAlongCurve(points: Vector3[], radius: (u: number) => number, flatten = 1, segments = 40) {
  const curve = new CatmullRomCurve3(points);
  const frames = curve.computeFrenetFrames(segments, false);
  const center = new Vector3();
  const sampler: SurfaceSampler = (u, w, target) => {
    const index = Math.round(u * segments);
    curve.getPointAt(u, center);
    const angle = w * TAU;
    const r = radius(u);
    target
      .copy(center)
      .addScaledVector(frames.normals[index], r * Math.cos(angle))
      .addScaledVector(frames.binormals[index], r * flatten * Math.sin(angle));
  };
  return buildTubeGeometry(sampler, {
    lengthSegments: segments,
    radialSegments: 12,
    capStart: true,
    capEnd: true,
  });
}

type AngleFn = (angle: number) => number;

export function buildOutfitPieces(model: BodyModel, outfit: Outfit, mode: OutfitMode): GarmentPiece[] {
  const H = model.height;
  const hs = model.headScale;
  const L = model.landmarks;
  const female = model.gender === 'female';
  const pieces: GarmentPiece[] = [];
  const add = (piece: GarmentPiece) => pieces.push(piece);

  // ------------------------------------------------------------ Helpers
  const torsoRange = (value: number | AngleFn) =>
    typeof value === 'number' ? model.torsoU(value) : (w: number) => model.torsoU(value(w * TAU));

  const torsoShell = ({
    from,
    to,
    offset,
    drape = 0,
    capStart = false,
    lengthSegments = 44,
  }: {
    from: number | AngleFn;
    to: number | AngleFn;
    offset: number | ((y: number, angle: number) => number);
    drape?: number;
    capStart?: boolean;
    lengthSegments?: number;
  }) => {
    const sampler = offsetSurface(model.torso({ garment: true, drape }), {
      remap: rangeRemap(torsoRange(from), torsoRange(to)),
      offset: typeof offset === 'number' ? offset : (u, w) => offset(model.torsoY(u), w * TAU),
    });
    return buildTubeGeometry(sampler, { lengthSegments, radialSegments: 72, capStart });
  };

  /** Point on a torso garment surface (for straps, buttons, drawstrings). */
  const torsoGarmentPoint = (y: number, angle: number, offset: number, drape = 0) => {
    const sampler = offsetSurface(model.torso({ garment: true, drape }), { offset });
    const point = new Vector3();
    sampler(model.torsoU(y), (((angle / TAU) % 1) + 1) % 1, point);
    return point;
  };

  const torsoPatch = ({
    fromY,
    toY,
    center,
    halfWidth,
    offset,
    drape = 0,
  }: {
    fromY: number;
    toY: number;
    center: number;
    halfWidth: (v: number) => number;
    offset: number;
    drape?: number;
  }) => {
    const u0 = model.torsoU(fromY);
    const u1 = model.torsoU(toY);
    const sampler = offsetSurface(model.torso({ garment: true, drape }), {
      offset,
      remap: (u, w, target) => {
        target.u = lerp(u0, u1, u);
        const angle = center + lerp(-1, 1, w) * halfWidth(u);
        target.w = (((angle / TAU) % 1) + 1) % 1;
      },
    });
    return buildPatchGeometry(sampler, 10, 20);
  };

  const sleeve = (fromDistance: number, toDistance: number, offset: (distance: number) => number, capStart: boolean) => {
    // The shoulder is already covered by the torso shell: keep the sleeve cap snug
    // there, otherwise the two layers look like shoulder pads.
    const snugCap = (distance: number) =>
      lerp(0.0045 * H, offset(distance), smoothstep(-0.01 * H, 0.05 * H, distance));
    const sampler = offsetSurface(model.arm, {
      remap: rangeRemap(model.armU(fromDistance), model.armU(toDistance)),
      offset: (u) => snugCap(model.armDistance(u)),
    });
    return buildTubeGeometry(sampler, { lengthSegments: 40, radialSegments: 32, capStart });
  };

  const pantLeg = (
    fromY: number,
    toY: number,
    offset: (y: number) => number,
    envelopeFrom?: number,
    taper?: number,
  ) => {
    const sampler = offsetSurface(model.leg({ envelopeFrom, taper }), {
      remap: rangeRemap(model.legU(fromY), model.legU(toY)),
      offset: (u) => offset(model.legY(u)),
    });
    return buildTubeGeometry(sampler, { lengthSegments: 44, radialSegments: 40 });
  };

  const footShell = (offset: number, minY: number, maxY: number) => {
    const sampler = offsetSurface(model.foot, {
      offset,
      post: (point) => {
        point.y = clamp(point.y, minY, maxY);
      },
    });
    return buildTubeGeometry(sampler, { lengthSegments: 40, radialSegments: 32, capStart: true, capEnd: true });
  };

  const footPoint = (u: number, w: number, offset: number) => {
    const point = new Vector3();
    offsetSurface(model.foot, { offset })(u, w, point);
    return point;
  };

  /** Neckline height per angle: higher at the back, optional V at the front. */
  const neckline = (frontDrop: number, backDrop: number, vDepth = 0, vWidth = 0.45): AngleFn => (angle) => {
    const front = Math.max(0, Math.sin(angle));
    const v = vDepth * Math.max(0, 1 - Math.abs(wrapAngle(angle - FRONT)) / vWidth);
    return L.neckBase - lerp(backDrop, frontDrop, front) * H - v * H;
  };

  /** Shoulder strap path that goes over the shoulder at a constant distance from the neck. */
  const strap = (startY: number, offset: number, radius: number) => {
    const strapX = (female ? 0.058 : 0.064) * H;
    const probe = new Vector3();
    const angleFor = (y: number, sign: number) => {
      let lo = 0;
      let hi = Math.PI / 2;
      for (let i = 0; i < 24; i += 1) {
        const mid = (lo + hi) / 2;
        model.torsoPoint(y, sign * mid, probe, { garment: true });
        if (probe.x > strapX) lo = mid;
        else hi = mid;
      }
      return sign * (lo + hi) / 2;
    };
    let lo = L.shoulder;
    let hi = L.neckBase;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      model.torsoPoint(mid, 0, probe, { garment: true });
      if (probe.x > strapX) lo = mid;
      else hi = mid;
    }
    const topY = lo;
    const heights = [startY, lerp(startY, topY, 0.45), lerp(startY, topY, 0.8), topY - 0.002 * H];
    const front = heights.map((y) => torsoGarmentPoint(y, angleFor(y, 1), offset));
    const back = [...heights].reverse().map((y) => torsoGarmentPoint(y, angleFor(y, -1), offset));
    const top = torsoGarmentPoint(topY - 0.001 * H, 0, offset + 0.001 * H);
    return tubeAlongCurve([...front, top, ...back], () => radius, 0.5, 48);
  };

  // --------------------------------------------------------- Base layer
  if (mode === 'base') {
    if (female) {
      const braTop: AngleFn = (angle) =>
        L.armpit -
        0.022 * H +
        0.034 * H * (pairBump(angle, FRONT, 0.55, 0.2) + pairBump(angle, BACK, 0.55, 0.2)) +
        0.008 * H * gaussian(wrapAngle(angle - BACK), 0.6);
      add({
        id: 'bra',
        geometry: torsoShell({ from: L.underbust - 0.004 * H, to: braTop, offset: 0.003 * H }),
        color: BASE_LAYER_COLOR,
        fabric: 'rib',
      });
      add({
        id: 'bra-band',
        geometry: torsoShell({ from: L.underbust - 0.016 * H, to: L.underbust - 0.002 * H, offset: 0.0036 * H, lengthSegments: 6 }),
        color: BASE_LAYER_ACCENT,
        fabric: 'rib',
      });
      add({ id: 'bra-strap', geometry: strap(L.armpit - 0.004 * H, 0.0032 * H, 0.0035 * H), color: BASE_LAYER_COLOR, fabric: 'rib', mirror: true });
    }

    const briefTop = female ? 0.545 * H : 0.56 * H;
    add({
      id: 'briefs',
      geometry: torsoShell({ from: model.torsoY(0), to: briefTop - 0.012 * H, offset: 0.0028 * H, capStart: true, lengthSegments: 24 }),
      color: BASE_LAYER_COLOR,
      fabric: 'rib',
    });
    add({
      id: 'briefs-band',
      geometry: torsoShell({ from: briefTop - 0.013 * H, to: briefTop, offset: 0.0036 * H, lengthSegments: 6 }),
      color: BASE_LAYER_ACCENT,
      fabric: 'rib',
    });
    add({
      id: 'briefs-leg',
      geometry: pantLeg(model.legY(0), L.crotch - (female ? 0.012 : 0.06) * H, () => 0.0028 * H),
      color: BASE_LAYER_COLOR,
      fabric: 'rib',
      mirror: true,
    });

    return pieces;
  }

  // ---------------------------------------------------------------- Top
  const topColor = outfit.garmentColor;
  const topTrim = shade(topColor, -0.12);
  // Below the waist, tops hang over the waistband of any bottom (max 0.0077H).
  const overWaistband = (offset: number) => (y: number) =>
    lerp(Math.max(offset, 0.0098 * H), offset, smoothstep(L.waist - 0.012 * H, L.waist + 0.02 * H, y));

  if (outfit.top === 'classic') {
    const collar = neckline(0.016, 0.004);
    add({
      id: 'tee',
      geometry: torsoShell({
        from: (female ? 0.5 : 0.49) * H,
        to: collar,
        offset: overWaistband(0.0055 * H),
        drape: 0.35,
      }),
      color: topColor,
      fabric: 'cotton',
    });
    add({
      id: 'tee-collar',
      geometry: torsoShell({
        from: (angle) => collar(angle) - 0.009 * H,
        to: (angle) => collar(angle) + 0.0005 * H,
        offset: 0.0068 * H,
        lengthSegments: 6,
      }),
      color: topTrim,
      fabric: 'rib',
    });
    add({
      id: 'tee-sleeve',
      geometry: sleeve(model.armLengths.start, 0.105 * H, (d) => 0.0062 * H + 0.006 * H * smoothstep(0.02 * H, 0.105 * H, d), true),
      color: topColor,
      fabric: 'cotton',
      mirror: true,
    });
  }

  if (outfit.top === 'hoodie') {
    const hem = 0.505 * H;
    const collar = neckline(0.02, 0.002);
    const bodyOffset = (y: number) => 0.0095 * H + 0.003 * H * (1 - smoothstep(L.hip, L.waist, y));
    add({
      id: 'hoodie',
      geometry: torsoShell({ from: hem + 0.03 * H, to: collar, offset: bodyOffset, drape: 0.45 }),
      color: topColor,
      fabric: 'fleece',
    });
    add({
      id: 'hoodie-hem',
      geometry: torsoShell({ from: hem, to: hem + 0.032 * H, offset: 0.0082 * H, lengthSegments: 6 }),
      color: topTrim,
      fabric: 'rib',
    });
    const { wrist } = model.armLengths;
    add({
      id: 'hoodie-sleeve',
      geometry: sleeve(model.armLengths.start, wrist - 0.028 * H, () => 0.0095 * H, true),
      color: topColor,
      fabric: 'fleece',
      mirror: true,
    });
    add({
      id: 'hoodie-cuff',
      geometry: sleeve(wrist - 0.032 * H, wrist + 0.004 * H, () => 0.0062 * H, false),
      color: topTrim,
      fabric: 'rib',
      mirror: true,
    });

    // Hood lying around the neck and on the upper back.
    const hoodPoints: Vector3[] = [];
    const center = new Vector3();
    for (let i = 0; i <= 8; i += 1) {
      const angle = FRONT - 1.05 - (i / 8) * (TAU - 2.1);
      const backness = Math.max(0, -Math.sin(angle));
      const y = L.neckBase - 0.012 * H + 0.012 * H * backness;
      model.torsoPoint(y, angle, center, { garment: true });
      const radial = new Vector3(Math.cos(angle), 0, Math.sin(angle));
      hoodPoints.push(center.clone().addScaledVector(radial, 0.024 * H + 0.012 * H * backness));
    }
    add({
      id: 'hood-roll',
      geometry: tubeAlongCurve(hoodPoints, (u) => 0.02 * H * (0.45 + 0.55 * Math.pow(Math.sin(Math.PI * u), 0.6)), 0.8, 48),
      color: topColor,
      fabric: 'fleece',
    });
    // Hood lying flat on the upper back.
    const hoodBackY = L.armpit + 0.024 * H;
    const hoodBack = new SphereGeometry(1, 28, 20);
    hoodBack.scale(0.08 * H, 0.068 * H, 0.013 * H);
    hoodBack.rotateX(-0.28);
    hoodBack.translate(0, hoodBackY, model.torsoPoint(hoodBackY, BACK, new Vector3(), { garment: true }).z - 0.012 * H);
    add({ id: 'hood-back', geometry: hoodBack, color: topColor, fabric: 'fleece' });

    add({
      id: 'hoodie-pocket',
      geometry: torsoPatch({
        fromY: hem + 0.034 * H,
        toY: hem + 0.1 * H,
        center: FRONT,
        halfWidth: (v) => lerp(0.62, 0.48, v),
        offset: bodyOffset(hem + 0.07 * H) + 0.003 * H,
        drape: 0.45,
      }),
      color: shade(topColor, -0.06),
      fabric: 'fleece',
    });

    [-1, 1].forEach((side) => {
      const angle = FRONT + side * 0.2;
      const startY = collar(angle) - 0.004 * H;
      // Follow the hoodie surface so the cords lie on the chest instead of cutting through it.
      const cord = [0, 0.35, 0.7, 1].map((k) =>
        torsoGarmentPoint(startY - k * 0.075 * H, angle + side * k * 0.04, bodyOffset(startY) + 0.0035 * H, 0.45),
      );
      const bottom = cord[cord.length - 1];
      add({ id: `drawstring-${side}`, geometry: tubeAlongCurve(cord, () => 0.0022 * H, 1, 16), color: '#F5F5F4', fabric: 'cotton' });
      const tip = new SphereGeometry(0.0034 * H, 10, 8);
      tip.translate(bottom.x, bottom.y, bottom.z);
      add({ id: `drawstring-tip-${side}`, geometry: tip, color: '#D6D3D1', fabric: 'metal' });
    });
  }

  if (outfit.top === 'overshirt') {
    const hem = 0.49 * H;
    const collar = neckline(-0.004, -0.012, 0.075, 0.5);
    add({
      id: 'overshirt',
      geometry: torsoShell({
        from: hem,
        to: collar,
        offset: (y) => 0.0088 * H + 0.003 * H * (1 - smoothstep(L.hip, L.waist, y)),
        drape: 0.4,
      }),
      color: topColor,
      fabric: 'twill',
    });
    const placketTop = collar(FRONT) - 0.004 * H;
    add({
      id: 'overshirt-placket',
      geometry: torsoPatch({
        fromY: hem,
        toY: placketTop,
        center: FRONT,
        halfWidth: () => 0.07,
        offset: 0.0104 * H,
        drape: 0.4,
      }),
      color: shade(topColor, -0.06),
      fabric: 'twill',
    });
    for (let y = hem + 0.03 * H; y < placketTop - 0.008 * H; y += 0.05 * H) {
      const inner = torsoGarmentPoint(y, FRONT, 0.0104 * H, 0.4);
      const outer = torsoGarmentPoint(y, FRONT, 0.0122 * H, 0.4);
      add({ id: `button-${y.toFixed(3)}`, geometry: rod(inner, outer, 0.0045 * H, 14), color: '#E7E5E4', fabric: 'rubber' });
    }
    add({
      id: 'overshirt-pocket',
      geometry: torsoPatch({
        fromY: L.bust + 0.004 * H,
        toY: L.bust + 0.046 * H,
        center: FRONT + 0.45,
        halfWidth: () => 0.17,
        offset: 0.0102 * H,
        drape: 0.4,
      }),
      color: shade(topColor, -0.04),
      fabric: 'twill',
    });
    const { wrist } = model.armLengths;
    add({
      id: 'overshirt-sleeve',
      geometry: sleeve(model.armLengths.start, wrist - 0.036 * H, () => 0.009 * H, true),
      color: topColor,
      fabric: 'twill',
      mirror: true,
    });
    add({
      id: 'overshirt-cuff',
      geometry: sleeve(wrist - 0.04 * H, wrist + 0.002 * H, () => 0.0078 * H, false),
      color: shade(topColor, -0.06),
      fabric: 'twill',
      mirror: true,
    });
  }

  if (outfit.top === 'tank') {
    const top: AngleFn = (angle) =>
      L.armpit -
      0.012 * H +
      0.036 * H * (pairBump(angle, FRONT, 0.55, 0.2) + pairBump(angle, BACK, 0.55, 0.2)) +
      0.014 * H * (gaussian(wrapAngle(angle - FRONT), 0.5) + gaussian(wrapAngle(angle - BACK), 0.5));
    add({
      id: 'tank',
      geometry: torsoShell({ from: 0.5 * H, to: top, offset: overWaistband(0.0048 * H), drape: 0.2 }),
      color: topColor,
      fabric: 'rib',
    });
    add({ id: 'tank-strap', geometry: strap(L.armpit + 0.018 * H, 0.0048 * H, 0.0058 * H), color: topColor, fabric: 'rib', mirror: true });
  }

  // ------------------------------------------------------------- Bottom
  const bottomColor = BOTTOM_COLORS[outfit.bottom];
  const bottomFabric: Fabric = outfit.bottom === 'jeans' ? 'denim' : 'twill';
  const waistTop =
    outfit.bottom === 'jeans'
      ? L.waist - 0.035 * H
      : outfit.bottom === 'trousers'
        ? L.waist - 0.012 * H
        : L.waist - 0.03 * H;
  const pelvisOffset = outfit.bottom === 'trousers' ? 0.0065 * H : outfit.bottom === 'jeans' ? 0.005 * H : 0.006 * H;

  add({
    id: 'pants-pelvis',
    geometry: torsoShell({
      from: model.torsoY(0),
      to: waistTop - 0.016 * H,
      offset: pelvisOffset,
      capStart: true,
      lengthSegments: 30,
    }),
    color: bottomColor,
    fabric: bottomFabric,
  });
  add({
    id: 'pants-waistband',
    geometry: torsoShell({ from: waistTop - 0.018 * H, to: waistTop, offset: pelvisOffset + 0.0012 * H, lengthSegments: 6 }),
    color: shade(bottomColor, -0.08),
    fabric: bottomFabric,
  });

  if (outfit.bottom === 'jeans') {
    add({
      id: 'jeans-leg',
      geometry: pantLeg(model.legY(0), 0.042 * H, (y) => 0.005 * H + 0.003 * H * (1 - smoothstep(L.knee, L.crotch, y)), L.knee + 0.02 * H, 0.92),
      color: bottomColor,
      fabric: 'denim',
      mirror: true,
    });
    [-1, 1].forEach((side) => {
      add({
        id: `jeans-pocket-${side}`,
        geometry: torsoPatch({
          fromY: L.hip - 0.042 * H,
          toY: L.hip + 0.014 * H,
          center: BACK + side * 0.47,
          halfWidth: (v) => lerp(0.2, 0.25, v),
          offset: pelvisOffset + 0.0012 * H,
        }),
        color: shade(bottomColor, -0.1),
        fabric: 'denim',
      });
    });
  }

  if (outfit.bottom === 'trousers') {
    add({
      id: 'trousers-leg',
      geometry: pantLeg(model.legY(0), 0.03 * H, (y) => 0.0065 * H + 0.0025 * H * (1 - smoothstep(L.knee, L.crotch, y)), 0.4 * H, 0.97),
      color: bottomColor,
      fabric: 'twill',
      mirror: true,
    });
  }

  if (outfit.bottom === 'shorts') {
    const hem = (female ? 0.385 : 0.37) * H;
    const legOffset = (y: number) => 0.006 * H + 0.007 * H * (1 - smoothstep(hem, L.crotch, y));
    add({
      id: 'shorts-leg',
      geometry: pantLeg(model.legY(0), hem + 0.012 * H, legOffset, L.crotch - 0.02 * H, 1.05),
      color: bottomColor,
      fabric: 'twill',
      mirror: true,
    });
    add({
      id: 'shorts-hem',
      geometry: pantLeg(hem + 0.013 * H, hem, (y) => legOffset(y) + 0.0012 * H, L.crotch - 0.02 * H, 1.05),
      color: shade(bottomColor, -0.1),
      fabric: 'twill',
      mirror: true,
    });
  }

  // --------------------------------------------------------------- Shoes
  const shoeColor = SHOE_COLORS[outfit.shoes];

  if (outfit.shoes === 'sneakers') {
    add({ id: 'sneaker-upper', geometry: footShell(0.0068 * H, 0.006 * H, 0.058 * H), color: shoeColor, fabric: 'leather', mirror: true });
    add({ id: 'sneaker-sole', geometry: footShell(0.009 * H, 0, 0.0135 * H), color: SOLE_COLORS.sneakers, fabric: 'rubber', mirror: true });
    for (let i = 0; i < 4; i += 1) {
      const u = lerp(0.36, 0.58, i / 3);
      const left = footPoint(u, 0.18, 0.0078 * H);
      const right = footPoint(u, 0.32, 0.0078 * H);
      add({ id: `lace-${i}`, geometry: rod(left, right, 0.0016 * H), color: '#F5F5F4', fabric: 'cotton', mirror: true });
    }
  }

  if (outfit.shoes === 'boots') {
    add({ id: 'boot-upper', geometry: footShell(0.0075 * H, 0.008 * H, 0.07 * H), color: shoeColor, fabric: 'leather', mirror: true });
    add({ id: 'boot-shaft', geometry: pantLeg(0.155 * H, 0.03 * H, () => 0.0075 * H), color: shoeColor, fabric: 'leather', mirror: true });
    add({ id: 'boot-rim', geometry: pantLeg(0.158 * H, 0.146 * H, () => 0.0088 * H), color: shade(shoeColor, -0.25), fabric: 'leather', mirror: true });
    add({ id: 'boot-sole', geometry: footShell(0.0105 * H, 0, 0.017 * H), color: SOLE_COLORS.boots, fabric: 'rubber', mirror: true });
  }

  if (outfit.shoes === 'loafers') {
    add({ id: 'loafer-upper', geometry: footShell(0.006 * H, 0.004 * H, 0.035 * H), color: shoeColor, fabric: 'leather', mirror: true });
    add({ id: 'loafer-sole', geometry: footShell(0.0078 * H, 0, 0.009 * H), color: SOLE_COLORS.loafers, fabric: 'rubber', mirror: true });
    const strapPoints = [0.1, 0.17, 0.25, 0.33, 0.4].map((w) => footPoint(0.64, w, 0.0072 * H));
    add({
      id: 'loafer-strap',
      geometry: tubeAlongCurve(strapPoints, () => 0.0024 * H, 0.45, 24),
      color: shade(shoeColor, -0.2),
      fabric: 'leather',
      mirror: true,
    });
  }

  // ---------------------------------------------------------- Accessory
  const probe = new Vector3();

  if (outfit.accessory === 'glasses') {
    const lensRadius = 0.0128 * hs;
    [-1, 1].forEach((side) => {
      const angle = FRONT - side * 0.36;
      const eye = model.headPoint(0.5, angle, new Vector3());
      const center = new Vector3(eye.x, eye.y, model.headPoint(0.5, FRONT - side * 0.2, probe).z + 0.012 * hs);

      const frame = new TorusGeometry(lensRadius, 0.0014 * hs, 8, 32);
      frame.scale(1.18, 1, 1);
      frame.rotateY(side * 0.12);
      frame.translate(center.x, center.y, center.z);
      add({ id: `glasses-frame-${side}`, geometry: frame, color: '#111827', fabric: 'metal' });

      const lens = new CircleGeometry(lensRadius, 32);
      lens.scale(1.18, 1, 1);
      lens.rotateY(side * 0.12);
      lens.translate(center.x, center.y, center.z);
      add({ id: `glasses-lens-${side}`, geometry: lens, color: '#1F2937', fabric: 'lens' });

      const hinge = new Vector3(center.x + side * lensRadius * 1.16, center.y + 0.002 * hs, center.z - 0.004 * hs);
      const sidePoint = model.headPoint(0.5, side > 0 ? 0 : Math.PI, new Vector3());
      const earPoint = new Vector3(sidePoint.x + side * 0.004 * hs, hinge.y, sidePoint.z - 0.02 * hs);
      add({ id: `glasses-temple-${side}`, geometry: rod(hinge, earPoint, 0.0011 * hs), color: '#111827', fabric: 'metal' });
    });
    const bridgeLeft = new Vector3(-0.008 * hs, 0, 0);
    const bridgeRight = new Vector3(0.008 * hs, 0, 0);
    const bridgeCenter = model.headPoint(0.52, FRONT, new Vector3()).add(new Vector3(0, 0, 0.006 * hs));
    add({
      id: 'glasses-bridge',
      geometry: rod(bridgeLeft.add(bridgeCenter), bridgeRight.add(bridgeCenter), 0.0012 * hs),
      color: '#111827',
      fabric: 'metal',
    });
  }

  if (outfit.accessory === 'cap') {
    const capStart = (angle: number) => {
      const sin = Math.sin(angle);
      return sin >= 0 ? 0.6 + 0.06 * Math.pow(sin, 1.3) : 0.6 - 0.08 * Math.pow(-sin, 0.9);
    };
    const capOffset = (t: number, angle: number) => model.hairOffset(t, angle) + 0.0045 * hs;
    const dome = offsetSurface(model.head, {
      remap: rangeRemap((w) => capStart(model.headAngle(w)), 1),
      offset: (t, w) => capOffset(t, model.headAngle(w)),
    });
    add({
      id: 'cap-dome',
      geometry: buildTubeGeometry(dome, { lengthSegments: 28, radialSegments: 96, capEnd: true }),
      color: '#1F2937',
      fabric: 'twill',
    });

    const frontT = capStart(FRONT) + 0.012;
    const front = model.headPoint(frontT, FRONT, new Vector3());
    const width = model.headPoint(frontT, 0.15, probe).x * 1.02;
    const brimShape = new Shape();
    brimShape.absellipse(0, 0, width, 0.058 * hs, 0, Math.PI, false, 0);
    const brim = new ExtrudeGeometry(brimShape, {
      depth: 0.003 * hs,
      bevelEnabled: true,
      bevelThickness: 0.0012 * hs,
      bevelSize: 0.0012 * hs,
      bevelSegments: 2,
      curveSegments: 32,
    });
    brim.rotateX(Math.PI / 2 + 0.18);
    brim.translate(0, front.y + 0.002 * hs, front.z + capOffset(frontT, FRONT) - 0.014 * hs);
    add({ id: 'cap-brim', geometry: brim, color: '#111827', fabric: 'twill' });

    const button = new SphereGeometry(0.0055 * hs, 12, 8);
    const crown = model.headPoint(1, FRONT, new Vector3());
    button.translate(crown.x, crown.y + capOffset(1, FRONT) + 0.003 * hs, crown.z);
    add({ id: 'cap-button', geometry: button, color: '#111827', fabric: 'twill' });
  }

  return pieces;
}

/** Hair tie for the ponytail, aligned with the hair direction. */
export function buildPonytailTie(model: BodyModel) {
  if (!model.ponytailTie) return null;
  const { position, direction, radius } = model.ponytailTie;
  const tie = new TorusGeometry(radius, 0.0035 * model.headScale, 8, 24);
  tie.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), direction.clone().normalize()));
  tie.translate(position.x, position.y, position.z);
  return tie;
}

export function disposePieces(pieces: GarmentPiece[]) {
  pieces.forEach((piece) => piece.geometry.dispose());
}

