/**
 * Client-side image compression using Canvas API
 * Converts to WebP, resizes to max dimensions, compresses quality
 */

const DEFAULT_MAX_WIDTH = 800;
const DEFAULT_MAX_HEIGHT = 800;
const DEFAULT_QUALITY = 0.7;
const MAX_OUTPUT_SIZE_MB = 0.5; // target max 500KB

/**
 * Compress an image File to WebP format
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @param {number} [options.maxWidth=800] - Max output width
 * @param {number} [options.maxHeight=800] - Max output height
 * @param {number} [options.quality=0.7] - WebP quality 0-1
 * @returns {Promise<{blob: Blob, url: string, originalSize: number, compressedSize: number}>}
 */
export function compressImage(file, options = {}) {
  const { maxWidth = DEFAULT_MAX_WIDTH, maxHeight = DEFAULT_MAX_HEIGHT, quality = DEFAULT_QUALITY } = options;

  return new Promise((resolve, reject) => {
    // Validate input
    if (!file || !file.type.match(/image\/(jpeg|png|webp)/)) {
      reject(new Error('Format tidak didukung. Gunakan JPG, PNG, atau WebP.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate target dimensions (keep aspect ratio)
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Draw on canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Gagal mengompresi gambar'));
              return;
            }

            // If still too large, reduce quality further
            if (blob.size > MAX_OUTPUT_SIZE_MB * 1024 * 1024) {
              canvas.toBlob(
                (retryBlob) => {
                  const url = URL.createObjectURL(retryBlob);
                  resolve({
                    blob: retryBlob,
                    url,
                    originalSize: file.size,
                    compressedSize: retryBlob.size,
                    width,
                    height,
                  });
                },
                'image/webp',
                quality * 0.6
              );
            } else {
              const url = URL.createObjectURL(blob);
              resolve({
                blob,
                url,
                originalSize: file.size,
                compressedSize: blob.size,
                width,
                height,
              });
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => reject(new Error('Gagal membaca gambar'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as data URL (for preview)
 * @param {File} file
 * @returns {Promise<string>}
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}
