import { useState, useEffect } from 'react';
import { Image, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Crypto from 'expo-crypto';

interface CacheOptions {
  /**
   * Cache expiration time in milliseconds
   * Default: 7 days (604800000 ms)
   */
  expirationTime?: number;

  /**
   * Whether to immediately start caching on hook mount
   * Default: true
   */
  immediateCache?: boolean;

  /**
   * Whether to prefetch images in sequence (true) or in parallel (false)
   * Default: false (parallel prefetching is faster but may cause more simultaneous network requests)
   */
  sequentialPrefetch?: boolean;

  /**
   * Maximum number of concurrent requests when prefetching in parallel
   * Default: 3
   */
  concurrentRequests?: number;
}

interface CacheStatus {
  /**
   * Overall loading state
   */
  isLoading: boolean;

  /**
   * Individual loading states for each image
   */
  loadingStatus: Record<string, boolean>;

  /**
   * Error messages if any occurred during caching
   */
  errors: Record<string, string | null>;

  /**
   * Percentage of images successfully cached (0-100)
   */
  progress: number;

  /**
   * Local paths to cached images
   */
  cachedPaths: Record<string, string>;
}

const DEFAULT_OPTIONS: CacheOptions = {
  expirationTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  immediateCache: true,
  sequentialPrefetch: false,
  concurrentRequests: 3,
};

/**
 * Hook for efficient caching of remote images
 * @param imageUris Array of image URIs to cache
 * @param options Caching options
 * @returns Cache status and control functions
 */
export function useCacheAssets(
  imageUris: string[],
  options: CacheOptions = DEFAULT_OPTIONS
): CacheStatus & { prefetchAll: () => Promise<void>; clearCache: () => Promise<void> } {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [progress, setProgress] = useState<number>(0);
  const [cachedPaths, setCachedPaths] = useState<Record<string, string>>({});

  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  // Get cached path for an image
  const getCachedPath = async (uri: string): Promise<string> => {
    // Web platform doesn't support local file caching the same way
    if (Platform.OS === 'web') {
      return uri;
    }

    // Generate a unique filename based on the URI
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      uri
    );
    const fileName = `${hash}.${uri.split('.').pop()}`;
    return `${FileSystem.cacheDirectory}image_cache/${fileName}`;
  };

  // Check if an image is cached and not expired
  const isCached = async (uri: string, path: string): Promise<boolean> => {
    if (Platform.OS === 'web') return false;

    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (!fileInfo.exists) return false;

      // Check expiration if the file exists
      if (mergedOptions.expirationTime && fileInfo.exists) {
        const now = Date.now();
        const modTime = (fileInfo as any).modificationTime as number | undefined;
        if (modTime) {
          return (now - modTime * 1000) < mergedOptions.expirationTime;
        }
      }
      
      return true;
    } catch (error) {
      console.warn('Error checking cache', error);
      return false;
    }
  };

  // Cache a single image
  const cacheImage = async (uri: string): Promise<string> => {
    try {
      setLoadingStatus(prev => ({ ...prev, [uri]: true }));
      setErrors(prev => ({ ...prev, [uri]: null }));

      // For web, we don't need to cache locally
      if (Platform.OS === 'web') {
        // Use browser Image constructor for web caching
        await new Promise<void>((resolve, reject) => {
          const img = new (globalThis as any).Image();
          img.onload = () => resolve();
          img.onerror = () => {
            reject(new Error(`Failed to load image: ${uri}`));
          };
          img.src = uri;
        });
        
        setLoadingStatus(prev => ({ ...prev, [uri]: false }));
        setCachedPaths(prev => ({ ...prev, [uri]: uri }));
        return uri;
      }

      // For native platforms
      const path = await getCachedPath(uri);
      const isCachedAndValid = await isCached(uri, path);

      if (isCachedAndValid) {
        setLoadingStatus(prev => ({ ...prev, [uri]: false }));
        setCachedPaths(prev => ({ ...prev, [uri]: path }));
        return path;
      }

      // Ensure directory exists
      const dirPath = path.substring(0, path.lastIndexOf('/'));
      const dirInfo = await FileSystem.getInfoAsync(dirPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dirPath, { intermediates: true });
      }

      // Download the file
      await FileSystem.downloadAsync(uri, path);
      
      // Update state
      setLoadingStatus(prev => ({ ...prev, [uri]: false }));
      setCachedPaths(prev => ({ ...prev, [uri]: path }));

      return path;
    } catch (error) {
      console.error('Image caching error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setLoadingStatus(prev => ({ ...prev, [uri]: false }));
      setErrors(prev => ({ ...prev, [uri]: errorMessage }));
      
      // Return original URI as fallback
      return uri;
    }
  };

  // Prefetch all images
  const prefetchAll = async (): Promise<void> => {
    if (imageUris.length === 0) return;
    
    setIsLoading(true);
    let completedCount = 0;

    try {
      if (mergedOptions.sequentialPrefetch) {
        // Sequential prefetching (one at a time)
        for (const uri of imageUris) {
          await cacheImage(uri);
          completedCount++;
          setProgress(Math.floor((completedCount / imageUris.length) * 100));
        }
      } else {
        // Parallel prefetching with concurrency limit
        const concurrency = mergedOptions.concurrentRequests ?? 3;
        const chunks = [];
        for (let i = 0; i < imageUris.length; i += concurrency) {
          chunks.push(imageUris.slice(i, i + concurrency));
        }

        for (const chunk of chunks) {
          await Promise.all(chunk.map(async (uri) => {
            await cacheImage(uri);
            completedCount++;
            setProgress(Math.floor((completedCount / imageUris.length) * 100));
          }));
        }
      }
    } catch (error) {
      console.error('Prefetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all cached images
  const clearCache = async (): Promise<void> => {
    if (Platform.OS === 'web') return;

    try {
      const cacheDir = `${FileSystem.cacheDirectory}image_cache/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(cacheDir);
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
      }
      
      setCachedPaths({});
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  // Initialize caching on mount if enabled
  useEffect(() => {
    if (mergedOptions.immediateCache) {
      prefetchAll();
    }
    
    // Cleanup on unmount
    return () => {
      // Cancel any pending operations if needed
    };
  }, [JSON.stringify(imageUris)]);

  return {
    isLoading,
    loadingStatus,
    errors,
    progress,
    cachedPaths,
    prefetchAll,
    clearCache,
  };
}

