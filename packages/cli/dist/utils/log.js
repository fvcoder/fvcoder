"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = log;
exports.logError = logError;
exports.logBullet = logBullet;
const process_1 = require("process");
function log(message) {
    return process.stdout.write(message + "\n");
}
function logError(message) {
    return process_1.stderr.write(message + "\n");
}
function logBullet(logger, colorizePrefix, colorizeText, symbol, prefix, text) {
    let textParts = Array.isArray(text) ? text : [text || ""].filter(Boolean);
    let formattedText = textParts
        .map((textPart) => colorizeText(textPart))
        .join("");
    if (process.stdout.columns < 80) {
        logger(`${" ".repeat(5)} ${colorizePrefix(symbol)}  ${colorizePrefix(prefix)}`);
        logger(`${" ".repeat(9)}${formattedText}`);
    }
    else {
        logger(`${" ".repeat(5)} ${colorizePrefix(symbol)}  ${colorizePrefix(prefix)} ${formattedText}`);
    }
}
