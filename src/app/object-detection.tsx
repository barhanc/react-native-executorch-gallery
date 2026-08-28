import { useState } from "react";
import {
  models,
  useObjectDetector,
  type ObjectDetection,
} from "react-native-executorch";

import { DetectionOverlay } from "@/components/DetectionOverlay";
import { PhotoPicker, type PickedImage } from "@/components/PhotoPicker";
import { ScreenWrapper } from "@/components/ScreenWrapper";
import { TaskScreen } from "@/components/TaskScreen";

function ObjectDetectionTask() {
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [results, setResults] = useState<ObjectDetection<"xyxy", string>[]>([]);
  const [latency, setLatency] = useState<number | null>(null);

  const detector = useObjectDetector(
    models.objectDetection.SSDLITE320_MOBILENET_V3_LARGE.DEFAULT
  );

  const run = async () => {
    if (!image || !detector.detectObjects) return;
    setBusy(true);
    try {
      const t0 = Date.now();
      const output = await detector.detectObjects(image.buffer);
      setLatency(Date.now() - t0);
      setResults(output);
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaskScreen
      title="Object Detection"
      subtitle="SSDLite MobileNetV3 · COCO"
      status={detector}
      canRun={!!image && detector.isReady}
      busy={busy}
      onRun={run}
      runLabel="Detect objects"
      meta={latency != null ? `Inference ${latency} ms` : undefined}
    >
      <PhotoPicker
        onPick={(img) => {
          setImage(img);
          setResults([]);
          setLatency(null);
        }}
        renderOverlay={(transform) => (
          <DetectionOverlay detections={results} transform={transform} />
        )}
      />
    </TaskScreen>
  );
}

export default function ObjectDetectionScreen() {
  return (
    <ScreenWrapper>
      <ObjectDetectionTask />
    </ScreenWrapper>
  );
}
