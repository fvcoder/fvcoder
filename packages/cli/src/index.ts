import { Command } from 'commander';
import PackageJson from "./../package.json";
import { helloCommand } from './command/hello';
import { newCommand } from './command/new';

const program = new Command();

program
  .name('fvcoder')
  .description('Comandos útiles para Fernando Ticona (@fvcoder)')
  .version(PackageJson.version);

program
  .command('hello')
  .description('Comando de prueba que imprime Hello World')
  .action(helloCommand);

program
  .command('new [name]')
  .description("Crea un proyecto desde una plantilla")
  .option('-t, --template', 'Nombre de la plantilla')
  .action(newCommand)

program.parse(process.argv);