import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { borderWidth, radius, spacing, overlay } from '@/theme';

export interface CandidateQueryItem {
  id: string;
  text: string;
  score: number | null;
}

const ROW_HEIGHT = 32;
const ROW_GAP = 4;
const ROW_PITCH = ROW_HEIGHT + ROW_GAP; // 36px per row

function CandidateQueryRow({
  item,
  targetIndex,
  maxScore,
}: {
  item: CandidateQueryItem;
  targetIndex: number;
  maxScore: number;
}) {
  const widthAnim = useSharedValue(0);
  const topAnim = useSharedValue(targetIndex * ROW_PITCH);

  const pct =
    item.score != null && maxScore > 0
      ? Math.max(Math.min((item.score / maxScore) * 100, 100), 4)
      : 0;

  useEffect(() => {
    widthAnim.value = withTiming(pct, { duration: 450 });
  }, [pct, widthAnim]);

  useEffect(() => {
    topAnim.value = withSpring(targetIndex * ROW_PITCH, {
      damping: 20,
      stiffness: 160,
      mass: 0.8,
    });
  }, [targetIndex, topAnim]);

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: topAnim.value }],
  }));

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${widthAnim.value}%`,
  }));

  const isTop = targetIndex === 0 && item.score != null;

  return (
    <Animated.View style={[styles.row, rowAnimatedStyle]}>
      {/* Background score track */}
      <Animated.View
        style={[
          styles.barFill,
          {
            backgroundColor: isTop ? overlay.tintSoft : 'rgba(255, 255, 255, 0.06)',
          },
          barAnimatedStyle,
        ]}
      />

      <View style={styles.rowContent}>
        <Text style={[styles.rankText, isTop && styles.rankTextTop]}>0{targetIndex + 1}</Text>

        <Text style={[styles.labelText, isTop && styles.labelTextTop]} numberOfLines={1}>
          {item.text}
        </Text>

        {item.score != null ? (
          <Text style={[styles.scoreText, isTop && styles.scoreTextTop]}>
            {item.score.toFixed(3)}
          </Text>
        ) : (
          <Text style={styles.pendingText}>—</Text>
        )}
      </View>
    </Animated.View>
  );
}

export interface MultimodalRankOverlayProps {
  /** Candidate queries with optional similarity scores. */
  items: CandidateQueryItem[];
}

/**
 * Floating glassmorphic overlay for Multimodal Search (CLIP zero-shot ranking).
 *
 * All candidate query rows are constrained strictly inside the card viewport and translate
 * smoothly along the Y-axis using target index coordinates without expanding or jumping.
 *
 * @param props Candidate query items.
 * @returns Self-contained, bounded floating rank card.
 */
export function MultimodalRankOverlay({ items }: MultimodalRankOverlayProps) {
  const maxScore = Math.max(...items.map((i) => i.score ?? 0), 0.01);

  // Compute total fixed list height so the card is perfectly sized
  const listHeight = items.length * ROW_PITCH - ROW_GAP;

  // Sorted items determine each item's target index in the visual hierarchy
  const sortedItems = [...items].sort((a, b) => {
    if (a.score != null && b.score != null) return b.score - a.score;
    if (a.score != null) return -1;
    if (b.score != null) return 1;
    return 0;
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Semantic Match Ranking</Text>
        </View>

        <View style={[styles.list, { height: listHeight }]}>
          {items.map((item) => {
            const targetIndex = sortedItems.findIndex((s) => s.id === item.id);
            return (
              <CandidateQueryRow
                key={item.id}
                item={item}
                targetIndex={targetIndex}
                maxScore={maxScore}
              />
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
    backgroundColor: overlay.bg,
    borderRadius: radius.md,
    borderWidth,
    borderColor: overlay.border,
    padding: spacing.md,
    gap: spacing.sm,
    overflow: 'hidden',
  },
  headerRow: {
    paddingBottom: 2,
  },
  headerTitle: {
    color: overlay.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  list: {
    position: 'relative',
    width: '100%',
  },
  row: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ROW_HEIGHT,
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
    color: overlay.tint,
  },
  labelText: {
    flex: 1,
    color: overlay.textSecondary,
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  labelTextTop: {
    color: overlay.textPrimary,
    fontWeight: '500',
  },
  scoreText: {
    color: overlay.textMuted,
    fontSize: 12,
    fontWeight: '500',
    fontVariant: ['tabular-nums'],
  },
  scoreTextTop: {
    color: overlay.tint,
    fontWeight: '600',
  },
  pendingText: {
    color: '#64748B',
    fontSize: 12,
  },
});
