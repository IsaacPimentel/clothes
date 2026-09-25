import { CatmullRomCurve3, Vector3 } from 'three';

import type { AvatarGender, AvatarProfile } from '../../../types/avatar';
import {
  BACK,
  FRONT,
  TAU,
  clamp,
  gaussian,
  lerp,
  monotoneCurve,
  pairBump,
  smoothstep,
  superCos,
  superSin,
  wrapAngle,
  type CurveKey,
} from './math';
import type { SurfaceSampler } from './surface';

export type BodyShape = Pick<AvatarProfile, 'gender' | 'height' | 'bust' | 'waist' | 'hips'>;

/**
 * Parametric human body. Every part is a smooth surface driven by the
 * measurements of the avatar form, in meters (y up, feet on y = 0, facing +z).
 * Right-side limbs are modelled on +x; the left side is a mirrored copy.
 */

type Levels = {
  crotch: number;
  hip: number;
  highHip: number;
  waist: number;
  underbust: number;
  bust: number;
  armpit: number;
  shoulder: number;
  trap: number;
  neck: number;
};

// Landmark heights as a fraction of body height (anthropometric averages).
const FEMALE_LEVELS: Levels = {
  crotch: 0.468,
  hip: 0.515,
  highHip: 0.568,
  waist: 0.625,
  underbust: 0.683,
  bust: 0.722,
  armpit: 0.764,
  shoulder: 0.815,
  trap: 0.834,
  neck: 0.85,
};

const MALE_LEVELS: Levels = {
  crotch: 0.475,
  hip: 0.52,
  highHip: 0.565,
  waist: 0.61,
  underbust: 0.675,
  bust: 0.728,
  armpit: 0.77,
  shoulder: 0.818,
  trap: 0.836,
  neck: 0.852,
};

type Ratios = { front: number; back: number; nFront: number; nBack: number };

type TorsoRatios = Record<'hip' | 'highHip' | 'waist' | 'underbust' | 'bust' | 'armpit', Ratios>;

const FEMALE_RATIOS: TorsoRatios = {
  hip: { front: 0.62, back: 0.66, nFront: 2.1, nBack: 2.2 },
  highHip: { front: 0.68, back: 0.7, nFront: 2.1, nBack: 2.1 },
  waist: { front: 0.78, back: 0.72, nFront: 2, nBack: 2 },
  underbust: { front: 0.7, back: 0.74, nFront: 2.1, nBack: 2.1 },
  bust: { front: 0.64, back: 0.78, nFront: 2.1, nBack: 2.1 },
  armpit: { front: 0.58, back: 0.66, nFront: 2.3, nBack: 2.3 },
};

const MALE_RATIOS: TorsoRatios = {
  hip: { front: 0.7, back: 0.74, nFront: 2.2, nBack: 2.2 },
  highHip: { front: 0.74, back: 0.72, nFront: 2.2, nBack: 2.2 },
  waist: { front: 0.82, back: 0.74, nFront: 2.2, nBack: 2.1 },
  underbust: { front: 0.72, back: 0.72, nFront: 2.3, nBack: 2.3 },
  bust: { front: 0.72, back: 0.74, nFront: 2.4, nBack: 2.4 },
  armpit: { front: 0.6, back: 0.66, nFront: 2.5, nBack: 2.5 },
};

export type Landmarks = {
  height: number;
  crotch: number;
  hip: number;
  highHip: number;
  waist: number;
  underbust: number;
  bust: number;
  armpit: number;
  shoulder: number;
  trap: number;
  neckBase: number;
  chin: number;
  knee: number;
  calf: number;
  ankle: number;
};

export type TorsoOptions = {
  /** Fabric mode: bridges the gap between bust / glutes instead of following it. */
  garment?: boolean;
  /** Fabric falling from the bust apex (slope, 0 disables). */
  drape?: number;
};

export type LegOptions = {
  /** Below this height the leg keeps at least this cross-section (straight trousers). */
  envelopeFrom?: number;
  /** Scale of that envelope at the ankle (1 = straight, < 1 = tapered). */
  taper?: number;
};

export type ArmLengths = {
  start: number;
  upper: number;
  fore: number;
  wrist: number;
  hand: number;
  end: number;
};

export type BodyModel = {
  gender: AvatarGender;
  height: number;
  headScale: number;
  landmarks: Landmarks;
  torso: (options?: TorsoOptions) => SurfaceSampler;
  torsoU: (y: number) => number;
  torsoY: (u: number) => number;
  torsoPoint: (y: number, angle: number, target: Vector3, options?: TorsoOptions) => Vector3;
  neck: SurfaceSampler;
  head: SurfaceSampler;
  headAngle: (w: number) => number;
  headPoint: (t: number, angle: number, target: Vector3) => Vector3;
  hairStart: (angle: number) => number;
  hairOffset: (t: number, angle: number) => number;
  ponytail: SurfaceSampler | null;
  ponytailTie: { position: Vector3; direction: Vector3; radius: number } | null;
  ear: { visible: boolean; position: Vector3; rotationY: number; scale: Vector3 };
  arm: SurfaceSampler;
  armU: (distance: number) => number;
  armDistance: (u: number) => number;
  armLengths: ArmLengths;
  armCenter: (distance: number, target: Vector3) => Vector3;
  thumb: SurfaceSampler;
  leg: (options?: LegOptions) => SurfaceSampler;
  legU: (y: number) => number;
  legY: (u: number) => number;
  foot: SurfaceSampler;
  footU: (z: number) => number;
  footRange: { heel: number; toe: number };
};

