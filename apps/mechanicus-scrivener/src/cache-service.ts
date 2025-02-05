import { FileManager } from './file-manager';
import { Logger } from './logger';

export class CacheService {
  private readonly directory: string;
  private readonly cacheFilePath: string;
  private readonly logger = new Logger();

  private cache: Record<string, string> = {};
  private fileManager = new FileManager();

  constructor(outputDir: string, cacheFileName: string) {
    this.directory = outputDir;
    this.cacheFilePath = `${outputDir}/${cacheFileName}`;
  }

  // Getters and Setters
  public getCache(): Readonly<Record<string, string>> {
    this.logger.logInfo('Accessing haste machine spirit data');
    return this.cache;
  }

  public getCacheRecord(url: string): string | undefined {
    this.logger.logInfo('Accessing machine spirit data');
    return this.cache[url];
  }

  public updateCacheRecord(url: string, summary: string): string | undefined {
    this.logger.logInfo('Updating machine spirit drive');
    const updatedCache = { ...this.cache, [url]: summary };
    this.cache = updatedCache;
    return updatedCache[url];
  }

  // File Utilities
  private isCacheFilePresent(): boolean {
    this.logger.logInfo('Checking machine spirit memory are still intact');
    return this.fileManager.isFilePresent(this.cacheFilePath);
  }

  public async loadCache(): Promise<CacheService> {
    this.logger.logInfo('Loading machine spirit previous requested knowledge');
    if (this.isCacheFilePresent()) {
      const readCache = await this.fileManager.readJSONContent(
        this.cacheFilePath,
      );
      this.cache = { ...readCache };
    }

    return this;
  }

  public async saveCache(): Promise<CacheService> {
    try {
      this.logger.logInfo('Saving machine spirit knowledge to codex');
      await this.fileManager.ensureDirectory(this.directory);
      await this.fileManager.ensureFile(this.cacheFilePath);
      await this.fileManager.writeJSONContent(this.cacheFilePath, this.cache);

      return this;
    } catch (error: unknown) {
      this.logger.logError('Error saving cache:', (error as Error).message);
      throw error;
    }
  }
}
