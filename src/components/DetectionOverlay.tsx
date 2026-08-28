import { StyleSheet, Text, View } from 'react-native';
import type { ObjectDetection } from 'react-native-executorch';

import type { ViewportTransform } from '@/components/PhotoPicker';
import { domainColor } from '@/lib/labels';
import { radius } from '@/theme';

/**
 * Draws detection boxes over the canvas. Boxes are `xyxy` in source-image
 * pixels; the {@link ViewportTransform} maps them into displayed coordinates.
 */
export function DetectionOverlay({
  detections,
  transform,
}: {
  detections: ObjectDetection<'xyxy', string>[];
  transform: ViewportTransform;
}) {
  const { scale, offsetX, offsetY } = transform;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {detections.map((d, i) => {
        const color = domainColor(d.label);
        const left = Math.round(offsetX + d.box.xmin * scale);
        const top = Math.round(offsetY + d.box.ymin * scale);
        const width = Math.round((d.box.xmax - d.box.xmin) * scale);
        const height = Math.round((d.box.ymax - d.box.ymin) * scale);
        const isNearTop = top < 24;

        return (
          <View
            key={i}
            style={[
              styles.box,
              {
                left,
                top,
                width,
                height,
                borderColor: color,
                backgroundColor: color + '12',
              },
            ]}
          >
            <View
              style={[
                styles.tag,
                {
                  backgroundColor: color,
                  top: isNearTop ? 2 : -22,
                  left: isNearTop ? 2 : -1,
                },
              ]}
            >
              <Text style={styles.tagText}>
                {d.label} {Math.round(d.confidence * 100)}%
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: radius.xs,
  },
  tag: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

