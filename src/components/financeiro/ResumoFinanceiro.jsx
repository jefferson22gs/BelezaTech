import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusPagamentoColors = {
  pendente: "bg-yellow-100 text-yellow-800",
  pago: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800"
};

const formaPagamentoColors = {
  dinheiro: "bg-green-100 text-green-800",
  pix: "bg-blue-100 text-blue-800", 
  cartao_debito: "bg-purple-100 text-purple-800",
  cartao_credito: "bg-indigo-100 text-indigo-800",
  link_pagamento: "bg-orange-100 text-orange-800"
};

export default function ResumoFinanceiro({ agendamentos, onReload }) {
  const hoje = new Date();
  const inicioHoje = startOfDay(hoje);
  const fimHoje = endOfDay(hoje);
  const inicioSemana = startOfWeek(hoje);
  const fimSemana = endOfWeek(hoje);

  // Faturamento hoje
  const agendamentosHoje = agendamentos.filter(a => {
    const dataAgendamento = new Date(a.data_hora);
    return dataAgendamento >= inicioHoje && dataAgendamento <= fimHoje && a.status_pagamento === 'pago';
  });
  const faturamentoHoje = agendamentosHoje.reduce((sum, a) => sum + (a.valor || 0), 0);

  // Faturamento semanal
  const agendamentosSemana = agendamentos.filter(a => {
    const dataAgendamento = new Date(a.data_hora);
    return dataAgendamento >= inicioSemana && dataAgendamento <= fimSemana && a.status_pagamento === 'pago';
  });
  const faturamentoSemana = agendamentosSemana.reduce((sum, a) => sum + (a.valor || 0), 0);

  // Agendamentos recentes (últimos 10 pagos)
  const agendamentosRecentes = agendamentos
    .filter(a => a.status_pagamento === 'pago')
    .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
    .slice(0, 10);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Performance Diária/Semanal */}
      <div className="lg:col-span-1">
        <Card className="glass-effect border-0 premium-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Hoje</span>
                <Badge variant="outline" className="text-xs">
                  {agendamentosHoje.length} serviços
                </Badge>
              </div>
              <p className="text-2xl font-bold text-green-600">
                R$ {faturamentoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Esta Semana</span>
                <Badge variant="outline" className="text-xs">
                  {agendamentosSemana.length} serviços
                </Badge>
              </div>
              <p className="text-xl font-bold text-blue-600">
                R$ {faturamentoSemana.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Formas de Pagamento (Semana)</h4>
              <div className="space-y-2">
                {['dinheiro', 'pix', 'cartao_debito', 'cartao_credito'].map(forma => {
                  const count = agendamentosSemana.filter(a => a.forma_pagamento === forma).length;
                  if (count === 0) return null;
                  
                  return (
                    <div key={forma} className="flex justify-between items-center">
                      <Badge className={`text-xs ${formaPagamentoColors[forma]}`}>
                        {forma.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-600">{count}x</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transações Recentes */}
      <div className="lg:col-span-2">
        <Card className="glass-effect border-0 premium-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Últimas Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agendamentosRecentes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma transação encontrada</p>
                </div>
              ) : (
                agendamentosRecentes.map((agendamento, index) => (
                  <motion.div
                    key={agendamento.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {agendamento.cliente_nome?.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {agendamento.cliente_nome}
                        </p>
                        <p className="text-xs text-gray-600">
                          {agendamento.servico} • {format(new Date(agendamento.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        R$ {agendamento.valor?.toFixed(2)}
                      </p>
                      <Badge className={`text-xs ${formaPagamentoColors[agendamento.forma_pagamento]}`}>
                        {agendamento.forma_pagamento?.replace('_', ' ')}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}