import { useState } from 'react';
import {
  models,
  useSemanticSegmenter,
  type SemanticSegmentationResult,
} from 'react-native-executorch';

import { PhotoPicker, type PickedImage } from '@/components/PhotoPicker';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { SegmentationOverlay } from '@/components/SegmentationOverlay';
import { TaskScreen } from '@/components/TaskScreen';

function SemanticSegmentationTask() {
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [result, setResult] = useState<SemanticSegmentationResult<string> | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const segmenter = useSemanticSegmenter(
    models.semanticSegmentation.DEEPLAB_V3_MOBILENET_V3_LARGE.DEFAULT
  );

  const run = async () => {
    if (!image || !segmenter.segment) return;
    setBusy(true);
    setResult(null);
    setLatency(null);
    setError(null);
    try {
      const t0 = Date.now();
      const output = await segmenter.segment(image.buffer);
      setLatency(Date.now() - t0);
      setResult(output);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaskScreen
      title="Semantic Segmentation"
      subtitle="DeepLabV3 MobileNetV3"
      status={{ ...segmenter, error: error || segmenter.error }}
      canRun={!!image && segmenter.isReady}
      busy={busy}
      onRun={run}
      runLabel="Segment Image"
      meta={latency != null ? `Inference ${latency} ms` : undefined}
    >
      <PhotoPicker
        busy={busy}
        onPick={(img) => {
          setImage(img);
          setResult(null);
          setLatency(null);
          setError(null);
        }}
        renderOverlay={(transform) => (
          <SegmentationOverlay
            result={result}
            imageWidth={image?.width ?? 0}
            imageHeight={image?.height ?? 0}
            transform={transform}
          />
        )}
      />
    </TaskScreen>
  );
}

export default function SemanticSegmentationScreen() {
  return (
    <ScreenWrapper>
      <SemanticSegmentationTask />
    </ScreenWrapper>
  );
}
