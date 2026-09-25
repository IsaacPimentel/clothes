export type CurveKey = readonly [x: number, y: number];

export const TAU = Math.PI * 2;
export const FRONT = Math.PI / 2;
export const BACK = -Math.PI / 2;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, t: number) => from + (to - from) * t;

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const gaussian = (x: number, sigma: number) => Math.exp(-(x * x) / (2 * sigma * sigma));

/** Wraps an angle into [-PI, PI]. */
export const wrapAngle = (angle: number) => {
  let result = angle % TAU;
  if (result > Math.PI) result -= TAU;
  if (result < -Math.PI) result += TAU;
  return result;
};

/** Superellipse helpers: exponent 2 is an ellipse, higher values get boxier. */
export const superCos = (angle: number, exponent: number) => {
  const c = Math.cos(angle);
  return Math.sign(c) * Math.pow(Math.abs(c), 2 / exponent);
};

export const superSin = (angle: number, exponent: number) => {
  const s = Math.sin(angle);
  return Math.sign(s) * Math.pow(Math.abs(s), 2 / exponent);
};

/**
 * Two symmetric bumps around `center` (e.g. bust or glutes). With `plateau`
 * the gap between them is filled, which is how fabric bridges over them.
 */
export const pairBump = (
  angle: number,
  center: number,
  spread: number,
  sigma: number,
  plateau = false,
) => {
  if (plateau) {
    const distance = Math.abs(wrapAngle(angle - center));
    return distance <= spread ? 1 : gaussian(distance - spread, sigma);
  }

  return (
    gaussian(wrapAngle(angle - center - spread), sigma) +
    gaussian(wrapAngle(angle - center + spread), sigma)
  );
};

/**
 * Monotone cubic (Fritsch–Carlson) interpolation. Unlike Catmull-Rom it never
 * overshoots between keys, so body profiles stay smooth without bulges.
 */
export function monotoneCurve(keys: readonly CurveKey[]): (x: number) => number {
  const sorted = [...keys].sort((a, b) => a[0] - b[0]);
  const count = sorted.length;
  const xs = sorted.map((key) => key[0]);
  const ys = sorted.map((key) => key[1]);

  if (count === 1) {
    return () => ys[0];
  }

  const slopes: number[] = [];
  for (let i = 0; i < count - 1; i += 1) {
    slopes.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
  }

  const tangents = new Array<number>(count);
  tangents[0] = slopes[0];
  tangents[count - 1] = slopes[count - 2];
  for (let i = 1; i < count - 1; i += 1) {
    tangents[i] = slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2;
  }

  for (let i = 0; i < count - 1; i += 1) {
    if (slopes[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }

    const a = tangents[i] / slopes[i];
    const b = tangents[i + 1] / slopes[i];
    const magnitude = a * a + b * b;
    if (magnitude > 9) {
      const scale = 3 / Math.sqrt(magnitude);
      tangents[i] = scale * a * slopes[i];
      tangents[i + 1] = scale * b * slopes[i];
    }
  }

  return (x: number) => {
    if (x <= xs[0]) return ys[0];
    if (x >= xs[count - 1]) return ys[count - 1];

    let lo = 0;
    let hi = count - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (xs[mid] <= x) lo = mid;
      else hi = mid;
    }

    const h = xs[hi] - xs[lo];
    const t = (x - xs[lo]) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    return (
      (2 * t3 - 3 * t2 + 1) * ys[lo] +
      (t3 - 2 * t2 + t) * h * tangents[lo] +
      (-2 * t3 + 3 * t2) * ys[hi] +
      (t3 - t2) * h * tangents[hi]
    );
  };
}
