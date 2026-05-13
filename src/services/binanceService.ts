import axios from 'axios';

/**
 * Service to fetch rates from Binance P2P.
 * Implements median-based pricing to avoid outliers and manipulation.
 */
export const getBinanceRate = async (tradeType: 'BUY' | 'SELL' = 'BUY') => {
    try {
        const { data } = await axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
            asset: 'USDT',
            fiat: 'VES',
            merchantCheck: false, // Relajamos para asegurar resultados
            page: 1,
            rows: 20, 
            tradeType: tradeType,
            transAmount: "", // Sin monto mínimo para ampliar búsqueda
            filterType: 'CLASSIC',
            publisherType: null,
            countries: [],
            periods: [],
            classifies: [] // Quitamos restricciones de clasificación
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            timeout: 10000
        });

        const ads = data?.data || [];
        if (ads.length === 0) {
            console.warn(`[BinanceService] No se encontraron anuncios para ${tradeType}`);
            return null;
        }

        // Extraemos los precios y filtramos valores inválidos
        const prices = ads
            .map((ad: any) => parseFloat(ad.adv.price))
            .filter((p: number) => !isNaN(p) && p > 0);

        if (prices.length === 0) return null;

        // Cálculo de la Mediana para evitar ruidos de anuncios "fake" o extremos
        prices.sort((a: number, b: number) => a - b);
        const mid = Math.floor(prices.length / 2);
        const median = prices.length % 2 !== 0 
            ? prices[mid] 
            : (prices[mid - 1] + prices[mid]) / 2;

        return {
            symbol: 'USDT',
            price: Number(median.toFixed(4)),
            last_updated: new Date().toISOString(),
            source: `Binance P2P (${tradeType === 'BUY' ? 'Compra' : 'Venta'})`
        };
    } catch (error: any) {
        console.error('❌ [BinanceService] Error al obtener tasa de Binance:', error?.message);
        return null;
    }
};

/**
 * Obtiene ambas tasas (Compra y Venta) de forma paralela.
 */
export const getAllBinanceRates = async () => {
    const [buy, sell] = await Promise.all([
        getBinanceRate('BUY'),
        getBinanceRate('SELL')
    ]);
    return { buy, sell };
};
