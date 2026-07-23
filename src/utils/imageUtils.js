// src/utils/imageUtils.js

/**
 * Converts any image (File, Blob, Data URL, or HTTP image URL) to WebP format.
 * Compresses file size for fast loading and reduced storage usage.
 *
 * @param {File|Blob|string} input - The image file, blob, data URL, or remote image URL
 * @param {number} quality - Compression quality (0.0 to 1.0, default: 0.82)
 * @param {number} maxDimension - Maximum width/height (default: 1920px)
 * @returns {Promise<{ dataUrl: string, file: File }>} The converted WebP Data URL and File object
 */
export async function convertToWebP(input, quality = 0.82, maxDimension = 1920) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const processImage = (src) => {
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Downscale large images proportionally
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP Data URL
        const dataUrl = canvas.toDataURL('image/webp', quality);

        // Convert to WebP Blob / File
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const webpFile = new File(
                [blob],
                `prompt_${Date.now()}.webp`,
                { type: 'image/webp' }
              );
              resolve({ dataUrl, file: webpFile });
            } else {
              // Fallback
              resolve({ dataUrl, file: null });
            }
          },
          'image/webp',
          quality
        );
      };

      img.onerror = (err) => {
        reject(err);
      };

      img.src = src;
    };

    if (input instanceof File || input instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => processImage(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(input);
    } else if (typeof input === 'string') {
      processImage(input);
    } else {
      reject(new Error('Invalid image input provided to convertToWebP'));
    }
  });
}
