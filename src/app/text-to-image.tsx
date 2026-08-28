import { useState } from 'react';
import { models, useTextToImage } from 'react-native-executorch';

import { GeneratedImageViewport } from '@/components/GeneratedImageViewport';
import { PromptInput } from '@/components/PromptInput';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { TaskScreen } from '@/components/TaskScreen';
import { bufferToSkImage } from '@/lib/image';
import { useDisposableImage } from '@/lib/useDisposableImage';
import { deleteCachedFiles } from '@/lib/deleteCachedFiles';

const SUGGESTIONS = [
  'A serene mountain lake at sunrise, hyperrealistic, 8k',
  'A cozy library with warm candlelight, digital painting',
  'A golden retriever puppy in a field of flowers, studio photo',
];

function TextToImageTask() {
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useDisposableImage();
  const [latency, setLatency] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textToImage = useTextToImage(models.textToImage.SDXS_512_DREAMSHAPER.DEFAULT);

  const run = async () => {
    if (busy || !prompt.trim() || !textToImage.generate) return;
    setBusy(true);
    setImage(null);
    setLatency(null);
    setError(null);
    try {
      const t0 = Date.now();
      const output = await textToImage.generate(prompt);
      setLatency(Date.now() - t0);
      const skiaImage = bufferToSkImage(output);
      if (!skiaImage) throw new Error('Failed to create image from generated output');
      setImage(skiaImage);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaskScreen
      title="Text to Image"
      subtitle="SDXS 512 DreamShaper"
      status={{ ...textToImage, error: error || textToImage.error }}
      busy={busy}
      onRun={() => undefined}
      canRun={false}
      onDeleteModel={async () => {
        await deleteCachedFiles(textToImage.resource);
      }}
      meta={latency != null ? `Inference ${latency} ms` : undefined}
      footer={
        <PromptInput
          value={prompt}
          onChangeText={setPrompt}
          onSubmit={run}
          disabled={busy}
          canSubmit={!!prompt.trim() && textToImage.isReady && !busy}
          suggestions={SUGGESTIONS}
          placeholder="Describe the image you want to generate…"
        />
      }
    >
      <GeneratedImageViewport image={image} />
    </TaskScreen>
  );
}

export default function TextToImageScreen() {
  return (
    <ScreenWrapper>
      <TextToImageTask />
    </ScreenWrapper>
  );
}
