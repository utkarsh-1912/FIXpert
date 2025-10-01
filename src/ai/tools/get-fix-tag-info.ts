'use server';
/**
 * @fileOverview A tool for fetching information about a FIX protocol tag.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import puppeteer from 'puppeteer';

const GetFixTagInfoSchema = z.object({
    tag: z.string().describe('The FIX tag number to look up.'),
});

export const getFixTagInfo = ai.defineTool(
  {
    name: 'getFixTagInfo',
    description: 'Get information about a specific FIX protocol tag, such as its name. Use the OnixS online FIX dictionary as the source.',
    inputSchema: GetFixTagInfoSchema,
    outputSchema: z.string(),
  },
  async ({ tag }) => {
    let browser = null;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      
      // Using OnixS FIX 4.2 dictionary, as it's a common version.
      const url = `https://www.onixs.biz/fix-dictionary/4.2/tag/${tag}.html`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const tagName = await page.evaluate(() => {
        const titleElement = document.querySelector('h1.page-header');
        if (!titleElement) return null;
        // The title is usually in the format "FIX Tag=[TagName] (NN)"
        const match = titleElement.textContent?.match(/Tag=([A-Za-z]+)/);
        return match ? match[1] : null;
      });
      
      if (!tagName) {
        return `Could not find information for FIX tag ${tag}.`;
      }

      return `The name for FIX tag ${tag} is ${tagName}.`;

    } catch (error) {
      console.error(`Error scraping FIX tag info for tag ${tag}:`, error);
      return `An error occurred while trying to fetch information for FIX tag ${tag}.`;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
);
