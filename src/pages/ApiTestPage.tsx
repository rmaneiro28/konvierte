import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Database,
    Code2,
    Copy,
    Check,
    Play,
    ChevronRight,
    Github,
    Sun,
    Moon,
    Activity,
    Clock,
    DollarSign,
    Euro,
    Terminal,
    Users,
    ExternalLink,
    Heart,
    Landmark,
    Coins
} from 'lucide-react';
import { toast } from 'sonner';
import { NavLink } from 'react-router-dom';

const ApiTestPage: React.FC = () => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [activeTab, setActiveTab] = useState<'js' | 'python' | 'curl'>('js');
    const [activeMenu, setActiveMenu] = useState('rates');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);

    // Dominio raíz (Sin /api al final) para evitar duplicidades 🌍
    const baseUrlHost = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://konvierte.vercel.app')
        : "https://konvierte.vercel.app";

    const endpoints = [
        { 
            id: 'status', label: 'Estado del Servicio', path: '/docs/api/status', icon: <Activity size={16} />, 
            desc: 'Verifica la salud operacional y tiempo de actividad del motor API.',
            params: [],
            schema: [
                { field: 'status', type: 'string', desc: 'Estado general (ej: "operational").' },
                { field: 'uptime', type: 'number', desc: 'Segundos desde el último despliegue.' },
                { field: 'engine', type: 'string', desc: 'Nombre y versión del motor Vercel.' },
                { field: 'services', type: 'object', desc: 'Salud de scrapers y base de datos.' },
                { field: 'timestamp', type: 'date', desc: 'Hora del servidor en formato ISO.' }
            ]
        },
        { 
            id: 'rates', label: 'Tasas de Cambio', path: '/docs/api/rates', icon: <Database size={16} />, 
            desc: 'Obtiene el pull completo de tasas sincronizadas (BCV + Binance P2P).',
            params: [
                { field: 'currency', type: 'string', desc: '(Opcional) Filtrar por USD, EUR, USDT o COP.' }
            ],
            schema: [
                { field: 'USD', type: 'Object', desc: 'Tasa oficial BCV y metadatos.' },
                { field: 'EUR', type: 'Object', desc: 'Tasa oficial EUR BCV.' },
                { field: 'USDT', type: 'Object', desc: 'Promedio Binance USDT/VES.' },
                { field: 'COP', type: 'Object', desc: 'Promedio Binance COP/USDT.' },
                { field: 'timestamp', type: 'string', desc: 'Momento de sincronización global.' }
            ]
        },
        { 
            id: 'history', label: 'Historial', path: '/docs/api/history', icon: <Clock size={16} />, 
            desc: 'Consulta registros históricos con filtros de granularidad temporal.',
            params: [
                { field: 'currency', type: 'string', desc: 'Filtro de moneda base.' },
                { field: 'days', type: 'number', desc: 'Período en días atrás.' },
                { field: 'limit', type: 'number', desc: 'Max registros por respuesta.' }
            ],
            schema: [
                { field: 'data', type: 'Array', desc: 'Array de objetos con precios históricos.' },
                { field: 'count', type: 'number', desc: 'Número total de registros encontrados.' }
            ]
        },
        { 
            id: 'usd', label: 'Dólar BCV', path: '/docs/api/usd', icon: <DollarSign size={16} />, 
            desc: 'Tasa oficial del Banco Central de Venezuela.',
            params: [],
            schema: [
                { field: 'price', type: 'number', desc: 'Precio en Bolívares (VES).' },
                { field: 'symbol', type: 'string', desc: 'Símbolo "BS" del BCV.' },
                { field: 'source', type: 'string', desc: 'Origen de la data (BCV).' },
                { field: 'last_updated', type: 'string', desc: 'Última actualización local.' },
                { field: 'date_rate', type: 'string', desc: 'Fecha legal de la tasa.' }
            ]
        },
        { 
            id: 'eur', label: 'Euro BCV', path: '/docs/api/eur', icon: <Euro size={16} />, 
            desc: 'Tasa oficial del Banco Central de Venezuela en Euros.',
            params: [],
            schema: [
                { field: 'price', type: 'number', desc: 'Precio en VES.' },
                { field: 'date_rate', type: 'string', desc: 'Fecha de vigencia legal.' }
            ]
        },
        { 
            id: 'usdt', label: 'P2P Binance', path: '/docs/api/usdt', icon: <Zap size={16} />, 
            desc: 'Promedio de órdenes de compra/venta en Binance P2P.',
            params: [],
            schema: [
                { field: 'price', type: 'number', desc: 'Promedio ponderado USDT.' },
                { field: 'last_updated', type: 'string', desc: 'Momento exacto del scrape.' }
            ]
        },
        { 
            id: 'cop', label: 'P2P Pesos', path: '/docs/api/cop', icon: <Coins size={16} />, 
            desc: 'Promedio de órdenes de compra/venta en pesos colombianos Binance P2P.',
            params: [],
            schema: [
                { field: 'price', type: 'number', desc: 'Promedio ponderado en Pesos Colombianos (COP).' },
                { field: 'last_updated', type: 'string', desc: 'Momento exacto del scrape.' }
            ]
        },
        { 
            id: 'hist_usd', label: 'Historia Dólar', path: '/docs/api/historicos/dolares', icon: <Activity size={16} />, 
            desc: 'Serie histórica pura (JSON Array) del dólar BCV.',
            params: [
                { field: 'days', type: 'number', desc: 'Días hacia atrás.' }
            ],
            schema: [
                { field: '[{...}]', type: 'Array', desc: 'Lista de precios y fechas USD.' }
            ]
        },
        { 
            id: 'hist_eur', label: 'Historia Euro', path: '/docs/api/historicos/euros', icon: <Activity size={16} />, 
            desc: 'Serie histórica pura (JSON Array) del euro BCV.',
            params: [
                { field: 'days', type: 'number', desc: 'Días hacia atrás.' }
            ],
            schema: [
                { field: '[{...}]', type: 'Array', desc: 'Lista de precios y fechas EUR.' }
            ]
        },
        { 
            id: 'hist_usdt', label: 'Historia Binance', path: '/docs/api/historicos/usdt', icon: <Activity size={16} />, 
            desc: 'Serie histórica pura (JSON Array) de USDT P2P.',
            params: [
                { field: 'days', type: 'number', desc: 'Días hacia atrás.' }
            ],
            schema: [
                { field: '[{...}]', type: 'Array', desc: 'Lista de promedios diarios USDT.' }
            ]
        },
        { 
            id: 'hist_cop', label: 'Historia Pesos', path: '/docs/api/historicos/pesos', icon: <Activity size={16} />, 
            desc: 'Serie histórica pura (JSON Array) del peso colombiano (COP).',
            params: [
                { field: 'days', type: 'number', desc: 'Días hacia atrás.' }
            ],
            schema: [
                { field: '[{...}]', type: 'Array', desc: 'Lista de promedios diarios COP.' }
            ]
        },
        { 
            id: 'banks', label: 'Bancos de Venezuela', path: '/docs/api/banks', icon: <Landmark size={16} />, 
            desc: 'Información institucional de bancos (nombres, logos y RIF). No incluye tasas.',
            params: [],
            schema: [
                { field: 'codigo_banco', type: 'string', desc: 'Código bancario oficial.' },
                { field: 'nombre_banco', type: 'string', desc: 'Nombre comercial del banco.' },
                { field: 'logo', type: 'string', desc: 'URL del logo en formato PNG/ICO.' },
                { field: 'rif', type: 'string', desc: 'Registro de Información Fiscal.' }
            ]
        },
    ];

    const currentEndpoint = endpoints.find(e => e.id === activeMenu);

    const fetchLiveStats = async () => {
        if (!currentEndpoint) return;
        setLoading(true);
        setData(null);
        try {
            // Llamada directa al dominio de producción con el path limpio 🚀
            const res = await fetch(`${baseUrlHost}${currentEndpoint.path}`);
            const json = await res.json();
            setData(json);
        } catch (e) {
            setData({
                "error": "Error de Conexión",
                "hint": "Probablemente el dominio no está respondiendo o el endpoint ha cambiado."
            });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        toast.success("Copiado al portapapeles");
        setTimeout(() => setCopied(null), 2000);
    };

    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? 'bg-[#0F1115]' : 'bg-[#F8FAFC]',
        sidebar: isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-[#F8FAFC] border-[#E2E8F0]',
        content: isDark ? 'bg-[#0F1115]' : 'bg-[#F1F5F9]',
        textMain: isDark ? 'text-[#C9D1D9]' : 'text-[#1F2328]',
        textSub: isDark ? 'text-[#8B949E]' : 'text-[#475569]',
        card: isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-[#FFFFFF] border-[#E2E8F0] shadow-sm',
        codeBg: isDark ? 'bg-[#0D1117]' : 'bg-[#F8FAFC]',
        sandboxBg: isDark ? 'bg-[#0D1117]' : 'bg-[#E2E8F0]',
        sandboxBorder: isDark ? 'border-[#30363D]' : 'border-[#CBD5E1]',
        sandboxHeader: isDark ? 'bg-[#010409]' : 'bg-[#CBD5E1]',
        sandboxText: isDark ? 'text-[#8B949E]' : 'text-[#475569]',
        resultBg: isDark ? 'bg-[#010409]' : 'bg-[#FFFFFF]'
    };

    return (
        <div className={`fixed inset-0 flex overflow-hidden transition-colors duration-300 ${colors.bg} ${colors.textMain}`}>
            <aside className={`w-72 border-r hidden lg:flex flex-col transition-all overflow-hidden shrink-0 ${colors.sidebar}`}>
                <div className="h-16 flex items-center px-6 border-b border-inherit bg-black/5 lg:bg-transparent">
                    <a href="/" className="flex items-center gap-3">
                        <img src="/favicon.ico" alt="Konvierte Logo" className="w-6 h-6 object-contain" />
                        <span className="font-extrabold text-sm tracking-tight uppercase">Konvierte <span className="opacity-40">API</span></span>
                    </a>
                </div>
                <nav className="flex-1 overflow-y-auto p-4 space-y-8 pt-6 border-inherit">
                    <div className="space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-wider px-3 mb-2 opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>Arquitectura</p>
                        {endpoints.map(e => (
                            <button key={e.id} onClick={() => { setActiveMenu(e.id); setData(null); }} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${activeMenu === e.id ? 'bg-emerald-500/10 text-emerald-600 border-l-4 border-emerald-500 pl-2 shadow-sm' : isDark ? 'hover:bg-white/5 opacity-70 hover:opacity-100' : 'hover:bg-black/5 opacity-80 hover:opacity-100'}`}>
                                {e.icon} {e.label}
                            </button>
                        ))}
                    </div>
                    <div className="space-y-1">
                        <p className={`text-[10px] font-black uppercase tracking-wider px-3 mb-2 opacity-50 ${isDark ? 'text-white' : 'text-slate-900'}`}>Proyecto</p>
                        <button onClick={() => setActiveMenu('team')} className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all ${activeMenu === 'team' ? 'bg-emerald-500/10 text-emerald-600 border-l-4 border-emerald-500 pl-2 shadow-sm' : isDark ? 'hover:bg-white/5 opacity-70 hover:opacity-100' : 'hover:bg-black/5 opacity-80 hover:opacity-100'}`}>
                            <Users size={16} /> Desarrollador
                        </button>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-3 transition-all opacity-70 hover:opacity-100 ${isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                            <Github size={16} /> GitHub Wiki
                        </a>
                    </div>
                </nav>
                <div className="p-6 border-t border-inherit opacity-40">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold">V1.1.0 STABLE</span>
                    </div>
                </div>
            </aside>
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className={`h-16 border-b flex items-center justify-between px-8 md:px-12 backdrop-blur-md transition-all shrink-0 ${colors.sidebar}`}>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase opacity-60">
                        <ChevronRight size={14} className="text-emerald-500" /> {activeMenu === 'team' ? 'Desarrollo' : currentEndpoint?.label}
                    </div>
                    <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`p-2 rounded-lg border shadow-sm transition-all bg-inherit border-inherit`}>
                        {isDark ? <Sun size={14} /> : <Moon size={14} />}
                    </button>
                </header>
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                    <div className={`flex-1 overflow-y-auto p-6 md:p-14 space-y-8 md:space-y-12 transition-all ${colors.content}`}>
                        {/* Mobile Navigation */}
                        <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 snap-x custom-scrollbar -mx-6 px-6">
                            {endpoints.map(e => (
                                <button key={e.id} onClick={() => { setActiveMenu(e.id); setData(null); }} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border snap-start shadow-sm ${activeMenu === e.id ? 'bg-emerald-500 text-white border-emerald-500' : isDark ? 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}>
                                    {e.icon} {e.label}
                                </button>
                            ))}
                            <button onClick={() => setActiveMenu('team')} className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all border snap-start shadow-sm ${activeMenu === 'team' ? 'bg-emerald-500 text-white border-emerald-500' : isDark ? 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'}`}>
                                <Users size={16} /> Desarrollador
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {activeMenu !== 'team' ? (
                                <motion.div key={activeMenu} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                                    <section className="space-y-4 text-center sm:text-left">
                                        <h1 className="text-3xl font-extrabold tracking-tight underline underline-offset-8 decoration-emerald-500/20 italic">{currentEndpoint?.label}</h1>
                                        <p className={`text-base font-semibold leading-relaxed max-w-3xl ${colors.textSub}`}>
                                            "{currentEndpoint?.desc}"
                                        </p>
                                    </section>
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase opacity-60 flex items-center gap-2">
                                            <Code2 size={12} className="text-emerald-500" /> Endpoint API
                                        </p>
                                        <div className={`flex items-center gap-4 p-5 rounded-2xl border font-mono text-xs border-inherit group relative shadow-md overflow-hidden ${isDark ? colors.codeBg : 'bg-white'}`}>
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg font-black text-[10px]">GET</span>
                                            <span className="truncate opacity-80 font-bold">{baseUrlHost}{currentEndpoint?.path}</span>
                                            <button onClick={() => copyToClipboard(`${baseUrlHost}${currentEndpoint?.path}`, 'url')} className="ml-auto p-2 hover:bg-emerald-500/10 rounded-lg hover:text-emerald-600 transition-all opacity-40 group-hover:opacity-100">
                                                {copied === 'url' ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-10">
                                        {currentEndpoint?.params && currentEndpoint.params.length > 0 && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase opacity-60">Parámetros de Consulta (Query)</p>
                                                <div className={`border rounded-2xl overflow-hidden shadow-lg ${colors.card}`}>
                                                    <table className="w-full text-left text-xs">
                                                        <thead className={isDark ? 'bg-white/5' : 'bg-slate-50 border-b border-inherit'}>
                                                            <tr>
                                                                <th className="p-5 font-black uppercase tracking-widest opacity-60">Campo</th>
                                                                <th className="p-5 font-black uppercase tracking-widest opacity-60">Tipo</th>
                                                                <th className="p-5 font-black uppercase tracking-widest opacity-60">Info</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-inherit">
                                                            {currentEndpoint.params.map((p, i) => (
                                                                <tr key={i}>
                                                                    <td className="p-5 font-mono font-bold text-emerald-600">{p.field}</td>
                                                                    <td className="p-5 opacity-60 italic text-[10px] uppercase font-bold tracking-tight">{p.type}</td>
                                                                    <td className="p-5 font-medium italic opacity-70">{p.desc}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}

                                        {currentEndpoint?.schema && (
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase opacity-60">Esquema de Respuesta (JSON)</p>
                                                <div className={`border rounded-2xl overflow-hidden shadow-lg ${colors.card}`}>
                                                    <table className="w-full text-left text-xs">
                                                        <thead className={isDark ? 'bg-white/5' : 'bg-slate-50 border-b border-inherit'}>
                                                            <tr>
                                                                <th className="p-5 font-black uppercase tracking-widest opacity-60">Clave</th>
                                                                <th className="p-5 font-black uppercase tracking-widest opacity-60">Tipo</th>
                                                                <th className="p-5 font-black uppercase tracking-widest opacity-60">Descripción</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-inherit">
                                                            {currentEndpoint.schema.map((s, i) => (
                                                                <tr key={i}>
                                                                    <td className="p-5 font-mono font-bold text-emerald-600">{s.field}</td>
                                                                    <td className="p-5 opacity-60 italic text-[10px] uppercase font-bold tracking-tight">{s.type}</td>
                                                                    <td className="p-5 font-medium italic opacity-70">{s.desc}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-16">
                                    <div className="space-y-6">
                                        <h1 className="text-4xl font-extrabold tracking-tight">Arquitectura</h1>
                                        <p className={`text-lg font-medium leading-relaxed max-w-2xl ${colors.textSub}`}>
                                            Konvierte es una infraestructura de datos resiliente para el ecosistema financiero venezolano.
                                        </p>
                                    </div>
                                    <div className={`p-10 rounded-[2.5rem] border flex flex-col sm:flex-row items-center gap-10 shadow-2xl ${colors.card}`}>
                                        <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center text-emerald-500 border border-emerald-500/20 rotate-3 transition-transform hover:rotate-0">
                                            <Users size={32} />
                                        </div>
                                        <div className="text-center sm:text-left space-y-2">
                                            <h3 className="text-3xl font-black italic uppercase">Rubel Maneiro</h3>
                                            <p className="text-xs opacity-40 uppercase tracking-[0.3em] font-black">Lead Software Engineer</p>
                                            <div className="flex justify-center sm:justify-start gap-6 pt-4">
                                                <NavLink to="https://github.com/rmaneiro28">
                                                    <Github size={20} className="cursor-pointer hover:text-emerald-500 transition-colors opacity-60 hover:opacity-100" />
                                                </NavLink>
                                                <ExternalLink size={20} className="cursor-pointer hover:text-emerald-500 transition-colors opacity-60 hover:opacity-100" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <footer className="pt-20 pb-10 border-t border-inherit flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
                            <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                                <a href="#" className="hover:text-emerald-500">Docs</a>
                                <a href="#" className="hover:text-emerald-500">GitHub</a>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                                Crafted with <Heart size={14} className="text-red-500 fill-red-500 shadow-sm" /> by Maneiro
                            </span>
                        </footer>
                    </div>
                    <div className={`w-[30rem] border-l hidden lg:flex flex-col h-full transition-all relative ${colors.sandboxBg}`}>
                        <div className={`p-4 border-b flex items-center justify-between transition-all shrink-0 ${colors.sandboxBorder} ${colors.sandboxHeader} ${colors.sandboxText}`}>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]">
                                <Terminal size={14} className="text-emerald-500" />
                                <span>Live Sandbox Console</span>
                            </div>
                            <div className="flex gap-1.5 opacity-20">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            </div>
                        </div>
                        <div className={`flex-1 overflow-y-auto p-10 space-y-10 flex flex-col transition-all custom-scrollbar ${isDark ? colors.resultBg : 'bg-transparent'}`}>
                            <div className="space-y-6 flex-1 flex flex-col shrink-0">
                                <div className={`flex rounded-xl p-1 gap-1 border transition-all ${isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-[#CBD5E1] border-[#CBD5E1]'}`}>
                                    {(['js', 'python', 'curl'] as const).map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? (isDark ? 'bg-[#30363D] text-emerald-400 shadow-md' : 'bg-white text-emerald-600 shadow-sm') : (isDark ? 'text-[#8B949E] hover:text-white' : 'text-[#475569] hover:text-black')}`}>
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <div className={`p-8 rounded-[2rem] border relative group flex flex-col justify-between overflow-hidden shadow-2xl transition-all ${isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-white/40 border-[#CBD5E1]'}`}>
                                    <pre className={`font-mono text-xs leading-[1.8] overflow-auto max-h-[150px] custom-scrollbar transition-all ${isDark ? 'text-emerald-400/70' : 'text-emerald-700'}`}>
                                        {activeMenu !== 'team' && (
                                            (activeTab === 'js' ? `fetch("${baseUrlHost}${currentEndpoint?.path}")\n  .then(res => res.json())\n  .then(console.log);` :
                                                activeTab === 'python' ? `import requests\nres = requests.get("${baseUrlHost}${currentEndpoint?.path}")\nprint(res.json())` :
                                                    `curl -G "${baseUrlHost}${currentEndpoint?.path}"`)
                                        )}
                                    </pre>
                                    <button onClick={fetchLiveStats} className="mt-10 py-3 bg-emerald-500 text-black rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3">
                                        {loading ? '...' : <><Play size={14} fill="currentColor" /> Run Endpoint</>}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-6 flex-1 flex flex-col min-h-0">
                                <div className={`flex items-center justify-between border-b pb-4 transition-all ${colors.sandboxBorder} ${colors.sandboxText}`}>
                                    <span className="text-[10px] font-black uppercase tracking-widest italic opacity-50">Response Payload</span>
                                    <div className="flex items-center gap-4">
                                        {data && (
                                            <>
                                                <button 
                                                    onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'payload')}
                                                    className="p-1.5 hover:bg-emerald-500/10 rounded-lg hover:text-emerald-500 transition-all flex items-center gap-2 group/copy"
                                                    title="Copiar JSON"
                                                >
                                                    {copied === 'payload' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} className="opacity-50 group-hover/copy:opacity-100" />}
                                                    <span className="text-[9px] font-black tracking-tighter">JSON</span>
                                                </button>
                                                <span className="text-[10px] font-black uppercase text-emerald-500 italic flex items-center gap-2">
                                                    <Check size={12} /> 200 OK
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className={`p-8 rounded-[2rem] border flex-1 overflow-auto transition-all custom-scrollbar ${isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-white border-[#CBD5E1] shadow-inner'}`}>
                                    {data ? (
                                        <pre className={`font-mono text-[11px] leading-relaxed overflow-auto transition-all ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                            {JSON.stringify(data, null, 2)}
                                        </pre>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center opacity-10 text-center space-y-6 italic py-10 grayscale">
                                            <Activity size={48} />
                                            <p className="text-[11px] font-black uppercase tracking-[0.3em]">Waiting for transmission...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiTestPage;
