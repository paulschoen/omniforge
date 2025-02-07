import {
  ensureDir,
  ensureFile,
  existsSync,
  readFile,
  readJSON,
  writeFile,
  writeJSON,
} from 'fs-extra';
import { Logger } from '@omniforge/utils';

export class FileManager {
  public async ensureDirectory(directory: string): Promise<FileManager> {
    try {
      Logger.info(`Ensuring holy directory is accessible: ${directory}`);
      await ensureDir(directory);
      return this;
    } catch (error: unknown) {
      Logger.error(`Error ensuring directory: ${directory} ${error as Error}`);
      throw error;
    }
  }

  public async ensureFile(filePath: string): Promise<FileManager> {
    try {
      Logger.info(`Ensuring holy knowledge is accessible: ${filePath}`);
      await ensureFile(filePath);
      return this;
    } catch (error: unknown) {
      Logger.error(`Error ensuring file: ${filePath}, ${error as Error}`);
      throw error;
    }
  }

  public async readFileContent(filePath: string): Promise<string> {
    try {
      Logger.info(`Reading holy knowledge: ${filePath}`);
      return await readFile(filePath, 'utf-8');
    } catch (error: unknown) {
      Logger.error(`Error reading file: ${filePath} ${error as Error}`);
      throw error;
    }
  }

  public async readJSONContent(
    filePath: string,
  ): Promise<Record<string, string>> {
    try {
      Logger.info(`Reading holy machine spirit scripture: ${filePath}`);
      return (await readJSON(filePath)) as Record<string, string>;
    } catch (error: unknown) {
      Logger.error(`Error reading JSON file: ${filePath} ${error as Error}`);
      throw error;
    }
  }

  public async writeFileContent(
    filePath: string,
    content: string,
  ): Promise<FileManager> {
    try {
      Logger.info(`Writing knowledge: ${filePath}`);
      await writeFile(filePath, content, 'utf-8');
      return this;
    } catch (error: unknown) {
      Logger.error(`Error writing file: ${filePath} ${error as Error}`);
      throw error;
    }
  }

  public async writeJSONContent(
    filePath: string,
    content: Record<string, string>,
  ): Promise<FileManager> {
    try {
      Logger.info(`Storing holy machine spirit scripture: ${filePath}`);
      await writeJSON(filePath, content, { spaces: 2 });
      return this;
    } catch (error: unknown) {
      Logger.error(`Error writing JSON file: ${filePath} ${error as Error}`);
      throw error;
    }
  }

  public isFilePresent(filePath: string): boolean {
    Logger.info(`Checking if knowledge is present: ${filePath}`);
    return existsSync(filePath);
  }
}
