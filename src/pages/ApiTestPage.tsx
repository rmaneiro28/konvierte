import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, RefreshCw, CheckCircle, AlertCircle, Database, Server } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const ApiTestPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        setLogs(prev => [...prev.slice(-4), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const fetchTestData = async () => {
        setLoading(true);
        setError(null);
        addLog("Iniciando petición al motor de scraping...");

        try {
            const response = await fetch('/api/rates');
            const contentType = response.headers.get("content-type");
            
            // Si el contenido no es JSON, es que Vite está sirviendo el código fuente
            if (!contentType || !contentType.includes("application/json")) {
                addLog("⚠️ Aviso: Ejecución local detectada. Mostrando simulación.");
                throw new Error("Vite está devolviendo código fuente en lugar de ejecutar la API. Despliega en Vercel para conectividad real.");
            }
            
            const json = await response.json();
            setData(json);
            addLog("✅ Datos reales recibidos del motor.");
        } catch (err: any) {
            setError(err.message);
            addLog("Modo Simulación Activado.");
            // Mock elegante para desarrollo
            setData({
                rates: { usd: 47.06, eur: 51.12, btc: 63405.20 },
                last_updated: new Date().toISOString(),
                source: "Simulación Local (Motor BCV)",
                status: "dev_mock_mode",
                note: "Este es un dato de prueba. La API real se activa al desplegar en Vercel."
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTestData();
    }, []);

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 font-sans">
            <nav className="max-w-5xl mx-auto mb-16 flex items-center justify-between">
                <NavLink to="/" className="text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <Terminal size={14} /> Konvierte Dev Console
                </NavLink>
                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
                   Status: Konvierte Engine v1 Active
                </div>
            </nav>

            <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats Grid */}
                <div className="md:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {data?.rates && Object.entries(data.rates).map(([curr, val]: any) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={curr} 
                                className="bg-white/5 border border-white/10 p-6 rounded-3xl"
                            >
                                <p className="text-[10px] font-black uppercase text-white/40 mb-1">{curr}</p>
                                <p className="text-2xl font-black text-main">
                                    {typeof val === 'number' ? val.toFixed(2) : '---'}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 overflow-hidden relative">
                        <Terminal size={100} className="absolute -bottom-10 -right-10 opacity-5" />
                        <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                            <Database size={14} /> Raw JSON Response
                        </h2>
                        <pre className="text-[11px] font-mono text-green-400 leading-relaxed overflow-x-auto">
                            {JSON.stringify(data, null, 4)}
                        </pre>
                    </div>
                </div>

                {/* Debug Sidebar */}
                <div className="space-y-6">
                   <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                        <h3 className="text-xs font-black uppercase mb-4 flex items-center gap-2">
                            <Server size={14} /> Control de API
                        </h3>
                        <button 
                            onClick={fetchTestData}
                            disabled={loading}
                            className="w-full py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            Refrescar Scraper
                        </button>
                        
                        <div className="mt-8 space-y-3">
                            <p className="text-[10px] font-black uppercase text-white/20">Registros del sistema</p>
                            {logs.map((log, i) => (
                                <p key={i} className="text-[9px] font-mono text-white/40 border-l border-white/10 pl-3">
                                    {log}
                                </p>
                            ))}
                        </div>
                   </div>

                   {error && (
                       <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                           <AlertCircle size={16} className="text-red-500" />
                           <p className="text-[10px] font-bold text-red-500/80">{error}</p>
                       </div>
                   )}
                   
                   {!error && data && (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3">
                            <CheckCircle size={16} className="text-green-500" />
                            <p className="text-[10px] font-bold text-green-500/80">API Respondiendo correctamente</p>
                        </div>
                   )}
                </div>
            </main>
        </div>
    );
};

export default ApiTestPage;
