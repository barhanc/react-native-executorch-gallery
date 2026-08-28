import React from 'react';
import { StyleSheet } from 'react-native';
import {
  Canvas,
  Image as SkiaImage,
  useCanvasSize,
  type SkImage,
} from '@shopify/react-native-skia';
import { useTheme } from '@/theme';

export interface GeneratedImageProps {
  /** The image to render. */
  image: SkImage | null;
}

/**
 * Displays a generated image inside a single hardware canvas.
 *
 * Renders the image letterboxed (contain) to fit the available area, matching
 * the app's single-canvas rule for bitmap overlays. Canvas size is measured via
 * `useCanvasSize`, which is supported on the new architecture.
 *
 * @param props The generated image.
 * @returns A canvas viewport, or an empty surface when no image is set.
 */
export function GeneratedImage({ image }: GeneratedImageProps) {
  const { colors } = useTheme();
  const { ref, size } = useCanvasSize();

  return (
    <Canvas ref={ref} style={[styles.canvas, { backgroundColor: colors.surfaceSubtle }]}>
      {image && size.width > 0 && size.height > 0 ? (
        <SkiaImage
          image={image}
          fit="contain"
          x={0}
          y={0}
          width={size.width}
          height={size.height}
        />
      ) : null}
    </Canvas>
  );
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});
