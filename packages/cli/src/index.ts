#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program
  .name('fvcoder')
  .description('Generador de proyectos para Fernando Ticona')
  .version('0.0.1');

program
  .command('hello')
  .description('Comando de prueba que imprime Hello World')
  .action(() => {
    console.log('Hello World! 👋');
    console.log('¡Bienvenido a fvcoder CLI!');
  });

program.parse(process.argv);