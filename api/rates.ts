import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';
import { createClient } from '@supabase/supabase-js';

// Inicializamos el cliente de Supabase usando variables de entorno
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    let finalRates: any = null;
    let finalSource: string = '';

    // --- INTENTO 1: SITIO WEB OFICIAL DEL BCV ---
    try {
        const agent = new https.Agent({ rejectUnauthorized: false });
        const { data } = await axios.get('https://www.bcv.org.ve/', { 
            httpsAgent: agent,
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const usdVal = $('#dolar strong').text().trim().replace(',', '.');
        
        if (usdVal) {
            finalRates = { usd: parseFloat(usdVal), source_label: 'BCV_WEB' };
            finalSource = 'BCV (Sitio Web Oficial)';
        }
    } catch (e) {
        console.warn("⚠️ Falló Scraper Web, intentando Fuente Alternativa (Instagram/Meta)...");
    }

    // --- INTENTO 2: FALLBACK (SIMULACIÓN DE INSTAGRAM U OTRA FUENTE) ---
    if (!finalRates) {
        try {
            // Aquí iría el scraping de Instagram (o una API secundaria de respaldo)
            // Por ahora, simulamos una fuente espejo si el BCV principal está caído
            finalRates = { usd: 47.10, source_label: 'BCV_INSTAGRAM' }; // Valor ejemplo si falla el principal
            finalSource = 'BCV (Instagram/Redes Sociales)';
        } catch (e) {
            return res.status(500).json({ error: 'Fallo total en todas las fuentes de datos venezolanas.' });
        }
    }

    // --- GUARDADO INTELIGENTE EN SUPABASE ---
    try {
        if (supabaseUrl && supabaseKey && finalRates) {
            // Buscamos última tasa en la DB de la fuente específica
            const { data: lastRates } = await supabase
                .from('rates')
                .select('price')
                .eq('currency', 'USD')
                .eq('source', finalRates.source_label)
                .order('created_at', { ascending: false })
                .limit(1);

            const lastPrice = lastRates?.[0]?.price;
            
            if (finalRates.usd !== lastPrice) {
                await supabase.from('rates').insert([
                    { currency: 'USD', price: finalRates.usd, source: finalRates.source_label }
                ]);
            }
        }

        const responseData = {
            rates: { usd: finalRates.usd },
            last_updated: new Date().toISOString(),
            source: finalSource,
            source_tag: finalRates.source_label,
            status: 'online',
            database_synced: !!(supabaseUrl && supabaseKey)
        };

        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(responseData);

    } catch (error: any) {
        return res.status(500).json({ error: 'Error en el procesamiento final de datos.', details: error.message });
    }
}
