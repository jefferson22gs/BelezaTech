import React, { useState } from "react";
import { Profissional } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Users, Edit, DollarSign, Target } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function ComissoesProfissionais({ profissionais, agendamentos, onReload }) {
  const [showModal, setShowModal] = useState(false);
  const [selectedProfissional, setSelectedProfissional] = useState(null);
  const [novaComissao, setNovaComissao] = useState(50);

  const hoje = new Date();
  const inicioMes = startOfMonth(hoje);
  const fimMes = endOfMonth(hoje);

  const calcularComissaoProfissional = (profissionalNome) => {
    const agendamentosProfissional = agendamentos.filter(a => 
      a.profissional === profissionalNome &&
      a.status_pagamento === 'pago' &&
      new Date(a.data_hora) >= inicioMes &&
      new Date(a.data_hora) <= fimMes
    );

    const totalServicos = agendamentosProfissional.length;
    const faturamentoBruto = agendamentosProfissional.reduce((sum, a) => sum + (a.valor || 0), 0);
    const comissaoTotal = agendamentosProfissional.reduce((sum, a) => sum + (a.comissao_profissional || 0), 0);

    return {
      totalServicos,
      faturamentoBruto,
      comissaoTotal,
      agendamentos: agendamentosProfissional
    };
  };

  const handleEditarComissao = (profissional) => {
    setSelectedProfissional(profissional);
    setNovaComissao(profissional.porcentagem_comissao || 50);
    setShowModal(true);
  };

  const salvarComissao = async () => {
    if (!selectedProfissional) return;
    
    try {
      await Profissional.update(selectedProfissional.id, {
        porcentagem_comissao: novaComissao
      });
      setShowModal(false);
      onReload();
    } catch (error) {
      console.error("Erro ao atualizar comissão:", error);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card className="glass-effect border-0 premium-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Comissões dos Profissionais
            </CardTitle>
            <p className="text-sm text-gray-600">
              Controle das comissões mensais de cada profissional
            </p>
          </CardHeader>
        </Card>

        {profissionais.length === 0 ? (
          <Card className="glass-effect border-0 premium-shadow">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum profissional cadastrado
              </h3>
              <p className="text-gray-600">
                Adicione profissionais à sua equipe para gerenciar comissões
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {profissionais.map((profissional, index) => {
              const dadosComissao = calcularComissaoProfissional(profissional.nome);
              
              return (
                <motion.div
                  key={profissional.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-effect border-0 premium-shadow h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold">
                              {profissional.nome?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {profissional.nome}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {profissional.porcentagem_comissao || 50}% comissão
                            </Badge>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditarComissao(profissional)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">
                            {dadosComissao.totalServicos}
                          </p>
                          <p className="text-xs text-blue-800">Serviços</p>
                        </div>
                        
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">
                            R$ {dadosComissao.faturamentoBruto.toFixed(0)}
                          </p>
                          <p className="text-xs text-purple-800">Faturamento</p>
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Comissão do Mês
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(hoje, "MMMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                          R$ {dadosComissao.comissaoTotal.toFixed(2)}
                        </p>
                      </div>

                      {dadosComissao.agendamentos.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Últimos Serviços
                          </h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {dadosComissao.agendamentos.slice(0, 3).map(agendamento => (
                              <div key={agendamento.id} className="flex justify-between items-center text-xs">
                                <span className="text-gray-600">
                                  {agendamento.cliente_nome} • {agendamento.servico}
                                </span>
                                <span className="font-medium text-green-600">
                                  R$ {agendamento.comissao_profissional?.toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Editar Comissão */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Comissão</DialogTitle>
          </DialogHeader>
          
          {selectedProfissional && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold">
                    {selectedProfissional.nome?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{selectedProfissional.nome}</h4>
                  <p className="text-sm text-gray-600">{selectedProfissional.email}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="comissao">Porcentagem de Comissão (%)</Label>
                <Input
                  id="comissao"
                  type="number"
                  min="0"
                  max="100"
                  value={novaComissao}
                  onChange={(e) => setNovaComissao(Number(e.target.value))}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Porcentagem que o profissional recebe sobre cada serviço pago
                </p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <Target className="w-4 h-4 inline mr-1" />
                  Exemplo: Em um serviço de R$ 100, o profissional receberá R$ {novaComissao}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarComissao} className="bg-purple-600 hover:bg-purple-700">
              Salvar Alteração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}