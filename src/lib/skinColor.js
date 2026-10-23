const DEFAULT_SKIN_COLOR = '#e0ac69';
const CHEEK_LANDMARKS = [50, 280];
const SAMPLE_RADIUS = 6;

function getImageSize(imageElement) {
  return {
    width: imageElement.naturalWidth || imageElement.videoWidth || imageElement.width,
    height: imageElement.naturalHeight || imageElement.videoHeight || imageElement.height,
  };
}

function toPixelCoordinate(value, size) {
  // FaceLandmarker entrega coordenadas normalizadas entre 0 y 1.
  return value >= 0 && value <= 1 ? Math.round(value * (size - 1)) : Math.round(value);
}

/**
 * Obtiene el color promedio de ambas mejillas a partir de los landmarks faciales.
 * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement} imageElement Imagen analizada.
 * @param {Array<{x: number, y: number}>} faceLandmarks Landmarks normalizados de FaceLandmarker.
 * @returns {string} Color de piel promedio en formato hexadecimal.
 */
export function getSkinColor(imageElement, faceLandmarks) {
  if (!imageElement || !faceLandmarks) return DEFAULT_SKIN_COLOR;

  const { width, height } = getImageSize(imageElement);
  if (!width || !height) return DEFAULT_SKIN_COLOR;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return DEFAULT_SKIN_COLOR;

  context.drawImage(imageElement, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height).data;

  let red = 0;
  let green = 0;
  let blue = 0;
  let sampleCount = 0;

  for (const landmarkIndex of CHEEK_LANDMARKS) {
    const landmark = faceLandmarks[landmarkIndex];
    if (!landmark || !Number.isFinite(landmark.x) || !Number.isFinite(landmark.y)) continue;

    const centerX = toPixelCoordinate(landmark.x, width);
    const centerY = toPixelCoordinate(landmark.y, height);

    for (let offsetY = -SAMPLE_RADIUS; offsetY <= SAMPLE_RADIUS; offsetY += 1) {
      for (let offsetX = -SAMPLE_RADIUS; offsetX <= SAMPLE_RADIUS; offsetX += 1) {
        if (offsetX * offsetX + offsetY * offsetY > SAMPLE_RADIUS * SAMPLE_RADIUS) continue;

        const pixelX = centerX + offsetX;
        const pixelY = centerY + offsetY;
        if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) continue;

        const pixelOffset = (pixelY * width + pixelX) * 4;
        if (imageData[pixelOffset + 3] === 0) continue;

        red += imageData[pixelOffset];
        green += imageData[pixelOffset + 1];
        blue += imageData[pixelOffset + 2];
        sampleCount += 1;
      }
    }
  }

  if (sampleCount === 0) return DEFAULT_SKIN_COLOR;

  const toHex = (channel) => Math.round(channel / sampleCount).toString(16).padStart(2, '0');
  return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}
