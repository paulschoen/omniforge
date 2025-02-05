import { launch, type Page } from 'puppeteer';
import { config } from './config';
import { Logger } from './logger';

interface BlogPost {
  title: string;
  url: string;
  image: string;
  category: string;
  date: string | null;
}

class BlogPostService {
  private siteUrl = config.SITE_URL;
  private logger = new Logger();
  private async launchBrowser() {
    try {
      return await launch({ headless: true, args: ['--no-sandbox'] });
    } catch (error: unknown) {
      this.logger.logError(
        `Error launching browser:`,
        (error as Error).message,
      );
      throw new Error('Could not launch the browser');
    }
  }

  private async extractPosts(page: Page): Promise<BlogPost[]> {
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
            this.logger.logWarning(
              `Unable to find date for post: ${el.textContent}`,
            );
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

          this.logger.logWarning(`Unable to find date for post: ${foundDate}`);

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
    } catch (error: unknown) {
      this.logger.logError(
        `Error extracting posts from page:`,
        (error as Error).message,
      );
      return [];
    }
  }

  public async collectPosts(): Promise<BlogPost[]> {
    this.logger.logInfo('Initiating holy knowledge collection process...');
    const browser = await this.launchBrowser();
    const page = await browser.newPage();

    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36',
    );

    try {
      await page.goto(this.siteUrl, { waitUntil: 'networkidle2' });
      return await this.extractPosts(page);
    } finally {
      await browser.close();
    }
  }
}

export { BlogPostService, type BlogPost };
