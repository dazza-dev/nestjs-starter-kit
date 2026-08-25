import * as mime from 'mime-types';

/**
 * Gets the MIME type of a file from its name or extension.
 */
export const getMimeFromExtension = (fileName: string): string => {
  const mimeType = mime.lookup(fileName);

  if (!mimeType) {
    return 'application/octet-stream';
  }

  return mimeType;
};
