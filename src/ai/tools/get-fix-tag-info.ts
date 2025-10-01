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

const scrapeOnixs = async (page: any, tag: string): Promise<string | null> => {
    const url = `https://www.onixs.biz/fix-dictionary/4.2/tag/${tag}.html`;
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const tagInfo = await page.evaluate(() => {
        const titleElement = document.querySelector('h1.page-header');
        if (!titleElement || titleElement.textContent?.includes('Tag Not Found')) {
            return null;
        }

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
        return null;
    }

    let response = `Tag ${tag} is ${tagInfo.name}. Description: ${tagInfo.description}`;
    
    if (tagInfo.values && tagInfo.values.length > 0) {
        response += `\n\nPossible values include:\n` + tagInfo.values.map(v => `- ${v.value}: ${v.meaning}`).join('\n');
    }

    return response;
};

const searchWeb = async (page: any, tag: string): Promise<string | null> => {
    const query = `FIX protocol tag ${tag} meaning`;
    await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`, { waitUntil: 'domcontentloaded' });
    
    // This is a simplified approach; robust scraping is complex.
    // We're looking for the description snippet from the search results.
    const searchResult = await page.evaluate(() => {
        // Look for common patterns in search results for definitions.
        const descriptionElement = document.querySelector('.BNeawe .s3v9rd, .BNeawe .AP7Wnd');
        return descriptionElement ? descriptionElement.textContent : null;
    });

    if (searchResult) {
        return `According to a web search, here is information for FIX tag ${tag}: ${searchResult}`;
    }
    
    return null;
}

export const getFixTagInfo = ai.defineTool(
  {
    name: 'getFixTagInfo',
    description: 'Get information about a specific FIX protocol tag, such as its name, description, and possible values. It first consults the OnixS online FIX dictionary, and if that fails, it performs a general web search.',
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

      // 1. Try OnixS first
      const onixsResult = await scrapeOnixs(page, tag);
      if (onixsResult) {
        return onixsResult;
      }
      
      // 2. If OnixS fails, try a general web search
      const webSearchResult = await searchWeb(page, tag);
      if(webSearchResult) {
          return webSearchResult;
      }

      // 3. If both fail
      return `Could not find information for FIX tag ${tag}. Please ask the user to verify the tag number.`;

    } catch (error) {
      console.error(`Error in getFixTagInfo for tag ${tag}:`, error);
      return `An error occurred while trying to fetch information for FIX tag ${tag}. The websites may be unavailable. Please ask the user to try again later.`;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
);

// Export the schema for use in other parts of the application
export { GetFixTagInfoSchema };
