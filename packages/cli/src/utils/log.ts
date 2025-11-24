import { stderr } from "process";

export function log(message: string) {
  return process.stdout.write(message + "\n");
}

export function logError(message: string) {
  return stderr.write(message + "\n");
}

export function logBullet(
  logger: typeof log | typeof logError,
  colorizePrefix: <V>(v: V) => V,
  colorizeText: <V>(v: V) => V,
  symbol: string,
  prefix: string,
  text?: string | string[],
) {
  let textParts = Array.isArray(text) ? text : [text || ""].filter(Boolean);
  let formattedText = textParts
    .map((textPart) => colorizeText(textPart))
    .join("");

  if (process.stdout.columns < 80) {
    logger(
      `${" ".repeat(5)} ${colorizePrefix(symbol)}  ${colorizePrefix(prefix)}`,
    );
    logger(`${" ".repeat(9)}${formattedText}`);
  } else {
    logger(
      `${" ".repeat(5)} ${colorizePrefix(symbol)}  ${colorizePrefix(
        prefix,
      )} ${formattedText}`,
    );
  }
}