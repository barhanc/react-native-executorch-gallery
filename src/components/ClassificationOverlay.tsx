import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Classification } from 'react-native-executorch';
import { radius, spacing } from '@/theme';

export interface ClassificationOverlayProps {
  /** Top classification prediction entries returned by the model. */
  results: Classification<string>[];
}

/**
 * Minimalist, elegant classification results card floating over the photo viewport.
 *
 * Displays top predicted classes with proportional confidence bars and clean typography.
 *
 * @param props Component properties containing model classification results.
 * @returns Refined floating prediction card or null if empty.
 */
export function ClassificationOverlay({ results }: ClassificationOverlayProps) {
  if (results.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Predictions</Text>
        </View>

        <View style={styles.list}>
          {results.map((res, i) => {
            const pct = Math.round(res.confidence * 100);
            const isTop = i === 0;

            return (
              <View key={res.label} style={styles.row}>
                {/* Confidence bar track */}
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${Math.max(pct, 4)}%`,
                      backgroundColor: isTop
                        ? 'rgba(42, 71, 255, 0.25)'
                        : 'rgba(255, 255, 255, 0.06)',
                    },
                  ]}
                />

                <View style={styles.rowContent}>
                  <Text style={[styles.rankText, isTop && styles.rankTextTop]}>0{i + 1}</Text>
                  <Text style={[styles.labelText, isTop && styles.labelTextTop]} numberOfLines={1}>
                    {res.label}
                  </Text>
                  <Text style={[styles.pctText, isTop && styles.pctTextTop]}>{pct}%</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
  },
  card: {
    backgroundColor: 'rgba(10, 16, 32, 0.76)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    paddingBottom: 2,
  },
  headerTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  list: {
    gap: 4,
  },
  row: {
    position: 'relative',
    height: 32,
    borderRadius: radius.xs,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: radius.xs,
  },
  rowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  rankText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 16,
  },
  rankTextTop: {
    color: '#93C5FD',
  },
  labelText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  labelTextTop: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  pctText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  pctTextTop: {
    color: '#93C5FD',
    fontWeight: '700',
  },
});
