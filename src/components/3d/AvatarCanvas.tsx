import React, { useRef, type RefObject } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';
import { Canvas, useFrame, useThree } from '@react-three/fiber/native';
import { ContactShadows } from '@react-three/drei/native';
import { MathUtils, Vector3, type PerspectiveCamera } from 'three';

import AvatarModel, { type RotationState } from './AvatarModel';
import type { OutfitMode } from './avatar/outfitGeometry';

/** Pixels of the canvas covered by overlays (header on top, sheet at the bottom). */
export type ViewportInsets = {
  top: number;
  bottom: number;
};

// World-space box that must always fit in the visible area (tallest avatar is 2 m).
const FRAME_HEIGHT = 2.26;
const FRAME_WIDTH = 1.05;
const FRAME_CENTER_Y = 1.0;
// Radians of rotation per pixel dragged.
const DRAG_SENSITIVITY = 0.012;

function CameraRig({ viewport }: { viewport?: RefObject<ViewportInsets | null> }) {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const size = useThree((state) => state.size);
  const desired = useRef(new Vector3());
  const initialized = useRef(false);

  useFrame((_, delta) => {
    const insets = viewport?.current ?? { top: 0, bottom: 0 };
    const visible = Math.max(size.height - insets.top - insets.bottom, size.height * 0.2);
    const tanHalf = Math.tan(MathUtils.degToRad(camera.fov / 2));

    const byHeight = FRAME_HEIGHT / ((visible / size.height) * 2 * tanHalf);
    const byWidth = FRAME_WIDTH / (camera.aspect * 2 * tanHalf);
    const distance = Math.max(byHeight, byWidth);

    // Shift the camera so the avatar sits in the middle of the uncovered area.
    const centerPx = insets.top + visible / 2;
    const ndc = 1 - (2 * centerPx) / size.height;
    desired.current.set(0, FRAME_CENTER_Y - ndc * distance * tanHalf, distance);

    if (!initialized.current) {
      camera.position.copy(desired.current);
      initialized.current = true;
    } else {
      camera.position.lerp(desired.current, 1 - Math.exp(-delta * 6));
    }
    camera.lookAt(0, camera.position.y, 0);
  });

  return null;
}

function Podium() {
  return (
    <group>
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.62, 0.66, 0.04, 96]} />
        <meshStandardMaterial color="#141419" roughness={0.9} metalness={0} />
      </mesh>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.615, 96]} />
        <meshStandardMaterial color="#7C3AED" emissive="#7C3AED" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

type AvatarCanvasProps = {
  /** 'base' shows the body with neutral underwear, 'outfit' the selected clothes. */
  outfitMode?: OutfitMode;
  /** Overlay insets, read every frame so the camera follows a moving sheet. */
  viewport?: RefObject<ViewportInsets | null>;
};

export default function AvatarCanvas({ outfitMode = 'outfit', viewport }: AvatarCanvasProps) {
  const rotationRef = useRef<RotationState>({ target: 0, velocity: 0, dragging: false });
  const dragRef = useRef({ startX: 0, startTarget: 0, lastX: 0, lastTime: 0, velocity: 0 });

  const handleDragStart = (event: GestureResponderEvent) => {
    const { pageX, timestamp } = event.nativeEvent;
    const drag = dragRef.current;
    const spin = rotationRef.current;
    spin.dragging = true;
    spin.velocity = 0;
    drag.startX = pageX;
    drag.lastX = pageX;
    drag.lastTime = timestamp ?? Date.now();
    drag.velocity = 0;
    drag.startTarget = spin.target;
  };

  const handleDragMove = (event: GestureResponderEvent) => {
    const { pageX, timestamp } = event.nativeEvent;
    const drag = dragRef.current;
    const now = timestamp ?? Date.now();
    const instant = (pageX - drag.lastX) / Math.max(now - drag.lastTime, 1);
    drag.velocity = drag.velocity * 0.6 + instant * 0.4;
    drag.lastX = pageX;
    drag.lastTime = now;
    rotationRef.current.target = drag.startTarget + (pageX - drag.startX) * DRAG_SENSITIVITY;
  };

  const handleDragEnd = () => {
    const spin = rotationRef.current;
    spin.dragging = false;
    // px/ms -> rad/s, so a flick keeps the avatar spinning for a moment.
    spin.velocity = MathUtils.clamp(dragRef.current.velocity * DRAG_SENSITIVITY * 1000, -10, 10);
  };

  return (
    <View style={styles.container}>
      <Canvas
        shadows
        camera={{ position: [0, FRAME_CENTER_Y, 7], fov: 28, near: 0.1, far: 60 }}
        style={StyleSheet.absoluteFill}
      >
        <color attach="background" args={['#0B0B0F']} />

        {/* Warm floor bounce so surfaces facing down (under nose, chin, arms) are not black. */}
        <hemisphereLight args={['#DFE3FF', '#4A3B3F', 0.75]} />
        <ambientLight intensity={0.15} />
        <directionalLight
          castShadow
          position={[2.5, 4, 3.5]}
          intensity={2.4}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-bias={-0.0004}
          shadow-normalBias={0.02}
          shadow-camera-left={-1.4}
          shadow-camera-right={1.4}
          shadow-camera-top={2.4}
          shadow-camera-bottom={-0.4}
          shadow-camera-near={0.5}
          shadow-camera-far={12}
        />
        <directionalLight position={[-3, 2, 2]} intensity={0.7} color="#C7D2FE" />
        {/* Low frontal fill, like a reflector board in a photo studio. */}
        <directionalLight position={[0, 0.6, 4]} intensity={0.55} color="#FFE9E0" />
        <directionalLight position={[0, 3, -4]} intensity={1.6} color="#A78BFA" />

        <CameraRig viewport={viewport} />
        <Podium />
        <ContactShadows position={[0, 0.002, 0]} opacity={0.55} scale={3} blur={2.4} far={2.2} resolution={512} />
        <AvatarModel outfitMode={outfitMode} rotationRef={rotationRef} />
      </Canvas>

      {/* Drag anywhere on the avatar area to turn it around. */}
      <View
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleDragStart}
        onResponderMove={handleDragMove}
        onResponderRelease={handleDragEnd}
        onResponderTerminate={handleDragEnd}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
  },
});
