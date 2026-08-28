import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { radius, spacing } from '@/theme';

export interface StyleTransferOverlayProps {
  /** Whether the user is actively pressing the compare toggle to view the original. */
  showOriginal: boolean;
  /** Callback triggered when user presses down on the compare pill. */
  onPressInOriginal: () => void;
  /** Callback triggered when user releases the compare pill. */
  onPressOutOriginal: () => void;
}

/**
 * "Hold for original" comparison control for the style transfer viewport.
 *
 * The styled image itself is drawn by {@link PhotoPicker} inside the primary
 * canvas, so this overlay stays a plain view and adds no second Skia surface.
 *
 * @param props Compare state and press handlers.
 * @returns Floating comparison pill.
 */
export function StyleTransferOverlay({
  showOriginal,
  onPressInOriginal,
  onPressOutOriginal,
}: StyleTransferOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Pressable
        onPressIn={onPressInOriginal}
        onPressOut={onPressOutOriginal}
        style={styles.comparePill}
      >
        <Text style={styles.compareText}>
          {showOriginal ? 'Viewing original' : 'Hold for original'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  comparePill: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 26, 114, 0.88)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  compareText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
