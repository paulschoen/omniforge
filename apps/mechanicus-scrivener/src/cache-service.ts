import { ensureDir, existsSync, readJSON, writeJSON } from 'fs-extra';
import { type BlogPost } from './blog-post-service';

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

  public cleanCache(
    posts: BlogPost[],
    cache: Record<string, string>,
  ): Record<string, string> {
    const newUrls = posts.map((post) => post.url);

    return Object.keys(cache).reduce<Record<string, string>>((acc, oldUrl) => {
      if (newUrls.includes(oldUrl) && cache[oldUrl] !== undefined) {
        acc[oldUrl] = cache[oldUrl];
      }
      return acc;
    }, {});
  }

  public async saveCache(cache: Record<string, string>): Promise<void> {
    try {
      await ensureDir('./docs');
      await writeJSON(this.cacheFile, cache, { spaces: 2 });
    } catch (error) {
      console.error('⚠ Error saving cache:', error);
    }
  }

  public async cleanAndSaveCache(
    posts: BlogPost[],
    cache: Record<string, string>,
  ): Promise<void> {
    try {
      if (!existsSync(this.cacheFile)) return;

      const cleanedCache = this.cleanCache(posts, cache);
      await this.saveCache({ ...cleanedCache });
    } catch (error) {
      console.error('⚠ Error saving or cleaning cache:', error);
    }
  }
}
