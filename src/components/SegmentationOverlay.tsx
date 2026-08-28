import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AlphaType, Canvas, ColorType, Image as SkiaImage, Skia } from '@shopify/react-native-skia';
import type { SemanticSegmentationResult } from 'react-native-executorch';
import type { ViewportTransform } from '@/components/PhotoPicker';
import { radius, spacing } from '@/theme';

export interface LegendItem {
  /** Name of the detected segment category. */
  label: string;
  /** CSS RGB/RGBA color string matching the mask pixel tint. */
  color: string;
}

export interface SegmentationOverlayProps {
  /** Semantic segmentation output result containing mask buffer and colormap. */
  result: SemanticSegmentationResult<string> | null;
  /** Width of the photo in source pixels. */
  imageWidth: number;
  /** Height of the photo in source pixels. */
  imageHeight: number;
  /** Viewport coordinate transformation. */
  transform: ViewportTransform;
}

/**
 * Renders color-coded semantic segmentation pixel masks and an active class color legend.
 *
 * Automatically decodes the output RGBA buffer into a Skia Image and extracts the
 * active class categories that are present in the image.
 *
 * @param props Segmentation result, source dimensions, and coordinate transform.
 * @returns Alpha-blended Skia canvas mask layer and floating segment color legend.
 */
export function SegmentationOverlay({
  result,
  imageWidth,
  imageHeight,
  transform,
}: SegmentationOverlayProps) {
  // Decode output RGBA buffer into Skia image using exact buffer dimensions
  const maskImage = React.useMemo(() => {
    if (!result?.buffer?.data) return null;
    const w = result.buffer.width || imageWidth;
    const h = result.buffer.height || imageHeight;
    if (!w || !h) return null;

    try {
      const outData = Skia.Data.fromBytes(result.buffer.data);
      const info = {
        width: w,
        height: h,
        colorType: ColorType.RGBA_8888,
        alphaType: AlphaType.Premul,
      };
      return Skia.Image.MakeImage(info, outData, w * 4);
    } catch (err) {
      console.warn('Failed to decode segmentation mask image:', err);
      return null;
    }
  }, [result, imageWidth, imageHeight]);

  // Extract detected class color legend from colormap and present mask pixels
  const legend = React.useMemo(() => {
    if (!result?.colormap || !result?.buffer?.data) return [];

    try {
      const presentColors = new Set<string>();
      const data = result.buffer.data;
      const step = Math.max(4, Math.floor(data.length / 5000) * 4);
      for (let i = 0; i < data.length; i += step) {
        const a = data[i + 3]!;
        if (a > 20) {
          presentColors.add(`${data[i]!},${data[i + 1]!},${data[i + 2]!}`);
        }
      }

      const detectedLegends: LegendItem[] = [];
      for (const [label, color] of Object.entries(result.colormap)) {
        if (!Array.isArray(color) || color.length < 4) continue;
        const [r, g, b, a] = color as [number, number, number, number];
        if (label.toLowerCase() === 'background' || a === 0) continue;
        if (presentColors.has(`${r},${g},${b}`)) {
          detectedLegends.push({
            label: label.charAt(0).toUpperCase() + label.slice(1),
            color: `rgb(${r}, ${g}, ${b})`,
          });
        }
      }
      return detectedLegends;
    } catch {
      return [];
    }
  }, [result]);

  if (!maskImage) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Skia Colorized Mask Canvas */}
      <Canvas style={StyleSheet.absoluteFill}>
        <SkiaImage
          image={maskImage}
          fit="fill"
          x={transform.offsetX}
          y={transform.offsetY}
          width={imageWidth * transform.scale}
          height={imageHeight * transform.scale}
          opacity={0.65}
        />
      </Canvas>

      {/* Floating Segment Color Legend */}
      {legend.length > 0 ? (
        <View style={styles.legendContainer}>
          <View style={styles.legendCard}>
            <Text style={styles.legendHeader}>Segments</Text>
            <View style={styles.legendWrap}>
              {legend.map((item) => (
                <View key={item.label} style={styles.legendBadge}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  legendContainer: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  legendCard: {
    backgroundColor: 'rgba(10, 16, 32, 0.76)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: spacing.md,
    gap: spacing.xs + 2,
  },
  legendHeader: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  legendWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  legendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    gap: spacing.xs + 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  legendText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '400',
  },
});
