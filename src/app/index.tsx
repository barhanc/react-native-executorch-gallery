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
  tint: string;
  ready?: boolean;
};

type Section = {
  title: string;
  tasks: Task[];
};

const SECTIONS: Section[] = [
  {
    title: 'Computer Vision',
    tasks: [
      {
        href: '/instance-segmentation',
        title: 'Instance Segmentation',
        subtitle: 'Detect and mask individual object instances',
        model: 'YOLO26 Nano',
        iconName: 'overlappingCircles',
        tint: '#8B5CF6',
        ready: true,
      },
      {
        href: '/keypoint-detection',
        title: 'Pose Estimation',
        subtitle: 'Estimate 17 human body skeletal keypoints',
        model: 'YOLO26 Pose',
        iconName: 'person',
        tint: '#059669',
        ready: true,
      },
      {
        href: '/ocr',
        title: 'OCR Text Recognition',
        subtitle: 'Detect and read multilingual text in photos',
        model: 'PaddleOCR PP-OCRv6',
        iconName: 'textDoc',
        tint: '#EA580C',
        ready: true,
      },
      {
        href: '/style-transfer',
        title: 'Style Transfer',
        subtitle: 'Transform photos into artistic paintings',
        model: 'Candy Style',
        iconName: 'palette',
        tint: '#D946EF',
        ready: true,
      },
      {
        href: '/object-detection',
        title: 'Object Detection',
        subtitle: 'Locate and classify multiple objects in photos',
        model: 'SSDLite MobileNetV3',
        iconName: 'scan',
        tint: '#2A47FF',
        ready: true,
      },
      {
        href: '/semantic-segmentation',
        title: 'Semantic Segmentation',
        subtitle: 'Segment objects by class with pixel-level masks',
        model: 'DeepLabV3 ResNet50',
        iconName: 'splitMask',
        tint: '#10B981',
        ready: true,
      },
      {
        href: '/image-classification',
        title: 'Image Classification',
        subtitle: 'Identify 1,000 object categories with confidence',
        model: 'EfficientNetV2-S',
        iconName: 'eye',
        tint: '#0284C7',
        ready: true,
      },
    ],
  },
  {
    title: 'Generative AI',
    tasks: [
      {
        href: '/text-to-image',
        title: 'Text to Image',
        subtitle: 'Generate synthetic imagery from natural language prompts',
        model: 'SDXS 512 DreamShaper',
        iconName: 'sparkle',
        tint: '#EC4899',
        ready: false,
      },
      {
        href: '/llm-chat',
        title: 'LLM Chat & Reasoning',
        subtitle: 'Interactive conversational assistant with on-device LLMs',
        model: 'Llama 3.2 1B',
        iconName: 'chat',
        tint: '#8B5CF6',
        ready: false,
      },
    ],
  },
  {
    title: 'Embeddings & Search',
    tasks: [
      {
        href: '/image-embeddings',
        title: 'Multimodal Search',
        subtitle: 'Rank text queries against images with CLIP',
        model: 'CLIP ViT-B/32',
        iconName: 'embeddings',
        tint: '#6366F1',
        ready: false,
      },
    ],
  },
  {
    title: 'Audio & Speech',
    tasks: [
      {
        href: '/speech-to-text',
        title: 'Speech to Text',
        subtitle: 'Multi-lingual automatic speech recognition',
        model: 'Whisper Tiny',
        iconName: 'mic',
        tint: '#F59E0B',
        ready: false,
      },
      {
        href: '/text-to-speech',
        title: 'Text to Speech',
        subtitle: 'Expressive neural voice synthesis',
        model: 'Kokoro 82M',
        iconName: 'audio',
        tint: '#E11D48',
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
          <Logo size={42} />
          <View style={styles.brandText}>
            <Text style={[styles.title, { color: colors.text }]}>React Native ExecuTorch</Text>
            <View style={styles.galleryBadgeRow}>
              <Text style={[styles.galleryWord, { color: colors.accent }]}>GALLERY</Text>
            </View>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textDim }]}>
          Explore on-device machine learning with React Native ExecuTorch. Every task runs entirely
          on your phone — no network, full privacy. Try each model live and see how fast on-device
          inference really is.
        </Text>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} style={{ gap: spacing.sm + 2 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
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
            ? { backgroundColor: task.tint + '14', borderColor: task.tint + '30' }
            : { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle },
        ]}
      >
        <Icon
          name={task.iconName}
          size={22}
          color={isAvailable ? task.tint : colors.textSecondary}
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
          <Text style={[styles.modelText, { color: colors.textSecondary }]}>{task.model}</Text>
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
    gap: 3,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 25,
  },
  galleryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  galleryWord: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.xs,
  },
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
