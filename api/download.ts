// --- api/download.ts ---
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    if (req.method === 'OPTIONS') return res.status(204).end();

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return res.status(500).json({ error: true, message: 'Config missing' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // GET: Obtener el conteo total de descargas
    if (req.method === 'GET') {
        try {
            const { count, error } = await supabase
                .from('apk_downloads')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            return res.status(200).json({
                status: 'success',
                downloads: count || 0
            });
        } catch (e: any) {
            return res.status(500).json({ status: 'error', message: e.message });
        }
    }

    // POST: Registrar una nueva descarga
    if (req.method === 'POST') {
        try {
            const { platform, version } = req.body || {};
            const userAgent = req.headers['user-agent'] || 'unknown';
            const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';

            const { error } = await supabase
                .from('apk_downloads')
                .insert([{
                    platform: platform || 'android',
                    version: version || '1.0',
                    user_agent: userAgent.substring(0, 500),
                    ip_hash: Buffer.from(ip).toString('base64').substring(0, 50),
                    downloaded_at: new Date().toISOString()
                }]);

            if (error) throw error;

            // Obtener total actualizado
            const { count } = await supabase
                .from('apk_downloads')
                .select('*', { count: 'exact', head: true });

            return res.status(201).json({
                status: 'success',
                message: 'Download registered',
                total: count || 0
            });
        } catch (e: any) {
            return res.status(500).json({ status: 'error', message: e.message });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
}
