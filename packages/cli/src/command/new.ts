import inquirer from 'inquirer';
import * as fs from 'fs';
import * as path from 'path';
import { copyTemplate, CopyTemplateError } from '../utils/copy-template';
import { error } from '../utils/error';

export interface newCommandOpt {
    template: string
}

export async function newCommand(projectName = "", options: newCommandOpt) {
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

    /*
    const manifest = await (await fetch("https://raw.githubusercontent.com/fvcoder/templates/refs/heads/main/manifest.json")).json()

    console.log(manifest)
    */
    const manifest = [
        { template: 'next', stack: [ 'Tailwind' ] },
        { template: 'react', stack: [] },
        { template: 'react-router-dom-framework', stack: [ 'Tailwind' ] }
    ]


    const { template } = await inquirer.prompt([
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

    const s = await copyTemplate(`fvcoder/templates/${template}`, path.join(process.cwd()), {
        async onError(err) {
          error(
            "Oh no!",
            err instanceof CopyTemplateError
              ? err.message
              : "Something went wrong. Run `create-react-router --debug` to see more info.\n\n" +
                  "Open an issue to report the problem at " +
                  "https://github.com/fvcoder/fvcoder/issues/new",
          );
          throw err;
        },
    })
    console.log(s)
    /*

    const templatesDir = path.join(__dirname, '..', '..', '..', '..', 'templates');
    const templatePath = path.join(templatesDir, template);

    if (!fs.existsSync(templatePath)) {
        const availableTemplates = fs.existsSync(templatesDir) 
            ? fs.readdirSync(templatesDir).filter(file => 
                fs.statSync(path.join(templatesDir, file)).isDirectory()
              )
            : [];

        if (availableTemplates.length === 0) {
            console.error('❌ No hay plantillas disponibles en /templates');
            process.exit(1);
        }

        const templateAnswer = await inquirer.prompt([
            {
                type: 'list',
                name: 'template',
                message: `La plantilla "${template}" no existe. Selecciona una plantilla:`,
                choices: availableTemplates
            }
        ]);
        template = templateAnswer.template;
    }

    // Crear el proyecto desde la plantilla
    await createProjectFromTemplate(name, template, templatesDir);
    */
}

async function createProjectFromTemplate(projectName: string, template: string, templatesDir: string) {
    const templatePath = path.join(templatesDir, template);
    const targetPath = path.join(process.cwd(), projectName);

    try {
        console.log(`\n📦 Creando proyecto "${projectName}" desde la plantilla "${template}"...\n`);

        // Verificar que el directorio destino no exista
        if (fs.existsSync(targetPath)) {
            console.error(`❌ El directorio "${projectName}" ya existe`);
            process.exit(1);
        }

        // Copiar la plantilla
        copyDirectory(templatePath, targetPath);

        console.log(`✅ Proyecto creado exitosamente en: ${targetPath}`);
        console.log(`\n📝 Próximos pasos:`);
        console.log(`   cd ${projectName}`);
        console.log(`   npm install`);
        console.log(`   npm run dev\n`);
    } catch (error) {
        console.error('❌ Error al crear el proyecto:', error);
        process.exit(1);
    }
}

function copyDirectory(source: string, destination: string) {
    // Crear el directorio destino
    fs.mkdirSync(destination, { recursive: true });

    // Leer el contenido del directorio origen
    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
        const sourcePath = path.join(source, entry.name);
        const destPath = path.join(destination, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(sourcePath, destPath);
        } else {
            // Copiar archivo
            fs.copyFileSync(sourcePath, destPath);
        }
    }
}