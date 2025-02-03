import { ensureDir, existsSync, readJSON, writeJSON } from 'fs-extra';

export class CacheService {
  private readonly cacheFile: string;

  constructor(outputDir: string, cacheFileName: string) {
    this.cacheFile = `${outputDir}/${cacheFileName}`;
  }

  public async loadCache(): Promise<Record<string, string>> {
    if (existsSync(this.cacheFile)) {
      return readJSON(this.cacheFile) as Promise<Record<string, string>>;
    }
    return {};
  }

  public isThereAValueForUrl(
    cache: Record<string, string>,
    url: string,
  ): boolean {
    return cache[url] !== undefined;
  }

  public async cleanCache(): Promise<void> {
    if (existsSync(this.cacheFile)) {
      await writeJSON(this.cacheFile, {}, { spaces: 2 });
    }
  }

  public async saveCache(cache: Record<string, string>): Promise<void> {
    try {
      await ensureDir('./docs');
      await writeJSON(this.cacheFile, cache, { spaces: 2 });
    } catch (error) {
      console.error('⚠ Error saving cache:', error);
    }
  }
}
