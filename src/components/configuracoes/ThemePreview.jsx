import React from 'react';
import { Crown, Sparkles, Home, Calendar, Users, Settings } from 'lucide-react';

export default function ThemePreview({ logoUrl, nomeSalao, cores }) {

    const getContrastingColor = (hex) => {
        if (!hex) return '#000000';
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155 ? '#0F172A' : '#F8FAFC';
    };

    const primaryFg = getContrastingColor(cores.primaria);
    const accentFg = getContrastingColor(cores.acento);

    return (
        <div 
            className="rounded-xl overflow-hidden border-2"
            style={{ 
                backgroundColor: cores.fundo, 
                color: cores.texto,
                borderColor: cores.primaria
            }}
        >
            <div className="flex h-64">
                {/* Sidebar */}
                <div className="w-1/3 p-4 space-y-3" style={{ backgroundColor: cores.primaria + '15' }}>
                    <div className="flex items-center gap-2">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-6 h-6 object-contain" />
                        ) : (
                            <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: cores.acento, color: accentFg }}>
                                <Crown className="w-4 h-4" />
                            </div>
                        )}
                        <div className="w-full h-3 rounded" style={{backgroundColor: cores.secundaria + '50'}}/>
                    </div>
                    
                    <div className="p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: cores.primaria, color: primaryFg }}>
                        <Home className="w-4 h-4" />
                        <span className="text-xs font-bold">Dashboard</span>
                    </div>

                    {[Calendar, Users, Settings].map((Icon, i) => (
                         <div key={i} className="p-2 rounded-lg flex items-center gap-2 opacity-70">
                            <Icon className="w-4 h-4" />
                            <div className="w-full h-2 rounded" style={{backgroundColor: cores.secundaria + '30'}}/>
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="w-2/3 p-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="w-1/2 h-4 rounded" style={{backgroundColor: cores.texto + '40'}}/>
                        <div className="w-6 h-6 rounded-full" style={{backgroundColor: cores.primaria}}/>
                    </div>

                    <div className="p-4 rounded-lg" style={{backgroundColor: cores.fundo, border: `1px solid ${cores.primaria + '30'}`}}>
                        <div className="w-1/3 h-3 rounded mb-2" style={{backgroundColor: cores.texto + '30'}}/>
                        <div className="w-3/4 h-6 rounded mb-3" style={{backgroundColor: cores.secundaria + '50'}}/>
                        <div className="w-full h-2 rounded" style={{backgroundColor: cores.texto + '10'}}/>
                    </div>
                    
                    <div className="flex gap-2">
                        <div className="px-4 py-2 rounded-lg text-sm font-bold" style={{backgroundColor: cores.primaria, color: primaryFg}}>
                            Botão
                        </div>
                        <div className="px-4 py-2 rounded-lg text-sm font-bold" style={{backgroundColor: cores.acento, color: accentFg}}>
                            Ação
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}