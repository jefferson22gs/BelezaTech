import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Calculator,
  TrendingUp,
  Clock,
  DollarSign,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

export default function MetasSimulador({ faturamentoAtual }) {
  const [metaDesejada, setMetaDesejada] = useState(15000);
  const [mostrarSimulacao, setMostrarSimulacao] = useState(false);

  const valorRestante = metaDesejada - faturamentoAtual;
  const diasRestantes = 30 - new Date().getDate();
  const mediadiaria = valorRestante / diasRestantes;
  const percentualAtingido = (faturamentoAtual / metaDesejada) * 100;

  const simularEstrategia = () => {
    setMostrarSimulacao(true);
  };

  const estrategias = [
    {
      titulo: "Focar em Serviços Premium",
      descricao: "Aumente escova progressiva e tratamentos capilares",
      impacto: "+R$ 1.200/semana",
      dificuldade: "Fácil"
    },
    {
      titulo: "Campanha de Reativação",
      descricao: "Contate 15 clientes inativos com oferta especial",
      impacto: "+R$ 800/semana", 
      dificuldade: "Médio"
    },
    {
      titulo: "Upsell Automático",
      descricao: "Ofereça produtos complementares em cada atendimento",
      impacto: "+R$ 600/semana",
      dificuldade: "Fácil"
    }
  ];

  return (
    <Card className="glass-effect border-0 premium-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-500" />
          Simulador de Metas IA
        </CardTitle>
        <p className="text-sm text-gray-600">
          Configure sua meta e receba um plano personalizado para alcançá-la
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Configuração da Meta */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="meta" className="text-sm font-medium">Meta Mensal (R$)</Label>
              <Input
                id="meta"
                type="number"
                value={metaDesejada}
                onChange={(e) => setMetaDesejada(Number(e.target.value))}
                className="mt-1"
                placeholder="15000"
              />
            </div>
            <Button 
              onClick={simularEstrategia}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white mt-6"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Simular
            </Button>
          </div>

          {/* Progress da Meta Atual */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso da Meta</span>
              <Badge className="bg-purple-100 text-purple-700">
                {percentualAtingido.toFixed(1)}%
              </Badge>
            </div>
            <div className="w-full h-3 bg-white rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentualAtingido, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
              <span>R$ {faturamentoAtual.toLocaleString('pt-BR')}</span>
              <span>R$ {metaDesejada.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Simulação de Estratégia */}
        {mostrarSimulacao && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">Análise da IA</h4>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Valor restante:</span>
                  <p className="font-semibold text-gray-900">R$ {valorRestante.toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Dias restantes:</span>
                  <p className="font-semibold text-gray-900">{diasRestantes} dias</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Média diária necessária:</span>
                  <p className="font-semibold text-lg text-green-600">
                    R$ {mediadiaria.toFixed(0)}/dia
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Estratégias Recomendadas
              </h4>
              <div className="space-y-3">
                {estrategias.map((estrategia, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm text-gray-900 mb-1">
                          {estrategia.titulo}
                        </h5>
                        <p className="text-xs text-gray-600 mb-2">
                          {estrategia.descricao}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            {estrategia.impacto}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {estrategia.dificuldade}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}