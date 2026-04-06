// --- src/services/rateService.ts ---
export interface ExchangeRate {
    price: number;
    symbol: string;
    lastUpdate: string;
    change24h: number;
    history: number[]; // Últimos 7 días
}

export interface RatesState {
    bcv_usd: ExchangeRate;
    bcv_eur: ExchangeRate;
    binance_usd: ExchangeRate;
    loading: boolean;
    error: string | null;
}

// Consumimos nuestra propia arquitectura serverless
const KONVIERTE_API = "https://konvierte.vercel.app/api";

export const fetchRates = async (): Promise<Partial<RatesState>> => {
    try {
        // 1. Obtenemos las últimas tasas consolidadas
        const res = await fetch(`${KONVIERTE_API}/rates`);
        const json = await res.json();
        
        if (json.status !== 'success') throw new Error('API Error');
        const { rates } = json;

        // 2. Obtenemos historial real para las gráficas (paralelo para velocidad)
        const [hUsdRes, hEurRes, hUsdtRes] = await Promise.all([
            fetch(`${KONVIERTE_API}/history?currency=USD&limit=7`),
            fetch(`${KONVIERTE_API}/history?currency=EUR&limit=7`),
            fetch(`${KONVIERTE_API}/history?currency=USDT&limit=7`)
        ]);

        const formatHistory = async (resp: Response) => {
            const data = await resp.json();
            // Invertimos para que el gráfico vaya de antiguo a nuevo
            return (data.history || []).reverse().map((h: any) => Number(h.price));
        };

        const usdHist = await formatHistory(hUsdRes);
        const eurHist = await formatHistory(hEurRes);
        const usdtHist = await formatHistory(hUsdtRes);

        // Lógica de cálculo de variación 24h basada en historial real
        const calcVariation = (history: number[], current: number) => {
            if (history.length < 2) return 0;
            const previous = history[history.length - 2];
            return ((current - previous) / previous) * 100;
        };

        return {
            bcv_usd: {
                price: rates.usd.price,
                symbol: 'USD',
                lastUpdate: rates.usd.last_updated,
                history: usdHist.length > 0 ? usdHist : [rates.usd.price],
                change24h: calcVariation(usdHist, rates.usd.price)
            },
            bcv_eur: {
                price: rates.eur.price,
                symbol: 'EUR',
                lastUpdate: rates.eur.last_updated,
                history: eurHist.length > 0 ? eurHist : [rates.eur.price],
                change24h: calcVariation(eurHist, rates.eur.price)
            },
            binance_usd: {
                price: rates.usdt.price,
                symbol: 'USDT',
                lastUpdate: rates.usdt.last_updated,
                history: usdtHist.length > 0 ? usdtHist : [rates.usdt.price],
                change24h: calcVariation(usdtHist, rates.usdt.price)
            },
        };
    } catch (error) {
        console.error("Falla en la API nativa de Konvierte:", error);
        throw error;
    }
};

