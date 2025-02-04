import { XMLParser } from 'fast-xml-parser';
import { Feed } from 'feed';
import { type BlogPost } from './blog-post-service';
import { FileManager } from './file-manager';
import { Logger } from './logger';

interface RssItem {
  link: string;
}

export class RSSParser {
  private parser = new XMLParser();

  public extractLinks(feed: string): Set<string> {
    const parsedFeed = this.parser.parse(feed) as {
      rss?: { channel?: { item?: RssItem[] } };
    };
    return new Set(
      parsedFeed.rss?.channel?.item?.map((item: RssItem) => item.link) ?? [],
    );
  }
}

export class FeedGenerator {
  private parser = new RSSParser();
  private fileManager = new FileManager();
  private logger = new Logger();

  private feed: Feed;
  private directory: string;
  private filePath: string;

  constructor({
    siteUrl,
    rssFile,
    directory,
  }: {
    siteUrl: string;
    rssFile: string;
    directory: string;
  }) {
    this.feed = new Feed({
      title: 'Warhammer 40k Community RSS Feed',
      description: 'Latest intelligence reports from the Warhammer Community',
      id: siteUrl,
      link: siteUrl,
      language: 'en',
      copyright: 'Games Workshop',
    });

    this.directory = directory;
    this.filePath = `${directory}/${rssFile}`;
  }

  public addPostToFeed(post: BlogPost, aiSummary: string): void {
    this.logger.logInfo(
      `Adding newly acquired intelligence to the feed: ${post.title}`,
    );
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

  public async isRssFileEmpty(): Promise<boolean> {
    try {
      this.logger.logInfo('Checking if RSS file is empty');
      return (
        (await this.fileManager.readFileContent(this.filePath)).length === 0
      );
    } catch (error: unknown) {
      this.logger.logError(
        'Error checking if RSS file is empty:',
        (error as Error).message,
      );
      return true;
    }
  }

  public async determineIfFeedNeedsUpdate(): Promise<boolean> {
    try {
      this.logger.logInfo('Checking if feed data needs further processing');
      await this.fileManager.ensureDirectory(this.directory);
      await this.fileManager.ensureFile(this.filePath);

      const fileContent = await this.fileManager.readFileContent(this.filePath);
      const fileLinks = this.parser.extractLinks(fileContent);
      const newLinks = this.parser.extractLinks(this.feed.rss2());

      return this.hasNewItems(fileLinks, newLinks);
    } catch (error: unknown) {
      this.logger.logError('Error processing feeds:', (error as Error).message);
      return false;
    }
  }

  private hasNewItems(oldItems: Set<string>, newItems: Set<string>): boolean {
    this.logger.logInfo('Validating if new items are present');
    for (const item of newItems) {
      if (!oldItems.has(item)) {
        return true;
      }
    }
    return false;
  }

  public async saveFeed(): Promise<void> {
    try {
      this.logger.logInfo('Saving acquired feed data to codex');
      await this.fileManager.ensureDirectory(this.directory);
      await this.fileManager.ensureFile(this.filePath);

      await this.fileManager.writeFileContent(this.filePath, this.feed.rss2());
      this.logger.logInfo(`RSS feed updated at: ${this.filePath}`);
    } catch (error: unknown) {
      this.logger.logError('Error saving feed:', (error as Error).message);
      throw error;
    }
  }
}
