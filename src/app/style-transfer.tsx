import { useState } from 'react';
import { models, useStyleTransfer } from 'react-native-executorch';

import { PhotoPicker, type PickedImage } from '@/components/PhotoPicker';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { StyleTransferOverlay } from '@/components/StyleTransferOverlay';
import { TaskScreen } from '@/components/TaskScreen';
import { bufferToSkImage } from '@/lib/image';
import { useDisposableImage } from '@/hooks/useDisposableImage';
import { deleteCachedFiles } from '@/lib/deleteCachedFiles';

function StyleTransferTask() {
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [styledImage, setStyledImage] = useDisposableImage();
  const [showOriginal, setShowOriginal] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styleTransfer = useStyleTransfer(models.styleTransfer.CANDY.DEFAULT);

  const run = async () => {
    if (busy || !image || !styleTransfer.transferStyle) return;
    setBusy(true);
    setStyledImage(null);
    setLatency(null);
    setError(null);
    try {
      const t0 = Date.now();
      const output = await styleTransfer.transferStyle(image.buffer);
      setLatency(Date.now() - t0);

      const skiaStyled = bufferToSkImage(output);
      if (!skiaStyled) throw new Error('Failed to create styled image from output data');
      setStyledImage(skiaStyled);
      setShowOriginal(false);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaskScreen
      title="Style Transfer"
      subtitle="Candy Style"
      status={{ ...styleTransfer, error: error || styleTransfer.error }}
      canRun={!!image && styleTransfer.isReady && !busy}
      busy={busy}
      onRun={run}
      runLabel="Transfer Style"
      meta={latency != null ? `Inference ${latency} ms` : undefined}
      onDeleteModel={async () => {
        await deleteCachedFiles(styleTransfer.resource);
      }}
    >
      <PhotoPicker
        busy={busy}
        overlayImage={showOriginal ? null : styledImage}
        overlayOpacity={1}
        onPick={(img) => {
          setImage(img);
          setStyledImage(null);
          setLatency(null);
          setError(null);
        }}
        renderOverlay={() =>
          styledImage ? (
            <StyleTransferOverlay
              showOriginal={showOriginal}
              onPressInOriginal={() => setShowOriginal(true)}
              onPressOutOriginal={() => setShowOriginal(false)}
            />
          ) : null
        }
      />
    </TaskScreen>
  );
}

export default function StyleTransferScreen() {
  return (
    <ScreenWrapper>
      <StyleTransferTask />
    </ScreenWrapper>
  );
}
