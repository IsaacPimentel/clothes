type MediaPipeVision = typeof import('@mediapipe/tasks-vision');
type PoseLandmarker = InstanceType<MediaPipeVision['PoseLandmarker']>;

let mediaPipeVisionPromise: Promise<MediaPipeVision> | null = null;

async function getMediaPipeVision() {
  if (!mediaPipeVisionPromise) {
    mediaPipeVisionPromise = import(/* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/vision_bundle.mjs')
      .then((module) => module as unknown as MediaPipeVision)
      .catch((error: unknown) => {
        mediaPipeVisionPromise = null;
        throw error;
      });
  }

  return mediaPipeVisionPromise;
}

export type PoseLandmark = {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
  presence?: number;
};

let landmarkerPromise: Promise<PoseLandmarker> | null = null;

const VISION_WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm';
const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export function loadPoseImage(uri: string): Promise<HTMLImageElement> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('La estimación automática por foto está disponible en la versión web.'));
  }

  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar la foto para analizarla.'));
    image.src = uri;
  });
}

async function getPoseLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker: PoseLandmarkerRuntime } = await getMediaPipeVision();
      const vision = await FilesetResolver.forVisionTasks(VISION_WASM_URL);
      return PoseLandmarkerRuntime.createFromOptions(vision, {
        baseOptions: { modelAssetPath: POSE_MODEL_URL },
        runningMode: 'IMAGE',
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        outputSegmentationMasks: false,
      });
    })().catch((error: unknown) => {
      landmarkerPromise = null;
      throw error;
    });
  }

  return landmarkerPromise;
}

/** Detecta los 33 puntos de pose de una imagen en navegador (Expo Web). */
export async function detectPose(imageElement: HTMLImageElement): Promise<PoseLandmark[]> {
  if (typeof document === 'undefined' || !(imageElement instanceof HTMLImageElement)) {
    throw new Error('La estimación automática por foto está disponible en la versión web.');
  }

  const landmarker = await getPoseLandmarker();
  const result = landmarker.detect(imageElement);
  const landmarks = result.landmarks[0] as PoseLandmark[] | undefined;

  if (!landmarks || landmarks.length < 33) {
    throw new Error('No se detectó una persona. Usa una foto frontal de cuerpo completo.');
  }

  const requiredLandmarks = [11, 12, 27, 28];
  const hasVisibleBody = requiredLandmarks.every(
    (index) => (landmarks[index]?.visibility ?? landmarks[index]?.presence ?? 0) > 0.5,
  );

  if (!hasVisibleBody) {
    throw new Error('La foto debe mostrar el cuerpo completo');
  }

  return landmarks;
}
