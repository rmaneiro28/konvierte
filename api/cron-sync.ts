// --- api/cron-sync.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { getBinanceRate } from '../src/services/binanceService';


/**
 * Este script sincroniza las tasas de cambio oficiales del BCV y Binance P2P.
 * Basado íntegramente en la lógica del repositorio franciscorojas27/bcvScrapper.
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: true, message: "Faltan credenciales de Supabase." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const results = [];
    const timestamp = new Date().toISOString();
    const rows = [];

    try {
        // Desactivamos validación TLS para el BCV (certificado suele fallar)
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        // 1. Scraping del BCV (Banco Central de Venezuela)
        const bcvRes = await fetch('https://www.bcv.org.ve');
        const html = await bcvRes.text();
        const $ = cheerio.load(html);

        // Extracción de Fecha oficial
        const rawDateRate = $('.pull-right.dinpro.center .date-display-single').first().attr('content');
        const dateRate = rawDateRate ? new Date(rawDateRate).toISOString().split('T')[0] : null;

        const extractBcvPrice = (id: string) => {
            const text = $(`${id} .centrado strong`).text().trim();
            // Reemplaza coma por punto para parsing
            return text ? parseFloat(text.replace(',', '.')) : 0;
        };

        const bcvCurrencies = [
            { id: '#euro', symbol: 'EUR' },
            { id: '#yuan', symbol: 'CNY' },
            { id: '#lira', symbol: 'TRY' },
            { id: '#rublo', symbol: 'RUB' },
            { id: '#dolar', symbol: 'USD' }
        ];

        for (const currency of bcvCurrencies) {
            const price = extractBcvPrice(currency.id);
            if (price > 0) {
                rows.push({
                    price: Number(price.toFixed(4)),
                    currency: currency.symbol,
                    symbol: 'BS',
                    source: 'Banco Central de Venezuela',
                    created_at: timestamp,
                    date_rate: dateRate
                });
            }
        }

        // 2. Extracción de Binance P2P (Compra y Venta) usando el nuevo servicio
        const [binanceBuy, binanceSell] = await Promise.all([
            getBinanceRate('BUY'),
            getBinanceRate('SELL')
        ]);
        
        if (binanceBuy) {
            rows.push({
                price: binanceBuy.price,
                currency: 'USDT',
                symbol: 'BS',
                source: 'Binance P2P (Compra)',
                created_at: timestamp,
                date_rate: new Date().toISOString().split('T')[0]
            });
        }

        if (binanceSell) {
            rows.push({
                price: binanceSell.price,
                currency: 'USDT',
                symbol: 'BS',
                source: 'Binance P2P (Venta)',
                created_at: timestamp,
                date_rate: new Date().toISOString().split('T')[0]
            });
        }


        // 3. Sincronización con Base de Datos
        if (rows.length > 0) {
            const { error } = await supabase.from('rates').upsert(rows, {
                onConflict: 'currency, source, created_at'
            });

            if (error) {
                results.push({ status: 'error', message: "Error en Upsert: " + error.message });
            } else {
                results.push({ 
                    status: 'success', 
                    count: rows.length, 
                    sources: ['BCV (USD/EUR/CNY/TRY/RUB)', 'Binance P2P'],
                    data: rows 
                });
            }
        } else {
            results.push({ status: 'error', message: 'No se extrajeron datos válidos.' });
        }

    } catch (e: any) {
        results.push({ status: 'error', message: "Falla crítica en el sync: " + e.message });
    }

    return res.status(200).json({
        message: 'Sync completed (Full bcvScrapper Logic)',
        timestamp: timestamp,
        results
    });
}
