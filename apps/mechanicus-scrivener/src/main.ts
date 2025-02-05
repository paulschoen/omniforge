import { config } from './config';
import { FeedGenerator } from './feed-generator';
import { Logger } from './logger';
import { WarComApiClient } from './war-com-api-client';

const logger = new Logger();

(async () => {
  logger.logInfo(
    '+++ THE FLESH IS WEAK. THE MACHINE IS ETERNAL. PRAISE THE OMNISSIAH +++',
  );

  try {
    const warComApiClient = new WarComApiClient();
    const feedGenerator = new FeedGenerator({
      rssFile: config.RSS_FILE,
      directory: config.OUTPUT_DIR,
    });

    logger.logInfo(
      'The sacred cogitators are commencing the data collection rites',
    );

    const response = await warComApiClient.fetchNews({
      sortBy: 'date_desc',
      category: '',
      collections: ['articles', 'videos'],
      game_systems: [],
      index: 'news',
      locale: 'en-us',
      page: 0,
      perPage: 24,
      topics: [],
    });

    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(5);

    await Promise.all([
      response.news.map((post) =>
        limit(() => {
          feedGenerator.addPostToFeed(post);
        }),
      ),
    ]);

    const shouldUpdate = await feedGenerator.determineIfFeedNeedsUpdate();

    logger.logInfo(
      `The Omnissiah has decreed that the feed ${
        shouldUpdate ? 'needs' : 'does not need'
      } updating`,
    );

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
    throw new Error((error as Error).message);
  }
})().catch((error: unknown) => {
  logger.logError(
    'The Omnissiah has saved us from a catastrophic error:',
    (error as Error).message,
  );
  throw new Error((error as Error).message);
});