/** Scale for a ring shape so that its perimeter matches a real circumference. */
function fitScale(circumference: number, ratios: Ratios, bump: (angle: number) => number = () => 0) {
  const samples = 128;
  let perimeter = 0;
  let previousX = 0;
  let previousZ = 0;

  for (let i = 0; i <= samples; i += 1) {
    const angle = (i / samples) * TAU;
    const sin = Math.sin(angle);
    const exponent = sin >= 0 ? ratios.nFront : ratios.nBack;
    const offset = bump(angle);
    const x = superCos(angle, exponent) + Math.cos(angle) * offset;
    const z = (sin >= 0 ? ratios.front : ratios.back) * superSin(angle, exponent) + sin * offset;
    if (i > 0) perimeter += Math.hypot(x - previousX, z - previousZ);
    previousX = x;
    previousZ = z;
  }

  return circumference / perimeter;
}

const softplus = (x: number, width: number) => width * Math.log1p(Math.exp(x / width));

const curveOf = <T>(keys: readonly T[], x: (key: T) => number, y: (key: T) => number) =>
  monotoneCurve(keys.map((key) => [x(key), y(key)] as CurveKey));

/**
 * Tiny round-robin cache for per-ring values. Offset surfaces sample the
 * neighbouring rings for every vertex (normals), so a few slots avoid
 * re-evaluating all the profile curves each time.
 */
function slotCache<T extends { key: number }>(slots: number, make: () => T, fill: (key: number, entry: T) => void) {
  const entries = Array.from({ length: slots }, make);
  let next = 0;
  return (key: number) => {
    for (let i = 0; i < slots; i += 1) {
      if (entries[i].key === key) return entries[i];
    }
    const entry = entries[next];
    next = (next + 1) % slots;
    entry.key = key;
    fill(key, entry);
    return entry;
  };
}

