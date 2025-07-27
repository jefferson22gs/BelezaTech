
import React, { useState, useEffect } from "react";
import { Agendamento } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { Transacao } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  AlertCircle,
  Sparkles,
  Crown,
  Clock,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

import MetricasCard from "../components/dashboard/MetricasCard";
import AgendamentosHoje from "../components/dashboard/AgendamentosHoje";
import InsightsIA from "../components/dashboard/InsightsIA";
import MetasSimulador from "../components/dashboard/MetasSimulador";
import StatusAssinatura from "../components/dashboard/StatusAssinatura";

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedData, setHasLoadedData] = useState(false);

  useEffect(() => {
    // Só carregar dados uma vez quando o componente é montado
    if (!hasLoadedData) {
      loadDashboardData();
    }
  }, [hasLoadedData]);

  const loadDashboardData = async () => {
    try {
      // Carregar dados com delays para evitar rate limit
      const agendamentosData = await Agendamento.list("-data_hora", 50);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      const clientesData = await Cliente.list("-created_date", 100);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      const transacoesData = await Transacao.list("-data", 100);
      
      setAgendamentos(agendamentosData);
      setClientes(clientesData);
      setTransacoes(transacoesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      
      // Se for rate limit, tentar novamente após um tempo
      if (error.message.includes('429') || error.message.includes('Rate limit')) {
        setTimeout(() => {
          setHasLoadedData(false);
        }, 3000);
        return;
      }
    } finally {
      setIsLoading(false);
      setHasLoadedData(true);
    }
  };

  const today = new Date();
  const thisMonth = startOfMonth(today);
  const lastMonth = startOfMonth(subMonths(today, 1));

  const agendamentosHoje = agendamentos.filter(a => 
    format(new Date(a.data_hora), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );

  const faturamentoMes = transacoes
    .filter(t => t.tipo === 'receita' && new Date(t.data) >= thisMonth)
    .reduce((sum, t) => sum + t.valor, 0);

  const faturamentoMesPassado = transacoes
    .filter(t => t.tipo === 'receita' && new Date(t.data) >= lastMonth && new Date(t.data) < thisMonth)
    .reduce((sum, t) => sum + t.valor, 0);

  const crescimentoFaturamento = faturamentoMesPassado > 0 
    ? ((faturamentoMes - faturamentoMesPassado) / faturamentoMesPassado * 100)
    : 0;

  const clientesAtivos = clientes.filter(c => c.status === 'ativo').length;
  const clientesVIP = clientes.filter(c => c.status === 'vip').length;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Dashboard Executivo
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Powered by BelezaTech IA • {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 text-sm">
            <Crown className="w-4 h-4 mr-2" />
            Plano Infinite
          </Badge>
        </motion.div>

        {/* Grid Principal */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda */}
          <div className="lg:col-span-2 space-y-8">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricasCard
                title="Faturamento Mensal"
                value={`R$ ${faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                change={`${crescimentoFaturamento > 0 ? '+' : ''}${crescimentoFaturamento.toFixed(1)}%`}
                icon={DollarSign}
                trend={crescimentoFaturamento >= 0 ? 'up' : 'down'}
                color="green"
              />
              <MetricasCard
                title="Agendamentos Hoje"
                value={agendamentosHoje.length}
                change={`${agendamentosHoje.filter(a => a.status === 'confirmado').length} confirmados`}
                icon={Calendar}
                trend="up"
                color="blue"
              />
              <MetricasCard
                title="Clientes Ativos"
                value={clientesAtivos}
                change={`${clientesVIP} VIP`}
                icon={Users}
                trend="up"
                color="purple"
              />
              <MetricasCard
                title="Taxa de Ocupação"
                value="87%"
                change="↑ 5% vs mês passado"
                icon={Target}
                trend="up"
                color="orange"
              />
            </div>

            <AgendamentosHoje 
              agendamentos={agendamentosHoje}
              isLoading={isLoading}
            />
            
            <MetasSimulador 
              faturamentoAtual={faturamentoMes}
            />
          </div>

          {/* Coluna Direita */}
          <div className="space-y-8">
            <StatusAssinatura />
            
            <InsightsIA 
              agendamentos={agendamentos}
              clientes={clientes}
              faturamento={faturamentoMes}
            />

            {/* Performance Semanal */}
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-purple-500" />
                  Performance Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { dia: 'Segunda', valor: 850, ocupacao: 92 },
                    { dia: 'Terça', valor: 720, ocupacao: 78 },
                    { dia: 'Quarta', valor: 980, ocupacao: 95 },
                    { dia: 'Quinta', valor: 1150, ocupacao: 98 },
                    { dia: 'Sexta', valor: 1450, ocupacao: 100 },
                    { dia: 'Sábado', valor: 1820, ocupacao: 100 },
                    { dia: 'Domingo', valor: 650, ocupacao: 65 }
                  ].map((dia, index) => (
                    <div key={dia.dia} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{dia.dia}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">R$ {dia.valor}</span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${dia.ocupacao}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8">{dia.ocupacao}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
