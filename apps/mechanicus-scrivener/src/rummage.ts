import { Feed } from 'feed';
import {
  ensureDir,
  existsSync,
  readJSON,
  writeFile,
  writeJSON,
} from 'fs-extra';
import { OpenAI } from 'openai';
import { launch, type Browser, type Page } from 'puppeteer';

const OUTPUT_DIR = './docs';
const CACHE_FILE = `${OUTPUT_DIR}/summaries.json`;
const RSS_FILE = `${OUTPUT_DIR}/rss.xml`;

const SITE_URL =
  'https://www.warhammer-community.com/en-gb/setting/warhammer-40000/';
const MODEL = 'gpt-4-turbo';

const machineSpiritConduit = new OpenAI({
  apiKey: process.env.MACHINE_SPIRIT_API_KEY,
});

interface BlogPost {
  title: string;
  url: string;
  image: string;
  category: string;
  date: string | null;
}

export class RummageService {
  private async loadCache(): Promise<Record<string, string>> {
    try {
      if (existsSync(CACHE_FILE)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- safe to assume JSON
        return await readJSON(CACHE_FILE);
      }
    } catch (error) {
      console.error('⚠ Error loading cache:', error);
    }
    return {};
  }

  private async saveCache(cache: Record<string, string>): Promise<void> {
    try {
      await ensureDir(OUTPUT_DIR);
      await writeJSON(CACHE_FILE, cache, { spaces: 2 });
    } catch (error) {
      console.error('⚠ Error saving cache:', error);
    }
  }

