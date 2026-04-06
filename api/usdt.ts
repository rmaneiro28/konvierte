// --- api/usdt.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Seguridad Total JSON y CORS ⚡🦾
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    try {
        const { data, error } = await supabase
            .from('rates')
            .select('price, currency, source, created_at')
            .eq('currency', 'USDT')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw new Error("Error en Supabase: " + error.message);
        
        const rate = data?.[0];
        
        const responseData = {
            currency: "USDT",
            price: Number(rate?.price || 0),
            symbol: "BS",
            source: rate?.source || "Binance P2P",
            last_updated: rate?.created_at || new Date().toISOString()
        };

        return res.status(200).json(responseData);
    } catch (e: any) {
        return res.status(500).json({ error: true, message: "No se pudo obtener la tasa de Binance USDT.", details: e.message });
    }
}
