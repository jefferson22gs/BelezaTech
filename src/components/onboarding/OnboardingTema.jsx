import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Palette, ArrowLeft, ArrowRight, Sparkles, Crown } from "lucide-react";
import { motion } from "framer-motion";

const temasPredefinidos = [
  {
    nome: "Roxo Elegante",
    cores: {
      primaria: "#8b5cf6",
      secundaria: "#a855f7",
      acento: "#fbbf24",
      texto: "#1f2937",
      fundo: "#ffffff"
    }
  },
  {
    nome: "Rosa Glamour",
    cores: {
      primaria: "#ec4899",
      secundaria: "#f472b6",
      acento: "#06b6d4",
      texto: "#1f2937",
      fundo: "#ffffff"
    }
  },
  {
    nome: "Azul Profissional",
    cores: {
      primaria: "#3b82f6",
      secundaria: "#60a5fa",
      acento: "#f59e0b",
      texto: "#1f2937",
      fundo: "#ffffff"
    }
  },
  {
    nome: "Verde Sofisticado",
    cores: {
      primaria: "#059669",
      secundaria: "#10b981",
      acento: "#8b5cf6",
      texto: "#1f2937",
      fundo: "#ffffff"
    }
  },
  {
    nome: "Dourado Luxo",
    cores: {
      primaria: "#d97706",
      secundaria: "#f59e0b",
      acento: "#8b5cf6",
      texto: "#1f2937",
      fundo: "#ffffff"
    }
  },
  {
    nome: "Escuro Moderno",
    cores: {
      primaria: "#6366f1",
      secundaria: "#8b5cf6",
      acento: "#f59e0b",
      texto: "#f9fafb",
      fundo: "#111827"
    }
  }
];

export default function OnboardingTema({ data, updateData, onNext, onPrev }) {
  const [temaSelecionado, setTemaSelecionado] = useState(
    temasPredefinidos.find(t => 
      t.cores.primaria === data.cores_tema.primaria
    )?.nome || "Personalizado"
  );

  const selecionarTema = (tema) => {
    setTemaSelecionado(tema.nome);
    updateData({ cores_tema: tema.cores });
  };

  const PreviewInterface = ({ tema }) => (
    <div 
      className="rounded-lg overflow-hidden border-2 transition-all duration-300"
      style={{ 
        backgroundColor: tema.fundo,
        color: tema.texto,
        borderColor: tema.primaria
      }}
    >
      {/* Header mockup */}
      <div 
        className="p-4 flex items-center gap-3"
        style={{ backgroundColor: tema.primaria }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ backgroundColor: tema.acento }}>
          <Crown className="w-5 h-5" style={{ color: tema.texto }} />
        </div>
        <div>
          <h3 className="font-bold text-white">BelezaTech</h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/80">Infinite</span>
            <Sparkles className="w-2.5 h-2.5 text-white/80" />
          </div>
        </div>
      </div>

      {/* Content mockup */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tema.secundaria }} />
          <div className="h-2 flex-1 rounded" style={{ backgroundColor: tema.primaria + '20' }} />
        </div>
        
        <div className="flex gap-2">
          <div 
            className="px-3 py-1 rounded text-xs text-white font-medium"
            style={{ backgroundColor: tema.primaria }}
          >
            Botão Principal
          </div>
          <div 
            className="px-3 py-1 rounded text-xs font-medium border"
            style={{ 
              borderColor: tema.secundaria,
              color: tema.secundaria 
            }}
          >
            Secundário
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-2 rounded" style={{ backgroundColor: tema.primaria + '15' }} />
          <div className="h-2 w-3/4 rounded" style={{ backgroundColor: tema.secundaria + '15' }} />
        </div>
      </div>

      {/* Footer mockup */}
      <div 
        className="p-2 text-center"
        style={{ backgroundColor: tema.primaria + '10' }}
      >
        <div className="w-12 h-1 rounded mx-auto" style={{ backgroundColor: tema.acento }} />
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Personalize as Cores da Interface
        </h2>
        <p className="text-lg text-gray-600">
          Escolha o tema que mais combina com a identidade do seu salão
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Lista de temas */}
        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {temasPredefinidos.map((tema, index) => (
              <motion.div
                key={tema.nome}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`cursor-pointer transition-all duration-300 ${
                  temaSelecionado === tema.nome 
                    ? 'transform scale-105' 
                    : 'hover:scale-102'
                }`}
                onClick={() => selecionarTema(tema)}
              >
                <Card className={`glass-effect border-2 ${
                  temaSelecionado === tema.nome 
                    ? 'border-purple-500 shadow-lg' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tema.nome}</CardTitle>
                      {temaSelecionado === tema.nome && (
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                    
                    {/* Paleta de cores */}
                    <div className="flex gap-1 mt-2">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: tema.cores.primaria }}
                        title="Cor Primária"
                      />
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: tema.cores.secundaria }}
                        title="Cor Secundária"
                      />
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: tema.cores.acento }}
                        title="Cor de Acento"
                      />
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: tema.cores.fundo }}
                        title="Cor de Fundo"
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <PreviewInterface tema={tema.cores} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Preview maior */}
        <div className="lg:col-span-1">
          <Card className="glass-effect border-0 premium-shadow sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Preview Completo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.logo_url && (
                  <div className="text-center mb-4">
                    <img
                      src={data.logo_url}
                      alt="Logo"
                      className="max-w-full max-h-16 mx-auto object-contain"
                    />
                  </div>
                )}
                
                <div className="scale-110">
                  <PreviewInterface tema={data.cores_tema} />
                </div>
                
                <div className="text-center pt-4">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {data.nome_salao}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tema: {temaSelecionado}
                  </p>
                </div>

                {/* Detalhes das cores */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Primária:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: data.cores_tema.primaria }}
                      />
                      <code className="bg-gray-100 px-1 rounded">
                        {data.cores_tema.primaria}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Secundária:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: data.cores_tema.secundaria }}
                      />
                      <code className="bg-gray-100 px-1 rounded">
                        {data.cores_tema.secundaria}
                      </code>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Acento:</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: data.cores_tema.acento }}
                      />
                      <code className="bg-gray-100 px-1 rounded">
                        {data.cores_tema.acento}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between mt-12">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <Button
          onClick={onNext}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}