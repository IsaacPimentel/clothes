import React from 'react';
import { useOutfitStore } from '../../stores/outfitStore';

const TOP_COLORS = {
  classic: '#F8FAFC',
  hoodie: '#3B82F6',
  overshirt: '#7C4D2E',
  tank: '#F59E0B',
};

const BOTTOM_COLORS = {
  jeans: '#2563EB',
  trousers: '#374151',
  shorts: '#FACC15',
};

const SHOE_COLORS = {
  sneakers: '#0F172A',
  boots: '#7C2D12',
  loafers: '#C084FC',
};

const ACCESSORY_COLORS = {
  none: '#000000',
  glasses: '#0F172A',
  cap: '#1F2937',
};

export default function AvatarOutfit() {
  const { top, bottom, shoes, accessory, garmentColor } = useOutfitStore();

  const topColor = garmentColor || TOP_COLORS[top];
  const bottomColor = BOTTOM_COLORS[bottom];
  const shoeColor = SHOE_COLORS[shoes];
  const accessoryColor = ACCESSORY_COLORS[accessory];

  return (
    <group position={[0, -1.4, 0]}>
      {top === 'classic' && (
        <group>
          <mesh position={[0, 1.2, 0.1]} castShadow>
            <capsuleGeometry args={[0.55, 1.5, 9, 18]} />
            <meshStandardMaterial color={topColor} roughness={0.88} metalness={0.08} />
          </mesh>
          <mesh position={[-0.72, 1.2, 0.06]} rotation={[0, 0, 0.6]} castShadow>
            <capsuleGeometry args={[0.12, 0.9, 6, 12]} />
            <meshStandardMaterial color={topColor} roughness={0.88} metalness={0.08} />
          </mesh>
          <mesh position={[0.72, 1.2, 0.06]} rotation={[0, 0, -0.6]} castShadow>
            <capsuleGeometry args={[0.12, 0.9, 6, 12]} />
            <meshStandardMaterial color={topColor} roughness={0.88} metalness={0.08} />
          </mesh>
          <mesh position={[0, 1.8, 0.12]} castShadow>
            <boxGeometry args={[0.7, 0.18, 0.22]} />
            <meshStandardMaterial color={topColor} roughness={0.8} metalness={0.1} />
          </mesh>
        </group>
      )}

      {top === 'hoodie' && (
        <group>
          <mesh position={[0, 1.14, 0.04]} castShadow>
            <boxGeometry args={[1.25, 1.48, 0.65]} />
            <meshStandardMaterial color={topColor} roughness={0.76} metalness={0.1} />
          </mesh>
          <mesh position={[0, 1.92, -0.02]} castShadow>
            <boxGeometry args={[0.72, 0.42, 0.42]} />
            <meshStandardMaterial color={topColor} roughness={0.8} metalness={0.08} />
          </mesh>
          <mesh position={[0, 1.38, 0.28]} castShadow>
            <boxGeometry args={[0.9, 0.18, 0.1]} />
            <meshStandardMaterial color={topColor} roughness={0.78} metalness={0.12} />
          </mesh>
        </group>
      )}

      {top === 'overshirt' && (
        <group>
          <mesh position={[0, 1.2, 0.08]} castShadow>
            <boxGeometry args={[1.38, 1.55, 0.52]} />
            <meshStandardMaterial color={topColor} roughness={0.7} metalness={0.14} />
          </mesh>
          <mesh position={[0, 1.84, 0.1]} castShadow>
            <boxGeometry args={[0.7, 0.28, 0.4]} />
            <meshStandardMaterial color={topColor} roughness={0.72} metalness={0.14} />
          </mesh>
          <mesh position={[0, 1.02, 0.38]} castShadow>
            <boxGeometry args={[0.65, 0.1, 0.12]} />
            <meshStandardMaterial color={topColor} roughness={0.7} metalness={0.14} />
          </mesh>
        </group>
      )}

      {top === 'tank' && (
        <group>
          <mesh position={[0, 1.12, 0.12]} castShadow>
            <boxGeometry args={[1.05, 1.3, 0.38]} />
            <meshStandardMaterial color={topColor} roughness={0.82} metalness={0.05} />
          </mesh>
          <mesh position={[0, 1.7, 0.08]} castShadow>
            <boxGeometry args={[0.7, 0.3, 0.2]} />
            <meshStandardMaterial color={topColor} roughness={0.85} metalness={0.05} />
          </mesh>
          <mesh position={[0, 0.68, 0.26]} castShadow>
            <boxGeometry args={[0.6, 0.05, 0.14]} />
            <meshStandardMaterial color={topColor} roughness={0.85} metalness={0.05} />
          </mesh>
        </group>
      )}

      {bottom === 'jeans' && (
        <group>
          <mesh position={[-0.24, -0.2, 0.08]} rotation={[0, 0, 0.04]} castShadow>
            <boxGeometry args={[0.38, 1.8, 0.6]} />
            <meshStandardMaterial color={bottomColor} roughness={0.7} metalness={0.12} />
          </mesh>
          <mesh position={[0.24, -0.2, 0.08]} rotation={[0, 0, -0.04]} castShadow>
            <boxGeometry args={[0.38, 1.8, 0.6]} />
            <meshStandardMaterial color={bottomColor} roughness={0.7} metalness={0.12} />
          </mesh>
          <mesh position={[0, -0.95, 0.24]} castShadow>
            <boxGeometry args={[0.7, 0.08, 0.18]} />
            <meshStandardMaterial color={bottomColor} roughness={0.7} metalness={0.12} />
          </mesh>
        </group>
      )}

      {bottom === 'trousers' && (
        <group>
          <mesh position={[-0.26, -0.28, 0]} rotation={[0, 0, 0.04]} castShadow>
            <capsuleGeometry args={[0.2, 1.65, 7, 16]} />
            <meshStandardMaterial color={bottomColor} roughness={0.76} metalness={0.1} />
          </mesh>
          <mesh position={[0.26, -0.28, 0]} rotation={[0, 0, -0.04]} castShadow>
            <capsuleGeometry args={[0.2, 1.65, 7, 16]} />
            <meshStandardMaterial color={bottomColor} roughness={0.76} metalness={0.1} />
          </mesh>
          <mesh position={[0, -1.18, 0.18]} castShadow>
            <boxGeometry args={[0.72, 0.09, 0.08]} />
            <meshStandardMaterial color={bottomColor} roughness={0.78} metalness={0.1} />
          </mesh>
        </group>
      )}

      {bottom === 'shorts' && (
        <group>
          <mesh position={[-0.25, -0.05, 0.08]} rotation={[0, 0, 0.04]} castShadow>
            <boxGeometry args={[0.38, 1.1, 0.55]} />
            <meshStandardMaterial color={bottomColor} roughness={0.78} metalness={0.1} />
          </mesh>
          <mesh position={[0.25, -0.05, 0.08]} rotation={[0, 0, -0.04]} castShadow>
            <boxGeometry args={[0.38, 1.1, 0.55]} />
            <meshStandardMaterial color={bottomColor} roughness={0.78} metalness={0.1} />
          </mesh>
          <mesh position={[0, 0.32, 0.22]} castShadow>
            <boxGeometry args={[0.8, 0.12, 0.08]} />
            <meshStandardMaterial color={bottomColor} roughness={0.8} metalness={0.08} />
          </mesh>
        </group>
      )}

      {shoes === 'sneakers' && (
        <group position={[0, -1.95, 0]}>
          <mesh position={[-0.34, 0, 0.38]} castShadow>
            <boxGeometry args={[0.38, 0.22, 0.82]} />
            <meshStandardMaterial color={shoeColor} roughness={0.7} metalness={0.18} />
          </mesh>
          <mesh position={[0.34, 0, 0.38]} castShadow>
            <boxGeometry args={[0.38, 0.22, 0.82]} />
            <meshStandardMaterial color={shoeColor} roughness={0.7} metalness={0.18} />
          </mesh>
          <mesh position={[-0.34, 0.14, 0.12]} castShadow>
            <boxGeometry args={[0.3, 0.08, 0.5]} />
            <meshStandardMaterial color={shoeColor} roughness={0.68} metalness={0.2} />
          </mesh>
          <mesh position={[0.34, 0.14, 0.12]} castShadow>
            <boxGeometry args={[0.3, 0.08, 0.5]} />
            <meshStandardMaterial color={shoeColor} roughness={0.68} metalness={0.2} />
          </mesh>
        </group>
      )}

      {shoes === 'boots' && (
        <group position={[0, -1.92, 0]}>
          <mesh position={[-0.3, -0.08, 0.36]} castShadow>
            <boxGeometry args={[0.4, 0.5, 0.9]} />
            <meshStandardMaterial color={shoeColor} roughness={0.7} metalness={0.14} />
          </mesh>
          <mesh position={[0.3, -0.08, 0.36]} castShadow>
            <boxGeometry args={[0.4, 0.5, 0.9]} />
            <meshStandardMaterial color={shoeColor} roughness={0.7} metalness={0.14} />
          </mesh>
          <mesh position={[-0.3, 0.12, 0.12]} castShadow>
            <boxGeometry args={[0.28, 0.07, 0.45]} />
            <meshStandardMaterial color={shoeColor} roughness={0.72} metalness={0.16} />
          </mesh>
          <mesh position={[0.3, 0.12, 0.12]} castShadow>
            <boxGeometry args={[0.28, 0.07, 0.45]} />
            <meshStandardMaterial color={shoeColor} roughness={0.72} metalness={0.16} />
          </mesh>
        </group>
      )}

      {shoes === 'loafers' && (
        <group position={[0, -1.96, 0]}>
          <mesh position={[-0.3, 0.04, 0.28]} castShadow>
            <boxGeometry args={[0.42, 0.18, 0.72]} />
            <meshStandardMaterial color={shoeColor} roughness={0.6} metalness={0.2} />
          </mesh>
          <mesh position={[0.3, 0.04, 0.28]} castShadow>
            <boxGeometry args={[0.42, 0.18, 0.72]} />
            <meshStandardMaterial color={shoeColor} roughness={0.6} metalness={0.2} />
          </mesh>
          <mesh position={[-0.3, 0.18, 0.44]} castShadow>
            <boxGeometry args={[0.28, 0.08, 0.2]} />
            <meshStandardMaterial color={shoeColor} roughness={0.55} metalness={0.22} />
          </mesh>
          <mesh position={[0.3, 0.18, 0.44]} castShadow>
            <boxGeometry args={[0.28, 0.08, 0.2]} />
            <meshStandardMaterial color={shoeColor} roughness={0.55} metalness={0.22} />
          </mesh>
        </group>
      )}

      {accessory === 'glasses' && (
        <group position={[0, 1.9, 0.42]}>
          <mesh position={[-0.19, 0, 0]} castShadow>
            <boxGeometry args={[0.32, 0.14, 0.08]} />
            <meshStandardMaterial color={accessoryColor} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0.19, 0, 0]} castShadow>
            <boxGeometry args={[0.32, 0.14, 0.08]} />
            <meshStandardMaterial color={accessoryColor} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.08, 0.06, 0.08]} />
            <meshStandardMaterial color={accessoryColor} metalness={0.7} roughness={0.2} />
          </mesh>
        </group>
      )}

      {accessory === 'cap' && (
        <group position={[0, 2.35, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.55, 0.6, 0.2, 28]} />
            <meshStandardMaterial color={accessoryColor} roughness={0.6} metalness={0.28} />
          </mesh>
          <mesh position={[0, -0.12, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.8, 0.58, 28]} />
            <meshStandardMaterial color={accessoryColor} roughness={0.6} metalness={0.28} />
          </mesh>
        </group>
      )}
    </group>
  );
}
