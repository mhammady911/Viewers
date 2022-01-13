import Listr from 'listr';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { copyTemplate, editPackageJson, validateOptions, access } from '../lib';

const copyModeTemplate = async options => {
  const { name, version, description, author, license } = options;

  const currentFileUrl = import.meta.url;
  const targetDir = path.resolve(process.cwd(), options.name);

  const templateDir = path.resolve(
    fileURLToPath(currentFileUrl),
    '../../../templates/mode'
  );

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error('%s Template not found', chalk.red.bold('ERROR'));
    process.exit(1);
  }

  return await copyTemplate(templateDir, targetDir);
};

const createMode = async options => {
  const targetDir = path.resolve(process.cwd(), options.name);

  const tasks = new Listr(
    [
      {
        title: 'Validating options',
        task: () => validateOptions(options),
      },
      {
        title: 'Copy template files',
        task: () => copyModeTemplate(options),
      },
      {
        title: 'Editing Package.json with provided information',
        task: () => editPackageJson(targetDir, options),
      },
    ],
    {
      exitOnError: true,
    }
  );

  await tasks.run();
  console.log('%s Mode is ready', chalk.green.bold('DONE'));
  return true;
};

export { createMode };
