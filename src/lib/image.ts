import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { SkImage } from '@shopify/react-native-skia';
import type { ImageBuffer } from 'react-native-executorch/cv';

/**
 * Decode a Skia image into the raw RGBA/HWC {@link ImageBuffer} that
 * react-native-executorch vision tasks consume.
 */
export function skImageToBuffer(image: SkImage): ImageBuffer {
  const pixels = image.readPixels();
  if (!(pixels instanceof Uint8Array)) {
    throw new Error('Could not read pixels from the selected image.');
  }
  return {
    data: pixels,
    width: image.width(),
    height: image.height(),
    format: 'rgba',
    layout: 'hwc',
  };
}

/**
 * Pick an image from the library or camera.
 * If `targetWidth` is provided, downscales the image; otherwise preserves full original resolution.
 */
export async function pickImage(
  source: 'camera' | 'library',
  targetWidth?: number
): Promise<string | undefined> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert('Permission required', `Please allow ${source} access to continue.`);
    return;
  }

  const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return;

  if (targetWidth != null) {
    const rendered = await ImageManipulator.manipulate(result.assets[0].uri)
      .resize({ width: targetWidth })
      .renderAsync();
    const saved = await rendered.saveAsync({ format: SaveFormat.PNG });
    return saved.uri;
  }

  return result.assets[0].uri;
}
