// --- api/cron-sync.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import { getBinanceRate } from '../src/services/binanceService.js';
import { getBcvRates } from '../src/services/bcvScraper.js';


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
        // 1. Obtención de tasas del BCV usando el servicio modular
        const bcvRates = await getBcvRates();
        if (bcvRates && bcvRates.length > 0) {
            const cleanBcv = bcvRates.map(r => ({
                price: r.price,
                currency: r.currency,
                source: r.source,
                created_at: r.created_at,
                date_rate: r.date_rate
            }));
            rows.push(...cleanBcv);
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
                source: 'Binance P2P (Compra)',
                created_at: timestamp,
                date_rate: new Date().toISOString().split('T')[0]
            });
        }

        if (binanceSell) {
            rows.push({
                price: binanceSell.price,
                currency: 'USDT',
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
                    sources: ['BCV (USD/EUR)', 'Binance P2P'],
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
