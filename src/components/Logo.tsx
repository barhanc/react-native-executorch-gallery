import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Canvas,
  Group,
  LinearGradient,
  Path,
  Skia,
  vec,
} from '@shopify/react-native-skia';

const LOGO_PATHS = [
  {
    d: 'M203.91 160.29C207.682 181.336 201.405 205.773 192.213 222.983C175.794 253.759 151.925 263.141 122.288 278.862C112.589 283.363 89.3224 291.699 80.035 296.643C17.2419 330.081 33.1859 375.786 67.9265 400.794C84.6312 412.806 105.647 420.033 124.412 418.796C55.8497 423.202 -43.8395 315.47 22.2819 258.545C76.6117 211.795 158.043 220.416 203.91 160.29Z',
    start: vec(0.6, 289.6),
    end: vec(205.0, 289.6),
  },
  {
    d: 'M151.798 411.57C156.648 386.246 179.153 368.94 197.95 353.219C330.542 243.712 172.021 192.778 233.071 75.1567C233.071 75.1567 232.532 99.1817 244.039 121.812C261.631 156.392 282.488 157.85 315.422 204.093C329.242 223.522 333.141 247.991 326.738 270.78C303.662 352.744 190.057 340.034 151.798 411.602V411.57Z',
    start: vec(151.8, 243.4),
    end: vec(329.7, 243.4),
  },
  {
    d: 'M151.83 411.633C121.686 267.927 251.519 303.299 226.795 176.645C250.473 230.843 273.613 261.873 234.593 318.449C210.629 353.187 165.682 370.81 151.83 411.633Z',
    start: vec(255.5, 294.2),
    end: vec(147.3, 294.2),
  },
  {
    d: 'M124.412 418.797C82.3807 421.966 19.5242 381.365 41.0469 331.571C54.0113 301.588 88.0229 293.093 115.188 280.669C139.753 269.417 161.435 257.785 181.087 239.592C129.071 302.031 77.4992 330.24 124.412 418.797Z',
    start: vec(108.9, 239.6),
    end: vec(108.9, 419.0),
  },
  {
    d: 'M103.618 145.457C149.865 102.668 153.288 58.1999 126.789 4.82513C125.648 2.51137 124.697 0.831543 124.697 0.831543C217.92 33.7629 178.076 117.09 103.618 145.457Z',
    start: vec(179.1, 73.1),
    end: vec(103.6, 73.1),
  },
  {
    d: 'M69.6064 194.87C80.9225 142.89 132.685 135.98 162.512 100.481C188.98 66.6625 179.059 29.2305 144.857 9.80127C171.705 25.0784 196.873 47.4235 201.817 77.2488C212.626 150.211 130.403 190.274 69.6064 194.838V194.87Z',
    start: vec(69.6, 102.3),
    end: vec(202.8, 102.3),
  },
];

/**
 * Official React Native ExecuTorch gradient flame emblem.
 */
export function Logo({
  size = 36,
  colors = ['#2A47FF', '#D0E2FF'],
}: {
  size?: number;
  colors?: [string, string];
}) {
  const width = size;
  const height = Math.round((size * 419) / 330);
  const scale = size / 330;

  const paths = React.useMemo(() => {
    return LOGO_PATHS.map((item) => {
      const p = Skia.Path.MakeFromSVGString(item.d);
      return { path: p, start: item.start, end: item.end };
    });
  }, []);

  return (
    <View style={{ width, height }}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Group transform={[{ scale }]}>
          {paths.map((item, idx) => {
            if (!item.path) return null;
            return (
              <Path key={idx} path={item.path}>
                <LinearGradient
                  start={item.start}
                  end={item.end}
                  colors={colors}
                />
              </Path>
            );
          })}
        </Group>
      </Canvas>
    </View>
  );
}
