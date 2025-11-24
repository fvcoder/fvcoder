import { stderr } from "process";
export function log(message) {
    return process.stdout.write(message + "\n");
}
export function logError(message) {
    return stderr.write(message + "\n");
}
export function logBullet(logger, colorizePrefix, colorizeText, symbol, prefix, text) {
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
