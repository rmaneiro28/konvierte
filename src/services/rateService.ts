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

// Fuentes de datos reales usando DolarApi
const API_BASE = "https://ve.dolarapi.com/v1";

const calculateRealStats = (historicalData: any[], fuente: string, currentPrice: number) => {
    // Filtrar por fuente
    const filtered = historicalData.filter(d => d.fuente === fuente && d.promedio !== null && d.promedio !== undefined);
    // Ordenar por fecha recien a antiguo (la API a veces los da al revés)
    filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    // Obtener los ultimos 7 días
    const last7 = filtered.slice(0, 7).reverse().map(d => d.promedio);

    // Calcular variacion 24h
    let change24h = 0;
    if (filtered.length > 1) {
        // El item 0 es el de hoy/último cargado completo, el 1 es el del día hábil anterior
        const today = filtered[0].promedio;
        const yesterday = filtered[1].promedio;
        // Si el precio actual es distinto (por un update de media mañana), tomamos el currentPrice como today
        const effectiveToday = currentPrice > 0 ? currentPrice : today;
        change24h = ((effectiveToday - yesterday) / yesterday) * 100;
    }

    return {
        history: last7.length > 0 ? last7 : [currentPrice],
        change24h
    };
};

export const fetchRates = async (): Promise<Partial<RatesState>> => {
    try {
        const [estadoRes, usdRes, eurRes, pRes, hUsdRes, hEurRes] = await Promise.all([
            fetch(`${API_BASE}/estado`),
            fetch(`${API_BASE}/dolares/oficial`),
            fetch(`${API_BASE}/euros/oficial`),
            fetch(`${API_BASE}/dolares/paralelo`),
            fetch(`${API_BASE}/historicos/dolares`),
            fetch(`${API_BASE}/historicos/euros`)
        ]);

        const estadoData = await estadoRes.json();
        if (estadoData.estado !== 'Disponible') {
            throw new Error('API_UNAVAILABLE');
        }

        const usdData = await usdRes.json();
        const eurData = await eurRes.json();
        const pData = await pRes.json();
        const hUsdData = await hUsdRes.json();
        const hEurData = await hEurRes.json();

        const getPrice = (data: any) => data.promedio || data.price || data.valor || 0;

        const usdPrice = getPrice(usdData);
        const eurPrice = getPrice(eurData);
        const pPrice = getPrice(pData);

        const usdStats = calculateRealStats(hUsdData, 'oficial', usdPrice);
        const eurStats = calculateRealStats(hEurData, 'oficial', eurPrice);
        const pStats = calculateRealStats(hUsdData, 'paralelo', pPrice);

        return {
            bcv_usd: {
                price: usdPrice,
                symbol: 'USD',
                lastUpdate: usdData.fechaActualizacion || new Date().toISOString(),
                ...usdStats
            },
            bcv_eur: {
                price: eurPrice,
                symbol: 'EUR',
                lastUpdate: eurData.fechaActualizacion || new Date().toISOString(),
                ...eurStats
            },
            binance_usd: {
                price: pPrice,
                symbol: 'USDT',
                lastUpdate: pData.fechaActualizacion || new Date().toISOString(),
                ...pStats
            },
        };
    } catch (error) {
        // console.error("Error fetching rates from DolarApi:", error);
        throw error;
    }
};
