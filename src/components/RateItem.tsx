
import React from 'react';
import { Reorder } from 'framer-motion';
import { GripVertical, Star, Trash2 } from 'lucide-react';
import { Flag } from './ui/Flag';

export const RateItem = React.memo(({
    id,
    data,
    isDefault,
    onToggleDefault,
    onRemove,
    isCustom
}: {
    id: string,
    data: any,
    isDefault: boolean,
    onToggleDefault: (id: string) => void,
    onRemove: (id: string) => void,
    isCustom: boolean
}) => (
    <Reorder.Item
        key={id}
        value={id}
        className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between group cursor-grab active:cursor-grabbing border border-transparent hover:border-primary/10 transition-colors"
    >
        <div className="flex items-center gap-3 flex-1">
            <GripVertical size={14} className="opacity-50 group-hover:opacity-100" />
            <Flag code={data.flag} />
            <div className="overflow-hidden">
                <p className="text-[11px] font-black uppercase truncate">{data.name}</p>
                <p className="text-[8px] opacity-80 font-bold uppercase tracking-tighter">
                    {isCustom ? 'Personalizada' : 'Sistema'}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); onToggleDefault(id); }}
                aria-label={isDefault ? "Desmarcar favorita" : "Marcar como favorita"}
                className={`p-2 rounded-lg transition-colors ${isDefault ? 'text-yellow-500 bg-yellow-500/10' : 'text-primary hover:text-yellow-500 hover:bg-yellow-500/5'}`}
                title={isDefault ? "Tasa por defecto" : "Marcar como favorita"}
            >
                <Star size={14} fill={isDefault ? "currentColor" : "none"} />
            </button>
            {isCustom && (
                <button
                    onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                    aria-label="Eliminar tasa personalizada"
                    className="p-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-500/10 rounded-lg transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
    </Reorder.Item>
));
RateItem.displayName = "RateItem";
