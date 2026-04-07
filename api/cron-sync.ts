// --- api/cron-sync.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: true, message: "SUPABASE_URL o SUPABASE_KEY no definidos en Vercel." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const endpoints = [
        { url: 'https://ve.dolarapi.com/v1/dolares', currency: 'USD' },
        { url: 'https://ve.dolarapi.com/v1/euros', currency: 'EUR' }
    ];

    const results = [];

    for (const endpoint of endpoints) {
        try {
            const apiRes = await fetch(endpoint.url);
            const data = await apiRes.json() as any[];

            if (!Array.isArray(data)) {
                results.push({ currency: endpoint.currency, status: 'error', message: 'Data is not an array' });
                continue;
            }

            const rows = data.map((item: any) => ({
                price: item.promedio || item.valor || 0,
                currency: endpoint.currency,
                source: `Konvierte (${item.fuente || 'oficial'})`,
                created_at: new Date(item.fechaActualizacion || item.fecha || new Date()).toISOString()
            })).filter(r => r.price > 0);

            const { error } = await supabase.from('rates').upsert(rows, {
                onConflict: 'currency, source, created_at'
            });

            if (error) {
                results.push({ currency: endpoint.currency, status: 'error', message: error.message });
            } else {
                results.push({ currency: endpoint.currency, status: 'success', count: rows.length });
            }
        } catch (e: any) {
            results.push({ currency: endpoint.currency, status: 'error', message: e.message });
        }
    }

    return res.status(200).json({
        message: 'Sync completed',
        timestamp: new Date().toISOString(),
        results
    });
}

