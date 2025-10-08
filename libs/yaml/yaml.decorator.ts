/* eslint-disable */
import { readFileSync, existsSync } from 'fs';
import { parse } from 'yaml';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

interface YamlOptions {
  file: string;
  encoding?: BufferEncoding;
}

function replaceEnvVariables(str: string): string {
  return str.replace(/\$\{(\w+)\}/g, (match, name) => {
    return process.env[name] || match;
  });
}

export function Yaml(options: YamlOptions) {
  return function <T extends { new (...args: any[]): object }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        if (!existsSync(options.file)) {
          const errorMessage = `YAML file not found: ${options.file}`;
          throw new Error(errorMessage);
        }

        const fileContent = readFileSync(options.file, {
          encoding: options.encoding || 'utf-8',
        });
        const fileContentWithEnv = replaceEnvVariables(fileContent);
        const parsedData = parse(fileContentWithEnv);
        const instance = plainToClass(constructor, parsedData || {});

        const errors = validateSync(instance);
        if (errors.length) {
          const errorMessage = `Validation error in ${options.file}: ${JSON.stringify(errors, null, 2)}`;
          throw new Error(errorMessage);
        }

        Object.assign(this, instance);
      }
    };
  };
}
