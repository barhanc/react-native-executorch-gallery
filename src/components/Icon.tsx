import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';

export type IconName =
  | 'scan'
  | 'chat'
  | 'embeddings'
  | 'mic'
  | 'audio'
  | 'photo'
  | 'camera'
  | 'bolt'
  | 'chevronRight'
  | 'sparkle';

const PATH_DEFINITIONS: Record<IconName, string> = {
  scan: 'M3 9V5a2 2 0 0 1 2-2h4 M15 3h4a2 2 0 0 1 2 2v4 M21 15v4a2 2 0 0 1-2 2h-4 M9 21H5a2 2 0 0 1-2-2v-4 M9 9h6v6H9z',
  chat: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  embeddings: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  mic: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8',
  audio: 'M11 5L6 9H2v6h4l5 4V5z M15.54 8.46a5 5 0 0 1 0 7.07 M19.07 4.93a10 10 0 0 1 0 14.14',
  photo: 'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  bolt: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  chevronRight: 'M9 18l6-6-6-6',
  sparkle: 'M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83',
};

/**
 * Minimalist, hardware-rendered vector icon component powered by Skia.
 * Clean, sharp vector rendering across any density without icon font bundling.
 */
export function Icon({
  name,
  size = 20,
  color = '#2563EB',
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const d = PATH_DEFINITIONS[name];
  const path = React.useMemo(() => {
    const rawPath = Skia.Path.MakeFromSVGString(d);
    if (!rawPath) return null;
    if (size !== 24) {
      const scale = size / 24;
      const matrix = Skia.Matrix();
      matrix.scale(scale, scale);
      rawPath.transform(matrix);
    }
    return rawPath;
  }, [d, size]);

  if (!path) return <View style={{ width: size, height: size }} />;

  return (
    <View style={{ width: size, height: size }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Path
          path={path}
          color={color}
          style="stroke"
          strokeWidth={strokeWidth * (size / 24)}
          strokeCap="round"
          strokeJoin="round"
        />
      </Canvas>
    </View>
  );
}
