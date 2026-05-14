import React from 'react';
import { Share2, Settings2, Wallet, ArrowLeft, Coins } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface HeaderProps {
    setIsShareOpen: (isOpen: boolean) => void;
    setIsConfigOpen: (isOpen: boolean) => void;
    setIsPaymentMethodsOpen: (isOpen: boolean) => void;
    setIsKambioOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setIsShareOpen, setIsConfigOpen, setIsPaymentMethodsOpen, setIsKambioOpen }) => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-border safe-top flex items-center">
            <div className="max-w-4xl mx-auto px-6 w-full h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => navigate('/')} 
                        className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center opacity-60 hover:opacity-100 md:hidden"
                        aria-label="Volver al Inicio"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-9 h-9 bg-surface rounded-xl flex items-center justify-center shadow-lg border border-border overflow-hidden">
                            <svg width="22" height="22" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M38 32V96M38 64 L74 32M56 64L88 96" stroke="#10B981" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="85" cy="64" r="18" fill="var(--surface-color)" stroke="#10B981" strokeWidth="6" />
                                <path d="M78 58C80 54 83 53 85 53C88 53 91 54 93 58L97 54M92 70C90 74 87 75 85 75C82 75 79 74 77 70L73 74" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h1 className="text-sm font-black uppercase tracking-[0.2em] relative">
                            Konvierte
                            <span className="sr-only"> - Calculadora de Tipo de Cambio en Venezuela</span>
                        </h1>
                    </Link>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsShareOpen(true)} aria-label="Compartir" className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center opacity-60 hover:opacity-100"><Share2 size={18} /></button>
                    <button onClick={() => setIsKambioOpen(true)} aria-label="Kambio" className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center opacity-60 hover:opacity-100"><Coins size={18} /></button>
                    <button onClick={() => setIsPaymentMethodsOpen(true)} aria-label="Fichas de Pago" className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center opacity-60 hover:opacity-100"><Wallet size={18} /></button>
                    <button onClick={() => setIsConfigOpen(true)} aria-label="Ajustes" className="w-9 h-9 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center opacity-60 hover:opacity-100"><Settings2 size={18} /></button>
                </div>
            </div>
        </nav>
    );
};
