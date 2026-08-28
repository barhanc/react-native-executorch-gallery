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
  | 'sparkle'
  | 'palette'
  | 'textDoc'
  | 'layers'
  | 'person'
  | 'brush'
  | 'wand'
  | 'shapes'
  | 'splitMask'
  | 'scissors'
  | 'arrowUp'
  | 'send'
  | 'close'
  | 'trash';

const PATH_DEFINITIONS: Record<IconName, string> = {
  scan: 'M3 9V5a2 2 0 0 1 2-2h4 M15 3h4a2 2 0 0 1 2 2v4 M21 15v4a2 2 0 0 1-2 2h-4 M9 21H5a2 2 0 0 1-2-2v-4 M9 9h6v6H9z',
  chat: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  embeddings: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  mic: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v4 M8 23h8',
  audio: 'M11 5L6 9H2v6h4l5 4V5z M15.54 8.46a5 5 0 0 1 0 7.07 M19.07 4.93a10 10 0 0 1 0 14.14',
  photo:
    'M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z M8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z M21 15l-5-5L5 21',
  camera:
    'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z M12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  bolt: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  chevronRight: 'M9 18l6-6-6-6',
  sparkle:
    'M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83',
  palette:
    'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z M6 10a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z M9.5 6.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z M14.5 6.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z M8 15a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
  textDoc:
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  layers: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
  person: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  brush:
    'M18.37 2.63a2.12 2.12 0 0 1 3 3L7.12 19.88a4 4 0 0 1-1.88 1.07l-3.24.81.81-3.24a4 4 0 0 1 1.07-1.88L18.37 2.63z M14.5 6.5l3 3',
  wand: 'M15 4V2 M15 16v-2 M8 9h2 M20 9h2 M17.8 11.8L19.2 13.2 M17.8 6.2l1.4-1.4 M12.2 11.8l-1.4 1.4 M12.2 6.2l-1.4-1.4 M4 20l10-10',
  shapes:
    'M8 14A5 5 0 1 1 8 4a5 5 0 0 1 0 10z M14 10h6a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z',
  splitMask: 'M3 3h18v18H3z M3 15c4-2 7 1 11-2s4-1 7-4 M8 3v5 M16 16v5',
  scissors:
    'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M20 4L8.12 15.88 M14.47 14.48L20 20 M8.12 8.12L12 12',
  arrowUp: 'M12 19V5 M5 12l7-7 7 7',
  send: 'M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z',
  close: 'M18 6L6 18 M6 6l12 12',
  trash:
    'M3 6h18 M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2 M10 11v6 M14 11v6',
};

export interface IconProps {
  /** Name of the vector icon to draw. */
  name: IconName;
  /** Size in logical points (width and height). */
  size?: number;
  /** Hex stroke color. */
  color?: string;
  /** Stroke stroke width in points. */
  strokeWidth?: number;
}

/**
 * Minimalist, hardware-rendered vector icon component powered by Skia.
 *
 * Renders sharp, scale-independent vector icons without requiring bundled icon fonts.
 *
 * @param props Icon name, bounding size, color, and stroke weight.
 * @returns Hardware-rendered vector icon canvas.
 */
export function Icon({ name, size = 20, color = '#2563EB', strokeWidth = 2 }: IconProps) {
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
