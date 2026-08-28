import RNBlobUtil from 'react-native-blob-util';

/**
 * File-path fields common to downloaded model configs that can be deleted from
 * the persistent cache to free disk space.
 */
const VALID_PATH_KEYS = ['modelPath', 'tokenizerPath'] as const;

/**
 * Deletes the cached model files referenced by a downloaded resource config.
 *
 * Walks the config object for known local file-path fields and unlinks each one.
 * Safe to call repeatedly — missing files are ignored.
 *
 * @param resource The resolved resource config whose local paths should be removed.
 * @returns The number of files deleted.
 */
export async function deleteCachedFiles(resource: unknown): Promise<number> {
  if (!resource || typeof resource !== 'object') return 0;

  let deleted = 0;
  for (const key of VALID_PATH_KEYS) {
    const value = (resource as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.length > 0) {
      const existed = await RNBlobUtil.fs.exists(value);
      if (existed) {
        await RNBlobUtil.fs.unlink(value).catch(() => {});
        deleted += 1;
      }
    }
  }
  return deleted;
}
