import { Feed } from 'feed';
import { ensureDir, writeFile } from 'fs-extra';
import { launch, type Browser, type Page } from 'puppeteer';

const SITE_URL =
  'https://www.warhammer-community.com/en-gb/setting/warhammer-40000/';
const OUTPUT_DIR = './docs';
const RSS_FILE = `${OUTPUT_DIR}/rss.xml`;

interface BlogPost {
  title: string;
  url: string;
  image: string;
  category: string;
  date: string;
}

export class RummageService {
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
        const queryTimeFromBlogPostElement = (el: Element): string => {
          const timeEl = el.querySelector('time');

          if (
            timeEl?.textContent
              ?.toLowerCase()
              .match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i)
          ) {
            return timeEl.textContent;
          }

          if (el.nextElementSibling) {
            return queryTimeFromBlogPostElement(el.nextElementSibling);
          }

          return 'Unknown Date';
        };

        return Array.from(document.querySelectorAll('li.column')).map((el) => {
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
        console.warn(
          `[${new Date().toISOString()}] ⚠ No data extracted. The Omnissiah has forsaken us.`,
        );
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

      posts.forEach((post) => {
        const parsedDate = new Date(
          `20${post.date.slice(-2)}-${post.date.slice(3, 6)}-${post.date.slice(0, 2)}`,
        );

        feed.addItem({
          title: post.title,
          id: post.url,
          link: post.url,
          description: post.title,
          date: parsedDate,
          image: post.image,
        });
      });

      await ensureDir(OUTPUT_DIR);
      await writeFile(RSS_FILE, feed.rss2(), 'utf-8');

      console.log(
        `[${new Date().toISOString()}] ✅ *Data sanctified!* RSS feed generated at: ${RSS_FILE}`,
      );
    } catch (error) {
      console.error(
        `[${new Date().toISOString()}] ❌ Error generating RSS feed:`,
        error,
      );
    }
  }
}
