// test-binance.ts
import { getAllBinanceRates } from './src/services/binanceService.js';

console.log('🚀 Iniciando prueba de Binance P2P (Cálculo de Mediana)...');

const start = Date.now();

getAllBinanceRates().then(rates => {
    const end = Date.now();
    console.log('\n✅ Tasas obtenidas con éxito:');
    console.log('-----------------------------------');
    console.log(`💵 Compra:  ${rates.buy?.price} Bs. (Ref: ${rates.buy?.source})`);
    console.log(`🏷️ Venta:   ${rates.sell?.price} Bs. (Ref: ${rates.sell?.source})`);
    console.log('-----------------------------------');
    console.log(`⏱️ Tiempo de respuesta: ${end - start}ms`);
    console.log(`📅 Última actualización: ${rates.buy?.last_updated}`);
}).catch(err => {
    console.error('\n❌ Error crítico en la prueba:', err.message);
});
