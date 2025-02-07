import { XMLParser } from 'fast-xml-parser';
import { Feed } from 'feed';
import { type NewsArticle } from '@omniforge/data-access';
import { Logger } from '@omniforge/utils';
import { FileManager } from './file-manager';

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
  private baseUrl = 'https://www.warhammer-community.com/en-us';
  private assetUrl = 'https://assets.warhammer-community.com';

  private feed: Feed;
  private directory: string;
  private filePath: string;

  constructor({ rssFile, directory }: { rssFile: string; directory: string }) {
    this.feed = new Feed({
      title: 'Warhammer 40k Community RSS Feed',
      description: 'Latest intelligence reports from the Warhammer Community',
      id: this.baseUrl,
      link: this.baseUrl,
      language: 'en',
      copyright: 'Games Workshop',
    });

    this.directory = directory;
    this.filePath = `${directory}/${rssFile}`;
  }

  public addPostToFeed(post: NewsArticle): void {
    Logger.info(
      `Adding newly acquired intelligence to the feed: ${post.title}`,
    );

    this.feed.addItem({
      title: post.title,
      id: post.id,
      guid: post.uuid,
      link: `${this.baseUrl}${post.uri}`,
      description: post.excerpt,
      date: new Date(post.date),
      image: `${this.assetUrl}/${post.image.path}`,
      category: [
        ...post.topics.map((topic) => ({
          name: topic.title,
          domain: topic.slug,
        })),
        ...(post.collection ? [{ name: post.collection }] : []),
      ],
    });
  }

  public async isRssFileEmpty(): Promise<boolean> {
    try {
      Logger.info('Checking if RSS file is empty');
      return (
        (await this.fileManager.readFileContent(this.filePath)).length === 0
      );
    } catch (error: unknown) {
      Logger.error(
        `Error checking if RSS file is empty: ${(error as Error).message}`,
      );
      return true;
    }
  }

  public async determineIfFeedNeedsUpdate(): Promise<boolean> {
    try {
      Logger.info('Checking if feed data needs further processing');
      await this.fileManager.ensureDirectory(this.directory);
      await this.fileManager.ensureFile(this.filePath);

      const fileContent = await this.fileManager.readFileContent(this.filePath);
      const fileLinks = this.parser.extractLinks(fileContent);
      const newLinks = this.parser.extractLinks(this.feed.rss2());

      return this.hasNewItems(fileLinks, newLinks);
    } catch (error: unknown) {
      Logger.error(`Error processing feeds:, ${(error as Error).message}`);
      return false;
    }
  }

  private hasNewItems(oldItems: Set<string>, newItems: Set<string>): boolean {
    Logger.info('Validating if new items are present');
    for (const item of newItems) {
      if (!oldItems.has(item)) {
        return true;
      }
    }
    return false;
  }

  public async saveFeed(): Promise<void> {
    try {
      Logger.info('Saving acquired feed data to codex');
      await this.fileManager.ensureDirectory(this.directory);
      await this.fileManager.ensureFile(this.filePath);

      await this.fileManager.writeFileContent(this.filePath, this.feed.rss2());
      Logger.info(`RSS feed updated at: ${this.filePath}`);
    } catch (error: unknown) {
      Logger.error(`Error saving feed: ${(error as Error).message}`);
      throw error;
    }
  }
}
