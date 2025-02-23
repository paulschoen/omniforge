/* eslint-disable @typescript-eslint/no-unsafe-member-access -- Using unsafe member access for testing */
import { Feed, type Item } from 'feed';
import { type NewsArticle } from '@omniforge/data-access';
import { Logger, RSSParser } from '@omniforge/utils';
import { FileManager } from './file-manager';

interface FeedGeneratorProps {
  baseUrl?: string;
  assetUrl?: string;
  rssFile?: string;
  directory?: string;
  title?: string;
  description?: string;
  language?: string;
  copyright?: string;
}

const DEFAULT_BASE_URL = 'https://www.warhammer-community.com/en-gb';

export class FeedGenerator {
  private parser = new RSSParser();
  private fileManager = new FileManager();
  private baseUrl = DEFAULT_BASE_URL;
  private assetUrl = 'https://assets.warhammer-community.com';

  private feed: Feed;
  private directory: string;
  private filePath: string;

  constructor({
    rssFile,
    directory = './docs',
    baseUrl = DEFAULT_BASE_URL,
    assetUrl = 'https://assets.warhammer-community.com',
    title = 'Warhammer 40k Community RSS Feed',
    description = 'Latest intelligence reports from the Warhammer Community',
    language = 'en',
    copyright = 'Games Workshop',
  }: FeedGeneratorProps) {
    this.feed = new Feed({
      title,
      description,
      id: baseUrl,
      link: baseUrl,
      language,
      copyright,
    });

    this.baseUrl = baseUrl;
    this.assetUrl = assetUrl;
    this.directory = directory;
    this.filePath = `${directory}/${rssFile}`;
  }

  public addItemToFeed(item: Item): this {
    this.feed.addItem(item);
    return this;
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

  public async determineIfFeedNeedsUpdate(links?: string[]): Promise<boolean> {
    try {
      Logger.info('Checking if feed data needs further processing');
      await this.fileManager.ensureDirectory(this.directory);
      await this.fileManager.ensureFile(this.filePath);

      const fileContent = await this.fileManager.readFileContent(this.filePath);
      const fileLinks = this.parser.extractLinks(fileContent);
      const newLinks = links
        ? links
        : this.parser.extractLinks(this.feed.rss2());

      return this.hasNewItems(fileLinks, newLinks);
    } catch (error: unknown) {
      Logger.error(`Error processing feeds:, ${(error as Error).message}`);
      return false;
    }
  }

  private hasNewItems(
    oldItems: Set<string>,
    newItems: Set<string> | string[],
  ): boolean {
    Logger.info('Validating if new items are present');
    for (const item of newItems) {
      if (!oldItems.has(item)) {
        return true;
      }
    }
    return false;
  }

  public async loadFeed(): Promise<this> {
    try {
      Logger.info('Loading feed data from codex');
      await this.fileManager.ensureDirectory(this.directory);
      await this.fileManager.ensureFile(this.filePath);

      const pastFeed = await this.fileManager.readFileContent(this.filePath);

      const mostRecentItems = this.parser.extractItemsFromXml(pastFeed);

      const convertMostRecentItems = Array.from(mostRecentItems).map(
        (item) => ({
          title: item?.title as string,
          id: item?.guid as string,
          content: item['content:encoded'] as string,
          description: item?.description as string,
          link: item?.link as string,
          date: new Date(item?.pubDate as string),
        }),
      );

      convertMostRecentItems.forEach((item) => {
        this.feed.addItem(item);
      });

      return this;
    } catch (error: unknown) {
      Logger.error(`Error loading feed: ${(error as Error).message}`);
      throw error;
    }
  }

  public get items(): Item[] {
    return this.feed.items;
  }

  public async saveFeed(): Promise<FeedGenerator> {
    try {
      Logger.info('Saving acquired feed data to codex');
      await this.fileManager.ensureDirectory(this.directory);
      await this.fileManager.ensureFile(this.filePath);

      await this.fileManager.writeFileContent(this.filePath, this.feed.rss2());
      Logger.info(`RSS feed updated at: ${this.filePath}`);

      return this;
    } catch (error: unknown) {
      Logger.error(`Error saving feed: ${(error as Error).message}`);
      throw error;
    }
  }
}
