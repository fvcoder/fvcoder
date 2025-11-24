"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = void 0;
const chalk_1 = __importDefault(require("chalk"));
exports.color = {
    heading: chalk_1.default.bold,
    arg: chalk_1.default.yellowBright,
    error: chalk_1.default.red,
    warning: chalk_1.default.yellow,
    hint: chalk_1.default.blue,
    bold: chalk_1.default.bold,
    black: chalk_1.default.black,
    white: chalk_1.default.white,
    blue: chalk_1.default.blue,
    cyan: chalk_1.default.cyan,
    red: chalk_1.default.red,
    yellow: chalk_1.default.yellow,
    green: chalk_1.default.green,
    blackBright: chalk_1.default.blackBright,
    whiteBright: chalk_1.default.whiteBright,
    blueBright: chalk_1.default.blueBright,
    cyanBright: chalk_1.default.cyanBright,
    redBright: chalk_1.default.redBright,
    yellowBright: chalk_1.default.yellowBright,
    greenBright: chalk_1.default.greenBright,
    bgBlack: chalk_1.default.bgBlack,
    bgWhite: chalk_1.default.bgWhite,
    bgBlue: chalk_1.default.bgBlue,
    bgCyan: chalk_1.default.bgCyan,
    bgRed: chalk_1.default.bgRed,
    bgYellow: chalk_1.default.bgYellow,
    bgGreen: chalk_1.default.bgGreen,
    bgBlackBright: chalk_1.default.bgBlackBright,
    bgWhiteBright: chalk_1.default.bgWhiteBright,
    bgBlueBright: chalk_1.default.bgBlueBright,
    bgCyanBright: chalk_1.default.bgCyanBright,
    bgRedBright: chalk_1.default.bgRedBright,
    bgYellowBright: chalk_1.default.bgYellowBright,
    bgGreenBright: chalk_1.default.bgGreenBright,
    gray: chalk_1.default.gray,
    dim: chalk_1.default.dim,
    reset: chalk_1.default.reset,
    inverse: chalk_1.default.inverse,
    hex: (color) => (chalk_1.default.hex(color)),
    underline: chalk_1.default.underline,
};
