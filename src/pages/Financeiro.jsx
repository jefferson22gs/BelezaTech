import React, { useState, useEffect } from "react";
import { Agendamento } from "@/api/entities";
import { Transacao } from "@/api/entities";
import { Profissional } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  CreditCard,
  PiggyBank,
  Receipt,
  Target
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

import ResumoFinanceiro from "../components/financeiro/ResumoFinanceiro";
import TransacoesList from "../components/financeiro/TransacoesList";
import ComissoesProfissionais from "../components/financeiro/ComissoesProfissionais";
import GeradorLinkPagamento from "../components/financeiro/GeradorLinkPagamento";

export default function Financeiro() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [transacoes, setTransacoes] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [agendamentosData, transacoesData, profissionaisData] = await Promise.all([
        Agendamento.list("-data_hora"),
        Transacao.list("-data"),
        Profissional.filter({ salao_id: userData.id })
      ]);
      
      setAgendamentos(agendamentosData);
      setTransacoes(transacoesData);
      setProfissionais(profissionaisData);
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    }
    setIsLoading(false);
  };

  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);
  const mesPassado = subMonths(hoje, 1);
  const inicioMesPassado = startOfMonth(mesPassado);
  const fimMesPassado = endOfMonth(mesPassado);

  // Cálculos financeiros
  const agendamentosPagos = agendamentos.filter(a => a.status_pagamento === 'pago');
  
  const faturamentoMes = agendamentosPagos
    .filter(a => new Date(a.data_hora) >= inicioMes && new Date(a.data_hora) <= fimMes)
    .reduce((sum, a) => sum + (a.valor || 0), 0);

  const faturamentoMesPassado = agendamentosPagos
    .filter(a => new Date(a.data_hora) >= inicioMesPassado && new Date(a.data_hora) <= fimMesPassado)
    .reduce((sum, a) => sum + (a.valor || 0), 0);

  const crescimento = faturamentoMesPassado > 0 
    ? ((faturamentoMes - faturamentoMesPassado) / faturamentoMesPassado * 100)
    : 0;

  const agendamentosPendentes = agendamentos.filter(a => a.status_pagamento === 'pendente');
  const valorPendente = agendamentosPendentes.reduce((sum, a) => sum + (a.valor || 0), 0);

  const totalComissoes = agendamentosPagos
    .filter(a => new Date(a.data_hora) >= inicioMes && new Date(a.data_hora) <= fimMes)
    .reduce((sum, a) => sum + (a.comissao_profissional || 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle Financeiro</h1>
          <p className="text-gray-600">
            Gerencie pagamentos, comissões e acompanhe o desempenho financeiro do seu salão
          </p>
        </motion.div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-effect border-0 premium-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Faturamento Mensal</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {faturamentoMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-sm flex items-center gap-1 ${crescimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="w-3 h-3" />
                      {crescimento >= 0 ? '+' : ''}{crescimento.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass-effect border-0 premium-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Valores Pendentes</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {valorPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {agendamentosPendentes.length} agendamentos
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <Receipt className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="glass-effect border-0 premium-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Comissões a Pagar</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {totalComissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Para {profissionais.length} profissionais
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="glass-effect border-0 premium-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {(faturamentoMes - totalComissoes).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Após comissões
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="transacoes">Transações</TabsTrigger>
            <TabsTrigger value="comissoes">Comissões</TabsTrigger>
            <TabsTrigger value="pagamentos">Links de Pagamento</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <ResumoFinanceiro 
              agendamentos={agendamentos}
              transacoes={transacoes}
              onReload={loadData}
            />
          </TabsContent>

          <TabsContent value="transacoes" className="space-y-6">
            <TransacoesList 
              agendamentos={agendamentos}
              onReload={loadData}
            />
          </TabsContent>

          <TabsContent value="comissoes" className="space-y-6">
            <ComissoesProfissionais 
              profissionais={profissionais}
              agendamentos={agendamentos}
              onReload={loadData}
            />
          </TabsContent>

          <TabsContent value="pagamentos" className="space-y-6">
            <GeradorLinkPagamento 
              agendamentos={agendamentosPendentes}
              onReload={loadData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}