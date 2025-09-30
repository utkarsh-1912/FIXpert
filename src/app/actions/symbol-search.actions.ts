
'use server';

import { cache } from 'react';
import yahooFinance from 'yahoo-finance2';

export const searchQuotes = cache(async (query: string) => {
    try {
        const result = await yahooFinance.search(query, {
            quotesCount: 20,
            newsCount: 0,
        });
        return result.quotes;
    } catch (error) {
        console.error('Yahoo Finance API search error:', error);
        return [];
    }
});


export const getQuote = cache(async (symbol: string) => {
    let quote, news, history, summary;

    try {
        quote = await yahooFinance.quote(symbol, {
            fields: [
                'symbol', 'longName', 'shortName', 'regularMarketPrice', 'regularMarketChange',
                'regularMarketChangePercent', 'regularMarketOpen', 'regularMarketDayHigh',
                'regularMarketDayLow', 'regularMarketPreviousClose', 'marketCap', 'regularMarketVolume',
                'fiftyTwoWeekHigh', 'fiftyTwoWeekLow', 'averageDailyVolume3Month', 'trailingPE',
                'forwardPE', 'epsTrailingTwelveMonths', 'earningsTimestamp', 'quoteType',
                'marketState', 'exchange', 'fullExchangeName',
            ]
        });
    } catch (error) {
        console.error(`Yahoo Finance API quote() error for ${symbol}:`, error);
        // If the main quote fails, we can't proceed.
        return null;
    }

    try {
        const newsResult = await yahooFinance.search(symbol, { newsCount: 10 });
        news = newsResult.news;
    } catch (error) {
        console.error(`Yahoo Finance API search() for news error for ${symbol}:`, error);
        news = [];
    }

    try {
        const historyResult = await yahooFinance.chart(symbol, {
            period1: '1y',
            interval: '1d'
        });
        history = historyResult.quotes;
    } catch (error) {
        console.error(`Yahoo Finance API chart() error for ${symbol}:`, error);
        history = [];
    }
    
    try {
        const summaryResult = await yahooFinance._quoteSummary(symbol, {
           modules: ["assetProfile"]
        });
        summary = summaryResult.assetProfile;
    } catch (error) {
        console.error(`Yahoo Finance API _quoteSummary() error for ${symbol}:`, error);
        summary = null;
    }

    return {
        quote,
        news,
        history,
        summary,
    };
});


export const getTrendingNews = cache(async () => {
    try {
        // Search for a broad topic to get general financial news
        const result = await yahooFinance.search('finance', {
            newsCount: 10,
            quotesCount: 0,
        });
        return result.news;
    } catch (error) {
        console.error('Yahoo Finance API getTrendingNews error:', error);
        return [];
    }
});
