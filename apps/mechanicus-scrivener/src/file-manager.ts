import {
  ensureDir,
  ensureFile,
  existsSync,
  readFile,
  readJSON,
  writeFile,
  writeJSON,
} from 'fs-extra';
import { Logger } from './logger';

export class FileManager {
  private logger = new Logger();
  public async ensureDirectory(directory: string): Promise<FileManager> {
    try {
      this.logger.logInfo(
        `Ensuring holy directory is accessible: ${directory}`,
      );
      await ensureDir(directory);
      return this;
    } catch (error: unknown) {
      this.logger.logError(
        `Error ensuring directory: ${directory}`,
        (error as Error).message,
      );
      throw error;
    }
  }

  public async ensureFile(filePath: string): Promise<FileManager> {
    try {
      this.logger.logInfo(`Ensuring holy knowledge is accessible: ${filePath}`);
      await ensureFile(filePath);
      return this;
    } catch (error: unknown) {
      this.logger.logError(
        `Error ensuring file: ${filePath}`,
        (error as Error).message,
      );
      throw error;
    }
  }

  public async readFileContent(filePath: string): Promise<string> {
    try {
      this.logger.logInfo(`Reading holy knowledge: ${filePath}`);
      return await readFile(filePath, 'utf-8');
    } catch (error: unknown) {
      this.logger.logError(
        `Error reading file: ${filePath}`,
        (error as Error).message,
      );
      throw error;
    }
  }

  public async readJSONContent(
    filePath: string,
  ): Promise<Record<string, string>> {
    try {
      this.logger.logInfo(`Reading holy machine spirit scripture: ${filePath}`);
      return (await readJSON(filePath)) as Record<string, string>;
    } catch (error: unknown) {
      this.logger.logError(
        `Error reading JSON file: ${filePath}`,
        (error as Error).message,
      );
      throw error;
    }
  }

  public async writeFileContent(
    filePath: string,
    content: string,
  ): Promise<FileManager> {
    try {
      this.logger.logInfo(`Writing knowledge: ${filePath}`);
      await writeFile(filePath, content, 'utf-8');
      return this;
    } catch (error: unknown) {
      this.logger.logError(
        `Error writing file: ${filePath}`,
        (error as Error).message,
      );
      throw error;
    }
  }

  public async writeJSONContent(
    filePath: string,
    content: Record<string, string>,
  ): Promise<FileManager> {
    try {
      this.logger.logInfo(`Storing holy machine spirit scripture: ${filePath}`);
      await writeJSON(filePath, content, { spaces: 2 });
      return this;
    } catch (error: unknown) {
      this.logger.logError(
        `Error writing JSON file: ${filePath}`,
        (error as Error).message,
      );
      throw error;
    }
  }

  public isFilePresent(filePath: string): boolean {
    this.logger.logInfo(`Checking if knowledge is present: ${filePath}`);
    return existsSync(filePath);
  }
}
