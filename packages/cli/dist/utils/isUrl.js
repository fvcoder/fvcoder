export function isUrl(value) {
    try {
        new URL(value);
        return true;
    }
    catch (_) {
        return false;
    }
}
