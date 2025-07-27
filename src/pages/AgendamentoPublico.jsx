
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SalaoConfig } from "@/api/entities";
import { Servico } from "@/api/entities";
import { Agendamento } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, User, Phone, Mail, Crown, Sparkles, Check } from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AgendamentoPublico() {
  const { salaoId } = useParams();
  const navigate = useNavigate();
  const [salao, setSalao] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    cliente_nome: "",
    cliente_telefone: "",
    cliente_email: "",
    servico_id: "",
    data_hora: "",
    observacoes: ""
  });

  useEffect(() => {
    loadSalaoData();
  }, [salaoId]);

  const loadSalaoData = async () => {
    try {
      // Buscar configuração do salão
      const salaoConfigs = await SalaoConfig.filter({ id: salaoId });
      if (salaoConfigs.length === 0) {
        throw new Error("Salão não encontrado");
      }
      
      const salaoConfig = salaoConfigs[0];
      setSalao(salaoConfig);

      // Buscar serviços do salão
      const servicosData = await Servico.filter({ created_by: salaoConfig.created_by });
      setServicos(servicosData.filter(s => s.ativo));

      // Buscar agendamentos existentes
      const agendamentosData = await Agendamento.filter({ created_by: salaoConfig.created_by });
      setAgendamentos(agendamentosData);

    } catch (error) {
      console.error("Erro ao carregar dados do salão:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const servicoSelecionado = servicos.find(s => s.id === formData.servico_id);
      
      // Criar ou atualizar cliente
      let cliente;
      const clientesExistentes = await Cliente.filter({ 
        telefone: formData.cliente_telefone 
      });

      if (clientesExistentes.length > 0) {
        cliente = clientesExistentes[0];
      } else {
        cliente = await Cliente.create({
          nome: formData.cliente_nome,
          telefone: formData.cliente_telefone,
          email: formData.cliente_email,
          status: "ativo"
        });
      }

      // Criar agendamento
      await Agendamento.create({
        cliente_id: cliente.id,
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone,
        servico: servicoSelecionado.nome,
        data_hora: formData.data_hora,
        valor: servicoSelecionado.valor,
        duracao_minutos: servicoSelecionado.duracao_minutos,
        observacoes: formData.observacoes,
        status: "agendado"
      });

      setStep(4); // Ir para tela de confirmação
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      alert("Erro ao criar agendamento. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <Crown className="w-9 h-9 text-white" />
          </div>
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!salao) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Salão não encontrado</h2>
            <p className="text-gray-600">O link que você acessou pode estar incorreto.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: `linear-gradient(135deg, ${salao?.cores_tema?.primaria || '#8b5cf6'}15 0%, ${salao?.cores_tema?.secundaria || '#a855f7'}15 100%)` 
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header do Salão */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            {salao?.logo_url && (
              <div className="mb-4">
                <img
                  src={salao.logo_url}
                  alt={salao.nome_salao}
                  className="max-h-20 mx-auto object-contain"
                />
              </div>
            )}
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: salao?.cores_tema?.primaria || '#8b5cf6' }}
            >
              {salao?.nome_salao || 'Salão de Beleza'}
            </h1>
            <p className="text-gray-600 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: salao?.cores_tema?.acento || '#fbbf24' }} />
              Agende seu horário online
            </p>
          </motion.div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: salao?.cores_tema?.primaria }} />
                    Seus dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nome">Nome completo</Label>
                    <Input
                      id="nome"
                      value={formData.cliente_nome}
                      onChange={(e) => handleInputChange('cliente_nome', e.target.value)}
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.cliente_telefone}
                      onChange={(e) => handleInputChange('cliente_telefone', e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail (opcional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.cliente_email}
                      onChange={(e) => handleInputChange('cliente_email', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                onClick={nextStep}
                disabled={!formData.cliente_nome || !formData.cliente_telefone}
                className="w-full"
                style={{ 
                  backgroundColor: salao?.cores_tema?.primaria,
                  color: 'white'
                }}
              >
                Próximo
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" style={{ color: salao?.cores_tema?.primaria }} />
                    Escolha o serviço
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {servicos.map(servico => (
                      <div
                        key={servico.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.servico_id === servico.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('servico_id', servico.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-900">{servico.nome}</h3>
                            {servico.descricao && (
                              <p className="text-sm text-gray-600 mt-1">{servico.descricao}</p>
                            )}
                            <p className="text-sm text-gray-500 mt-1">
                              {servico.duracao_minutos} minutos
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg" style={{ color: salao?.cores_tema?.primaria }}>
                              R$ {servico.valor?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Anterior
                </Button>
                <Button 
                  onClick={nextStep}
                  disabled={!formData.servico_id}
                  className="flex-1"
                  style={{ 
                    backgroundColor: salao?.cores_tema?.primaria,
                    color: 'white'
                  }}
                >
                  Próximo
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" style={{ color: salao?.cores_tema?.primaria }} />
                    Data e horário
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="data_hora">Selecione a data e horário</Label>
                    <Input
                      id="data_hora"
                      type="datetime-local"
                      value={formData.data_hora}
                      onChange={(e) => handleInputChange('data_hora', e.target.value)}
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações (opcional)</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      placeholder="Alguma observação especial?"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={prevStep} className="flex-1">
                  Anterior
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={!formData.data_hora || isSaving}
                  className="flex-1"
                  style={{ 
                    backgroundColor: salao?.cores_tema?.primaria,
                    color: 'white'
                  }}
                >
                  {isSaving ? 'Agendando...' : 'Confirmar Agendamento'}
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <Card>
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Agendamento Confirmado!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Seu agendamento foi realizado com sucesso. Em breve você receberá uma confirmação.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <h3 className="font-semibold text-gray-900 mb-2">Resumo do Agendamento:</h3>
                    <p><strong>Cliente:</strong> {formData.cliente_nome}</p>
                    <p><strong>Serviço:</strong> {servicos.find(s => s.id === formData.servico_id)?.nome}</p>
                    <p><strong>Data:</strong> {formData.data_hora && format(new Date(formData.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    <p><strong>Valor:</strong> R$ {servicos.find(s => s.id === formData.servico_id)?.valor?.toFixed(2) || '0.00'}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
