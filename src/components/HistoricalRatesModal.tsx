import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoricalRatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    applyHistoricalRates: (date: string, usdBCV: number, eurBCV: number, usdBinance: number) => void;
}

interface DailyRate {
    date: string;
    usd_oficial: number | null;
    usd_paralelo: number | null;
    eur_oficial: number | null;
}

export const HistoricalRatesModal: React.FC<HistoricalRatesModalProps> = ({ isOpen, onClose, applyHistoricalRates }) => {
    const [history, setHistory] = useState<DailyRate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calendar state
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        if (!isOpen) return;

        const loadHistory = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await fetch('https://konvierte.vercel.app/api/history?limit=2000');
                if (!res.ok) throw new Error('API fetch error');
                const json = await res.json();

                // Agrupar por fecha
                const grouped: Record<string, DailyRate> = {};

                json.history.forEach((item: any) => {
                    const dateStr = item.fecha; // YYYY-MM-DD
                    if (!grouped[dateStr]) grouped[dateStr] = { date: dateStr, usd_oficial: null, usd_paralelo: null, eur_oficial: null };
                    
                    if (item.currency === 'USD') grouped[dateStr].usd_oficial = item.promedio;
                    // Mapeamos USDT como paralelo para rellenar ese hueco, o si de la bd viene alguno marcado como paralelo viejo
                    if (item.currency === 'USDT' || (item.fuente || '').toLowerCase().includes('paralelo')) grouped[dateStr].usd_paralelo = item.promedio;
                    if (item.currency === 'EUR') grouped[dateStr].eur_oficial = item.promedio;
                });

                // Convertir a array y ordenar descendente para la lista, ascendente para gráfico
                const sorted = Object.values(grouped).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setHistory(sorted);
            } catch (err) {
                console.error(err);
                setError('Error al cargar el historial.');
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [isOpen]);

    const handleSelectDate = (day: DailyRate) => {
        if (day.usd_oficial && day.eur_oficial && day.usd_paralelo) {
            applyHistoricalRates(day.date, day.usd_oficial, day.eur_oficial, day.usd_paralelo);
            onClose();
        }
    };

    // Funciones del calendario
    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];

        // Días de relleno
        let startDayOfWeek = firstDay.getDay(); // 0 is Sunday
        startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Hacer que Lunes sea 0

        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push(dateStr);
        }

        return days;
    };

    const calendarDays = getDaysInMonth(currentMonth);
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] p-6 flex items-center justify-center"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card max-w-[500px] w-full max-h-[90vh] flex flex-col bg-surface dark:bg-surface border-white/10 rounded-3xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl flex items-center gap-2">
                                    <History size={20} className="text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-widest leading-none">
                                        Histórico de Tasas
                                    </h3>
                                    <p className="text-[10px] opacity-50 font-bold tracking-widest uppercase mt-1">Explora días anteriores</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative min-h-[50vh]">
                            {loading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {!loading && error && (
                                <div className="text-center opacity-50 text-xs py-10 font-medium">
                                    {error}
                                </div>
                            )}

                            {!loading && !error && history.length === 0 && (
                                <div className="text-center opacity-50 text-xs py-10 font-medium">
                                    No hay datos históricos disponibles
                                </div>
                            )}

                            {!loading && history.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <button onClick={prevMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={16} /></button>
                                        <h4 className="text-sm font-black uppercase tracking-widest">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h4>
                                        <button onClick={nextMonth} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={16} /></button>
                                    </div>

                                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(day => (
                                            <div key={day} className="text-[10px] font-black opacity-40 py-2">{day}</div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-7 gap-2">
                                        {calendarDays.map((dateStr, idx) => {
                                            if (!dateStr) return <div key={`empty-${idx}`} className="aspect-square" />;

                                            // Find if history exists for this date
                                            const dayData = history.find(h => h.date === dateStr);
                                            const hasData = !!dayData;
                                            const isSelected = hasData && dayData.usd_oficial && dayData.usd_paralelo;
                                            const dayNum = parseInt(dateStr.split('-')[2], 10);

                                            return (
                                                <button
                                                    key={dateStr}
                                                    disabled={!isSelected}
                                                    onClick={() => dayData && handleSelectDate(dayData)}
                                                    className={`
                                                        aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all group
                                                        ${isSelected ? 'bg-primary/20 hover:bg-primary border border-primary/30 hover:border-transparent text-white cursor-pointer' : 'opacity-30 bg-white/5 cursor-not-allowed border border-transparent'}
                                                    `}
                                                >
                                                    <span className={`text-xs font-black ${isSelected ? 'group-hover:text-white' : ''}`}>{dayNum}</span>
                                                    {isSelected && dayData && (
                                                        <span className="text-[7px] font-bold opacity-70 group-hover:opacity-100 hidden sm:block">
                                                            {dayData.usd_oficial}
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="flex items-center gap-3 justify-center mt-6 text-[10px] uppercase tracking-widest font-black opacity-50">
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-primary"></div><span>Con datos</span></div>
                                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-white/20"></div><span>Sin datos</span></div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
