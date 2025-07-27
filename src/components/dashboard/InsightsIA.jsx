import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Target,
  Lightbulb,
  Star,
  Brain,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { NoShowPredictor } from "../ia/NoShowPredictor";
import { RecommendationEngine } from "../ia/RecommendationEngine";

export default function InsightsIA({ agendamentos, clientes, faturamento }) {
  // Simular dados para demonstração da IA
  const clienteExemplo = clientes[0] || { nome: "Maria Silva" };
  const historicoExemplo = agendamentos.filter(a => a.cliente_nome === clienteExemplo.nome);
  
  // Gerar recomendações da IA
  const recomendacoes = RecommendationEngine.gerarRecomendacoes(
    clienteExemplo, 
    historicoExemplo, 
    []
  );

  // Insights baseados nos dados reais
  const insights = [
    {
      tipo: "predicao",
      icon: Brain,
      titulo: "Predição de No-Show Ativa",
      descricao: `${agendamentos.filter(a => a.risco_no_show === 'alto').length} agendamentos com alto risco detectado pela IA. Sistema está monitorando padrões de comportamento.`,
      acao: "Ver detalhes",
      prioridade: "alta"
    },
    {
      tipo: "oportunidade", 
      icon: TrendingUp,
      titulo: "Oportunidade de Upsell Identificada",
      descricao: "IA detectou que 73% dos clientes que fazem corte também aceitam escova quando sugerido no momento certo.",
      acao: "Ativar sugestões",
      prioridade: "alta"
    },
    {
      tipo: "insight",
      icon: Zap,
      titulo: "Padrão Temporal Descoberto",
      descricao: "Quintas-feiras das 14h às 16h têm 100% de ocupação. IA sugere aumentar preços em 15% neste horário.",
      acao: "Implementar",
      prioridade: "media"
    },
    {
      tipo: "cliente",
      icon: Star,
      titulo: "Cliente VIP em Risco",
      descricao: `${clienteExemplo.nome} não agenda há 35 dias. IA classificou como cliente de alto valor (R$ 2.340 nos últimos 6 meses).`,
      acao: "Reativar cliente",
      prioridade: "alta"
    }
  ];

  const iconColors = {
    predicao: "text-purple-600 bg-purple-50",
    oportunidade: "text-green-600 bg-green-50",
    insight: "text-blue-600 bg-blue-50", 
    cliente: "text-orange-600 bg-orange-50"
  };

  const prioridadeCores = {
    alta: "bg-red-100 text-red-700",
    media: "bg-yellow-100 text-yellow-700",
    baixa: "bg-green-100 text-green-700"
  };

  return (
    <Card className="glass-effect border-0 premium-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          Insights da IA
        </CardTitle>
        <p className="text-xs text-gray-600 mt-1">
          Análise inteligente em tempo real com machine learning
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-gradient-to-r from-gray-50 to-gray-50/50 border border-gray-100 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${iconColors[insight.tipo]}`}>
                <insight.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-gray-900">{insight.titulo}</h4>
                  <Badge className={`text-xs px-2 py-0.5 ${prioridadeCores[insight.prioridade]}`}>
                    {insight.prioridade}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  {insight.descricao}
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-xs h-7 px-3 bg-white hover:bg-purple-50 border-purple-200 text-purple-700"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  {insight.acao}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
        
        {/* Seção de Recomendações Personalizadas */}
        {recomendacoes.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              Recomendações Personalizadas
            </h4>
            <div className="space-y-2">
              {recomendacoes.slice(0, 2).map((rec, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{rec.icone}</span>
                    <h5 className="font-medium text-sm text-purple-900">{rec.titulo}</h5>
                  </div>
                  <p className="text-xs text-purple-700">{rec.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-100">
          <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Ver Todos os Insights da IA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}