import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, spacing, useTheme } from '@/theme';
import { Icon, type IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';

type Task = {
  href: string;
  title: string;
  subtitle: string;
  model: string;
  iconName: IconName;
  ready?: boolean;
};

type Section = {
  title: string;
  description: string;
  tasks: Task[];
};

const SECTIONS: Section[] = [
  {
    title: 'Computer Vision',
    description: 'High-speed bounding boxes, spatial models & camera processing',
    tasks: [
      {
        href: '/object-detection',
        title: 'Object Detection',
        subtitle: 'Locate and classify multiple objects in photos',
        model: 'SSDLite MobileNetV3 · COCO',
        iconName: 'scan',
        ready: true,
      },
    ],
  },
  {
    title: 'Natural Language',
    description: 'Generative chat, embedding vectors & tokenizers',
    tasks: [
      {
        href: '/llm-chat',
        title: 'LLM Chat & Generation',
        subtitle: 'Interactive on-device conversational assistant',
        model: 'Llama 3.2 1B · Qwen 2.5',
        iconName: 'chat',
        ready: false,
      },
      {
        href: '/text-embeddings',
        title: 'Text Embeddings',
        subtitle: 'Dense vector representations for semantic search',
        model: 'All-MiniLM-L6-v2',
        iconName: 'embeddings',
        ready: false,
      },
    ],
  },
  {
    title: 'Audio & Speech',
    description: 'High-fidelity voice synthesis & real-time transcription',
    tasks: [
      {
        href: '/speech-to-text',
        title: 'Speech to Text',
        subtitle: 'Multi-lingual automatic speech recognition',
        model: 'Whisper Tiny / Base',
        iconName: 'mic',
        ready: false,
      },
      {
        href: '/text-to-speech',
        title: 'Text to Speech',
        subtitle: 'Expressive neural voice synthesis',
        model: 'Kokoro 82M',
        iconName: 'audio',
        ready: false,
      },
    ],
  },
];

export default function Home() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingHorizontal: spacing.lg,
        paddingBottom: insets.bottom + spacing.xxl,
        gap: spacing.xl,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Block */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Logo size={36} />
          <View style={styles.brandText}>
            <Text style={[styles.title, { color: colors.text }]}>React Native ExecuTorch</Text>
            <Text style={[styles.subtitle, { color: colors.textDim }]}>
              On-device machine learning showcase
            </Text>
          </View>
        </View>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} style={{ gap: spacing.sm + 2 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
              {section.description}
            </Text>
          </View>

          <View style={{ gap: spacing.sm }}>
            {section.tasks.map((task) => (
              <TaskCard key={task.href} task={task} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

function TaskCard({ task }: { task: Task }) {
  const { colors } = useTheme();
  const router = useRouter();
  const isAvailable = task.ready !== false;

  return (
    <Pressable
      onPress={() => {
        if (isAvailable) {
          router.push(task.href as never);
        }
      }}
      disabled={!isAvailable}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: !isAvailable ? 0.55 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed && isAvailable ? 0.985 : 1 }],
        },
      ]}
    >
      <View
        style={[
          styles.iconTile,
          isAvailable
            ? { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder }
            : { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
        ]}
      >
        <Icon
          name={task.iconName}
          size={22}
          color={isAvailable ? colors.accent : colors.textSecondary}
          strokeWidth={2}
        />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardHeaderRow}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{task.title}</Text>
          {!isAvailable ? (
            <View
              style={[
                styles.soonBadge,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
              ]}
            >
              <Text style={[styles.soonText, { color: colors.textMuted }]}>Planned</Text>
            </View>
          ) : null}
        </View>

        <Text style={[styles.cardSubtitle, { color: colors.textDim }]}>{task.subtitle}</Text>

        <View
          style={[
            styles.modelTag,
            { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
          ]}
        >
          <Text style={[styles.modelText, { color: colors.textSecondary }]}>
            {task.model}
          </Text>
        </View>
      </View>

      {isAvailable ? (
        <Icon name="chevronRight" size={16} color={colors.textMuted} strokeWidth={2.5} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.sm },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandText: {
    flex: 1,
    gap: 2,
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, lineHeight: 18 },
  sectionHeader: { gap: 2, paddingHorizontal: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  sectionDesc: { fontSize: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardBody: { flex: 1, gap: 3 },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  iconTile: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, lineHeight: 16 },
  modelTag: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.xs,
    borderWidth: StyleSheet.hairlineWidth,
  },
  modelText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.1 },
  soonBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  soonText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
});


