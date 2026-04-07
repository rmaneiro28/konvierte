// --- api/v1/historicos/euros.ts ---
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
        return res.status(500).json({ error: true, message: "SUPABASE_URL o SUPABASE_KEY no definidos." });
    }

    const { limit, days } = req.query;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        let query = supabase
            .from('rates')
            .select('price, source, created_at')
            .eq('currency', 'EUR')
            .order('created_at', { ascending: false })
            .limit(1000000);

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        const history = (data || []).map(item => ({
            fuente: item.source.replace('DolarAPI (', '').replace(')', ''),
            compra: null,
            venta: null,
            promedio: Number(item.price),
            fecha: item.created_at.split('T')[0]
        }));

        return res.status(200).json(history);
    } catch (e: any) {
        return res.status(500).json({ error: true, message: e.message });
    }
}
