import { color } from "./color";
import { log, logBullet, logError } from "./log";

export function error(prefix: string, text?: string | string[]) {
  log("");
  logBullet(logError, color.red as any, color.error as any, "▲", prefix, text);
}