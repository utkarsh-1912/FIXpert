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

type FixTagInfo = {
    name: string;
    description: string;
    values?: { value: string; meaning: string }[];
}

export const getFixTagInfo = ai.defineTool(
  {
    name: 'getFixTagInfo',
    description: 'Get information about a specific FIX protocol tag, such as its name, description, and possible values. Use the OnixS online FIX dictionary as the source.',
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
      
      const url = `https://www.onixs.biz/fix-dictionary/4.2/tag/${tag}.html`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      const tagInfo = await page.evaluate(() => {
        const titleElement = document.querySelector('h1.page-header');
        const tagNameMatch = titleElement?.textContent?.match(/Tag=([A-Za-z]+)/);
        if (!tagNameMatch) return null;

        const info: FixTagInfo = {
            name: tagNameMatch[1],
            description: '',
        };
        
        const rows = Array.from(document.querySelectorAll('table.table-bordered tr'));
        
        const descriptionRow = rows.find(row => row.querySelector('td')?.textContent?.trim() === 'Description');
        info.description = descriptionRow?.querySelectorAll('td')[1]?.textContent?.trim() || 'No description found.';

        const valuesTable = document.querySelector('h3#values + div.table-responsive table');
        if (valuesTable) {
            info.values = Array.from(valuesTable.querySelectorAll('tbody tr')).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    value: cells[0]?.textContent?.trim() ?? '',
                    meaning: cells[1]?.textContent?.trim() ?? ''
                }
            });
        }
        
        return info;
      });
      
      if (!tagInfo) {
        return `Could not find information for FIX tag ${tag}. Please ensure it's a valid tag number for FIX 4.2.`;
      }

      let response = `Tag ${tag} is ${tagInfo.name}. Description: ${tagInfo.description}`;
      
      if (tagInfo.values && tagInfo.values.length > 0) {
          response += `\n\nPossible values include:\n` + tagInfo.values.map(v => `- ${v.value}: ${v.meaning}`).join('\n');
      }

      return response;

    } catch (error) {
      console.error(`Error scraping FIX tag info for tag ${tag}:`, error);
      return `An error occurred while trying to fetch information for FIX tag ${tag}. The website may be unavailable.`;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
);
