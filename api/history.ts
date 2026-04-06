// --- api/history.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') return res.status(204).end();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: true, message: "SUPABASE_URL o SUPABASE_KEY no definidos en Vercel." });
    }

    const { currency, limit } = req.query;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        let query = supabase
            .from('rates')
            .select('price, currency, source, created_at')
            .order('created_at', { ascending: false });

        // Si se proporciona un límite (ej: ?limit=100), se aplica. Si no, devuelve todo.
        if (limit) {
            query = query.limit(Number(limit));
        }

        if (currency) {
            query = query.eq('currency', currency.toString().toUpperCase());
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        return res.status(200).json({
            count: data?.length || 0,
            history: data || [],
            query_params: { currency: currency || 'all', limit: limit || 'none' }
        });
    } catch (e: any) {
        return res.status(500).json({ error: true, message: "Error Histórico: " + e.message });
    }
}


