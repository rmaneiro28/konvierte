// --- api/eur.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    if (req.method === 'OPTIONS') return res.status(204).end();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: true, message: "SUPABASE_URL o SUPABASE_KEY no definidos en Vercel." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        const { data, error } = await supabase
            .from('rates')
            .select('price, currency, source, created_at, date_rate')
            .eq('currency', 'EUR')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw new Error(error.message);
        
        if (!data || data.length === 0) {
            return res.status(404).json({ error: true, message: "No hay registros de EUR en la base de datos." });
        }

        const rate = data[0];
        return res.status(200).json({
            currency: "EUR",
            price: Number(rate.price),
            symbol: "BS",
            source: rate.source,
            last_updated: rate.created_at,
            date_rate: rate.date_rate || null
        });
    } catch (e: any) {
        return res.status(500).json({ error: true, message: "Error EUR: " + e.message });
    }
}

