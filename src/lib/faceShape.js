function distanceBetween(landmarks, firstIndex, secondIndex) {
  const first = landmarks[firstIndex];
  const second = landmarks[secondIndex];

  if (
    !first ||
    !second ||
    !Number.isFinite(first.x) ||
    !Number.isFinite(first.y) ||
    !Number.isFinite(second.x) ||
    !Number.isFinite(second.y)
  ) {
    throw new TypeError(`Landmarks faciales inválidos en los índices ${firstIndex} o ${secondIndex}.`);
  }

  return Math.hypot(second.x - first.x, second.y - first.y);
}

/** Calcula proporciones faciales independientes del tamaño de la imagen. */
export function measureFace(landmarks) {
  if (!Array.isArray(landmarks)) {
    throw new TypeError('measureFace espera el arreglo de landmarks de un rostro.');
  }

  const faceWidth = distanceBetween(landmarks, 234, 454);
  if (faceWidth === 0) {
    throw new RangeError('No se puede medir el rostro porque su ancho es cero.');
  }

  return {
    faceRatio: distanceBetween(landmarks, 10, 152) / faceWidth,
    jawRatio: distanceBetween(landmarks, 172, 397) / faceWidth,
    eyeRatio: distanceBetween(landmarks, 33, 263) / faceWidth,
  };
}

// Los rangos y nombres de morphs son estimados y deben calibrarse con el .glb real.
export const SHAPE_MORPHS = {
  faceRatio: { morph: 'face_long', min: 1.2, max: 1.5 },
  jawRatio: { morph: 'jaw_wide', min: 0.7, max: 0.95 },
  eyeRatio: { morph: 'eye_distance', min: 0.4, max: 0.5 },
};

export const SKIN_MATERIAL_HINTS = ['skin', 'face', 'body'];
