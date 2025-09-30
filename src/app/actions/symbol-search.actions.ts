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
        console.error('Yahoo Finance API search error:', error);
        return [];
    }
}


export async function getQuote(symbol: string) {
    try {
        const result = await yahooFinance.quote(symbol, {
            fields: [
                'symbol',
                'longName',
                'shortName',
                'regularMarketPrice',
                'regularMarketChange',
                'regularMarketChangePercent',
                'regularMarketOpen',
                'regularMarketDayHigh',
                'regularMarketDayLow',
                'regularMarketPreviousClose',
                'marketCap',
                'regularMarketVolume',
                'fiftyTwoWeekHigh',
                'fiftyTwoWeekLow',
                'averageDailyVolume3Month',
                'trailingPE',
                'forwardPE',
                'epsTrailingTwelveMonths',
                'earningsTimestamp',
                'quoteType',
                'marketState',
                'exchange',
                'fullExchangeName',
            ]
        });
        
        const news = await yahooFinance.search(symbol, { newsCount: 10 });
        
        const history = await yahooFinance.chart(symbol, {
            period1: '1y',
            interval: '1d'
        });

        // This is a separate call that gets the company profile/summary
        const summary = await yahooFinance._quoteSummary(symbol, {
           modules: ["assetProfile"]
        });

        return {
            quote: result,
            news: news.news,
            history: history.quotes,
            summary: summary.assetProfile,
        };

    } catch (error) {
        console.error(`Yahoo Finance API quote error for ${symbol}:`, error);
        // Return null or an error object to be handled by the frontend
        return null;
    }
}
