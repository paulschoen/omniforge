// eslint-disable-next-line import/no-extraneous-dependencies -- This is a shared utility in the nx mono repo
import { XMLParser } from 'fast-xml-parser';
// eslint-disable-next-line import/no-extraneous-dependencies -- This is a shared utility in the nx mono repo
import { type Item } from 'feed';

export class RSSParser {
  private parser = new XMLParser();

  public convertXmlStringToJson(xml: string): Record<string, any> {
    return this.parser.parse(xml) as Record<string, any>;
  }

  public extractLinks(feed: string): Set<string> {
    const parsedFeed = this.parser.parse(feed) as {
      rss?: { channel?: { item?: Item[] } };
    };
    return new Set(
      parsedFeed.rss?.channel?.item?.map((item: Item) => item.link) ?? [],
    );
  }

  public extractItemsFromXml(xml: string): Set<Item> {
    const parsedFeed = this.parser.parse(xml) as {
      rss?: {
        channel?: {
          item?: {
            pubDate: string;
          }[];
        };
      };
    };

    const mostRecentItems =
      parsedFeed.rss?.channel?.item
        ?.sort(
          (a: { pubDate: string }, b: { pubDate: string }) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
        )
        .slice(0, 12) ?? [];

    return new Set(mostRecentItems as unknown as Item[]);
  }
}
