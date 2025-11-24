import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { copyTemplate, CopyTemplateError } from '../utils/copy-template';
import { error } from '../utils/error';
import { readFile, writeFile } from 'fs/promises';

export interface newCommandOpt {
    template?: string
}

export async function newCommand(projectName = "", options: newCommandOpt) {
    const projectDir = path.join(process.cwd(), projectName);
    let name = projectName;

    if (!name) {
        const nameAnswer = await inquirer.prompt([
            {
                type: 'input',
                name: 'projectName',
                message: '¿Cuál es el nombre de tu proyecto?',
                validate: (input: string) => {
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

    const manifest = await (await fetch("https://raw.githubusercontent.com/fvcoder/templates/refs/heads/main/manifest.json")).json() as any[]

    let template = options.template;

    if (!template) {
        const templateAnswer = await inquirer.prompt([
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

    await copyTemplate(`fvcoder/templates/${template}`, projectDir, {
        async onError(err) {
          error(
            "Oh no!",
            err instanceof CopyTemplateError
              ? err.message
              : "Something went wrong.\n\n" +
                  "Open an issue to report the problem at " +
                  "https://github.com/fvcoder/fvcoder/issues/new",
          );
          throw err;
        },
    })

    const packageJsonDir = path.join(projectDir, 'package.json');

    if (fs.existsSync(packageJsonDir)) {
        const packageJson = JSON.parse(String(await readFile(packageJsonDir)))

        const packageJsonData = {
            name: projectName,
            ...packageJson,
        }
        await writeFile(packageJsonDir, JSON.stringify(packageJsonData, null, 2))
    }
}
