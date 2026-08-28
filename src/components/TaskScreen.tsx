import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { radius, spacing, useTheme } from '@/theme';
import { Icon } from '@/components/Icon';

/** Loading/progress/error state shared by every task hook. */
export type TaskStatus = {
  isReady: boolean;
  downloadProgress?: number;
  error?: unknown;
};

/**
  * Screen scaffold for a single ML task: navigation title, model status,
  * scrollable body, and a sticky run button. Screens supply only the task
  * content and the run handler — no layout of their own.
  */
export function TaskScreen({
  title,
  subtitle,
  status,
  onRun,
  runLabel = 'Run Inference',
  canRun,
  busy,
  meta,
  children,
}: {
  title: string;
  subtitle?: string;
  status: TaskStatus;
  onRun: () => void;
  runLabel?: string;
  canRun: boolean;
  busy?: boolean;
  meta?: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
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
          headerBackTitle: 'Tasks',
          headerTitleStyle: { fontWeight: '700', fontSize: 17 },
        }}
      />

      <View style={styles.headerBlock}>
        {subtitle ? (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          </View>
        ) : null}

        <StatusBanner status={status} meta={meta} />
      </View>

      <View style={styles.contentBody}>{children}</View>

      <View style={styles.footer}>
        <Pressable
          onPress={onRun}
          disabled={!canRun || busy}
          style={({ pressed }) => [
            styles.runButton,
            canRun && !busy
              ? {
                  backgroundColor: colors.accent,
                  borderColor: colors.accentBorder,
                  borderWidth: 1,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                  elevation: 6,
                }
              : {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                  borderWidth: StyleSheet.hairlineWidth,
                },
            {
              opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed && canRun && !busy ? 0.975 : 1 }],
            },
          ]}
        >
          {busy ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.runLabel, { color: '#FFFFFF' }]}>
                RUNNING ON EXECUTORCH…
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              {canRun ? (
                <View style={styles.buttonIconBadge}>
                  <Icon name="scan" size={20} color="#FFFFFF" strokeWidth={2.4} />
                </View>
              ) : null}
              <Text
                style={[
                  styles.runLabel,
                  {
                    color: canRun ? '#FFFFFF' : colors.textMuted,
                    fontWeight: '800',
                    letterSpacing: 0.8,
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

function StatusBanner({
  status,
  meta,
}: {
  status: TaskStatus;
  meta?: string;
}) {
  const { colors } = useTheme();
  const err = status.error ? String((status.error as Error)?.message ?? status.error) : null;
  const progress = status.downloadProgress ?? 0;
  const downloading = !status.isReady && status.downloadProgress != null && progress < 1;

  if (err) {
    return (
      <View
        style={[
          styles.statusCard,
          { backgroundColor: colors.dangerSoft, borderColor: colors.danger },
        ]}
      >
        <View style={[styles.dot, { backgroundColor: colors.danger }]} />
        <Text numberOfLines={2} style={[styles.statusText, { color: colors.danger }]}>
          {err}
        </Text>
      </View>
    );
  }

  if (status.isReady) {
    return (
      <View
        style={[
          styles.statusCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.statusLeft}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={[styles.statusText, { color: colors.textSecondary }]}>
            Ready
          </Text>
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

  return (
    <View
      style={[
        styles.statusCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <ActivityIndicator size="small" color={colors.accent} />
      <Text numberOfLines={1} style={[styles.statusText, { color: colors.textSecondary }]}>
        {downloading
          ? `Downloading model assets (${Math.round(progress * 100)}%)…`
          : 'Initializing ExecuTorch runtime…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBlock: { gap: spacing.xs + 2 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  badgeText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
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
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '600' },
  latencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  latencyText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.1 },
  contentBody: {
    flex: 1,
    minHeight: 0,
  },
  footer: {
    paddingTop: spacing.xs,
  },
  runButton: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  buttonIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runLabel: { fontSize: 15, fontWeight: '800', letterSpacing: 0.8 },
});

