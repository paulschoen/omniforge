import { Logger } from '@omniforge/utils';
import { fetchAuspexData } from './auspex-collection';
import { fetchWarComData } from './war-com-collection';

const communeWithDataVaults = async () => {
  try {
    await Promise.all([fetchAuspexData(), fetchWarComData()]);
    Logger.info(
      'The data streams have been successfully integrated and sanctified.',
    );
  } catch (error) {
    const errorMessage = `We have failed to appease the Omnissiah: ${(error as Error).message}`;
    Logger.error(errorMessage);
    throw new Error(errorMessage);
  }
};

(async () => {
  await communeWithDataVaults();
})().catch((error: unknown) => {
  Logger.error(`An error occurred during the data collection: ${error}`);
});
