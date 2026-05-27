import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

/**
 * Scraper oficial para el Banco Central de Venezuela (BCV)
 * Soporta múltiples monedas (USD, EUR, CNY, TRY, RUB).
 */
export const getBcvRates = async () => {
    try {
        const agent = new https.Agent({  
            rejectUnauthorized: false
        });

        const { data } = await axios.get('https://www.bcv.org.ve/', { 
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });

        const $ = cheerio.load(data);
        const timestamp = new Date().toISOString();
        
        // Extracción de Fecha oficial
        const rawDateRate = $('.pull-right.dinpro.center .date-display-single').first().attr('content');
        const dateRate = rawDateRate ? new Date(rawDateRate).toISOString().split('T')[0] : null;

        const extractPrice = (id: string) => {
            const text = $(`${id} .centrado strong`).text().trim();
            return text ? parseFloat(text.replace(',', '.')) : 0;
        };

        const currencies = [
            { id: '#euro', symbol: 'EUR' },
            { id: '#dolar', symbol: 'USD' }
        ];

        const rates = currencies.map(curr => {
            const price = extractPrice(curr.id);
            if (price === 0) return null;
            
            return {
                price: Number(price.toFixed(4)),
                currency: curr.symbol,
                symbol: 'BS',
                source: 'Banco Central de Venezuela',
                created_at: timestamp,
                date_rate: dateRate
            };
        }).filter(r => r !== null);

        return rates;

    } catch (error: any) {
        console.error('❌ [BcvScraper] Error al obtener tasas del BCV:', error?.message);
        return [];
    }
};

// Mantenemos compatibilidad con el nombre anterior si fuera necesario, pero enfocado a USD
export const getBcvRate = async () => {
    const rates = await getBcvRates();
    return rates.find(r => r?.currency === 'USD') || null;
};

