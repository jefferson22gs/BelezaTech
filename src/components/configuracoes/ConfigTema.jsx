import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Sparkles, Wand2, Upload, Save, Sun, Moon, Check, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { InvokeLLM } from "@/api/integrations";
import ThemePreview from "./ThemePreview"; // A new component for the preview

// --- Color Utility Functions ---

// Converts HEX to HSL array [h, s, l]
const hexToHslArray = (hex) => {
    if (!hex) return [0, 0, 50];
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return [0, 0, 50];
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
};

// Converts HSL array [h, s, l] to HEX
const hslToHex = ([h, s, l]) => {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return `#${[0, 8, 4].map(n =>
        Math.round(f(n) * 255).toString(16).padStart(2, '0')
    ).join('')}`;
};

// Generates palettes based on a primary color
const generateHarmonicPalettes = (primaryHex, mode = 'light') => {
    const [h, s, l] = hexToHslArray(primaryHex);
    
    const isDark = l < 40;
    const baseText = isDark ? '#F8FAFC' : '#0F172A';
    const baseFundo = isDark ? '#1E293B' : '#FFFFFF';

    const palettes = {};

    // Monochromatic
    palettes.mono = {
        primaria: primaryHex,
        secundaria: hslToHex([h, s, l > 50 ? l - 15 : l + 15]),
        acento: hslToHex([h, s, l > 50 ? l - 30 : l + 30]),
        texto: baseText,
        fundo: baseFundo,
    };

    // Contrast (Complementary)
    const complementH = (h + 180) % 360;
    palettes.contrast = {
        primaria: primaryHex,
        secundaria: hslToHex([h, s * 0.8, l * 1.1]),
        acento: hslToHex([complementH, s, l]),
        texto: baseText,
        fundo: baseFundo,
    };

    // Soft (Analogous)
    const analogousH = (h + 30) % 360;
    palettes.soft = {
        primaria: primaryHex,
        secundaria: hslToHex([analogousH, s * 0.9, l]),
        acento: hslToHex([(h + 60) % 360, s, l]),
        texto: baseText,
        fundo: baseFundo,
    };
    
    // Adjust for dark mode
    if(mode === 'dark') {
        Object.keys(palettes).forEach(key => {
            palettes[key].texto = '#F1F5F9';
            palettes[key].fundo = '#0F172A';
        });
    }

    return palettes;
};

// --- Main Component ---

