import { type BlogPost, BlogPostService } from './blog-post-service';
import { CacheService } from './cache-service';
import { FeedGenerator } from './feed-generator';
import { Logger } from './logger';
import { MachineSpiritConduit } from './machine-spirit-conduit';

const SITE_URL =
  'https://www.warhammer-community.com/en-gb/setting/warhammer-40000/';
const OUTPUT_DIR = './docs';
const CACHE_FILE = 'summaries.json';
const RSS_FILE = 'rss.xml';

const logger = new Logger();

const partitionPosts = (
  posts: BlogPost[],
  cache: Record<string, string>,
): [BlogPost[], BlogPost[]] => {
  return posts.reduce<[BlogPost[], BlogPost[]]>(
    ([toProcess, cached], post) => {
      if (cache[post.url]) {
        cached.push(post);
      } else {
        toProcess.push(post);
      }
      return [toProcess, cached];
    },
    [[], []],
  );
};

(async () => {
  logger.logInfo(
    '++++ THE FLESH IS WEAK. THE MACHINE IS ETERNAL. PRAISE THE OMNISSIAH ++++',
  );

  try {
    if (!process.env.MACHINE_SPIRIT_API_KEY) {
      throw new Error(
        '⚠️ The Machine Spirit is displeased. An offering (API key) is required to proceed.',
      );
    }

    const machineSpiritConduit = new MachineSpiritConduit(
      process.env.MACHINE_SPIRIT_API_KEY,
    );
    const cacheService = await new CacheService(
      OUTPUT_DIR,
      CACHE_FILE,
    ).loadCache();
    const blogPostService = new BlogPostService();
    const feedGenerator = new FeedGenerator({
      siteUrl: SITE_URL,
      rssFile: RSS_FILE,
      directory: OUTPUT_DIR,
    });

    logger.logInfo(
      'The sacred cogitators are commencing the data collection rites',
    );
    const posts = await blogPostService.collectPosts();

    const [postsToProcess, cachedPosts] = partitionPosts(
      posts,
      cacheService.getCache(),
    );

    logger.logInfo(
      `The Omnissiah has decreed the processing of ${postsToProcess.length} new articles...`,
    );

    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(5);

    await Promise.all([
      ...postsToProcess.map((post) =>
        limit(async () => {
          const sacredSummaryInvocation = `Invoke the Omnissiah's wisdom to summarize this Warhammer article in a single sentence: ${post.title} - ${post.url}`;
          const knowledgeOfTheMachineGod =
            await machineSpiritConduit.receiveWisdom(sacredSummaryInvocation);

          if (!cacheService.getCacheRecord(post.url)) {
            cacheService.updateCacheRecord(post.url, knowledgeOfTheMachineGod);
            feedGenerator.addPostToFeed(post, knowledgeOfTheMachineGod);
          }
        }),
      ),
      ...cachedPosts.map((post) =>
        limit(() => {
          logger.logInfo(
            `🔄 The Machine Spirit's stored wisdom is being utilized for: ${post.title}`,
          );
          const cachedPost = cacheService.getCacheRecord(post.url);

          if (cachedPost) {
            feedGenerator.addPostToFeed(post, cachedPost);
          }
        }),
      ),
    ]);

    const shouldUpdate = await feedGenerator.determineIfFeedNeedsUpdate();

    logger.logInfo(
      `The Omnissiah has decreed that the feed ${
        shouldUpdate ? 'needs' : 'does not need'
      } updating`,
    );

    await cacheService.cleanCache(posts).saveCache();

    if (!shouldUpdate) {
      logger.logInfo('The sacred rites of data processing have been completed');
      return;
    }

    await feedGenerator.saveFeed();

    logger.logInfo('The sacred rites of data processing have been completed');
  } catch (error: unknown) {
    logger.logError(
      'We have failed to appease the Omnissiah:',
      (error as Error).message,
    );
  }
})().catch((error: unknown) => {
  logger.logError(
    'The Omnissiah has saved us from a catastrophic error:',
    (error as Error).message,
  );
});
