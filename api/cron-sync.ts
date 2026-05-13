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
                symbol: 'BS',
                source: bcvSourceName,
                created_at: timestamp,
                date_rate: dateRate ? dateRate.split('T')[0] : null
            });
        }

        if (usdPrice > 0) {
            rows.push({
                price: usdPrice,
                currency: 'USD',
                symbol: 'BS',
                source: bcvSourceName,
                created_at: timestamp,
                date_rate: dateRate ? dateRate.split('T')[0] : null
            });
        }

        // --- Extracción de Binance P2P (Réplica exacta de bcvScrapper: Compra y Venta) ---
        try {
            const fetchBinance = async (tradeType: 'BUY' | 'SELL') => {
                const res = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                    },
                    body: JSON.stringify({
                        asset: 'USDT',
                        fiat: 'VES',
                        merchantCheck: true,
                        page: 1,
                        rows: 1,
                        tradeType: tradeType,
                        transAmount: 50000,
                        filterType: 'CLASSIC',
                        publisherType: null,
                        countries: [],
                        periods: []
                    })
                });
                const data = await res.json();
                return data?.data?.[0]?.adv?.price ? parseFloat(data.data[0].adv.price) : null;
            };

            // Ejecutamos ambas peticiones en paralelo como en el repo de Go
            const [buyPrice, sellPrice] = await Promise.all([
                fetchBinance('BUY'),
                fetchBinance('SELL')
            ]);

            if (buyPrice) {
                console.log(`[Binance Sync] Compra: ${buyPrice} BS`);
                rows.push({
                    price: Number(buyPrice.toFixed(4)),
                    currency: 'USDT',
                    symbol: 'BS',
                    source: 'Binance P2P (Compra)',
                    created_at: timestamp,
                    date_rate: new Date().toISOString().split('T')[0]
                });
            }

            if (sellPrice) {
                console.log(`[Binance Sync] Venta: ${sellPrice} BS`);
                rows.push({
                    price: Number(sellPrice.toFixed(4)),
                    currency: 'USDT',
                    symbol: 'BS',
                    source: 'Binance P2P (Venta)',
                    created_at: timestamp,
                    date_rate: new Date().toISOString().split('T')[0]
                });
            }

            if (!buyPrice && !sellPrice) {
                console.warn('[Binance Sync] No se encontraron anuncios para Compra ni Venta con 50k VES.');
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
