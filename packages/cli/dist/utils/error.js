import { color } from "./color";
import { log, logBullet, logError } from "./log";
export function error(prefix, text) {
    log("");
    logBullet(logError, color.red, color.error, "▲", prefix, text);
}
