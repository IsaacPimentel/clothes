import React from 'react';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { BOTTOM_COLORS, SHOE_COLORS, SOLE_COLORS } from '../../types/outfit';
import type { GarmentOption } from './catalog';

type GarmentIconProps = {
  option: GarmentOption;
  /** Current color of the top garment, so tops preview the chosen color. */
  topColor: string;
  size?: number;
};

const luminance = (hex: string) => {
  const value = parseInt(hex.replace('#', ''), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

// Outline and detail strokes that stay visible on both light and dark fabrics.
const strokesFor = (fill: string) =>
  luminance(fill) > 0.6
    ? { outline: '#6B7280', detail: '#9CA3AF' }
    : { outline: '#D1D5DB', detail: 'rgba(229, 231, 235, 0.55)' };

type Shape = {
  fill: string;
  body: string[];
  details?: string[];
  dots?: [number, number][];
  /** Second filled layer drawn under the details (shoe soles, lenses). */
  accent?: { fill: string; paths: string[]; opacity?: number };
};

function shapeFor(option: GarmentOption, topColor: string): Shape | null {
  switch (option.category) {
    case 'top':
      switch (option.value) {
        case 'classic':
          return {
            fill: topColor,
            body: ['M17 7 L8 12 L4 21 L10.5 24 L13 20 V42 H35 V20 L37.5 24 L44 21 L40 12 L31 7 C29.5 10.5 27 12 24 12 C21 12 18.5 10.5 17 7 Z'],
            details: ['M19 8.6 C20.5 10.4 22 11 24 11 C26 11 27.5 10.4 29 8.6'],
          };
        case 'hoodie':
          return {
            fill: topColor,
            body: [
              'M17 10 C16 5 19.5 3 24 3 C28.5 3 32 5 31 10 Z',
              'M17 9 L9 13 L5 39 L11 40 L13.5 22 V43 H34.5 V22 L37 40 L43 39 L39 13 L31 9 C29 12.5 27 14 24 14 C21 14 19 12.5 17 9 Z',
            ],
            details: [
              'M19.5 9.5 C20.5 12 22 13 24 13 C26 13 27.5 12 28.5 9.5',
              'M17 31 H31 L33 38 H15 Z',
              'M22 14 V21',
              'M26 14 V21',
            ],
          };
        case 'overshirt':
          return {
            fill: topColor,
            body: ['M16.5 7 L9 11 L5 39 L11 40 L13.5 20 V43 H34.5 V20 L37 40 L43 39 L39 11 L31.5 7 L24 15 Z'],
            details: ['M16.5 7 L19.5 14 L24 15 L28.5 14 L31.5 7', 'M24 15 V43', 'M28 20 H32.5 V25 H28 Z'],
            dots: [
              [24, 21],
              [24, 28],
              [24, 35],
            ],
          };
        case 'tank':
          return {
            fill: topColor,
            body: [
              'M17.5 4 V9 C17.5 13.5 14.5 16 12.5 18 V43 H35.5 V18 C33.5 16 30.5 13.5 30.5 9 V4 H27.5 V8 C27.5 11.5 26 13.5 24 13.5 C22 13.5 20.5 11.5 20.5 8 V4 Z',
            ],
            details: ['M12.5 39 H35.5'],
          };
      }
      break;

    case 'bottom': {
      const fill = BOTTOM_COLORS[option.value];
      switch (option.value) {
        case 'jeans':
          return {
            fill,
            body: ['M13 4 H35 L38 44 H27.5 L24 17 L20.5 44 H10 Z'],
            details: ['M13.3 9 H34.7', 'M16 9 C16.2 12.5 18 14 21 14', 'M32 9 C31.8 12.5 30 14 27 14', 'M24 9 V17'],
          };
        case 'trousers':
          return {
            fill,
            body: ['M14 4 H34 L36.5 44 H27.5 L24 16 L20.5 44 H11.5 Z'],
            details: ['M14.2 8.5 H33.8', 'M18 12 L16.5 42', 'M30 12 L31.5 42'],
          };
        case 'shorts':
          return {
            fill,
            body: ['M11 9 H37 L40.5 33 H27.5 L24 21 L20.5 33 H7.5 Z'],
            details: ['M11.4 14 H36.6', 'M8 29.5 H21.2', 'M26.8 29.5 H40'],
          };
      }
      break;
    }

    case 'shoes': {
      const fill = SHOE_COLORS[option.value];
      const sole = SOLE_COLORS[option.value];
      switch (option.value) {
        case 'sneakers':
          return {
            fill,
            body: ['M5 33 C5 29 7 26.5 10 26 L17 24.5 L21 19 C22.5 17 25.5 17 27 19 L30.5 23 C34 25.5 39 26.5 42.5 28.5 C44.5 29.5 44.5 32 44 33 Z'],
            accent: { fill: sole, paths: ['M4.5 33 H44.5 V36.5 C44.5 38 43.5 39 42 39 H7 C5.5 39 4.5 38 4.5 36.5 Z'] },
            details: ['M21 22 L25 24.5', 'M23 20 L27 22.5', 'M12 30 C18 31 26 30 34 27'],
          };
        case 'boots':
          return {
            fill,
            body: ['M12 5 H27 V25 C31 27 37 28 40.5 30 C43 31.5 44 33.5 44 35 H8 V30 C10.5 28 12 25.5 12 21 Z'],
            accent: { fill: sole, paths: ['M7.5 35 H44.5 V39.5 H7.5 Z'] },
            details: ['M12 9.5 H27', 'M21 14 H26', 'M21 18.5 H26', 'M21 23 H26'],
          };
        case 'loafers':
          return {
            fill,
            body: ['M5 32 C5 28.5 7.5 26.5 11 26.5 H21 C23 24.5 26.5 23.5 30 24.5 C35 25.8 40 27.5 43 29.5 C44.8 30.7 44.8 32.5 44 33 H5 Z'],
            accent: { fill: sole, paths: ['M4.5 33 H44.5 V36 C44.5 37 43.8 37.5 43 37.5 H6 C5.2 37.5 4.5 37 4.5 36 Z'] },
            details: ['M22.5 27 C25 29 28.5 29 31.5 26.5'],
          };
      }
      break;
    }

    case 'accessory':
      switch (option.value) {
        case 'glasses':
          return {
            fill: 'transparent',
            body: [
              'M6 19 H21 V26 C21 29.5 19 31.5 15.5 31.5 H11.5 C8 31.5 6 29.5 6 26 Z',
              'M27 19 H42 V26 C42 29.5 40 31.5 36.5 31.5 H32.5 C29 31.5 27 29.5 27 26 Z',
              'M21 21 C22.5 19.5 25.5 19.5 27 21',
              'M6 20 L3 17.5',
              'M42 20 L45 17.5',
            ],
            accent: {
              fill: '#4B5563',
              opacity: 0.55,
              paths: [
                'M6 19 H21 V26 C21 29.5 19 31.5 15.5 31.5 H11.5 C8 31.5 6 29.5 6 26 Z',
                'M27 19 H42 V26 C42 29.5 40 31.5 36.5 31.5 H32.5 C29 31.5 27 29.5 27 26 Z',
              ],
            },
          };
        case 'cap':
          return {
            fill: '#1F2937',
            body: [
              'M9 30 C9 19 15.5 11 24 11 C32.5 11 39 19 39 30 Z',
              'M9 30 C18 33 32 33 45 31 C45 34 41.5 36 36 36 C26 36 15 34 9 30 Z',
            ],
            details: ['M24 12 V30', 'M16 14 C18 20 18.5 25 18.5 30'],
            dots: [[24, 10.4]],
          };
        case 'none':
          return null;
      }
      break;
  }
  return null;
}

export default function GarmentIcon({ option, topColor, size = 48 }: GarmentIconProps) {
  const shape = shapeFor(option, topColor);

  if (!shape) {
    // "Ninguno": empty circle with a slash.
    return (
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Circle cx={24} cy={24} r={13} stroke="#6B7280" strokeWidth={2} fill="none" />
        <Path d="M15 33 L33 15" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }

  const { outline, detail } = strokesFor(shape.fill === 'transparent' ? '#111827' : shape.fill);

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <G strokeLinejoin="round" strokeLinecap="round">
        {shape.accent?.paths.map((d) => (
          <Path
            key={`accent-${d}`}
            d={d}
            fill={shape.accent?.fill}
            fillOpacity={shape.accent?.opacity ?? 1}
            stroke={outline}
            strokeWidth={1.4}
          />
        ))}
        {shape.body.map((d) => (
          <Path key={`body-${d}`} d={d} fill={shape.fill} stroke={outline} strokeWidth={1.6} />
        ))}
        {shape.details?.map((d) => (
          <Path key={`detail-${d}`} d={d} fill="none" stroke={detail} strokeWidth={1.2} />
        ))}
        {shape.dots?.map(([cx, cy]) => (
          <Circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={1.2} fill={detail} />
        ))}
      </G>
    </Svg>
  );
}