export default function ConfigTema({ configuracao, onUpdate }) {
    const [activePalette, setActivePalette] = useState(configuracao?.cores_tema || {
        primaria: "#8b5cf6", secundaria: "#a855f7", acento: "#fbbf24", texto: "#1f2937", fundo: "#ffffff"
    });
    const [suggestedPalettes, setSuggestedPalettes] = useState({});
    const [mode, setMode] = useState('light');
    const [isGenerating, setIsGenerating] = useState(false);

    // Apply theme to the whole app
    const applyLiveTheme = useCallback((cores) => {
        if (!cores) return;
        const root = document.documentElement;

        const hexToHslString = (hex) => {
            const [h, s, l] = hexToHslArray(hex);
            return `${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%`;
        };
        
        const getContrast = (hex) => {
             const [,,l] = hexToHslArray(hex);
             return l > 55 ? '0 0% 10%' : '0 0% 100%';
        };

        root.style.setProperty('--background', hexToHslString(cores.fundo));
        root.style.setProperty('--foreground', hexToHslString(cores.texto));
        root.style.setProperty('--card', hexToHslString(cores.fundo));
        root.style.setProperty('--card-foreground', hexToHslString(cores.texto));
        root.style.setProperty('--popover', hexToHslString(cores.fundo));
        root.style.setProperty('--popover-foreground', hexToHslString(cores.texto));
        root.style.setProperty('--primary', hexToHslString(cores.primaria));
        root.style.setProperty('--primary-foreground', getContrast(cores.primaria));
        root.style.setProperty('--secondary', hexToHslString(cores.secundaria));
        root.style.setProperty('--secondary-foreground', getContrast(cores.secundaria));
        root.style.setProperty('--accent', hexToHslString(cores.acento));
        root.style.setProperty('--accent-foreground', getContrast(cores.acento));
        root.style.setProperty('--ring', hexToHslString(cores.primaria));

    }, []);

    useEffect(() => {
        const palettes = generateHarmonicPalettes(activePalette.primaria, mode);
        setSuggestedPalettes(palettes);
        applyLiveTheme(activePalette);
    }, [activePalette.primaria, mode, applyLiveTheme]);

    const handlePrimaryColorChange = (e) => {
        const newPrimary = e.target.value;
        const newPalettes = generateHarmonicPalettes(newPrimary, mode);
        setActivePalette(newPalettes.mono); // Default to monochromatic when primary changes
    };

    const handlePaletteSelection = (palette) => {
        setActivePalette(palette);
    };

    const handleSaveTheme = async () => {
        setIsGenerating(true);
        try {
            await onUpdate({ cores_tema: activePalette });
        } catch (error) {
            console.error("Erro ao salvar tema:", error);
        } finally {
            setIsGenerating(false);
        }
    };
    
    const extractFromLogo = async () => {
        if(!configuracao?.logo_url) return;
        setIsGenerating(true);
        try {
            const response = await InvokeLLM({
                prompt: `Analyze the image at this URL and extract the single most dominant HEX color code. Return only the color code, nothing else. Example: #RRGGBB. URL: ${configuracao.logo_url}`,
                response_json_schema: { type: 'object', properties: { color: { type: 'string' } } }
            });
            if(response.color && /^#[0-9A-F]{6}$/i.test(response.color)) {
                const newPalettes = generateHarmonicPalettes(response.color, mode);
                setActivePalette(newPalettes.mono);
            }
        } catch(error) {
            console.error("Error extracting color from logo", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-500" />
                        Estúdio de Cores
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                        Crie uma identidade visual única para sua plataforma. As alterações são aplicadas em tempo real.
                    </p>
                </CardHeader>
            </Card>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Controles */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">1. Ponto de Partida</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={extractFromLogo} className="w-full" disabled={!configuracao?.logo_url || isGenerating}>
                                <Wand2 className="w-4 h-4 mr-2" />
                                Extrair cores do Logo
                            </Button>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">2. Cor Principal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label>Escolha sua cor base</Label>
                            <div className="relative mt-2">
                                <input
                                    type="color"
                                    value={activePalette.primaria}
                                    onChange={handlePrimaryColorChange}
                                    className="w-full h-12 p-1 bg-white border rounded-md cursor-pointer"
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono uppercase text-gray-600 pointer-events-none">
                                    {activePalette.primaria}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">3. Paletas Harmônicas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {Object.entries(suggestedPalettes).map(([name, palette]) => (
                                <div key={name} onClick={() => handlePaletteSelection(palette)}
                                     className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between">
                                     <span className="capitalize font-medium text-sm">{name}</span>
                                     <div className="flex gap-1.5">
                                         <div className="w-5 h-5 rounded-full" style={{backgroundColor: palette.primaria}}/>
                                         <div className="w-5 h-5 rounded-full" style={{backgroundColor: palette.secundaria}}/>
                                         <div className="w-5 h-5 rounded-full" style={{backgroundColor: palette.acento}}/>
                                     </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    
                    <Button onClick={handleSaveTheme} className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white" disabled={isGenerating}>
                        <Save className="w-4 h-4 mr-2"/>
                        Salvar e Aplicar Tema
                    </Button>
                </div>

                {/* Preview */}
                <div className="lg:col-span-2">
                     <Card className="sticky top-8">
                        <CardHeader>
                           <CardTitle>Preview em Tempo Real</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ThemePreview logoUrl={configuracao?.logo_url} nomeSalao={configuracao?.nome_salao} cores={activePalette} />
                        </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    );
}