"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = error;
const color_1 = require("./color");
const log_1 = require("./log");
function error(prefix, text) {
    (0, log_1.log)("");
    (0, log_1.logBullet)(log_1.logError, color_1.color.red, color_1.color.error, "▲", prefix, text);
}
