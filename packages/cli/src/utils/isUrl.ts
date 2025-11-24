export function isUrl(value: string | URL) {
  try {
    new URL(value);
    return true;
  } catch (_) {
    return false;
  }
}