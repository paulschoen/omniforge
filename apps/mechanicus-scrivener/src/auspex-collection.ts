import { ClientType, Innertube } from 'youtubei.js';
import { HttpClient } from '@omniforge/data-access';
import { Logger, RSSParser } from '@omniforge/utils';
import { config } from './config';
import { FeedGenerator } from './feed-generator';
import { MachineSpiritConduit } from './machine-spirit-conduit';

const parser = new RSSParser();

interface Author {
  name: string;
  uri: string;
}

interface Entry {
  author: Author;
  content: string;
  id: string;
  link: string;
  published: string;
  title: string;
  updated: string;
  'yt:videoId': string;
}

export const fetchAuspexData = async () => {
  Logger.info(
    'THE FLESH IS WEAK. THE MACHINE IS ETERNAL. PRAISE THE OMNISSIAH!',
  );

  try {
    const auspexClient = new HttpClient('https://www.youtube.com/feeds');
    const feedGenerator = new FeedGenerator({
      rssFile: 'auspex.rss',
      directory: './docs',
      baseUrl:
        'https://www.youtube.com/feeds/videos.xml?channel_id=UC6Gco9PWxmJmJ5CqfbChuiQ',
      title: 'Auspex Tactics RSS Feed',
      description: 'Latest intelligence reports from the Auspex Tactics',
      copyright: 'Auspex Tactics',
    });
    const machineSpiritConduit = new MachineSpiritConduit(
      config.MACHINE_SPIRIT_API_KEY,
    );

    Logger.info(
      'The sacred cogitators are commencing the data collection rites',
    );

    const youtube = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false,
      client_type: ClientType.WEB,
    });

    const fetchTranscript = async (videoId: string): Promise<string[]> => {
      Logger.info(
        `Attempting to translate vox transmission transcription: ${videoId}`,
      );
      try {
        if (!videoId) {
          throw new Error('Invalid YouTube video URL');
        }

        const info = await youtube.getInfo(videoId);
        const transcriptData = await info.getTranscript();
        return transcriptData.transcript.content?.body?.initial_segments
          .map((segment) => segment.snippet.text)
          .filter(Boolean) as string[];
      } catch (error: unknown) {
        Logger.error(
          `Vox transmission failed to fetch transcript for video: ${videoId}`,
        );
        throw error;
      }
    };

    const videoFeedResponse = await auspexClient.get(
      '/videos.xml?channel_id=UC6Gco9PWxmJmJ5CqfbChuiQ',
    );
    const videoFeedXML = parser.convertXmlStringToJson(
      videoFeedResponse.data as string,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Trust me bro
    const videoFeedItems = videoFeedXML.feed?.entry;

    const { default: pLimit } = await import('p-limit');
    const limit = pLimit(6);

    await feedGenerator.loadFeed();

    const newItem = (videoFeedItems as Entry[]).filter(
      (entry) =>
        !feedGenerator.items.some(
          (item) =>
            item.link ===
            `https://www.youtube.com/watch?v=${entry['yt:videoId']}`,
        ),
    );
    const shouldUpdate = newItem.length > 0;

    if (!shouldUpdate) {
      Logger.warn('The Omnissiah has decreed that the feed is up to date');
      Logger.info('The sacred rites of data processing have been completed');
      return;
    }

    Logger.info('The Omnissiah has decreed that the feed must be updated');

    await Promise.all(
      newItem.map((entry) =>
        limit(async () => {
          const transcript = await fetchTranscript(entry['yt:videoId']);
          const prompt = `
          Summarize the following YouTube video transcript in a structured format for an RSS feed. The output should be HTML-formatted and structured for readability.

          Requirements:
          Summarize Key Points – Break down the video into structured bullet points using emojis, bold text, and concise descriptions.
          Highlight Numeric Insights – Extract and interpret key numerical data from video transcript.
          Provide Exploratory Questions – Generate three thought-provoking questions related to the video’s content to engage readers.
          Well-formed HTML (no external CSS/JS, inline formatting allowed)

          Example of an Output Format:
          <h2>📢 Title Of The Video Summery</h2>

          <h3>📝 Summary</h3>
          <ul>
            <li>🔥 <strong>Main Insight 1:</strong> Brief explanation of key point.</li>
            ...additional key points as needed
          </ul>

          <h3>📊 Important Numerical Insights</h3>
          <ul>
            <li>📉 <strong>Statistic 1:</strong> Explanation (e.g., "Sales increased by 25% in Q4").</li>
            ...additional numerical insights as needed
          </ul>

          <h3>❓ Questions to Consider</h3>
          <ul>
            <li>🤔 <strong>Question 1:</strong> Thought-provoking question.</li>
            ...additional questions as needed to engage readers
          </ul>
          
          Video Transcript:
          ${JSON.stringify(transcript, null, 2)}
          `;

          const wisdom = await machineSpiritConduit.receiveWisdom({
            maxTokens: 750,
            messages: [
              {
                role: 'system',
                content:
                  'You are an AI that summarizes YouTube videos into structured insights.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
          });
          const cleanedWisdom = wisdom
            .replace(/```html/g, '')
            .replace(/```/g, '');

          const excerptPrompt = `
          Summarize the following YouTube video transcript in a sentence.

          Video Summarization:
          ${cleanedWisdom}
          `;

          const summarizedWisdom = await machineSpiritConduit.receiveWisdom({
            maxTokens: 100,
            messages: [
              {
                role: 'system',
                content: 'You are an AI that summarizes YouTube videos.',
              },
              {
                role: 'user',
                content: excerptPrompt,
              },
            ],
          });

          feedGenerator.addItemToFeed({
            title: entry.title,
            id: entry.id,
            guid: entry.id,
            content: cleanedWisdom,
            description: summarizedWisdom,
            link: `https://www.youtube.com/watch?v=${entry['yt:videoId']}`,
            date: new Date(entry.published),
          });
        }),
      ),
    );

    await feedGenerator.saveFeed();

    Logger.info('The sacred rites of data processing have been completed');
  } catch (error: unknown) {
    Logger.error(
      `We have failed to appease the Omnissiah: ${(error as Error).message}`,
    );
    throw new Error((error as Error).message);
  }
};
