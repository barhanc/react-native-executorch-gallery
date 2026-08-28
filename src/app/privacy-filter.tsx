import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { models, usePrivacyFilter, nlp } from 'react-native-executorch';

import { PromptInput } from '@/components/PromptInput';
import { PrivacyFilterResults } from '@/components/PrivacyFilterResults';
import { EmptyState } from '@/components/EmptyState';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { TaskScreen } from '@/components/TaskScreen';
import { deleteCachedFiles } from '@/lib/deleteCachedFiles';
import { spacing } from '@/theme';

function PrivacyFilterTask() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [entities, setEntities] = useState<nlp.PiiEntity[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const privacyFilter = usePrivacyFilter(models.privacyFilter.OPENAI.DEFAULT);

  const run = async () => {
    if (busy || !input.trim() || !privacyFilter.detectPii) return;
    setBusy(true);
    setEntities([]);
    setLatency(null);
    setError(null);
    try {
      const t0 = Date.now();
      const found = await privacyFilter.detectPii(input);
      setLatency(Date.now() - t0);
      setSubmitted(input);
      setEntities(found);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaskScreen
      title="Privacy Filter"
      subtitle="OpenAI PII Detector"
      status={{ ...privacyFilter, error: error || privacyFilter.error }}
      busy={busy}
      onRun={() => undefined}
      canRun={false}
      onDeleteModel={async () => {
        await deleteCachedFiles(privacyFilter.resource);
      }}
      meta={latency != null ? `Inference ${latency} ms` : undefined}
      footer={
        <PromptInput
          value={input}
          onChangeText={setInput}
          onSubmit={run}
          disabled={busy}
          canSubmit={!!input.trim() && privacyFilter.isReady && !busy}
          suggestions={SUGGESTIONS}
          placeholder="Paste text to scan for emails, phone numbers, names…"
        />
      }
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {entities.length === 0 ? (
          <EmptyState
            title="No PII detected yet"
            message="Paste a text or pick a suggestion, then press send to scan for personally identifiable information."
          />
        ) : (
          <PrivacyFilterResults text={submitted} entities={entities} />
        )}
      </ScrollView>
    </TaskScreen>
  );
}

const SUGGESTIONS = [
  'My name is Sarah Chen and I work as a senior engineer at Acme Corp. ' +
    'You can reach me at sarah.chen@acmecorp.io or call my direct line at (415) 923-0847. ' +
    'For billing inquiries, my account number is ACC-8821-4490-3371.',
  'Contact me at john.doe@example.com or +1 (555) 123-4567.',
  'My card number is 4111 1111 1111 1111 and SSN 123-45-6789.',
];

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  body: { gap: spacing.md, paddingBottom: spacing.md },
});

export default function PrivacyFilterScreen() {
  return (
    <ScreenWrapper>
      <PrivacyFilterTask />
    </ScreenWrapper>
  );
}
