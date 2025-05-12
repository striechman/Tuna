/**
 * A utility component to create blob URLs for images/files
 * Used to dynamically load model files in the browser
 */
export const createBlobURL = (data: Uint8Array, type = "application/octet-stream"): string => {
  const blob = new Blob([data], { type })
  return URL.createObjectURL(blob)
}

export const revokeURLs = (urls: string[]): void => {
  urls.forEach((url) => URL.revokeObjectURL(url))
}
