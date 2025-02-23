import { WarComApiClient } from '@omniforge/data-access';
import { Logger } from '@omniforge/utils';
import { config } from './config';
import { FeedGenerator } from './feed-generator';

export const fetchWarComData = async () => {
  Logger.info(
    'THE FLESH IS WEAK. THE MACHINE IS ETERNAL. PRAISE THE OMNISSIAH!',
  );

  try {
    const warComApiClient = new WarComApiClient();
    const feedGenerator = new FeedGenerator({
      rssFile: config.RSS_FILE,
      directory: config.OUTPUT_DIR,
    });

    Logger.info(
      'The sacred cogitators are commencing the data collection rites',
    );

    const response = await warComApiClient.fetchNews({
      sortBy: 'date_desc',
      category: '',
      collections: ['articles', 'videos'],
      game_systems: [],
      index: 'news',
      locale: 'en-gb',
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

    Logger.info(
      `The Omnissiah has decreed that the feed ${
        shouldUpdate ? 'needs' : 'does not need'
      } updating`,
    );

    if (!shouldUpdate) {
      Logger.info('The sacred rites of data processing have been completed');
      return;
    }

    await feedGenerator.saveFeed();

    Logger.info('The sacred rites of data processing have been completed');
  } catch (error: unknown) {
    Logger.error(
      `We have failed to appease the Omnissiah: ${(error as Error).message}`,
    );
    throw new Error((error as Error).message);
  }
};