export function createBodyModel(profile: BodyShape): BodyModel {
  const female = profile.gender === 'female';
  const H = profile.height / 100;
  const bust = profile.bust / 100;
  const waist = profile.waist / 100;
  const hips = profile.hips / 100;
  const L = female ? FEMALE_LEVELS : MALE_LEVELS;
  const R = female ? FEMALE_RATIOS : MALE_RATIOS;

  // 1 = average build for the height; drives limb girth and belly.
  const fullness = clamp(waist / H / (female ? 0.4 : 0.47), 0.8, 1.6);
  // Heads do not scale linearly with body height.
  const headScale = 1.7 * Math.pow(H / 1.7, 0.6);

  // ---------------------------------------------------------------- Torso
  const underbust = female
    ? clamp(waist + (bust - waist) * 0.36, Math.min(waist, bust - 0.03), bust - 0.03)
    : lerp(waist, bust, 0.78);
  const upperChest = female ? ((bust + underbust) / 2) * 1.02 : bust * 1.01;
  const highHip = lerp(waist, hips, female ? 0.62 : 0.7);

  const bustSpread = female ? 0.42 : 0.5;
  const bustSigma = female ? 0.27 : 0.36;
  const bustRel = female ? clamp(((bust - underbust) / bust) * 2.3, 0.08, 0.5) : 0.075;
  const buttRel = female ? 0.1 : 0.055;
  const bellyRel = clamp((fullness - 1) * (female ? 0.16 : 0.24), 0, 0.14);

  const bustBump = (angle: number) => pairBump(angle, FRONT, bustSpread, bustSigma, true);
  const buttBump = (angle: number) => pairBump(angle, BACK, 0.5, 0.42, true);
  const bellyBump = (angle: number) => gaussian(wrapAngle(angle - FRONT), 0.75);

  const hipScale = fitScale(hips, R.hip, (a) => buttRel * buttBump(a));
  const highHipScale = fitScale(
    highHip,
    R.highHip,
    (a) => 0.3 * buttRel * buttBump(a) + 0.9 * bellyRel * bellyBump(a),
  );
  const waistScale = fitScale(waist, R.waist, (a) => 0.6 * bellyRel * bellyBump(a));
  const underbustScale = fitScale(underbust, R.underbust, (a) => 0.15 * bustRel * bustBump(a));
  const bustScale = fitScale(bust, R.bust, (a) => bustRel * bustBump(a));
  const armpitScale = fitScale(upperChest, R.armpit, (a) => 0.16 * bustRel * bustBump(a));

  const neckRadius = ((female ? 0.196 : 0.215) * H * Math.pow(fullness, 0.35)) / TAU;
  const alpha =
    (clamp((female ? 16 : 14.5) + (fullness - 1) * 8, 12, 24) * Math.PI) / 180;
  const shoulderX = Math.max(
    (female ? 0.1 : 0.112) * H * (1 + 0.08 * (fullness - 1)),
    armpitScale * 0.92,
  );

  type RingKey = { y: number; cz: number; rx: number; front: number; back: number; nFront: number; nBack: number };
  const ringFrom = (level: number, scale: number, ratios: Ratios, cz: number): RingKey => ({
    y: level * H,
    cz: cz * H,
    rx: scale,
    front: ratios.front * scale,
    back: ratios.back * scale,
    nFront: ratios.nFront,
    nBack: ratios.nBack,
  });

  const torsoBottom = (L.crotch - 0.018) * H;
  const torsoTop = L.neck * H;

  const torsoKeys: RingKey[] = [
    {
      y: torsoBottom,
      cz: -0.004 * H,
      rx: hipScale * 0.42,
      front: R.hip.front * hipScale * 0.36,
      back: R.hip.back * hipScale * 0.4,
      nFront: 2,
      nBack: 2,
    },
    {
      y: L.crotch * H,
      cz: -0.006 * H,
      rx: hipScale * 0.76,
      front: R.hip.front * hipScale * 0.62,
      back: R.hip.back * hipScale * 0.64,
      nFront: 2.1,
      nBack: 2.1,
    },
    ringFrom(L.hip, hipScale, R.hip, female ? -0.012 : -0.008),
    ringFrom(L.highHip, highHipScale, R.highHip, female ? -0.008 : -0.006),
    ringFrom(L.waist, waistScale, R.waist, 0),
    ringFrom(L.underbust, underbustScale, R.underbust, 0.003),
    ringFrom(L.bust, bustScale, R.bust, female ? 0.002 : 0.004),
    ringFrom(L.armpit, armpitScale, R.armpit, 0),
    {
      y: L.shoulder * H,
      cz: -0.012 * H,
      rx: shoulderX + 0.008 * H,
      front: (female ? 0.048 : 0.054) * H,
      back: (female ? 0.054 : 0.06) * H,
      nFront: 2.6,
      nBack: 2.6,
    },
    {
      y: L.trap * H,
      cz: -0.016 * H,
      rx: (female ? 0.066 : 0.074) * H,
      front: (female ? 0.036 : 0.04) * H,
      back: (female ? 0.046 : 0.05) * H,
      nFront: 2.3,
      nBack: 2.3,
    },
    {
      y: torsoTop,
      cz: -0.014 * H,
      rx: neckRadius * 1.1,
      front: neckRadius,
      back: neckRadius * 1.05,
      nFront: 2,
      nBack: 2,
    },
  ];

  const torsoCurves = {
    rx: curveOf(torsoKeys, (k) => k.y, (k) => k.rx),
    front: curveOf(torsoKeys, (k) => k.y, (k) => k.front),
    back: curveOf(torsoKeys, (k) => k.y, (k) => k.back),
    nFront: curveOf(torsoKeys, (k) => k.y, (k) => k.nFront),
    nBack: curveOf(torsoKeys, (k) => k.y, (k) => k.nBack),
    cz: curveOf(torsoKeys, (k) => k.y, (k) => k.cz),
  };

  const at = (level: number) => level * H;
  const bustAmp = monotoneCurve(
    female
      ? [
          [at(L.underbust - 0.014), 0],
          [at(L.underbust + 0.008), 0.38],
          [at(L.bust), 1],
          [at(L.bust + 0.022), 0.72],
          [at(L.armpit), 0.16],
          [at(L.shoulder), 0],
        ]
      : [
          // Pectorals: defined lower edge, flatter towards the collarbones.
          [at(L.bust - 0.03), 0],
          [at(L.bust - 0.016), 0.85],
          [at(L.bust), 1],
          [at(L.armpit), 0.55],
          [at(L.shoulder), 0],
        ],
  );
  const buttAmp = monotoneCurve([
    [at(L.crotch - 0.012), 0],
    [at(L.crotch + 0.012), 0.62],
    [at(L.hip - 0.008), 1],
    [at(L.highHip), 0.3],
    [at(L.waist), 0],
  ]);
  const bellyAmp = monotoneCurve([
    [at(L.hip), 0],
    [at((L.hip + L.waist) / 2 + 0.01), 1],
    [at(L.waist), 0.6],
    [at(L.underbust), 0],
  ]);
  const bladeAmp = monotoneCurve([
    [at(L.waist + 0.03), 0],
    [at(L.armpit - 0.02), 1],
    [at(L.shoulder - 0.01), 0.5],
    [at(L.trap), 0],
  ]);

  type Ring = {
    y: number;
    rx: number;
    front: number;
    back: number;
    nFront: number;
    nBack: number;
    cz: number;
    bust: number;
    butt: number;
    belly: number;
    blades: number;
  };
  const makeRing = (): Ring => ({
    y: Number.NaN,
    rx: 0,
    front: 0,
    back: 0,
    nFront: 2,
    nBack: 2,
    cz: 0,
    bust: 0,
    butt: 0,
    belly: 0,
    blades: 0,
  });
  const loadRing = (ring: Ring, y: number) => {
    if (ring.y === y) return ring;
    ring.y = y;
    ring.rx = torsoCurves.rx(y);
    ring.front = torsoCurves.front(y);
    ring.back = torsoCurves.back(y);
    ring.nFront = torsoCurves.nFront(y);
    ring.nBack = torsoCurves.nBack(y);
    ring.cz = torsoCurves.cz(y);
    ring.bust = bustRel * bustScale * bustAmp(y);
    ring.butt = buttRel * hipScale * buttAmp(y);
    ring.belly = bellyRel * waistScale * bellyAmp(y);
    ring.blades = 0.007 * H * bladeAmp(y);
    return ring;
  };

  const ringPoint = (ring: Ring, angle: number, garment: boolean, target: Vector3) => {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const exponent = sin >= 0 ? ring.nFront : ring.nBack;
    let x = ring.rx * superCos(angle, exponent);
    let z = (sin >= 0 ? ring.front : ring.back) * superSin(angle, exponent);
    const bump =
      ring.bust * pairBump(angle, FRONT, bustSpread, bustSigma, garment) +
      ring.butt * pairBump(angle, BACK, 0.5, 0.42, garment) +
      ring.belly * bellyBump(angle) +
      ring.blades * pairBump(angle, BACK, 0.75, 0.35);
    x += cos * bump;
    z += sin * bump;
    return target.set(x, ring.y, z + ring.cz);
  };

  const bustY = at(L.bust);
  const createTorsoPoint = () => {
    const rings = Array.from({ length: 4 }, makeRing);
    let nextRing = 0;
    const ringAt = (y: number) => {
      for (const ring of rings) {
        if (ring.y === y) return ring;
      }
      const ring = rings[nextRing];
      nextRing = (nextRing + 1) % rings.length;
      return loadRing(ring, y);
    };
    const bustRing = makeRing();
    const apex = new Vector3();
    return (y: number, angle: number, target: Vector3, options: TorsoOptions = {}) => {
      const garment = options.garment ?? false;
      ringPoint(ringAt(y), angle, garment, target);

      const drape = options.drape ?? 0;
      const sin = Math.sin(angle);
      if (drape > 0 && sin > 0 && y < bustY) {
        ringPoint(loadRing(bustRing, bustY), angle, true, apex);
        const hanging = apex.z - (bustY - y) * drape;
        if (hanging > target.z) {
          target.z = lerp(target.z, hanging, smoothstep(0.05, 0.45, sin));
        }
      }
      return target;
    };
  };

  const torsoPoint = createTorsoPoint();
  const torso = (options: TorsoOptions = {}): SurfaceSampler => {
    const point = createTorsoPoint();
    return (u, w, target) => {
      point(lerp(torsoBottom, torsoTop, u), w * TAU, target, options);
    };
  };
  const torsoU = (y: number) => (y - torsoBottom) / (torsoTop - torsoBottom);

  // ----------------------------------------------------------------- Head
  const headHeight = (female ? 0.126 : 0.128) * headScale;
  const chinY = H - headHeight;
  const hw = (female ? 0.0425 : 0.0445) * headScale;
  const hl = (female ? 0.0545 : 0.0565) * headScale;
  const neckTopY = chinY + 0.3 * headHeight;
  const neckTopZ = -0.004 * H;
  const headZ = neckTopZ + 0.22 * hl;

  // [t (chin -> crown), half width, front extent, back extent] relative to hw / hl.
  const headKeys: [number, number, number, number][] = [
    [0, female ? 0.34 : 0.36, female ? 0.54 : 0.62, -0.02],
    [0.06, female ? 0.58 : 0.6, female ? 0.66 : 0.72, -0.26],
    [0.16, female ? 0.76 : 0.78, female ? 0.76 : 0.77, -0.54],
    [0.28, female ? 0.84 : 0.87, 0.85, -0.74],
    [0.42, 0.92, 0.89, -0.88],
    [0.54, 0.95, 0.9, -0.97],
    [0.66, 1, 0.87, -1.02],
    [0.78, 0.97, 0.78, -1],
    [0.88, 0.85, 0.58, -0.86],
    [0.95, 0.62, 0.34, -0.6],
    [1, 0.2, 0.06, -0.14],
  ];
  const headRx = curveOf(headKeys, (k) => k[0], (k) => k[1] * hw);
  const headFront = curveOf(headKeys, (k) => k[0], (k) => k[2] * hl);
  const headBack = curveOf(headKeys, (k) => k[0], (k) => -k[3] * hl);

  const noseScale = female ? 0.9 : 1.05;
  // Short underside (tip -> base) like a real nose, long bridge up to the brow.
  const nose = monotoneCurve([
    [0.262, 0],
    [0.28, 0.07],
    [0.3, 0.15],
    [0.33, 0.18],
    [0.36, 0.165],
    [0.44, 0.1],
    [0.52, 0.045],
    [0.58, 0.015],
    [0.62, 0],
  ]);
  // Narrow at the base so it does not read as a dark band over the lips.
  const noseSigma = monotoneCurve([
    [0.24, 0.1],
    [0.3, 0.115],
    [0.34, 0.125],
    [0.45, 0.095],
    [0.6, 0.1],
  ]);
  const lips = monotoneCurve([
    [0.14, 0],
    [0.175, female ? 0.03 : 0.024],
    [0.195, female ? 0.022 : 0.018],
    [0.215, female ? 0.032 : 0.026],
    [0.25, 0.01],
    [0.27, 0],
  ]);
  const chin = monotoneCurve([
    [0, 0.015],
    [0.06, female ? 0.04 : 0.055],
    [0.11, female ? 0.03 : 0.04],
    [0.15, 0.012],
    [0.18, 0],
  ]);
  const brow = monotoneCurve([
    [0.55, 0],
    [0.61, female ? 0.03 : 0.05],
    [0.67, 0.01],
    [0.72, 0],
  ]);
  const socket = monotoneCurve([
    [0.43, 0],
    [0.5, -0.07],
    [0.555, -0.045],
    [0.6, 0],
  ]);
  // Closed eyelids inside the sockets, like a sculpted mannequin.
  const eyes = monotoneCurve([
    [0.46, 0],
    [0.505, 0.035],
    [0.54, 0.02],
    [0.56, 0],
  ]);
  const mouthLine = monotoneCurve([
    [0.18, 0],
    [0.197, -0.014],
    [0.212, 0],
  ]);
  const cheek = monotoneCurve([
    [0.2, 0],
    [0.3, 0.022],
    [0.42, 0.028],
    [0.52, 0.012],
    [0.6, 0],
  ]);

  const headProfile = slotCache(
    4,
    () => ({
      key: Number.NaN,
      rx: 0,
      front: 0,
      back: 0,
      nose: 0,
      noseSigma: 1,
      lips: 0,
      chin: 0,
      brow: 0,
      socket: 0,
      eyes: 0,
      mouth: 0,
      cheek: 0,
    }),
    (t, profile) => {
      profile.rx = headRx(t);
      profile.front = headFront(t);
      profile.back = headBack(t);
      profile.nose = nose(t) * noseScale * hl;
      profile.noseSigma = noseSigma(t);
      profile.lips = lips(t) * hl;
      profile.chin = chin(t) * hl;
      profile.brow = brow(t) * hl;
      profile.socket = socket(t) * hl;
      profile.eyes = eyes(t) * hl;
      profile.mouth = mouthLine(t) * hl;
      profile.cheek = cheek(t) * hl;
    },
  );

  const headPoint = (t: number, angle: number, target: Vector3) => {
    const p = headProfile(t);
    const sin = Math.sin(angle);
    const exponent = sin >= 0 ? 2.2 : 2;
    let x = p.rx * superCos(angle, exponent);
    let z = (sin >= 0 ? p.front : p.back) * superSin(angle, exponent);

    const fromFront = wrapAngle(angle - FRONT);
    z += p.nose * gaussian(fromFront, p.noseSigma);
    z += p.lips * gaussian(fromFront, 0.3);
    z += p.chin * gaussian(fromFront, 0.4);
    z += p.brow * gaussian(fromFront, 0.55);
    z += p.socket * (gaussian(fromFront - 0.36, 0.16) + gaussian(fromFront + 0.36, 0.16));
    z += p.eyes * (gaussian(fromFront - 0.36, 0.09) + gaussian(fromFront + 0.36, 0.09));
    z += p.mouth * gaussian(fromFront, 0.2);
    const cheekbones = p.cheek * (gaussian(fromFront - 0.75, 0.35) + gaussian(fromFront + 0.75, 0.35));
    x += Math.cos(angle) * cheekbones;
    z += sin * cheekbones;

    return target.set(x, chinY + t * headHeight, headZ + z);
  };

  // More vertices around the face, fewer at the back of the head.
  const headAngle = (w: number) => {
    const q = 2 * w - 1;
    return FRONT + Math.PI * q * (0.45 + 0.55 * q * q);
  };
  const head: SurfaceSampler = (u, w, target) => {
    headPoint(u, headAngle(w), target);
  };

  const hairStart = (angle: number) => {
    const sin = Math.sin(angle);
    // Female hair covers the ears and is pulled back into the ponytail.
    const side = female ? 0.38 : 0.54;
    const front = female ? 0.735 : 0.775;
    const back = female ? 0.24 : 0.3;
    // Flat hairline across the forehead, sideburns in front of the ears.
    return sin >= 0
      ? side + (front - side) * smoothstep(0.15, 0.7, sin)
      : side + (back - side) * Math.pow(-sin, 0.85);
  };
  const hairOffset = (t: number, angle: number) => {
    const start = hairStart(angle);
    // Thin at the hairline so the edge sits flush with the skin.
    const edge = 0.0006 + 0.0016 * smoothstep(start, start + 0.06, t);
    if (female) {
      const volume = smoothstep(start, start + 0.25, t) * (0.55 + 0.45 * Math.max(0, -Math.sin(angle)));
      return (edge + 0.0055 * volume) * headScale;
    }
    // Short back and sides, a bit of volume on top.
    return (edge + 0.001 * smoothstep(start, start + 0.1, t) + 0.004 * smoothstep(0.76, 0.95, t)) * headScale;
  };

  // ----------------------------------------------------------------- Neck
  const neckBottomY = (L.shoulder - 0.005) * H;
  const neckFlare = monotoneCurve([
    [neckBottomY, 1.3],
    [L.trap * H, 1.12],
    [torsoTop + 0.01 * H, 1],
    [neckTopY, 0.96],
  ]);
  const neck: SurfaceSampler = (u, w, target) => {
    const y = lerp(neckBottomY, neckTopY, u);
    const angle = w * TAU;
    const radius = neckRadius * neckFlare(y);
    const z = lerp(-0.014 * H, neckTopZ, u);
    target.set(radius * Math.cos(angle), y, z + radius * 0.94 * Math.sin(angle));
  };

  // ------------------------------------------------------------ Ponytail
  const back = new Vector3();
  let ponytail: SurfaceSampler | null = null;
  let ponytailTie: BodyModel['ponytailTie'] = null;
  if (female) {
    const p0 = headPoint(0.64, BACK, new Vector3()).add(new Vector3(0, 0, -0.006 * headScale));
    const p1 = headPoint(0.46, BACK, new Vector3()).add(new Vector3(0, 0, -0.03 * headScale));
    const trapY = at(L.trap) + 0.006 * H;
    const p2 = new Vector3(0, trapY, torsoPoint(trapY, BACK, back).z - 0.026 * H);
    const lowY = at(L.armpit) + 0.008 * H;
    const p3 = new Vector3(0, lowY, torsoPoint(lowY, BACK, back).z - 0.02 * H);
    const tipY = at(L.armpit) - 0.018 * H;
    const p4 = new Vector3(0, tipY, torsoPoint(tipY, BACK, back).z - 0.017 * H);
    const curve = new CatmullRomCurve3([p0, p1, p2, p3, p4]);
    const radius = monotoneCurve([
      [0, 0.014],
      [0.12, 0.019],
      [0.45, 0.021],
      [0.8, 0.013],
      [1, 0.003],
    ]);
    const side = new Vector3(1, 0, 0);
    const point = new Vector3();
    const tangent = new Vector3();
    const normal = new Vector3();
    ponytail = (u, w, target) => {
      curve.getPointAt(u, point);
      curve.getTangentAt(u, tangent);
      normal.crossVectors(tangent, side).normalize();
      const r = radius(u) * headScale;
      const angle = w * TAU;
      target
        .copy(point)
        .addScaledVector(side, r * 1.15 * Math.cos(angle))
        .addScaledVector(normal, r * 0.85 * Math.sin(angle));
    };
    ponytailTie = {
      position: curve.getPointAt(0.1),
      direction: curve.getTangentAt(0.1),
      radius: radius(0.1) * headScale * 1.05,
    };
  }

  const ear = {
    visible: !female,
    position: new Vector3(hw * 0.93, chinY + 0.46 * headHeight, headZ - 0.1 * hl),
    rotationY: -0.3,
    scale: new Vector3(0.0048, 0.017, 0.0098).multiplyScalar(headScale),
  };

  // ----------------------------------------------------------------- Arms
  const armDir = new Vector3(Math.sin(alpha), -Math.cos(alpha), 0);
  const armSide = new Vector3(Math.cos(alpha), Math.sin(alpha), 0);
  const armFront = new Vector3(0, 0, 1);
  const shoulderJoint = new Vector3(shoulderX, (L.shoulder - 0.02) * H, -0.008 * H);

  const upper = 0.186 * H;
  const fore = 0.146 * H;
  const hand = (female ? 0.104 : 0.108) * H;
  const wrist = upper + fore;
  const armStart = -0.034 * H;
  const armEnd = wrist + hand;

  const rUpper = ((female ? 0.165 : 0.18) * H * Math.pow(fullness, 0.8)) / TAU;
  const rFore = ((female ? 0.142 : 0.16) * H * Math.pow(fullness, 0.5)) / TAU;
  const rWrist = ((female ? 0.089 : 0.097) * H * Math.pow(fullness, 0.2)) / TAU;
  const rDeltoid = rUpper * (female ? 1.14 : 1.24);
  const handWidth = female ? H : H * 1.06;
  const handStep = hand / (0.106 * H);

  // [distance along the arm, half thickness (side), half width (front), side offset]
  const armKeys: [number, number, number, number][] = [
    [armStart, 0.3 * rDeltoid, 0.3 * rDeltoid, 0.18 * rDeltoid],
    [-0.024 * H, 0.72 * rDeltoid, 0.7 * rDeltoid, 0.2 * rDeltoid],
    [-0.01 * H, 0.94 * rDeltoid, 0.9 * rDeltoid, 0.16 * rDeltoid],
    [0.012 * H, rDeltoid, 0.96 * rDeltoid, 0.1 * rDeltoid],
    [0.055 * H, 1.06 * rUpper, rUpper, 0.04 * rDeltoid],
    [0.1 * H, rUpper, 1.04 * rUpper, 0],
    [0.15 * H, 0.9 * rUpper, 0.92 * rUpper, 0],
    [upper, 0.98 * rFore, 0.88 * rFore, 0],
    [upper + 0.04 * H, 1.02 * rFore, 1.04 * rFore, 0],
    [upper + 0.1 * H, 0.75 * rFore, 0.85 * rFore, 0],
    [wrist, 0.8 * rWrist, 1.2 * rWrist, 0],
    [wrist + 0.018 * H * handStep, 0.0115 * handWidth, 0.021 * handWidth, -0.001 * H],
    [wrist + 0.045 * H * handStep, 0.0125 * handWidth, 0.0245 * handWidth, -0.002 * H],
    [wrist + 0.062 * H * handStep, 0.011 * handWidth, 0.0235 * handWidth, -0.003 * H],
    [wrist + 0.08 * H * handStep, 0.0085 * handWidth, 0.02 * handWidth, -0.005 * H],
    [wrist + 0.097 * H * handStep, 0.0062 * handWidth, 0.014 * handWidth, -0.0065 * H],
    [armEnd, 0.002 * handWidth, 0.004 * handWidth, -0.007 * H],
  ];
  const armThickness = curveOf(armKeys, (k) => k[0], (k) => k[1]);
  const armWidth = curveOf(armKeys, (k) => k[0], (k) => k[2]);
  const armShift = curveOf(armKeys, (k) => k[0], (k) => k[3]);
  const forearmBend = Math.tan((12 * Math.PI) / 180);

  const armCenter = (distance: number, target: Vector3) =>
    target
      .copy(shoulderJoint)
      .addScaledVector(armDir, distance)
      .addScaledVector(armFront, forearmBend * softplus(distance - upper, 0.03 * H))
      .addScaledVector(armSide, armShift(distance));

  const armRing = slotCache(
    4,
    () => ({ key: Number.NaN, center: new Vector3(), thickness: 0, width: 0 }),
    (distance, entry) => {
      armCenter(distance, entry.center);
      entry.thickness = armThickness(distance);
      entry.width = armWidth(distance);
    },
  );
  const arm: SurfaceSampler = (u, w, target) => {
    const ring = armRing(lerp(armStart, armEnd, u));
    const angle = w * TAU;
    target
      .copy(ring.center)
      .addScaledVector(armSide, ring.thickness * superCos(angle, 2.1))
      .addScaledVector(armFront, ring.width * superSin(angle, 2.1));
  };
  const armU = (distance: number) => (distance - armStart) / (armEnd - armStart);

  const thumbBase = armCenter(wrist + 0.024 * H * handStep, new Vector3())
    .addScaledVector(armFront, 0.015 * handWidth)
    .addScaledVector(armSide, -0.004 * H);
  const forearmDir = armDir.clone().addScaledVector(armFront, forearmBend).normalize();
  const thumbDir = forearmDir
    .clone()
    .multiplyScalar(0.7)
    .addScaledVector(armFront, 0.62)
    .addScaledVector(armSide, -0.3)
    .normalize();
  const thumbLength = 0.046 * H * handStep;
  const thumbE1 = new Vector3().crossVectors(thumbDir, new Vector3(0, 1, 0)).normalize();
  const thumbE2 = new Vector3().crossVectors(thumbDir, thumbE1).normalize();
  const thumbRadius = monotoneCurve([
    [0, 0.0078],
    [0.4, 0.0068],
    [0.8, 0.0058],
    [1, 0.0022],
  ]);
  const thumb: SurfaceSampler = (u, w, target) => {
    const angle = w * TAU;
    const r = thumbRadius(u) * handWidth;
    target
      .copy(thumbBase)
      .addScaledVector(thumbDir, u * thumbLength)
      .addScaledVector(thumbE1, r * Math.cos(angle))
      .addScaledVector(thumbE2, r * 0.85 * Math.sin(angle));
  };

  // ----------------------------------------------------------------- Legs
  const legGap = (female ? 0.001 : 0.006) * H;
  const thighRadius = Math.max((0.97 * hipScale - legGap / 2) / 2, 0.03 * H);
  const hipJoint = new Vector3(legGap / 2 + 0.9 * thighRadius, (L.crotch + 0.045) * H, (female ? -0.006 : -0.004) * H);
  const ankle = new Vector3((female ? 0.04 : 0.047) * H, 0.042 * H, -0.006 * H);

  const thighC = TAU * thighRadius;
  const kneeC = (female ? 0.215 : 0.21) * H * Math.pow(fullness, 0.35);
  const calfC = (female ? 0.205 : 0.212) * H * Math.pow(fullness, 0.45);
  const ankleC = (female ? 0.128 : 0.13) * H * Math.pow(fullness, 0.15);

  // [height fraction, circumference, inner, outer, front, back, side shift, front shift]
  const legKeys: [number, number, number, number, number, number, number, number][] = [
    [L.crotch + 0.075, 0.86 * thighC, 0.92, 1, 0.95, 1, 0, 0],
    [L.crotch + 0.012, thighC, 0.9, 1.06, 0.96, 1.04, 0.04, 0],
    [0.41, Math.max(0.9 * thighC, 1.1 * kneeC), 0.95, 1.02, 1, 1, 0.02, 0.02],
    [0.36, Math.max(0.77 * thighC, 1.12 * kneeC), 0.98, 1, 1.02, 0.98, 0, 0.02],
    [0.318, 1.03 * kneeC, 1, 1, 1.02, 0.96, -0.02, 0.02],
    [0.285, kneeC, 1.02, 0.98, 1.06, 0.92, -0.04, 0.03],
    [0.255, 0.97 * kneeC, 1.02, 0.98, 1, 0.98, -0.03, 0],
    [0.215, calfC, 1.08, 0.96, 0.86, 1.12, -0.03, -0.1],
    [0.16, 0.86 * calfC, 1.04, 0.98, 0.9, 1.06, -0.01, -0.06],
    [0.1, Math.max(1.15 * ankleC, 0.7 * calfC), 1, 1, 0.95, 1, 0, -0.02],
    [0.045, ankleC, 1.06, 1.06, 0.92, 1, 0, 0],
    [0.03, 0.96 * ankleC, 1, 1, 0.9, 1, 0, 0],
  ];
  const legY = (k: (typeof legKeys)[number]) => k[0] * H;
  const legRadiusAt = (k: (typeof legKeys)[number]) => k[1] / TAU;
  const legInner = curveOf(legKeys, legY, (k) => legRadiusAt(k) * k[2] - legRadiusAt(k) * k[6]);
  const legOuter = curveOf(legKeys, legY, (k) => legRadiusAt(k) * k[3] + legRadiusAt(k) * k[6]);
  const legFront = curveOf(legKeys, legY, (k) => legRadiusAt(k) * k[4] + legRadiusAt(k) * k[7]);
  const legBack = curveOf(legKeys, legY, (k) => legRadiusAt(k) * k[5] - legRadiusAt(k) * k[7]);
  const legTop = (L.crotch + 0.075) * H;
  const legBottom = 0.03 * H;

  const leg = ({ envelopeFrom, taper = 1 }: LegOptions = {}): SurfaceSampler => {
    const envelope =
      envelopeFrom === undefined
        ? null
        : {
            inner: legInner(envelopeFrom),
            outer: legOuter(envelopeFrom),
            front: legFront(envelopeFrom),
            back: legBack(envelopeFrom),
          };

    const extents = slotCache(
      4,
      () => ({ key: Number.NaN, inner: 0, outer: 0, front: 0, back: 0 }),
      (y, entry) => {
        entry.inner = legInner(y);
        entry.outer = legOuter(y);
        entry.front = legFront(y);
        entry.back = legBack(y);
        if (envelope && envelopeFrom !== undefined && y < envelopeFrom) {
          const scale = lerp(1, taper, clamp((envelopeFrom - y) / (envelopeFrom - legBottom), 0, 1));
          entry.inner = Math.max(entry.inner, envelope.inner * scale);
          entry.outer = Math.max(entry.outer, envelope.outer * scale);
          entry.front = Math.max(entry.front, envelope.front * scale);
          entry.back = Math.max(entry.back, envelope.back * scale);
        }
      },
    );

    return (u, w, target) => {
      const y = lerp(legTop, legBottom, u);
      const angle = w * TAU;
      const { inner, outer, front, back: backExtent } = extents(y);

      const t = (hipJoint.y - y) / (hipJoint.y - ankle.y);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const x = (cos >= 0 ? outer : inner) * superCos(angle, 2.1);
      const z = (sin >= 0 ? front : backExtent) * superSin(angle, 2.1);
      target.set(
        lerp(hipJoint.x, ankle.x, t) + x,
        y,
        lerp(hipJoint.z, ankle.z, t) + z,
      );
    };
  };
  const legU = (y: number) => (legTop - y) / (legTop - legBottom);

  // ----------------------------------------------------------------- Feet
  const footHalfWidth = (female ? 0.029 : 0.031) * H * Math.pow(fullness, 0.1);
  const heelZ = ankle.z - 0.036 * H;
  const toeZ = ankle.z + (female ? 0.114 : 0.118) * H;
  const footKeys: [number, number, number][] = [
    [0, 0.5, 0.036],
    [0.05, 0.76, 0.05],
    [0.16, 0.84, 0.062],
    [0.3, 0.87, 0.058],
    [0.48, 0.94, 0.046],
    [0.68, 1, 0.032],
    [0.82, 0.98, 0.024],
    [0.94, 0.86, 0.019],
    [1, 0.56, 0.015],
  ];
  const footWidth = curveOf(footKeys, (k) => k[0], (k) => k[1] * footHalfWidth);
  const footTop = curveOf(footKeys, (k) => k[0], (k) => k[2] * H);
  const sole = 0.0012 * H;

  const foot: SurfaceSampler = (u, w, target) => {
    const angle = w * TAU;
    const z = lerp(heelZ, toeZ, u);
    const top = footTop(u);
    const center = Math.min(top * 0.45, 0.018 * H);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const xCenter = ankle.x + (z - ankle.z) * 0.1 - 0.1 * footHalfWidth * smoothstep(0.55, 1, u);
    let y =
      sin >= 0
        ? center + (top - center) * superSin(angle, 2)
        : center + (center - sole) * superSin(angle, 3.4);
    if (sin < 0 && cos < 0) {
      // Arch on the inner side of the sole.
      y += 0.006 * H * -cos * Math.sqrt(-sin) * gaussian(u - 0.45, 0.13);
    }
    target.set(xCenter + footWidth(u) * superCos(angle, 2.2), y, z);
  };
  const footU = (z: number) => (z - heelZ) / (toeZ - heelZ);

  return {
    gender: profile.gender,
    height: H,
    headScale,
    landmarks: {
      height: H,
      crotch: at(L.crotch),
      hip: at(L.hip),
      highHip: at(L.highHip),
      waist: at(L.waist),
      underbust: at(L.underbust),
      bust: bustY,
      armpit: at(L.armpit),
      shoulder: at(L.shoulder),
      trap: at(L.trap),
      neckBase: torsoTop,
      chin: chinY,
      knee: 0.285 * H,
      calf: 0.215 * H,
      ankle: 0.045 * H,
    },
    torso,
    torsoU,
    torsoY: (u) => lerp(torsoBottom, torsoTop, u),
    torsoPoint: (y, angle, target, options) => torsoPoint(y, angle, target, options),
    neck,
    head,
    headAngle,
    headPoint,
    hairStart,
    hairOffset,
    ponytail,
    ponytailTie,
    ear,
    arm,
    armU,
    armDistance: (u) => lerp(armStart, armEnd, u),
    armLengths: { start: armStart, upper, fore, wrist, hand, end: armEnd },
    armCenter,
    thumb,
    leg,
    legU,
    legY: (u) => lerp(legTop, legBottom, u),
    foot,
    footU,
    footRange: { heel: heelZ, toe: toeZ },
  };
}
