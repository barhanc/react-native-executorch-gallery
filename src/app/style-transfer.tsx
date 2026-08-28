import { useState } from 'react';
import { AlphaType, ColorType, Skia, type SkImage } from '@shopify/react-native-skia';
import { models, useStyleTransfer } from 'react-native-executorch';

import { PhotoPicker, type PickedImage } from '@/components/PhotoPicker';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { StyleTransferOverlay } from '@/components/StyleTransferOverlay';
import { TaskScreen } from '@/components/TaskScreen';

function StyleTransferTask() {
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<PickedImage | null>(null);
  const [styledImage, setStyledImage] = useState<SkImage | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const styleTransfer = useStyleTransfer(models.styleTransfer.CANDY.DEFAULT);

  const run = async () => {
    if (!image || !styleTransfer.transferStyle) return;
    setBusy(true);
    setStyledImage(null);
    setLatency(null);
    setError(null);
    try {
      const t0 = Date.now();
      const output = await styleTransfer.transferStyle(image.buffer);
      setLatency(Date.now() - t0);

      const outData = Skia.Data.fromBytes(output.data);
      const info = {
        width: image.width,
        height: image.height,
        colorType: ColorType.RGBA_8888,
        alphaType: AlphaType.Premul,
      };
      const skiaStyled = Skia.Image.MakeImage(info, outData, image.width * 4);
      if (skiaStyled) {
        setStyledImage(skiaStyled);
        setShowOriginal(false);
      }
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
      canRun={!!image && styleTransfer.isReady}
      busy={busy}
      onRun={run}
      runLabel="Transfer Style"
      meta={latency != null ? `Inference ${latency} ms` : undefined}
    >
      <PhotoPicker
        busy={busy}
        onPick={(img) => {
          setImage(img);
          setStyledImage(null);
          setLatency(null);
          setError(null);
        }}
        renderOverlay={(transform) => (
          <StyleTransferOverlay
            styledImage={styledImage}
            showOriginal={showOriginal}
            onPressInOriginal={() => setShowOriginal(true)}
            onPressOutOriginal={() => setShowOriginal(false)}
            imageWidth={image?.width ?? 0}
            imageHeight={image?.height ?? 0}
            transform={transform}
          />
        )}
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
