import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Canvas, Image as SkiaImage, type SkImage } from '@shopify/react-native-skia';
import type { ViewportTransform } from '@/components/PhotoPicker';
import { radius, spacing } from '@/theme';

export interface StyleTransferOverlayProps {
  /** The stylized image buffer decoded as a hardware Skia image instance. */
  styledImage: SkImage | null;
  /** Whether the user is actively pressing the compare toggle to view the original. */
  showOriginal: boolean;
  /** Width of the input photo in source pixels. */
  imageWidth: number;
  /** Height of the input photo in source pixels. */
  imageHeight: number;
  /** Viewport coordinate transformation. */
  transform: ViewportTransform;
  /** Callback triggered when user presses down on the compare pill. */
  onPressInOriginal: () => void;
  /** Callback triggered when user releases the compare pill. */
  onPressOutOriginal: () => void;
}

/**
 * Renders the neural style transfer output over the photo viewport.
 *
 * Provides an interactive "Hold for original" comparison pill enabling users
 * to quickly switch between the source photo and the styled output.
 *
 * @param props Stylized image handle, viewport geometry, and compare handlers.
 * @returns Styled Skia canvas image layer and comparison toggle pill.
 */
export function StyleTransferOverlay({
  styledImage,
  showOriginal,
  imageWidth,
  imageHeight,
  transform,
  onPressInOriginal,
  onPressOutOriginal,
}: StyleTransferOverlayProps) {
  if (!styledImage) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {!showOriginal ? (
        <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
          <SkiaImage
            image={styledImage}
            fit="fill"
            x={transform.offsetX}
            y={transform.offsetY}
            width={imageWidth * transform.scale}
            height={imageHeight * transform.scale}
          />
        </Canvas>
      ) : null}

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
