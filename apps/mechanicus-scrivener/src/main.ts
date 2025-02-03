import { type BlogPost, BlogPostService } from './blog-post-service';
import { CacheService } from './cache-service';
import { FeedGenerator } from './feed-generator';
import { MachineSpiritConduit } from './machine-spirit-conduit';

const SITE_URL =
  'https://www.warhammer-community.com/en-gb/setting/warhammer-40000/';
const OUTPUT_DIR = './docs';
const CACHE_FILE = 'summaries.json';
const RSS_FILE = 'rss.xml';

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
  try {
    if (!process.env.MACHINE_SPIRIT_API_KEY) {
      throw new Error(
        '⚠️ The Machine Spirit is displeased. An offering (API key) is required to proceed.',
      );
    }

    const machineSpiritConduit = new MachineSpiritConduit(
      process.env.MACHINE_SPIRIT_API_KEY,
    );
    const cacheService = new CacheService(OUTPUT_DIR, CACHE_FILE);
    const blogPostService = new BlogPostService();
    const feedGenerator = new FeedGenerator(SITE_URL);

    console.log(
      '[STATUS] The sacred cogitators are commencing the data collection rites',
    );
    const posts = await blogPostService.collectPosts();
    const cache = await cacheService.loadCache();

    const [postsToProcess, cachedPosts] = partitionPosts(posts, cache);

    console.log(
      `[STATUS] The Omnissiah has decreed the processing of ${postsToProcess.length} new articles...`,
    );

    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(5);

    await Promise.all([
      ...postsToProcess.map((post) =>
        limit(async () => {
          const sacredSummaryInvocation = `Invoke the Omnissiah's wisdom to summarize this Warhammer article: ${post.title} - ${post.url}`;
          const knowledgeOfTheMachineGod =
            await machineSpiritConduit.receiveWisdom(sacredSummaryInvocation);

          if (!cache[post.url]) {
            cache[post.url] = knowledgeOfTheMachineGod;
            feedGenerator.addPostToFeed(post, knowledgeOfTheMachineGod);
          }
        }),
      ),
      ...cachedPosts.map((post) =>
        limit(() => {
          console.log(
            `🔄 The Omnissiah's stored wisdom is being utilized for: ${post.title}`,
          );
          const cachedPost = cache[post.url];

          if (cachedPost) {
            feedGenerator.addPostToFeed(post, cachedPost);
          }
        }),
      ),
    ]);

    await cacheService.saveCache(cache);
    await feedGenerator.saveFeed(`${OUTPUT_DIR}/${RSS_FILE}`);

    console.log(
      '[STATUS] The sacred rites of data processing have been completed',
    );
  } catch (error: unknown) {
    console.error(
      '⚠️ We have failed to appease the Omnissiah:',
      (error as Error).message,
    );
  }
})().catch((error: unknown) => {
  console.error(
    '⚠️ The Omnissiah has saved us from a catastrophic error:',
    (error as Error).message,
  );
});
