// --- api/history.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Seguridad Total y Garantía JSON 🔐🔌
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    const { currency, limit = 30 } = req.query;

    try {
        let query = supabase
            .from('rates')
            .select('price, currency, source, created_at')
            .order('created_at', { ascending: false })
            .limit(Number(limit));

        if (currency) {
            query = query.eq('currency', currency.toString().toUpperCase());
        }

        const { data, error } = await query;

        if (error) throw new Error("Error Supabase: " + error.message);

        return res.status(200).json({
            count: data.length,
            history: data,
            query_params: { currency: currency || 'all', limit }
        });
    } catch (e: any) {
        return res.status(500).json({ error: true, message: "Error Histórico: " + e.message });
    }
}
