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

    const { currency, limit, days } = req.query;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        let query = supabase
            .from('rates')
            .select('price, currency, source, created_at')
            .order('created_at', { ascending: false });

        // Filtro por periodo de tiempo (opcional, ahora permite "all time")
        if (days) {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - Number(days));
            query = query.gte('created_at', dateLimit.toISOString());
        }

        // Si se proporciona un límite manual, se usa. Si no, se quita el límite interno de 30k
        // para devolver TODO lo que permita Supabase (generalmente hasta 1.000 o más dependiendo de la config).
        // Forzamos un límite extremadamente alto para asegurar que no se corte por defecto en 1000.
        if (limit) {
            query = query.limit(Number(limit));
        } else {
            query = query.limit(1000000); // "No limit" práctico para Supabase
        }


        if (currency) {
            query = query.eq('currency', currency.toString().toUpperCase());
        }

        const { data, error } = await query;

        if (error) throw new Error(error.message);

        // Mapeamos los datos para que coincidan exactamente con el formato de la imagen proporcionada (DolarAPI)
        const formattedHistory = (data || []).map(item => ({
            fuente: item.source.replace('DolarAPI (', '').replace(')', ''), // Limpiamos el nombre si viene de DolarAPI
            compra: null,
            venta: null,
            promedio: Number(item.price),
            fecha: item.created_at.split('T')[0], // YYYY-MM-DD
            timestamp: item.created_at, // Mantenemos el timestamp completo para precisión
            currency: item.currency
        }));

        return res.status(200).json({
            count: formattedHistory.length,
            period: days ? `${days} days` : 'all time',
            history: formattedHistory,
            query_params: { currency: currency || 'all', limit: limit || 'unlimited', days: days || 'all' }
        });
    } catch (e: any) {
        return res.status(500).json({ error: true, message: "Error Histórico: " + e.message });
    }
}



