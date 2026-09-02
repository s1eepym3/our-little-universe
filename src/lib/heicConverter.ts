/**
 * Client-side HEIC/HEIF to JPEG converter for seamless browser rendering.
 */

export function isHeicFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  return (
    fileName.endsWith('.heic') ||
    fileName.endsWith('.heif') ||
    fileType === 'image/heic' ||
    fileType === 'image/heif'
  );
}

export async function convertHeicToJpeg(
  file: File,
  onProgressMessage?: (msg: string) => void
): Promise<File> {
  if (!isHeicFile(file)) {
    return file;
  }

  if (typeof window === 'undefined') {
    return file;
  }

  try {
    onProgressMessage?.('Converting HEIC photo for browser display...');
    const heic2anyModule = await import('heic2any');
    const heic2any = heic2anyModule.default || heic2anyModule;

    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.9,
    });

    const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    // Create new filename with .jpg extension
    const baseName = file.name.replace(/\.(heic|heif)$/i, '');
    const newFileName = `${baseName}.jpg`;

    return new File([resultBlob], newFileName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Failed to convert HEIC to JPEG:', error);
    // Return original file as fallback if conversion fails
    return file;
  }
}
