'use server';

import yahooFinance from 'yahoo-finance2';

export async function searchQuotes(query: string) {
    try {
        const result = await yahooFinance.search(query, {
            quotesCount: 20,
            newsCount: 0,
        });
        return result.quotes;
    } catch (error) {
        console.error('Yahoo Finance API error:', error);
        return [];
    }
}
