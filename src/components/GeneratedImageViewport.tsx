import React from 'react';
import { Keyboard, Pressable, StyleSheet } from 'react-native';
import type { SkImage } from '@shopify/react-native-skia';

import { GeneratedImage } from '@/components/GeneratedImage';
import { EmptyState } from '@/components/EmptyState';
import { borderWidth, radius, useTheme } from '@/theme';

export interface GeneratedImageViewportProps {
  /** The generated Skia image to display, or null when nothing has been generated yet. */
  image: SkImage | null;
}

/**
 * Viewport frame for a text-to-image result.
 *
 * Renders the same bordered, rounded container used by all other CV task
 * screens (matching the PhotoPicker viewport). Shows a {@link GeneratedImage}
 * when an image is available, or a centered {@link EmptyState} placeholder
 * before the first generation. Tapping anywhere on the viewport dismisses the
 * keyboard so the user can see the full result.
 *
 * @param props The generated Skia image, or null for the empty state.
 * @returns A pressable viewport card containing the image or placeholder.
 */
export function GeneratedImageViewport({ image }: GeneratedImageViewportProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[
        styles.viewport,
        { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
      ]}
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      {image ? (
        <GeneratedImage image={image} />
      ) : (
        <EmptyState
          title="Nothing generated yet"
          message="Type a prompt and press send to synthesize an image on-device."
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
});
