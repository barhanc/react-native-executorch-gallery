import { useRef, useState } from 'react';
import { AlphaType, ColorType, Skia, type SkImage } from '@shopify/react-native-skia';
import { models, useSemanticSegmenter } from 'react-native-executorch';

import { PhotoPicker, type PickedImage } from '@/components/PhotoPicker';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { TaskScreen } from '@/components/TaskScreen';

function SemanticSegmentationTask() {
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [segmentationImage, setSegmentationImage] = useState<SkImage | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isProcessingRef = useRef(false);

  const segmenter = useSemanticSegmenter(
    models.semanticSegmentation.DEEPLAB_V3_MOBILENET_V3_LARGE.DEFAULT
  );

  const run = async () => {
    if (isProcessingRef.current || busy || !image || !segmenter.segment) return;
    isProcessingRef.current = true;
    setBusy(true);
    setLatency(null);
    setError(null);
    try {
      const t0 = Date.now();
      const { buffer: outBuffer } = await segmenter.segment(image.buffer);
      setLatency(Date.now() - t0);

      const outData = Skia.Data.fromBytes(outBuffer.data);
      const info = {
        width: image.width,
        height: image.height,
        colorType: ColorType.RGBA_8888,
        alphaType: AlphaType.Premul,
      };
      const nextImage = Skia.Image.MakeImage(info, outData, image.width * 4);
      if (!nextImage) {
        throw new Error('Failed to create overlay image from output data');
      }
      setSegmentationImage(nextImage);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      isProcessingRef.current = false;
      setBusy(false);
    }
  };

  return (
    <TaskScreen
      title="Semantic Segmentation"
      subtitle="DeepLabV3 MobileNetV3"
      status={{ ...segmenter, error: error || segmenter.error }}
      canRun={!!image && segmenter.isReady && !busy}
      busy={busy}
      onRun={run}
      runLabel="Segment Image"
      meta={latency != null ? `Inference ${latency} ms` : undefined}
    >
      <PhotoPicker
        busy={busy}
        overlayImage={segmentationImage}
        overlayOpacity={0.65}
        onPick={(img) => {
          setImage(img);
          setSegmentationImage(null);
          setLatency(null);
          setError(null);
        }}
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
