import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  AlphaType,
  BlendColor,
  Canvas,
  ColorType,
  Image as SkiaImage,
  Skia,
  type SkImage,
} from '@shopify/react-native-skia';
import type { InstanceSegmentationResult } from 'react-native-executorch';
import type { ViewportTransform } from '@/components/PhotoPicker';
import { radius } from '@/theme';

export interface InstanceSegmentationOverlayProps {
  /** Array of instance segmentation results containing boxes, masks, and class labels. */
  instances: InstanceSegmentationResult<'xyxy', string>[];
  /** Width of the photo in source pixels. */
  imageWidth: number;
  /** Height of the photo in source pixels. */
  imageHeight: number;
  /** Viewport coordinate transformation. */
  transform: ViewportTransform;
}

const MASK_COLORS = [
  { r: 42, g: 71, b: 255, a: 140 }, // Royal Cobalt
  { r: 217, g: 70, b: 239, a: 140 }, // Magenta
  { r: 16, g: 185, b: 129, a: 140 }, // Emerald
  { r: 245, g: 158, b: 11, a: 140 }, // Amber
  { r: 139, g: 92, b: 246, a: 140 }, // Violet
  { r: 234, g: 88, b: 12, a: 140 }, // Orange
  { r: 2, g: 132, b: 199, a: 140 }, // Sky
  { r: 225, g: 29, b: 72, a: 140 }, // Rose
];

const MASK_STROKE_COLORS = [
  '#2A47FF',
  '#D946EF',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EA580C',
  '#0284C7',
  '#E11D48',
];

interface DecodedMaskInstance {
  maskImage: SkImage | null;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
  label: string;
  confidence: number;
  colorStr: string;
  strokeColor: string;
}

/**
 * Renders high-accuracy colorized instance segmentation pixel masks, bounding boxes, and tags.
 *
 * Decodes Alpha_8 instance mask buffers onto full-resolution Skia canvas layers with
 * vibrant categorical blend colors.
 *
 * @param props Instance results, photo dimensions, and active viewport transformation.
 * @returns Alpha-blended Skia mask layers and bounding boxes.
 */
export function InstanceSegmentationOverlay({
  instances,
  imageWidth,
  imageHeight,
  transform,
}: InstanceSegmentationOverlayProps) {
  if (instances.length === 0 || imageWidth === 0 || imageHeight === 0) return null;
  const { scale, offsetX, offsetY } = transform;

  const decodedMasks: DecodedMaskInstance[] = React.useMemo(() => {
    return instances.map((inst, i) => {
      const col = MASK_COLORS[i % MASK_COLORS.length]!;
      const colorStr = `rgba(${col.r}, ${col.g}, ${col.b}, ${col.a / 255})`;
      const strokeColor = MASK_STROKE_COLORS[i % MASK_STROKE_COLORS.length]!;
      let maskImage: SkImage | null = null;

      try {
        if (inst.mask && inst.mask.data && inst.mask.width > 0 && inst.mask.height > 0) {
          const outData = Skia.Data.fromBytes(inst.mask.data);
          const info = {
            width: inst.mask.width,
            height: inst.mask.height,
            colorType: ColorType.Alpha_8,
            alphaType: AlphaType.Premul,
          };
          maskImage = Skia.Image.MakeImage(info, outData, inst.mask.width);
        }
      } catch (err) {
        console.warn('Failed to decode instance mask image:', err);
      }

      return {
        maskImage,
        box: inst.box,
        label: inst.label,
        confidence: inst.confidence,
        colorStr,
        strokeColor,
      };
    });
  }, [instances]);

  const targetWidth = imageWidth * scale;
  const targetHeight = imageHeight * scale;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Full-Image Skia Color-Tinted Instance Masks */}
      <Canvas style={StyleSheet.absoluteFill}>
        {decodedMasks.map((item, idx) => {
          if (!item.maskImage) return null;

          return (
            <SkiaImage
              key={`mask-${idx}`}
              image={item.maskImage}
              fit="fill"
              x={offsetX}
              y={offsetY}
              width={targetWidth}
              height={targetHeight}
            >
              <BlendColor color={item.colorStr} mode="srcIn" />
            </SkiaImage>
          );
        })}
      </Canvas>

      {/* Bounding Boxes & Confidence Tags */}
      {decodedMasks.map((item, idx) => {
        const left = Math.round(offsetX + item.box.xmin * scale);
        const top = Math.round(offsetY + item.box.ymin * scale);
        const width = Math.round((item.box.xmax - item.box.xmin) * scale);
        const height = Math.round((item.box.ymax - item.box.ymin) * scale);
        const isNearTop = top < 24;

        return (
          <View
            key={`box-${idx}`}
            style={[
              styles.instanceBox,
              {
                left,
                top,
                width,
                height,
                borderColor: item.strokeColor,
              },
            ]}
          >
            <View
              style={[
                styles.instanceTag,
                {
                  backgroundColor: item.strokeColor,
                  top: isNearTop ? 2 : -22,
                  left: isNearTop ? 2 : -1,
                },
              ]}
            >
              <Text style={styles.instanceTagText}>
                {item.label} {Math.round(item.confidence * 100)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  instanceBox: {
    position: 'absolute',
    borderWidth: 1.5,
    borderRadius: radius.xs,
  },
  instanceTag: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  instanceTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
