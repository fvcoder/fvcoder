"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const package_json_1 = __importDefault(require("./../package.json"));
const hello_1 = require("./command/hello");
const new_1 = require("./command/new");
const program = new commander_1.Command();
program
    .name('fvcoder')
    .description('Comandos útiles para Fernando Ticona (@fvcoder)')
    .version(package_json_1.default.version);
program
    .command('hello')
    .description('Comando de prueba que imprime Hello World')
    .action(hello_1.helloCommand);
program
    .command('new [name]')
    .description("Crea un proyecto desde una plantilla")
    .option('-t, --template', 'Nombre de la plantilla')
    .action(new_1.newCommand);
program.parse(process.argv);
