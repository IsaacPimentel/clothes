import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ViewportInsets } from '../components/3d/AvatarCanvas';
import { HEADER_BAR_HEIGHT } from '../components/ui/OverlayHeader';

/**
 * Layout for screens with a full screen avatar and a draggable sheet on top:
 * the sheet snap points, plus the viewport insets that the 3D camera reads every
 * frame to keep the avatar centered in the uncovered area.
 *
 * @param peek Height of the sheet part that is always visible (above the safe area).
 */
export function useAvatarSheetLayout(peek: number) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const headerHeight = insets.top + HEADER_BAR_HEIGHT;

  const snapPoints = useMemo(() => {
    const collapsed = peek + insets.bottom;
    const expanded = Math.max(collapsed + 160, windowHeight - headerHeight - 140);
    const middle = Math.round(Math.min(Math.max(windowHeight * 0.48, collapsed + 80), expanded - 80));
    return [collapsed, middle, expanded];
  }, [peek, insets.bottom, windowHeight, headerHeight]);

  const viewport = useRef<ViewportInsets>({ top: headerHeight, bottom: snapPoints[1] });

  useEffect(() => {
    viewport.current.top = headerHeight;
  }, [headerHeight]);

  const handleSheetHeight = useCallback((visibleHeight: number) => {
    viewport.current.bottom = visibleHeight;
  }, []);

  return { insets, headerHeight, snapPoints, viewport, handleSheetHeight };
}
