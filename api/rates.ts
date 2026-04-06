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
    try {
        // Configuramos el agente para evitar errores de certificados SSL viejos del BCV
        const agent = new https.Agent({ rejectUnauthorized: false });

        // Bajamos el HTML del BCV
        const { data } = await axios.get('https://www.bcv.org.ve/', { 
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 8000 // Si el BCV tarda más de 8s, abortamos
        });

        const $ = cheerio.load(data);
        
        // Scraping de las tasas principales
        const usdValue = $('#dolar strong').text().trim().replace(',', '.');
        const eurValue = $('#euro strong').text().trim().replace(',', '.');
        const btcValue = $('#bitcoin strong').text().trim().replace(',', '.');

        // Lógica de Guardar solo si cambia
        if (supabaseUrl && supabaseKey) {
            // Buscamos la última tasa guardada del BCV para USD
            const { data: lastRates } = await supabase
                .from('rates')
                .select('price')
                .eq('currency', 'USD')
                .eq('source', 'BCV')
                .order('created_at', { ascending: false })
                .limit(1);

            const lastPrice = lastRates?.[0]?.price;
            const currentUsd = parseFloat(usdValue);

            // Solo guardamos si el precio es diferente al último o si no hay registros
            if (currentUsd !== lastPrice) {
                await supabase.from('rates').insert([
                    { currency: 'USD', price: currentUsd, source: 'BCV' },
                    { currency: 'EUR', price: parseFloat(eurValue), source: 'BCV' }
                ]);
            }
        }

        // Armamos el JSON limpio que los DEVS aman
        const responseData = {
            rates: {
                usd: parseFloat(usdValue),
                eur: parseFloat(eurValue),
                btc: parseFloat(btcValue)
            },
            last_updated: new Date().toISOString(),
            source: 'BVC Oficial (Banco Central de Venezuela)',
            status: 'success',
            database_synced: !!(supabaseUrl && supabaseKey),
            stored_new_change: (supabaseUrl && supabaseKey) // Podrías añadir lógica de boolean aquí si quieres
        };

        // Activamos CORS para que Konvierte (tu frontend) pueda leerlo
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        
        return res.status(200).json(responseData);

    } catch (error: any) {
        return res.status(500).json({ 
            error: 'Error en el motor de scraping del BCV',
            details: error.message 
        });
    }
}
