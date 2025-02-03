import { Feed } from 'feed';
import { ensureDir, writeFile } from 'fs-extra';
import { type BlogPost } from './blog-post-service';

export class FeedGenerator {
  private feed: Feed;

  constructor(siteUrl: string) {
    this.feed = new Feed({
      title: 'Warhammer Community RSS Feed',
      description: 'Latest intelligence reports from the Warhammer Community',
      id: siteUrl,
      link: siteUrl,
      language: 'en',
      updated: new Date(),
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
    });
  }

  public async saveFeed(rssFile: string): Promise<void> {
    await ensureDir('./docs');
    await writeFile(rssFile, this.feed.rss2(), 'utf-8');
    console.log(`✅ RSS feed updated at: ${rssFile}`);
  }
}
