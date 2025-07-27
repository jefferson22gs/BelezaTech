import React, { useState } from "react";
import { Agendamento } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { CheckCircle, Clock, X, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusPagamentoColors = {
  pendente: "bg-yellow-100 text-yellow-800",
  pago: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800"
};

const formaPagamentoOptions = [
  { value: "dinheiro", label: "Dinheiro" },
  { value: "pix", label: "PIX" },
  { value: "cartao_debito", label: "Cartão de Débito" },
  { value: "cartao_credito", label: "Cartão de Crédito" },
  { value: "link_pagamento", label: "Link de Pagamento" }
];

export default function TransacoesList({ agendamentos, onReload }) {
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [formaPagamento, setFormaPagamento] = useState("dinheiro");

  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    if (filtroStatus === "todos") return true;
    return agendamento.status_pagamento === filtroStatus;
  }).sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

  const handleMarcarPago = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setFormaPagamento(agendamento.forma_pagamento || "dinheiro");
    setShowModal(true);
  };

  const confirmarPagamento = async () => {
    if (!selectedAgendamento) return;
    
    try {
      const updateData = {
        status_pagamento: "pago",
        forma_pagamento: formaPagamento
      };

      // Calcular comissão se houver profissional
      if (selectedAgendamento.profissional_id) {
        // Em uma implementação real, buscaríamos a porcentagem de comissão do profissional
        // Por agora, assumimos 50%
        updateData.comissao_profissional = (selectedAgendamento.valor || 0) * 0.5;
      }

      await Agendamento.update(selectedAgendamento.id, updateData);
      setShowModal(false);
      setSelectedAgendamento(null);
      onReload();
    } catch (error) {
      console.error("Erro ao marcar pagamento:", error);
    }
  };

  const marcarCancelado = async (agendamento) => {
    if (!window.confirm("Tem certeza que deseja cancelar este pagamento?")) return;
    
    try {
      await Agendamento.update(agendamento.id, {
        status_pagamento: "cancelado"
      });
      onReload();
    } catch (error) {
      console.error("Erro ao cancelar pagamento:", error);
    }
  };

  return (
    <>
      <Card className="glass-effect border-0 premium-shadow">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              Gerenciar Transações
            </CardTitle>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {agendamentosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma transação encontrada</p>
              </div>
            ) : (
              agendamentosFiltrados.map((agendamento, index) => (
                <motion.div
                  key={agendamento.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {agendamento.cliente_nome?.substring(0, 2).toUpperCase()}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {agendamento.cliente_nome}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {agendamento.servico}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {format(new Date(agendamento.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        {agendamento.profissional && (
                          <Badge variant="outline" className="text-xs">
                            {agendamento.profissional}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        R$ {agendamento.valor?.toFixed(2)}
                      </p>
                      <Badge className={`text-xs ${statusPagamentoColors[agendamento.status_pagamento || 'pendente']}`}>
                        {agendamento.status_pagamento === 'pago' ? 'Pago' : 
                         agendamento.status_pagamento === 'cancelado' ? 'Cancelado' : 'Pendente'}
                      </Badge>
                    </div>

                    <div className="flex gap-2">
                      {agendamento.status_pagamento === 'pendente' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarcarPago(agendamento)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Marcar Pago
                        </Button>
                      )}
                      
                      {agendamento.status_pagamento === 'pago' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => marcarCancelado(agendamento)}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Confirmar Pagamento */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
          </DialogHeader>
          
          {selectedAgendamento && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold">{selectedAgendamento.cliente_nome}</h4>
                <p className="text-sm text-gray-600">{selectedAgendamento.servico}</p>
                <p className="font-bold text-green-600">
                  R$ {selectedAgendamento.valor?.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {formaPagamentoOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarPagamento} className="bg-green-600 hover:bg-green-700">
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}