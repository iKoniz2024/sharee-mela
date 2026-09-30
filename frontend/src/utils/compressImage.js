/**
 * Compresses an image file client-side using HTML5 Canvas to WebP/JPEG format to drastically reduce payload size.
 * @param {File} file - The file to compress.
 * @param {number} maxWidth - Maximum width of the output image.
 * @param {number} maxHeight - Maximum height of the output image.
 * @param {number} quality - Compression quality (0 to 1).
 * @returns {Promise<string>} - A Promise that resolves to the compressed Base64 data URL.
 */
export const compressImage = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      reject(new Error("File is not a valid image"));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio bounding box
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get 2D canvas context"));
          return;
        }

        // Fill white background for transparent PNGs converted to WebP/JPEG
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression size, fallback to JPEG
        let compressedBase64 = canvas.toDataURL("image/webp", quality);
        if (!compressedBase64.startsWith("data:image/webp")) {
          compressedBase64 = canvas.toDataURL("image/jpeg", quality);
        }
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * Generates a lightweight square thumbnail (e.g. 400x400) for fast catalog loading.
 */
export const createThumbnail = (file, size = 400, quality = 0.7) => {
  return compressImage(file, size, size, quality);
};

