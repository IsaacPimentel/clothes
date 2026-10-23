import type { PoseLandmark } from './poseDetection';

const distance = (first: PoseLandmark, second: PoseLandmark, aspectRatio: number) =>
  Math.hypot((second.x - first.x) * aspectRatio, second.y - first.y);

const average = (first: number, second: number) => (first + second) / 2;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const WAIST_CORRECTION_FACTOR = 0.82;
const WIDTH_TO_CIRCUMFERENCE_FACTOR = 2.4;
const SHOULDER_TO_BUST_CORRECTION = 1.35;

/** Estima proporciones frontales; no sustituye mediciones antropométricas reales. */
export function measureBody(
  poseLandmarks: PoseLandmark[],
  heightCm: number,
  imageSize: { width: number; height: number },
) {
  if (!Array.isArray(poseLandmarks) || poseLandmarks.length < 33) {
    throw new TypeError('Se requieren los 33 landmarks de pose para medir el cuerpo.');
  }
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 220) {
    throw new RangeError('La estatura debe estar entre 120 y 220 cm.');
  }
  if (!imageSize.width || !imageSize.height) {
    throw new RangeError('No se pudieron determinar las dimensiones de la foto.');
  }

  // Corrige que los landmarks x e y estén normalizados por dimensiones diferentes.
  const aspectRatio = imageSize.width / imageSize.height;

  const nose = poseLandmarks[0];
  const leftAnkle = poseLandmarks[27];
  const rightAnkle = poseLandmarks[28];
  const ankleY = average(leftAnkle.y, rightAnkle.y);
  const noseToAnkles = ankleY - nose.y;

  if (!Number.isFinite(noseToAnkles) || noseToAnkles <= 0) {
    throw new Error('No se pudo estimar la altura de la persona en la imagen.');
  }

  // PoseLandmarker #0 es la nariz, no la coronilla; estimamos la coronilla con un 12% adicional.
  const screenHeight = noseToAnkles * 1.12;
  const shoulderRatio = distance(poseLandmarks[11], poseLandmarks[12], aspectRatio) / screenHeight;
  const hipRatio = distance(poseLandmarks[23], poseLandmarks[24], aspectRatio) / screenHeight;
  const waistRatio = average(shoulderRatio, hipRatio) * WAIST_CORRECTION_FACTOR;
  const legRatio = average(
    distance(poseLandmarks[23], leftAnkle, aspectRatio),
    distance(poseLandmarks[24], rightAnkle, aspectRatio),
  ) / screenHeight;

  // La foto frontal no mide circunferencias. Se aproxima el ancho por 2.4 y se corrige
  // hombro a busto por 1.35; son heurísticas, no medidas antropométricas validadas.
  const estimatedCm = {
    shoulders: shoulderRatio * heightCm * WIDTH_TO_CIRCUMFERENCE_FACTOR,
    hips: hipRatio * heightCm * WIDTH_TO_CIRCUMFERENCE_FACTOR,
    waist: waistRatio * heightCm * WIDTH_TO_CIRCUMFERENCE_FACTOR,
    legs: legRatio * heightCm,
  };

  return {
    shoulderRatio,
    hipRatio,
    waistRatio,
    legRatio,
    estimatedCm,
    avatarMeasurements: {
      bust: Math.round(clamp(estimatedCm.shoulders * SHOULDER_TO_BUST_CORRECTION, 70, 130)),
      hips: Math.round(clamp(estimatedCm.hips, 70, 135)),
      waist: Math.round(clamp(estimatedCm.waist, 50, 120)),
    },
  };
}

// Los rangos y nombres son una referencia; deben calibrarse con el modelo .glb real.
export const BODY_MORPHS = {
  shoulderRatio: { morph: 'shoulder_wide', min: 0.18, max: 0.28 },
  hipRatio: { morph: 'hip_wide', min: 0.16, max: 0.26 },
  waistRatio: { morph: 'waist_narrow', min: 0.14, max: 0.23 },
  legRatio: { morph: 'leg_length', min: 0.42, max: 0.56 },
};
