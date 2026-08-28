import { ReactNode, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Canvas, Image as SkiaImage, useImage } from '@shopify/react-native-skia';
import type { ImageBuffer } from 'react-native-executorch/cv';

import { radius, spacing, useTheme } from '@/theme';
import { pickImage, skImageToBuffer } from '@/lib/image';
import { Icon, type IconName } from '@/components/Icon';

export type PickedImage = {
  uri: string;
  buffer: ImageBuffer;
  width: number;
  height: number;
};

/**
 * Maps a bounding box in source-image pixels onto the displayed canvas.
 */
export type ViewportTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

/**
 * Camera image viewport with a fixed 3:4 vertical phone camera aspect ratio.
 * Features an authentic camera viewfinder HUD with corner reticles and precise
 * coordinate mapping for detection overlays.
 */
export function PhotoPicker({
  onPick,
  renderOverlay,
}: {
  width?: number;
  onPick: (image: PickedImage | null) => void;
  renderOverlay?: (transform: ViewportTransform) => ReactNode;
}) {
  const { colors } = useTheme();
  const [uri, setUri] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const image = useImage(uri, () => onPick(null));

  const choose = async (source: 'library' | 'camera') => {
    const picked = await pickImage(source);
    if (!picked) return;
    onPick(null);
    setUri(picked);
  };

  useEffect(() => {
    if (!image || !uri) return;
    onPick({ uri, buffer: skImageToBuffer(image), width: image.width(), height: image.height() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image, uri]);

  const { width: viewW, height: viewH } = viewportSize;
  const iw = image?.width() ?? 0;
  const ih = image?.height() ?? 0;

  let transform: ViewportTransform = { scale: 1, offsetX: 0, offsetY: 0 };
  if (image && iw > 0 && ih > 0 && viewW > 0 && viewH > 0) {
    const scale = Math.min(viewW / iw, viewH / ih);
    transform = {
      scale,
      offsetX: (viewW - iw * scale) / 2,
      offsetY: (viewH - ih * scale) / 2,
    };
  }

  return (
    <View style={styles.container}>
      {/* Dynamic Viewfinder Frame */}
      <View
        onLayout={(e) => {
          const { width: w, height: h } = e.nativeEvent.layout;
          if (w > 0 && h > 0) {
            setViewportSize({ width: Math.round(w), height: Math.round(h) });
          }
        }}
        style={[
          styles.viewport,
          {
            backgroundColor: '#07090E',
            borderColor: colors.border,
          },
        ]}
      >
        {image && viewW > 0 && viewH > 0 ? (
          <>
            <Canvas style={StyleSheet.absoluteFill}>
              <SkiaImage
                image={image}
                fit="contain"
                x={0}
                y={0}
                width={viewW}
                height={viewH}
              />
            </Canvas>
            {renderOverlay?.(transform)}
          </>
        ) : (
          <View style={styles.placeholderContainer}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: '#131824', borderColor: '#1E293B' },
              ]}
            >
              <Icon name="camera" size={30} color={colors.accent} strokeWidth={2} />
            </View>
            <Text style={[styles.placeholderTitle, { color: '#F8FAFC' }]}>
              No Image Selected
            </Text>
            <Text style={[styles.placeholderSub, { color: '#94A3B8' }]}>
              Take a photo or choose an image from your library
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttons}>
        <PickButton
          iconName="camera"
          label="Take Photo"
          variant="primary"
          onPress={() => choose('camera')}
        />
        <PickButton
          iconName="photo"
          label="Photo Library"
          variant="secondary"
          onPress={() => choose('library')}
        />
      </View>
    </View>
  );
}

function PickButton({
  iconName,
  label,
  variant,
  onPress,
}: {
  iconName: IconName;
  label: string;
  variant: 'primary' | 'secondary';
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pickButton,
        isPrimary
          ? {
              backgroundColor: colors.surface,
              borderColor: colors.accentBorder,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 3,
            }
          : {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
        {
          opacity: pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Icon
        name={iconName}
        size={18}
        color={isPrimary ? colors.accent : colors.textSecondary}
        strokeWidth={2.2}
      />
      <Text
        style={[
          styles.pickLabel,
          { color: isPrimary ? colors.accent : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.sm,
    minHeight: 0,
  },
  viewport: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 220,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xs + 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  placeholderTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  placeholderSub: { fontSize: 13, textAlign: 'center', maxWidth: 240, lineHeight: 18 },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  pickButton: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickLabel: { fontSize: 14, fontWeight: '700', letterSpacing: 0.1 },
});



