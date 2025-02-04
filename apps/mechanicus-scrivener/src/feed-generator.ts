import { XMLParser } from 'fast-xml-parser';
import { Feed } from 'feed';
import { ensureDir, mkdir, readFile, writeFile } from 'fs-extra';
import { type BlogPost } from './blog-post-service';

interface RssItem {
  link: string;
}

export class FeedGenerator {
  private parser = new XMLParser();
  private feed: Feed;

  constructor(siteUrl: string) {
    this.feed = new Feed({
      title: 'Warhammer Community RSS Feed',
      description: 'Latest intelligence reports from the Warhammer Community',
      id: siteUrl,
      link: siteUrl,
      language: 'en',
      copyright: 'Games Workshop',
    });
  }

  public addPostToFeed(post: BlogPost, aiSummary: string): void {
    if (!post.date) return;

    const parsedDate = new Date(
      `20${post.date.slice(-2)}-${post.date.slice(3, 6)}-${post.date.slice(0, 2)}`,
    );

    this.feed.addItem({
      title: post.title,
      id: post.url,
      link: post.url,
      description: aiSummary,
      date: parsedDate,
      image: post.image,
      category: [{ name: post.category }],
    });
  }

  public async determineIfFeedNeedsUpdate(rssFile: string): Promise<boolean> {
    await this.ensureDirectoryExists('./docs');
    const doesFileExist = await this.doesFileExist(rssFile);

    if (!doesFileExist) {
      return true;
    }

    try {
      const readFeed = await this.readFileContent(rssFile);
      const readFeedItemsLinks = this.extractLinks(readFeed);
      const newFeedItemsLinks = this.extractLinks(this.feed.rss2());

      const hasNewItems = this.hasNewItems(
        readFeedItemsLinks,
        newFeedItemsLinks,
      );

      return hasNewItems;
    } catch (error) {
      console.error('Error processing feeds:', error);
      return false;
    }
  }

  private async ensureDirectoryExists(dir: string): Promise<void> {
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      console.error('Directory creation failed:', error);
    }
  }

  private async doesFileExist(file: string): Promise<boolean> {
    try {
      await readFile(file, 'utf-8');
      return true;
    } catch (error) {
      console.error('File creation failed:', error);
      return false;
    }
  }

  private async readFileContent(filePath: string): Promise<string> {
    try {
      return await readFile(filePath, 'utf-8');
    } catch (error) {
      console.error('Error reading file:', error);
      throw error;
    }
  }

  private extractLinks(feed: string): Set<string> {
    const parsedFeed = this.parser.parse(feed) as {
      rss: { channel: { item?: RssItem[] } };
    };
    return new Set(
      parsedFeed.rss.channel.item?.map((item: RssItem) => item.link) ?? [],
    );
  }

  private hasNewItems(oldItems: Set<string>, newItems: Set<string>): boolean {
    for (const item of newItems) {
      if (!oldItems.has(item)) {
        return true;
      }
    }
    return false;
  }

  public async saveFeed(rssFile: string): Promise<void> {
    await ensureDir('./docs');

    await writeFile(rssFile, this.feed.rss2(), 'utf-8');
    console.log(`✅ RSS feed updated at: ${rssFile}`);
  }
}