  private async generateAISummary(post: BlogPost): Promise<string> {
    if (!post.date) {
      return '⚠ Missing date for article. Machine Spirit cannot proceed.';
    }

    const cache = await this.loadCache();

    if (cache[post.url]) {
      console.log(`🔄 Using cached summary for: ${post.title}`);
      const cachedPost = cache[post.url];

      if (cachedPost) {
        return cachedPost;
      }
    }

    console.log(`🤖 Summoning Machine Spirit for: ${post.title}`);

    const machineSpiritSystemPrompt =
      process.env.SYSTEM_PROMPT ??
      'You are a to deliver a summary of a news article in 1-2 sentences.';

    try {
      const response = await machineSpiritConduit.chat.completions.create({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: machineSpiritSystemPrompt,
          },
          {
            role: 'user',
            content: `Summarize this Warhammer news article: ${post.title} - ${post.url}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      const summary =
        response.choices[0]?.message?.content ??
        '⚠ Machine Spirit failed to generate a summary.';

      cache[post.url] = summary;
      await this.saveCache(cache);

      return summary;
    } catch (error) {
      console.error('❌ Machine Spirit Summarization Failed:', error);
      return '⚠ Machine Spirit error: Unable to generate summary. Chaos threatens the data.';
    }
  }

  private async launchBrowser(): Promise<Browser> {
    try {
      return await launch({ headless: true, args: ['--no-sandbox'] });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ❌ Error launching browser:`,
        error,
      );
      throw new Error('Could not launch the browser');
    }
  }

  private async getPosts(page: Page): Promise<BlogPost[]> {
    try {
      return await page.evaluate(() => {
        const queryTimeFromBlogPostElement = (el: Element): string | null => {
          const timeEl = el.querySelectorAll('time');

          const months = [
            'jan',
            'feb',
            'mar',
            'apr',
            'may',
            'jun',
            'jul',
            'aug',
            'sep',
            'oct',
            'nov',
            'dec',
          ];

          if (timeEl.length === 0) {
            console.warn('⚠ Unable to find date for post:', el.textContent);
            return null;
          }

          const timeElArray = Array.from(timeEl);
          const foundDate = timeElArray.find((element) =>
            months.some((month) =>
              element.textContent?.toLowerCase().includes(month),
            ),
          );

          if (foundDate?.textContent) {
            return foundDate.textContent.trim();
          }

          console.warn('⚠ Unable to find date for post:', foundDate);

          return null;
        };

        return Array.from(
          document.querySelectorAll('.shared-newsGridThree li.column'),
        ).map((el) => {
          const capturedTitle = el
            .querySelector('h3.newsCard-title-sm')
            ?.textContent?.trim();
          const capturedUrl = el
            .querySelector('.btn-cover')
            ?.getAttribute('href');
          const capturedImage = el
            .querySelector('figure img')
            ?.getAttribute('src');
          const capturedCategory =
            el.querySelector('.btn-topic span')?.textContent;
          const capturedDate = queryTimeFromBlogPostElement(el);

          return {
            title: capturedTitle ?? 'Unknown Title',
            url: new URL(capturedUrl ?? '', window.location.origin).href,
            image: capturedImage ?? '',
            category: capturedCategory ?? 'Unknown Category',
            date: capturedDate,
          };
        });
      });
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ❌ Error extracting posts:`,
        error,
      );
      return [];
    }
  }

  public async collectPosts(): Promise<BlogPost[]> {
    console.log(
      `[${new Date().toISOString()}] 🔍 Initiating Data Retrieval...`,
    );

    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
      );

      console.time('Collection Time');
      await page.goto(SITE_URL, { waitUntil: 'networkidle2' });

      console.log(
        `[${new Date().toISOString()}] 📜 Extracting sacred knowledge...`,
      );
      const posts = await this.getPosts(page);
      console.timeEnd('Collection Time');

      return posts;
    } finally {
      await browser.close();
    }
  }

  public async generateRSS(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] ⚙️ Generating RSS feed...`);

      const posts = await this.collectPosts();
      if (!posts.length) {
        console.warn(`[${new Date().toISOString()}] ⚠ No data extracted.`);
        return;
      }

      const feed = new Feed({
        title: 'Warhammer Community RSS Feed',
        description: 'Latest intelligence reports from the Warhammer Community',
        id: SITE_URL,
        link: SITE_URL,
        language: 'en',
        updated: new Date(),
        copyright: 'Games Workshop',
      });

      const cache = await this.loadCache();
      const postsToProcess = posts.filter((post) => !cache[post.url]);

      console.log(
        `🔄 Processing ${postsToProcess.length} new articles with AI summaries...`,
      );

      const batchSize = 5;
      for (let i = 0; i < postsToProcess.length; i += batchSize) {
        const batch = postsToProcess.slice(i, i + batchSize);

        const aiSummaries = await Promise.allSettled(
          batch.map((post) => this.generateAISummary(post)),
        );

        aiSummaries.forEach((result, index) => {
          const post = batch[index];
          if (!post) return;
          if (result.status === 'fulfilled') {
            cache[post.url] = result.value;
          } else {
            console.warn(`⚠ AI failed for: ${post.title}`, result.reason);
            cache[post.url] = '⚠ AI error: Unable to generate summary.';
          }
        });

        await this.saveCache(cache);
      }

      posts.forEach((post) => {
        const aiSummary = cache[post.url];

        if (!post.date) {
          console.warn(`⚠ Missing date for: ${post.title}`);
          return;
        }

        const parsedDate = new Date(
          `20${post.date.slice(-2)}-${post.date.slice(3, 6)}-${post.date.slice(0, 2)}`,
        );

        feed.addItem({
          title: post.title,
          id: post.url,
          link: post.url,
          description: aiSummary,
          date: parsedDate,
          image: post.image,
        });
      });

      await ensureDir(OUTPUT_DIR);
      await writeFile(RSS_FILE, feed.rss2(), 'utf-8');

      console.log(
        `[${new Date().toISOString()}] ✅ *Machine Spirit-enhanced RSS feed updated at:* ${RSS_FILE}`,
      );
    } catch (error) {
      console.error(
        `❌ Error generating Machine Spirit-enhanced RSS feed:`,
        error,
      );
    }
  }
}
