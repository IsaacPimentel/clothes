import React, { type ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const HEADER_BAR_HEIGHT = 56;

type OverlayHeaderProps = {
  title: string;
  topInset: number;
  onBack: () => void;
  /** Optional action on the right (keeps the title centered when absent). */
  right?: ReactNode;
  /** Small pill under the header, e.g. a gesture hint. */
  hint?: string;
};

/** Transparent header floating over a full screen 3D scene. */
export default function OverlayHeader({ title, topInset, onBack, right, hint }: OverlayHeaderProps) {
  return (
    <>
      <View style={[styles.header, { paddingTop: topInset }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.side}
          accessibilityRole="button"
          accessibilityLabel="Volver"
          hitSlop={8}
        >
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>

        <View style={[styles.side, styles.right]}>{right}</View>
      </View>

      {hint ? (
        <View style={[styles.hint, { top: topInset + HEADER_BAR_HEIGHT + 4 }]} pointerEvents="none">
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  side: {
    width: 44,
    height: HEADER_BAR_HEIGHT,
    justifyContent: 'center',
  },
  right: {
    alignItems: 'flex-end',
  },
  back: {
    color: '#FFFFFF',
    fontSize: 40,
    lineHeight: 44,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#17171DCC',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hintText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
});
