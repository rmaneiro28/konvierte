// --- api/v1/historicos/usdt.ts ---
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
        return res.status(500).json({ error: true, message: "SUPABASE_URL o SUPABASE_KEY no definidos." });
    }

    const { limit, days } = req.query;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        let query = supabase
            .from('rates')
            .select('price, source, created_at, date_rate')
            .eq('currency', 'USDT')
            .order('created_at', { ascending: false });

        if (days) {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - Number(days));
            query = query.gte('created_at', dateLimit.toISOString());
        }

        // Forzamos un límite extremadamente alto (1 millón) para garantizar la entrega de la data completa.
        if (limit) {
            query = query.limit(Number(limit));
        } else {
            query = query.limit(1000000);
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        const history = (data || []).map(item => ({
            fuente: item.source,
            compra: null,
            venta: null,
            promedio: Number(item.price),
            fecha: item.created_at.split('T')[0],
            date_rate: item.date_rate || null
        }));

        return res.status(200).json(history);
    } catch (e: any) {
        return res.status(500).json({ error: true, message: e.message });
    }
}
