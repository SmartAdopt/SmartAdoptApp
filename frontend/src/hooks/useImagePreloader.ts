// src/hooks/useImagePreloader.ts

import { useEffect, useRef, useCallback } from "react";

// ==========================================
// IMAGE CACHE — Module-level singleton
// Persists across component re-renders and route navigations.
// Stores fully decoded HTMLImageElement objects ready for instant display.
// ==========================================
const imageCache = new Map<string, HTMLImageElement>();

/**
 * Preloads a batch of image URLs into the browser cache.
 * Uses the HTMLImageElement.decode() API to decode pixels off the main thread,
 * ensuring the image renders instantly when the <img> src is set.
 */
const preloadImage = (url: string): Promise<HTMLImageElement> => {
  // Return cached image immediately if already loaded
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Required for Backblaze B2 CORS
    img.src = url;

    img.onload = () => {
      // Use decode() API if available — decodes pixels off the main thread
      if (typeof img.decode === "function") {
        img
          .decode()
          .then(() => {
            imageCache.set(url, img);
            resolve(img);
          })
          .catch(() => {
            // decode() can fail on some browsers, still cache the loaded image
            imageCache.set(url, img);
            resolve(img);
          });
      } else {
        imageCache.set(url, img);
        resolve(img);
      }
    };

    img.onerror = () => {
      reject(new Error(`Failed to preload image: ${url}`));
    };
  });
};

/**
 * Hook: Batch-preloads a window of image URLs ahead of the current index.
 * - On first data load, preloads images [0..LOOKAHEAD_COUNT-1]
 * - When currentIndex changes, preloads images [current+1..current+LOOKAHEAD_COUNT]
 * - Uses AbortController pattern to cancel stale preloads on unmount
 */
export const useImagePreloader = (
  imageUrls: string[],
  currentIndex: number,
  lookaheadCount: number = 3,
) => {
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;

    // Determine the range of images to preload
    const startIdx = Math.max(0, currentIndex);
    const endIdx = Math.min(
      imageUrls.length,
      currentIndex + lookaheadCount + 1,
    );
    const urlsToPreload = imageUrls.slice(startIdx, endIdx);

    // Fire-and-forget preloading (non-blocking)
    urlsToPreload.forEach((url) => {
      if (url && !imageCache.has(url) && !abortRef.current) {
        preloadImage(url).catch(() => {
          // Silently ignore preload failures for future images
        });
      }
    });

    return () => {
      abortRef.current = true;
    };
  }, [imageUrls, currentIndex, lookaheadCount]);

  /** Check if a specific URL is already cached and decoded */
  const isImageReady = useCallback((url: string): boolean => {
    return imageCache.has(url);
  }, []);

  return { isImageReady };
};
