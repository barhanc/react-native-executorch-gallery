import { useState } from 'react';
import { models, useKeypointDetector, type KeypointDetection } from 'react-native-executorch';

import { KeypointOverlay } from '@/components/KeypointOverlay';
import { PhotoPicker, type PickedImage } from '@/components/PhotoPicker';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { TaskScreen } from '@/components/TaskScreen';
import { deleteCachedFiles } from '@/lib/deleteCachedFiles';

function KeypointDetectionTask() {
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [results, setResults] = useState<KeypointDetection<'xyxy', string>[]>([]);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detector = useKeypointDetector(models.keypointDetection.YOLO26_POSE.DEFAULT);

  const run = async () => {
    if (!image || !detector.detectKeypoints) return;
    setBusy(true);
    setResults([]);
    setLatency(null);
    setError(null);
    try {
      const t0 = Date.now();
      const output = await detector.detectKeypoints(image.buffer);
      setLatency(Date.now() - t0);
      setResults(output);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaskScreen
      title="Pose Estimation"
      subtitle="YOLO26 Pose"
      status={{ ...detector, error: error || detector.error }}
      canRun={!!image && detector.isReady}
      busy={busy}
      onRun={run}
      runLabel="Estimate Pose"
      onDeleteModel={async () => {
        await deleteCachedFiles(detector.resource);
      }}
      meta={latency != null ? `Inference ${latency} ms` : undefined}
    >
      <PhotoPicker
        busy={busy}
        onPick={(img) => {
          setImage(img);
          setResults([]);
          setLatency(null);
          setError(null);
        }}
        renderOverlay={(transform) => (
          <KeypointOverlay detections={results} transform={transform} />
        )}
      />
    </TaskScreen>
  );
}

export default function KeypointDetectionScreen() {
  return (
    <ScreenWrapper>
      <KeypointDetectionTask />
    </ScreenWrapper>
  );
}
