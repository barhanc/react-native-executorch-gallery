import React, { ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { radius, spacing, useTheme, modelTag } from '@/theme';
import { Icon } from '@/components/Icon';

/** Loading, download progress, and error state contract shared by task hooks. */
export interface TaskStatus {
  /** Whether the neural model and its C++ runtime instance are initialized and ready. */
  isReady: boolean;
  /** Download progress percentage from 0.0 to 1.0 when fetching remote weights. */
  downloadProgress?: number;
  /** Resolved local resource paths returned by ExecuTorch task hooks. */
  resource?: unknown;
  /** Error instance or message if model loading or runtime compilation failed. */
  error?: unknown;
}

export interface TaskScreenProps {
  /** Screen and navigation header title. */
  title: string;
  /** Model architecture and dataset metadata subtitle (e.g. "SSDLite MobileNetV3 · COCO"). */
  subtitle?: string;
  /** Task hook status (isReady, downloadProgress, error). */
  status: TaskStatus;
  /** Whether the user can currently run the model task. */
  canRun: boolean;
  /** Whether the model is actively processing on-device inference. */
  busy?: boolean;
  /** Action handler invoked when the user taps the primary task button. */
  onRun: () => void;
  /** Label for the primary action button. */
  runLabel?: string;
  /** Optional metadata chip text (e.g. latency metric). */
  meta?: string;
  /** Optional handler to delete/clear downloaded model weights from storage. */
  onDeleteModel?: () => Promise<void> | void;
  /** Task UI viewport content. */
  children: ReactNode;
}

/**
 * Universal layout wrapper for on-device ExecuTorch ML tasks.
 *
 * Enforces unified typography, model ready indicators, download progress,
 * and responsive action controls.
 *
 * @param props Task screen configuration and children viewports.
 * @returns Fully styled task view with header and bottom action bar.
 */
export function TaskScreen({
  title,
  subtitle,
  status,
  canRun,
  busy = false,
  onRun,
  runLabel = 'Run task',
  meta,
  onDeleteModel,
  children,
}: TaskScreenProps) {
  const { colors, scheme } = useTheme();
  const insets = useSafeAreaInsets();
  const tag = modelTag[scheme];

  const isExecutingRef = React.useRef(false);

  const handleRunPress = () => {
    if (!canRun || busy || isExecutingRef.current) return;
    isExecutingRef.current = true;
    try {
      onRun();
    } finally {
      setTimeout(() => {
        isExecutingRef.current = false;
      }, 300);
    }
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.bg,
          paddingTop: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xs,
          gap: spacing.sm + 2,
        },
      ]}
    >
      <Stack.Screen
        options={{
          title,
          headerBackTitle: 'Gallery',
          headerTintColor: colors.text,
          headerStyle: { backgroundColor: colors.bg },
          headerShadowVisible: false,
        }}
      />

      <View style={styles.headerBlock}>
        <View style={styles.headerRow}>
          {subtitle ? (
            <View style={[styles.badge, { backgroundColor: tag.bg, borderColor: tag.border }]}>
              <Text style={[styles.badgeText, { color: tag.fg }]}>{subtitle}</Text>
            </View>
          ) : null}

          {onDeleteModel && status.isReady ? (
            <Pressable
              onPress={() => {
                Alert.alert(
                  'Delete Model Weights',
                  'Delete downloaded model weights from device storage to free up disk space?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: onDeleteModel,
                    },
                  ]
                );
              }}
              style={({ pressed }) => [
                styles.deleteBadge,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  opacity: pressed ? 0.6 : 1,
                },
              ]}
            >
              <Icon name="trash" size={12} color={colors.danger} strokeWidth={2} />
              <Text style={[styles.deleteText, { color: colors.danger }]}>Delete model</Text>
            </Pressable>
          ) : null}
        </View>

        <StatusBanner status={status} meta={meta} />
      </View>

      <View style={styles.contentBody}>{children}</View>

      <View style={styles.footer}>
        <Pressable
          onPress={handleRunPress}
          disabled={!canRun || busy}
          style={({ pressed }) => [
            styles.runButton,
            canRun || busy
              ? {
                  backgroundColor: colors.accent,
                  borderColor: colors.accentBorder,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 4,
                  opacity: busy ? 0.95 : pressed ? 0.85 : 1,
                }
              : {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  opacity: 1,
                },
            {
              transform: [{ scale: pressed && canRun && !busy ? 0.98 : 1 }],
            },
          ]}
        >
          {busy ? (
            <View style={styles.buttonInner}>
              <ActivityIndicator color="#FFFFFF" size="small" style={styles.spinner} />
              <Text style={[styles.runLabel, { color: '#FFFFFF' }]}>Executing on-device…</Text>
            </View>
          ) : (
            <View style={styles.buttonInner}>
              {canRun ? (
                <View style={styles.buttonIconBadge}>
                  <Icon name="scan" size={16} color="#FFFFFF" strokeWidth={2} />
                </View>
              ) : null}
              <Text
                style={[
                  styles.runLabel,
                  {
                    color: canRun ? '#FFFFFF' : colors.textMuted,
                  },
                ]}
              >
                {runLabel}
              </Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function StatusBanner({ status, meta }: { status: TaskStatus; meta?: string }) {
  const { colors } = useTheme();
  const err = status.error ? String((status.error as Error)?.message ?? status.error) : null;
  const rawProgress = status.downloadProgress;
  const pct =
    rawProgress == null
      ? null
      : rawProgress <= 1 && rawProgress > 0
        ? Math.round(rawProgress * 100)
        : Math.round(rawProgress);

  const isDownloading = !status.isReady && pct != null && pct < 100;

  if (err) {
    return (
      <View
        style={[
          styles.errorCard,
          { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
        ]}
      >
        <View style={styles.errorHeader}>
          <View style={[styles.dot, { backgroundColor: colors.danger }]} />
          <Text style={[styles.errorTitle, { color: colors.danger }]}>Error</Text>
        </View>
        <Text style={[styles.errorText, { color: colors.danger }]}>{err}</Text>
      </View>
    );
  }

  if (status.isReady) {
    return (
      <View
        style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <View style={styles.statusLeft}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>Ready</Text>
        </View>

        {meta ? (
          <View style={styles.latencyRow}>
            <Icon name="bolt" size={12} color={colors.accent} strokeWidth={2.4} />
            <Text style={[styles.latencyText, { color: colors.text }]}>{meta}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  if (isDownloading && pct != null) {
    return (
      <View
        style={[
          styles.downloadCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.downloadHeader}>
          <View style={styles.statusLeft}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={[styles.statusText, { color: colors.text }]}>
              Downloading model assets…
            </Text>
          </View>
          <Text style={[styles.progressPct, { color: colors.accent }]}>{pct}%</Text>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: colors.surfaceSubtle }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.max(4, Math.min(100, pct))}%`,
                backgroundColor: colors.accent,
              },
            ]}
          />
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.statusLeft}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text numberOfLines={1} style={[styles.statusText, { color: colors.textSecondary }]}>
          Initializing ExecuTorch runtime…
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBlock: { gap: spacing.xs + 2 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: { fontSize: 12, fontWeight: '500', letterSpacing: 0.1 },
  deleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  deleteText: {
    fontSize: 11,
    fontWeight: '500',
  },
  errorCard: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  errorTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 3,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 38,
  },
  downloadCard: {
    gap: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 4,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  downloadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 13, fontWeight: '500' },
  latencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  latencyText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  contentBody: {
    flex: 1,
    minHeight: 0,
  },
  footer: {
    paddingTop: 2,
  },
  runButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs + 2,
    height: 48,
  },
  buttonIconBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 16,
    height: 16,
    transform: [{ scale: 0.85 }],
  },
  runLabel: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});
