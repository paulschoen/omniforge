import { ensureDir, existsSync, readJSON, writeJSON } from 'fs-extra';
import { type BlogPost } from './blog-post-service';

export class CacheService {
  private readonly cacheFile: string;
  private cache: Record<string, string> = {};

  constructor(outputDir: string, cacheFileName: string) {
    this.cacheFile = `${outputDir}/${cacheFileName}`;
  }

  // Getters and Setters

  public getCache(): Readonly<Record<string, string>> {
    return this.cache;
  }

  public getCacheRecord(url: string): string | undefined {
    return this.cache[url];
  }

  public updateCacheRecord(url: string, summary: string): string | undefined {
    return (this.cache[url] = summary);
  }

  // File Utilities

  private isCacheFilePresent(): boolean {
    return existsSync(this.cacheFile);
  }

  public async loadCache(): Promise<CacheService> {
    if (this.isCacheFilePresent()) {
      const readCache = (await readJSON(this.cacheFile)) as Record<
        string,
        string
      >;
      this.cache = { ...readCache };
    }

    return this;
  }

  public cleanCache(posts: readonly BlogPost[]): this {
    if (!this.isCacheFilePresent()) {
      throw new Error('Cache file is not present');
    }

    const newUrls = posts.map((post) => post.url);

    this.cache = Object.keys(this.cache).reduce<Record<string, string>>(
      (acc, oldUrl) => {
        if (newUrls.includes(oldUrl) && this.cache[oldUrl] !== undefined) {
          acc[oldUrl] = this.cache[oldUrl];
        }
        return acc;
      },
      {},
    );

    return this;
  }

  public async saveCache(): Promise<CacheService> {
    try {
      await ensureDir('./docs');
      await writeJSON(this.cacheFile, this.cache, { spaces: 2 });

      return this;
    } catch (error) {
      console.error('⚠ Error saving cache:', error);
      throw error;
    }
  }
}
