
'use server';

import { cache } from 'react';
import yahooFinance from 'yahoo-finance2';
import { subDays, format } from 'date-fns';
import type { Quote } from 'yahoo-finance2/dist/esm/src/modules/quote';

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

type Period = '1d' | '5d' | '1m' | '6m' | '1y' | 'all';

export const getQuote = cache(async (symbol: string, period: Period = '1y') => {
    let quote, news, history, summary;
    let recommendations: Quote[] = [];
    const encodedSymbol = encodeURIComponent(symbol);

    try {
        quote = await yahooFinance.quote(encodedSymbol, {
            fields: [
                'symbol', 'longName', 'shortName', 'regularMarketPrice', 'regularMarketChange',
                'regularMarketChangePercent', 'regularMarketOpen', 'regularMarketDayHigh',
                'regularMarketDayLow', 'regularMarketPreviousClose', 'marketCap', 'regularMarketVolume',
                'fiftyTwoWeekHigh', 'fiftyTwoWeekLow', 'averageDailyVolume3Month', 'trailingPE',
                'forwardPE', 'epsTrailingTwelveMonths', 'earningsTimestamp', 'quoteType',
                'marketState', 'exchange', 'fullExchangeName', 'currency', 'firstTradeDateMilliseconds'
            ]
        });
    } catch (error) {
        console.error(`Yahoo Finance API quote() error for ${symbol}:`, error);
        // If the main quote fails, we can't proceed.
        return null;
    }

    try {
        const newsResult = await yahooFinance.search(encodedSymbol, { newsCount: 10 });
        news = newsResult.news;
    } catch (error) {
        console.error(`Yahoo Finance API search() for news error for ${symbol}:`, error);
        news = [];
    }

    try {
        let period1: string | Date = '1y'; // Default
        let interval: string = '1d';

        const now = new Date();
        switch (period) {
            case '1d':
                period1 = subDays(now, 2); // A bit more than 1 day to ensure data
                interval = '15m';
                break;
            case '5d':
                period1 = subDays(now, 5);
                interval = '1d';
                break;
            case '1m':
                period1 = subDays(now, 30);
                interval = '1d';
                break;
            case '6m':
                period1 = subDays(now, 180);
                interval = '1d';
                break;
            case '1y':
                period1 = subDays(now, 365);
                interval = '1d';
                break;
            case 'all':
                period1 = 'max';
                interval = '1mo';
                break;
        }

        const historyResult = await yahooFinance.chart(encodedSymbol, {
            period1: period === 'all' ? 'max' : format(period1 as Date, 'yyyy-MM-dd'),
            interval: interval
        });
        history = historyResult.quotes;
    } catch (error) {
        console.error(`Yahoo Finance API chart() error for ${symbol}:`, error);
        history = [];
    }
    
    try {
        const summaryResult = await yahooFinance._quoteSummary(encodedSymbol, {
           modules: ["assetProfile", "summaryDetail"]
        });
        summary = summaryResult;
    } catch (error) {
        console.error(`Yahoo Finance API _quoteSummary() error for ${symbol}:`, error);
        summary = null;
    }
    
    try {
        const recommendationsResult = await yahooFinance.recommendationsBySymbol(encodedSymbol);
        const recommendedSymbols = recommendationsResult.quotes?.map(q => q.symbol) ?? [];

        if (recommendedSymbols.length > 0) {
            recommendations = await yahooFinance.quote(recommendedSymbols);
        } else if (summary?.assetProfile?.sector) {
            // Fallback to sector search
            const sectorSearch = await yahooFinance.search(summary.assetProfile.sector, { quotesCount: 5 });
            const sectorSymbols = sectorSearch.quotes?.filter(q => q.symbol !== symbol).map(q => q.symbol) ?? [];
            if (sectorSymbols.length > 0) {
                recommendations = await yahooFinance.quote(sectorSymbols);
            }
        }
    } catch (error) {
        console.error(`Yahoo Finance API recommendations or quote fetch error for ${symbol}:`, error);
        recommendations = [];
    }


    return {
        quote,
        news,
        history,
        summary,
        recommendations,
    };
});


export const getTrendingNews = cache(async () => {
    try {
        // Search for a broad topic to get general financial news
        const result = await yahooFinance.search('finance', {
            newsCount: 10,
            quotesCount: 0,
        });
        return result.news.map(item => ({
            ...item,
            // Ensure timestamp is in milliseconds for date formatting
            providerPublishTime: item.providerPublishTime,
        }));
    } catch (error) {
        console.error('Yahoo Finance API getTrendingNews error:', error);
        return [];
    }
});
