const backendBaseUrl = process.env.REACT_APP_BACKEND_BASE_URL || 'http://localhost/DutyDinarRepo/backend';

/**
 * Returns the full URL for an image path.
 * If the imagePath is relative (does not start with http), prepends the backend base URL.
 * @param {string} imagePath - The image path or URL.
 * @returns {string} - The full URL to use in img src or CSS background.
 */
export function getFullImageUrl(imagePath) {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  // Remove leading slashes to avoid double slashes in URL
  const cleanPath = imagePath.replace(/^\/+/, '');
  return `${backendBaseUrl}/${cleanPath}`;
}
