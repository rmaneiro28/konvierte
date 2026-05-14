// --- src/services/rateService.ts ---
export interface ExchangeRate {
    price: number;
    symbol: string;
    lastUpdate: string;
    change24h: number;
    history: number[]; // Últimos 7 días
    todayPrice?: number;
    dateRate?: string;
}

export interface RatesState {
    bcv_usd: ExchangeRate;
    bcv_eur: ExchangeRate;
    binance_usd: ExchangeRate;
    loading: boolean;
    error: string | null;
}

// Consumimos nuestra propia arquitectura serverless
const KONVIERTE_API = "https://konvierte.vercel.app/docs/api";

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

        const isFuture = (dateStr: string) => {
            if (!dateStr) return false;
            const date = new Date(dateStr);
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return date > today;
        };

        const calcVariation = (history: number[], current: number) => {
            if (history.length < 2) return 0;
            const previous = history[history.length - 2];
            return ((current - previous) / previous) * 100;
        };

        const processRate = (current: any, history: any[]) => {
            const all = [current, ...history].sort((a, b) => 
                new Date(b.date_rate || b.fecha).getTime() - new Date(a.date_rate || a.fecha).getTime()
            );

            const latest = all[0];
            const latestPrice = Number(latest.price || latest.promedio);
            const latestDate = latest.date_rate || latest.fecha;

            const nonFuture = all.filter(e => !isFuture(e.date_rate || e.fecha));
            let todayPrice: number | undefined;

            if (nonFuture.length > 0) {
                todayPrice = Number(nonFuture[0].price || nonFuture[0].promedio);
            } else {
                todayPrice = Number(all[all.length - 1].price || all[all.length - 1].promedio);
            }

            if (todayPrice === latestPrice && !isFuture(latestDate)) {
                todayPrice = undefined;
            }

            return {
                price: latestPrice,
                todayPrice,
                dateRate: latestDate,
                lastUpdate: latest.last_updated || latest.fecha || new Date().toISOString()
            };
        };

        // Procesar cada moneda con su respectivo historial
        // Nota: La API /history devuelve objetos con campo 'price' y 'fecha'
        // Mapeamos para que processRate los entienda
        const hUsd = (await hUsdRes.json()).history || [];
        const hEur = (await hEurRes.json()).history || [];
        const hUsdt = (await hUsdtRes.json()).history || [];

        const usdRes = processRate(rates.usd, hUsd);
        const eurRes = processRate(rates.eur, hEur);
        const usdtRes = processRate(rates.usdt, hUsdt);

        return {
            bcv_usd: {
                price: usdRes.price,
                todayPrice: usdRes.todayPrice,
                dateRate: usdRes.dateRate,
                symbol: 'USD',
                lastUpdate: usdRes.lastUpdate,
                history: usdHist.length > 0 ? usdHist : [usdRes.price],
                change24h: calcVariation(usdHist, usdRes.price)
            },
            bcv_eur: {
                price: eurRes.price,
                todayPrice: eurRes.todayPrice,
                dateRate: eurRes.dateRate,
                symbol: 'EUR',
                lastUpdate: eurRes.lastUpdate,
                history: eurHist.length > 0 ? eurHist : [eurRes.price],
                change24h: calcVariation(eurHist, eurRes.price)
            },
            binance_usd: {
                price: usdtRes.price,
                todayPrice: usdtRes.todayPrice,
                dateRate: usdtRes.dateRate,
                symbol: 'USDT',
                lastUpdate: usdtRes.lastUpdate,
                history: usdtHist.length > 0 ? usdtHist : [usdtRes.price],
                change24h: calcVariation(usdtHist, usdtRes.price)
            },
        };
    } catch (error) {
        console.error("Falla en la API nativa de Konvierte:", error);
        throw error;
    }
};

