import React, { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type AccessibilityActionEvent,
  type GestureResponderEvent,
} from 'react-native';

type DraggableSheetProps = {
  /**
   * Visible heights (px) the sheet snaps to, from collapsed to expanded.
   * The first one is the minimum: the sheet can never be hidden completely.
   */
  snapPoints: number[];
  initialSnap?: number;
  /** Always visible part; dragging or tapping it moves the sheet. */
  header: ReactNode;
  children: ReactNode;
  bottomInset?: number;
  /** Children indices of the scroll content that stick to the top (e.g. filters). */
  stickyHeaderIndices?: number[];
  accessibilityLabel?: string;
  /** Called with the visible height while dragging and when snapping. */
  onVisibleHeightChange?: (height: number) => void;
};

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const TAP_SLOP = 5;
const DRAG_THRESHOLD = 4;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Resistance when dragging past the first or last snap point.
const rubberBand = (distance: number) => (distance * 60) / (distance + 60);

const nearestIndex = (offsets: number[], value: number) =>
  offsets.reduce(
    (best, offset, index) => (Math.abs(offset - value) < Math.abs(offsets[best] - value) ? index : best),
    0,
  );

export default function DraggableSheet({
  snapPoints,
  initialSnap = 0,
  header,
  children,
  bottomInset = 0,
  stickyHeaderIndices,
  accessibilityLabel = 'Panel',
  onVisibleHeightChange,
}: DraggableSheetProps) {
  const maxHeight = snapPoints[snapPoints.length - 1];
  // translateY for each snap point: 0 = fully expanded.
  const offsets = useMemo(() => snapPoints.map((point) => maxHeight - point), [snapPoints, maxHeight]);

  const [snapIndex, setSnapIndex] = useState(initialSnap);
  const [translateY] = useState(() => new Animated.Value(offsets[initialSnap] ?? 0));
  const gestureRef = useRef({
    offset: offsets[initialSnap] ?? 0,
    index: initialSnap,
    startY: 0,
    startOffset: 0,
    lastY: 0,
    lastTime: 0,
    velocity: 0,
    moved: false,
  });
  const latestRef = useRef({ offsets, snapPoints, onVisibleHeightChange });

  useEffect(() => {
    latestRef.current = { offsets, snapPoints, onVisibleHeightChange };
  }, [offsets, snapPoints, onVisibleHeightChange]);

  const snapTo = useCallback(
    (index: number, velocity = 0) => {
      const { offsets: targets, snapPoints: heights, onVisibleHeightChange: notify } = latestRef.current;
      const next = clamp(index, 0, targets.length - 1);
      gestureRef.current.index = next;
      gestureRef.current.offset = targets[next];
      setSnapIndex(next);
      notify?.(heights[next]);
      Animated.spring(translateY, {
        toValue: targets[next],
        velocity,
        damping: 24,
        stiffness: 240,
        mass: 0.9,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    },
    [translateY],
  );

  // Keep the current snap point when the layout changes (rotation, insets).
  useEffect(() => {
    snapTo(gestureRef.current.index);
  }, [offsets, snapTo]);

  const handleGrant = (event: GestureResponderEvent) => {
    const { pageY, timestamp } = event.nativeEvent;
    const gesture = gestureRef.current;
    translateY.stopAnimation();
    gesture.startY = pageY;
    gesture.startOffset = gesture.offset;
    gesture.lastY = pageY;
    gesture.lastTime = timestamp ?? Date.now();
    gesture.velocity = 0;
    gesture.moved = false;
  };

  const handleMove = (event: GestureResponderEvent) => {
    const { pageY, timestamp } = event.nativeEvent;
    const gesture = gestureRef.current;
    const { offsets: targets, snapPoints: heights, onVisibleHeightChange: notify } = latestRef.current;
    const now = timestamp ?? Date.now();

    const dy = pageY - gesture.startY;
    if (!gesture.moved && Math.abs(dy) < DRAG_THRESHOLD) {
      return;
    }
    gesture.moved = true;

    const instant = (pageY - gesture.lastY) / Math.max(now - gesture.lastTime, 1);
    gesture.velocity = gesture.velocity * 0.6 + instant * 0.4;
    gesture.lastY = pageY;
    gesture.lastTime = now;

    const lowest = targets[0];
    let next = gesture.startOffset + dy;
    if (next < 0) next = -rubberBand(-next);
    else if (next > lowest) next = lowest + rubberBand(next - lowest);

    gesture.offset = next;
    translateY.setValue(next);
    notify?.(heights[heights.length - 1] - clamp(next, 0, lowest));
  };

  const handleRelease = (event: GestureResponderEvent) => {
    const gesture = gestureRef.current;
    const { offsets: targets } = latestRef.current;
    const last = targets.length - 1;
    const dy = event.nativeEvent.pageY - gesture.startY;

    if (!gesture.moved || Math.abs(dy) < TAP_SLOP) {
      // Tap on the handle: open one more step, or collapse when fully open.
      snapTo(gesture.index >= last ? 0 : gesture.index + 1);
      return;
    }

    const projected = gesture.offset + gesture.velocity * 160;
    snapTo(nearestIndex(targets, projected), gesture.velocity);
  };

  const handleTerminate = () => {
    snapTo(nearestIndex(latestRef.current.offsets, gestureRef.current.offset));
  };

  const handleAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') snapTo(gestureRef.current.index + 1);
    if (event.nativeEvent.actionName === 'decrement') snapTo(gestureRef.current.index - 1);
  };

  return (
    <Animated.View style={[styles.sheet, { height: maxHeight, transform: [{ translateY }] }]}>
      <View
        style={styles.dragArea}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={handleGrant}
        onResponderMove={handleMove}
        onResponderRelease={handleRelease}
        onResponderTerminate={handleTerminate}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Desliza hacia arriba o abajo para mostrar más o menos opciones"
        accessibilityValue={{ min: 1, max: snapPoints.length, now: snapIndex + 1 }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={handleAccessibilityAction}
      >
        <View style={styles.handle} />
        {header}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          // The part of the sheet below the screen edge must still be reachable.
          { paddingBottom: (offsets[snapIndex] ?? 0) + bottomInset + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        stickyHeaderIndices={stickyHeaderIndices}
      >
        {children}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#17171D',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#2D2D38',
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -8 },
    elevation: 16,
  },
  dragArea: {
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 20,
    // On web a text selection cancels the drag gesture.
    userSelect: 'none',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#4B4B57',
    marginBottom: 12,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
});
