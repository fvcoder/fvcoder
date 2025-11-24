"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrl = isUrl;
function isUrl(value) {
    try {
        new URL(value);
        return true;
    }
    catch (_) {
        return false;
    }
}
