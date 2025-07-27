import React, { useState } from "react";
import { Agendamento } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, Copy, ExternalLink, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

export default function GeradorLinkPagamento({ agendamentos, onReload }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  // Simular geração de link de pagamento (integração com gateway real)
  const gerarLinkPagamento = async (agendamento) => {
    setIsGenerating(true);
    setSelectedAgendamento(agendamento);
    
    try {
      // Simular chamada para API do gateway de pagamento
      // Na implementação real, integraria com Mercado Pago, Stripe, etc.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const linkSimulado = `https://pay.belezatech.com/payment/${agendamento.id}?amount=${agendamento.valor}&client=${encodeURIComponent(agendamento.cliente_nome)}`;
      
      // Atualizar o agendamento com o link
      await Agendamento.update(agendamento.id, {
        link_pagamento: linkSimulado,
        forma_pagamento: "link_pagamento"
      });
      
      setGeneratedLink(linkSimulado);
      onReload();
    } catch (error) {
      console.error("Erro ao gerar link de pagamento:", error);
    }
    
    setIsGenerating(false);
  };

  const copiarLink = (link) => {
    navigator.clipboard.writeText(link);
    // Em uma implementação real, mostraria uma notificação de sucesso
    alert("Link copiado para a área de transferência!");
  };

  const enviarWhatsApp = (agendamento, link) => {
    const mensagem = `Olá ${agendamento.cliente_nome}! 

Seu agendamento está confirmado:
📅 ${format(new Date(agendamento.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
✂️ ${agendamento.servico}
💰 R$ ${agendamento.valor?.toFixed(2)}

Para facilitar, você pode pagar online através deste link:
${link}

Qualquer dúvida, estou aqui para ajudar! 😊`;

    const whatsappUrl = `https://wa.me/${agendamento.cliente_telefone?.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="glass-effect border-0 premium-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-purple-500" />
            Gerador de Links de Pagamento
          </CardTitle>
          <p className="text-sm text-gray-600">
            Crie links de pagamento para enviar aos clientes via WhatsApp ou email
          </p>
        </CardHeader>
      </Card>

      {generatedLink && selectedAgendamento && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert className="bg-green-50 border-green-200">
            <ExternalLink className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium">Link gerado com sucesso para {selectedAgendamento.cliente_nome}!</p>
                <div className="flex gap-2">
                  <Input 
                    value={generatedLink} 
                    readOnly 
                    className="bg-white"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copiarLink(generatedLink)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => enviarWhatsApp(selectedAgendamento, generatedLink)}
                  >
                    📱 WhatsApp
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <Card className="glass-effect border-0 premium-shadow">
        <CardHeader>
          <CardTitle className="text-lg">Agendamentos Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {agendamentos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum agendamento pendente de pagamento</p>
              </div>
            ) : (
              agendamentos.map((agendamento, index) => (
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
                      <p className="text-xs text-gray-500">
                        {format(new Date(agendamento.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-purple-600">
                        R$ {agendamento.valor?.toFixed(2)}
                      </p>
                      {agendamento.link_pagamento ? (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          Link Gerado
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                          Pendente
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {agendamento.link_pagamento ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copiarLink(agendamento.link_pagamento)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copiar
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => enviarWhatsApp(agendamento, agendamento.link_pagamento)}
                          >
                            📱 Enviar
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => gerarLinkPagamento(agendamento)}
                          disabled={isGenerating}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          {isGenerating && selectedAgendamento?.id === agendamento.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                              Gerando...
                            </>
                          ) : (
                            <>
                              <Link className="w-3 h-3 mr-1" />
                              Gerar Link
                            </>
                          )}
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
    </div>
  );
}