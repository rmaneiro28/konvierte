// sync-now.ts
import { createClient } from '@supabase/supabase-js';
import { getBinanceRate } from './src/services/binanceService.js';
import { getBcvRates } from './src/services/bcvScraper.js';
import * as dotenv from 'dotenv';

// Cargamos variables de entorno locales
dotenv.config({ path: '.env.local' });

async function sync() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Error: No se encontraron las credenciales de Supabase en .env.local');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const timestamp = new Date().toISOString();
    const rows: any[] = [];

    console.log('🔄 Iniciando sincronización manual hacia Supabase...');

    try {
        const [bcvRates, binanceBuy, binanceSell] = await Promise.all([
            getBcvRates(),
            getBinanceRate('BUY'),
            getBinanceRate('SELL')
        ]);

        if (bcvRates && bcvRates.length > 0) {
            console.log(`📌 BCV: Obtenidas ${bcvRates.length} tasas.`);
            const cleanBcv = bcvRates.map(r => ({
                price: r.price,
                currency: r.currency,
                source: r.source,
                created_at: r.created_at,
                date_rate: r.date_rate
            }));
            rows.push(...cleanBcv);
        }

        if (binanceBuy) {
            console.log(`📌 Binance Compra: ${binanceBuy.price} Bs.`);
            rows.push({
                price: binanceBuy.price,
                currency: 'USDT',
                source: 'Binance P2P (Compra)',
                created_at: timestamp,
                date_rate: new Date().toISOString().split('T')[0]
            });
        }

        if (binanceSell) {
            console.log(`📌 Binance Venta: ${binanceSell.price} Bs.`);
            rows.push({
                price: binanceSell.price,
                currency: 'USDT',
                source: 'Binance P2P (Venta)',
                created_at: timestamp,
                date_rate: new Date().toISOString().split('T')[0]
            });
        }


        if (rows.length > 0) {
            const { error } = await supabase.from('rates').upsert(rows);
            if (error) {
                console.error('❌ Error al subir a Supabase:', error.message);
            } else {
                console.log('\n✨ ¡Éxito! Los valores han sido actualizados en la base de datos y la API.');
            }
        } else {
            console.warn('⚠️ No se obtuvieron datos para sincronizar.');
        }

    } catch (e: any) {
        console.error('❌ Falla crítica en la sincronización:', e.message);
    }
}

sync();
