// --- api/cron-sync.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: true, message: "SUPABASE_URL o SUPABASE_KEY no definidos en Vercel." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const results = [];
    const timestamp = new Date().toISOString();

    try {
        // Desactivamos la validación TLS porque el certificado de bcv.org.ve usualmente expira o es inválido 🛡️
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        const bcvRes = await fetch('https://www.bcv.org.ve');
        const html = await bcvRes.text();
        const $ = cheerio.load(html);

        const extractPrice = (selector: string) => {
            const text = $(selector).text().trim();
            // Convertimos la coma en punto para parcearlo a Float javascript
            return text ? parseFloat(text.replace(',', '.')) : 0;
        };

        const eurPrice = extractPrice('#euro strong');
        const usdPrice = extractPrice('#dolar strong');
        // Extraer la fecha publicada en bcv.org.ve
        const rawDateRate = $('.date-display-single').first().attr('content');
        const dateRate = rawDateRate ? new Date(rawDateRate).toISOString() : null;

        const rows = [];
        const bcvSourceName = "Banco Central de Venezuela";

        if (eurPrice > 0) {
            rows.push({
                price: eurPrice,
                currency: 'EUR',
                source: bcvSourceName,
                created_at: timestamp,
                date_rate: dateRate
            });
        }

        if (usdPrice > 0) {
            rows.push({
                price: usdPrice,
                currency: 'USD',
                source: bcvSourceName,
                created_at: timestamp,
                date_rate: dateRate
            });
        }

        // --- Extracción de Binance P2P ---
        try {
            const binanceRes = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset: 'USDT',
                    fiat: 'VES',
                    merchantCheck: false,
                    page: 1,
                    payTypes: [],
                    publisherType: null,
                    rows: 5,
                    tradeType: 'BUY'
                })
            });
            const binanceData = await binanceRes.json();
            if (binanceData?.data && binanceData.data.length > 0) {
                // Fetch top 5 prices and calculate average to avoid outliers
                const prices = binanceData.data.map((i: any) => parseFloat(i.adv.price));
                const usdtPrice = prices.reduce((a: number, b: number) => a + b) / prices.length;

                rows.push({
                    price: Number(usdtPrice.toFixed(4)),
                    currency: 'USDT',
                    source: 'Binance P2P',
                    created_at: timestamp,
                    date_rate: new Date().toISOString() // Binance is real-time, logic date is now
                });
            }
        } catch (binanceErr: any) {
            results.push({ status: 'warning', message: "Error extrayendo Binance P2P: " + binanceErr.message });
        }

        if (rows.length > 0) {
            const { error } = await supabase.from('rates').upsert(rows, {
                onConflict: 'currency, source, created_at'
            });

            if (error) {
                results.push({ status: 'error', message: error.message });
            } else {
                results.push({ status: 'success', count: rows.length, source: 'bcv.org.ve', data: rows });
            }
        } else {
            results.push({ status: 'error', message: 'No se pudieron extraer las tasas (selectores en 0)' });
        }

    } catch (e: any) {
        results.push({ status: 'error', message: "Error haciendo web scraping al BCV: " + e.message });
    }

    return res.status(200).json({
        message: 'Sync completed via direct BCV Web Scraping',
        timestamp: timestamp,
        results
    });
}
