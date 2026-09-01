import { Platform } from 'react-native';
import * as Device from 'expo-device';

/**
 * Returns true if running on a physical Apple device (iPhone/iPad) supporting CoreML/ANE.
 * Simulators run on CPU/XNNPACK.
 */
export const isPhysicalDeviceIOS = Platform.OS === 'ios' && Device.isDevice;

export const isAndroid = Platform.OS === 'android';

/**
 * Select the optimal backend model target:
 * - Physical iOS device: `coreml` (if available) -> `xnnpack`
 * - Android: `vulkan` (if provided) -> `xnnpack`
 * - Fallback: `xnnpack`
 */
export function selectBackendModel<T>(backends: { coreml?: T; vulkan?: T; xnnpack: T }): T {
  if (isPhysicalDeviceIOS && backends.coreml) {
    return backends.coreml;
  }
  if (isAndroid && backends.vulkan) {
    return backends.vulkan;
  }
  return backends.xnnpack;
}
