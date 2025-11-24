"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newCommand = newCommand;
const inquirer_1 = __importDefault(require("inquirer"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const copy_template_1 = require("../utils/copy-template");
const error_1 = require("../utils/error");
const promises_1 = require("fs/promises");
async function newCommand(projectName = "", options) {
    const projectDir = path.join(process.cwd(), projectName);
    let name = projectName;
    if (!name) {
        const nameAnswer = await inquirer_1.default.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: '¿Cuál es el nombre de tu proyecto?',
                validate: (input) => {
                    if (!input || input.trim() === '') {
                        return 'El nombre del proyecto es requerido';
                    }
                    if (fs.existsSync(path.join(process.cwd(), input))) {
                        return 'Ya existe un directorio con ese nombre';
                    }
                    return true;
                }
            }
        ]);
        name = nameAnswer.projectName;
    }
    const manifest = await (await fetch("https://raw.githubusercontent.com/fvcoder/templates/refs/heads/main/manifest.json")).json();
    let template = options.template;
    if (!template) {
        const templateAnswer = await inquirer_1.default.prompt([
            {
                type: 'rawlist',
                name: 'template',
                message: `Selecciona una plantilla`,
                choices: manifest.map((x) => ({
                    name: `${x.template} (${x.stack.join(", ")})`,
                    value: x.template
                }))
            }
        ]);
        template = templateAnswer.template;
    }
    await (0, copy_template_1.copyTemplate)(`fvcoder/templates/${template}`, projectDir, {
        async onError(err) {
            (0, error_1.error)("Oh no!", err instanceof copy_template_1.CopyTemplateError
                ? err.message
                : "Something went wrong.\n\n" +
                    "Open an issue to report the problem at " +
                    "https://github.com/fvcoder/fvcoder/issues/new");
            throw err;
        },
    });
    const packageJsonDir = path.join(projectDir, 'package.json');
    if (fs.existsSync(packageJsonDir)) {
        const packageJson = JSON.parse(String(await (0, promises_1.readFile)(packageJsonDir)));
        const packageJsonData = {
            name: projectName,
            ...packageJson,
        };
        await (0, promises_1.writeFile)(packageJsonDir, JSON.stringify(packageJsonData, null, 2));
    }
}
