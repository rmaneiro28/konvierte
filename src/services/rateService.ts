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
        const usdHist = (await hUsdRes.json()).history || [];
        const eurHist = (await hEurRes.json()).history || [];
        const usdtHist = (await hUsdtRes.json()).history || [];

        // Reutilizamos los mismos datos ya leídos para formatHistory (sin releer el body)
        const mapPrices = (hist: any[]) => hist.reverse().map((h: any) => Number(h.price || h.promedio));
        const usdHistPrices = mapPrices([...usdHist]);
        const eurHistPrices = mapPrices([...eurHist]);
        const usdtHistPrices = mapPrices([...usdtHist]);

        const usdRes = processRate(rates.usd, usdHist);
        const eurRes = processRate(rates.eur, eurHist);
        const usdtRes = processRate(rates.usdt, usdtHist);


        return {
            bcv_usd: {
                price: usdRes.price,
                todayPrice: usdRes.todayPrice,
                dateRate: usdRes.dateRate,
                symbol: 'USD',
                lastUpdate: usdRes.lastUpdate,
                history: usdHistPrices.length > 0 ? usdHistPrices : [usdRes.price],
                change24h: calcVariation(usdHistPrices, usdRes.price)
            },
            bcv_eur: {
                price: eurRes.price,
                todayPrice: eurRes.todayPrice,
                dateRate: eurRes.dateRate,
                symbol: 'EUR',
                lastUpdate: eurRes.lastUpdate,
                history: eurHistPrices.length > 0 ? eurHistPrices : [eurRes.price],
                change24h: calcVariation(eurHistPrices, eurRes.price)
            },
            binance_usd: {
                price: usdtRes.price,
                todayPrice: usdtRes.todayPrice,
                dateRate: usdtRes.dateRate,
                symbol: 'USDT',
                lastUpdate: usdtRes.lastUpdate,
                history: usdtHistPrices.length > 0 ? usdtHistPrices : [usdtRes.price],
                change24h: calcVariation(usdtHistPrices, usdtRes.price)
            },
        };

    } catch (error) {
        console.error("Falla en la API nativa de Konvierte:", error);
        throw error;
    }
};

