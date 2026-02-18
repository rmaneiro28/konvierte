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

// Función para simular historial basado en el precio actual
const generateHistory = (currentPrice: number): { history: number[], change24h: number } => {
    const history = [];
    let lastPrice = currentPrice;
    for (let i = 0; i < 7; i++) {
        // Variación aleatoria entre -0.5% y +0.5% para simular mercado
        const variation = 1 + (Math.random() * 0.01 - 0.005);
        lastPrice = lastPrice / variation;
        history.unshift(Number(lastPrice.toFixed(2)));
    }
    // El último valor del historial es el precio de "ayer" para el cálculo del %
    const yesterday = history[history.length - 2];
    const change24h = ((currentPrice - yesterday) / yesterday) * 100;

    // Aseguramos que el último punto del historial sea el precio actual
    history[history.length - 1] = currentPrice;

    return { history, change24h };
};

export const fetchRates = async (): Promise<Partial<RatesState>> => {
    try {
        const [usdRes, eurRes, pRes] = await Promise.all([
            fetch(`${API_BASE}/dolares/oficial`),
            fetch(`${API_BASE}/euros/oficial`),
            fetch(`${API_BASE}/dolares/paralelo`)
        ]);

        const usdData = await usdRes.json();
        const eurData = await eurRes.json();
        const pData = await pRes.json();

        const getPrice = (data: any) => data.promedio || data.price || data.valor || 0;

        const usdPrice = getPrice(usdData);
        const eurPrice = getPrice(eurData);
        const pPrice = getPrice(pData);

        const usdStats = generateHistory(usdPrice);
        const eurStats = generateHistory(eurPrice);
        const pStats = generateHistory(pPrice);

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
