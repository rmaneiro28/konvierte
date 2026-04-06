import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

/**
 * Scraper oficial para el Banco Central de Venezuela (BCV)
 * Este script está diseñado para ejecutarse en un entorno Node.js / Serverless.
 */
export const getBcvRate = async () => {
    try {
        // 1. Configuramos el agente para ignorar problemas de certificados SSL viejos del BCV
        const agent = new https.Agent({  
            rejectUnauthorized: false
        });

        // 2. Descargamos el HTML del sitio oficial del BCV
        const { data } = await axios.get('https://www.bcv.org.ve/', { 
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // 3. Cargamos el HTML en Cheerio (similar a JQuery)
        const $ = cheerio.load(data);

        // 4. Buscamos el div específico del Dólar (ID: dolar)
        // El BCV suele tener una estructura: div#dolar > strong
        const rawValue = $('#dolar strong').text().trim();

        if (!rawValue) {
            throw new Error('No se pudo encontrar la tasa del dólar en el HTML del BCV');
        }

        // 5. Limpiamos el valor (convertimos "47,06570000" a 47.0657)
        const cleanRate = parseFloat(rawValue.replace(',', '.'));

        return {
            symbol: 'USD',
            price: cleanRate,
            last_updated: new Date().toISOString(),
            source: 'Banco Central de Venezuela (BCV)'
        };

    } catch (error) {
        console.error('❌ Error en el Scraper del BCV:', error.message);
        return null;
    }
};

// Ejemplo de uso para pruebas locales:
// getBcvRate().then(rate => console.log('Tasa BCV hoy:', rate));
