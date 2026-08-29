import { useState } from 'react';
import { Keyboard } from 'react-native';
import { KOKORO_SAMPLE_RATE, models, useTextToSpeech } from 'react-native-executorch';

import { AudioWaveformVisualizer } from '@/components/AudioWaveformVisualizer';
import { PromptInput } from '@/components/PromptInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { TaskScreen } from '@/components/TaskScreen';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { deleteCachedFiles } from '@/lib/deleteCachedFiles';

const SUGGESTIONS = [
  'ExecuTorch brings PyTorch models straight to your mobile device with exceptional on-device performance. It enables low-latency machine learning inference without ever sending sensitive data to the cloud.',
  'Kokoro is an efficient on-device text-to-speech model. It converts input text into phonemes, predicts token durations, and synthesizes natural, expressive speech in real-time.',
  'The weather today is warm and sunny with a gentle breeze from the west. It is a wonderful day to go outside, explore nature, and enjoy the clear blue skies.',
];

function TextToSpeechTask() {
  const [loaded, setLoaded] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [ttfa, setTtfa] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tts = useTextToSpeech(models.textToSpeech.KOKORO.EN_US.DEFAULT, {
    preventLoad: !loaded,
  });
  const player = useAudioPlayer(KOKORO_SAMPLE_RATE);

  const handleStop = () => {
    tts.synthesizeStop?.();
    player.stop();
    setBusy(false);
  };

  const run = async () => {
    if (busy || player.isPlaying || !prompt.trim() || !tts.synthesize) return;
    Keyboard.dismiss();
    setBusy(true);
    setTtfa(null);
    setError(null);
    try {
      const t0 = Date.now();
      const chunks = tts.synthesize(prompt, { voice: 'af_heart' });
      await player.playStream(chunks, () => {
        setTtfa(Date.now() - t0);
      });
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  const isExecuting = busy || player.isPlaying;

  return (
    <TaskScreen
      title="Text to Speech"
      subtitle="Kokoro 82M · EN_US"
      status={{ ...tts, error: error || (tts.error ? tts.error.message : null) }}
      onLoadModel={!loaded ? () => setLoaded(true) : undefined}
      busy={isExecuting}
      onRun={() => undefined}
      canRun={false}
      onDeleteModel={async () => {
        handleStop();
        await deleteCachedFiles(tts.resource);
        setLoaded(false);
      }}
      meta={ttfa != null ? `TTFA ${ttfa} ms` : undefined}
      footer={
        <PromptInput
          value={prompt}
          onChangeText={setPrompt}
          onSubmit={run}
          disabled={busy && !player.isPlaying}
          isExecuting={busy && !player.isPlaying}
          isPlaying={player.isPlaying}
          onStop={handleStop}
          canSubmit={!!prompt.trim() && tts.isReady && !isExecuting}
          suggestions={SUGGESTIONS}
          placeholder="Enter text to synthesize into speech…"
        />
      }
    >
      <AudioWaveformVisualizer active={player.isPlaying} />
    </TaskScreen>
  );
}

export default function TextToSpeechScreen() {
  return (
    <ScreenWrapper>
      <TextToSpeechTask />
    </ScreenWrapper>
  );
}
