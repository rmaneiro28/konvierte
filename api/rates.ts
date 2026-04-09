// --- api/rates.ts ---
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
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw new Error(error.message);

        if (!data || data.length === 0) {
            return res.status(404).json({ error: true, message: "No hay registros de tasas en la base de datos." });
        }

        const rates: any = {};
        data.forEach(r => {
            if (!rates[r.currency.toLowerCase()]) {
                rates[r.currency.toLowerCase()] = {
                    price: Number(r.price),
                    source: r.source,
                    last_updated: r.created_at,
                    date_rate: r.date_rate || null
                };
            }
        });

        return res.status(200).json({
            status: "success",
            timestamp: new Date().toISOString(),
            engine: "Konvierte v1.1",
            rates: rates
        });
    } catch (e: any) {
        return res.status(500).json({ status: "error", message: "Error en el motor de tasas: " + e.message });
    }
}

