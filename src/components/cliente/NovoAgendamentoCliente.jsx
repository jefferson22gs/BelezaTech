import React, { useState } from "react";
import { Agendamento } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Scissors, 
  Clock, 
  DollarSign, 
  User, 
  Calendar,
  ArrowLeft,
  Check,
  ChevronRight
} from "lucide-react";
import { format, addDays, setHours, setMinutes, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

const HORARIOS_DISPONIVEIS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
  "17:00", "17:30", "18:00", "18:30"
];

const PROFISSIONAIS = [
  { id: "1", nome: "Maria Silva", especialidades: ["cabelo", "manicure"] },
  { id: "2", nome: "João Santos", especialidades: ["cabelo", "barba"] },
  { id: "3", nome: "Ana Costa", especialidades: ["sobrancelha", "depilacao"] },
  { id: "qualquer", nome: "Qualquer Profissional Disponível", especialidades: [] }
];

export default function NovoAgendamentoCliente({ cliente, servicos, configuracao, onSuccess, onCancel }) {
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProfissional, setSelectedProfissional] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedHorario, setSelectedHorario] = useState(null);
  const [observacoes, setObservacoes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const totalDuracao = selectedServices.reduce((sum, s) => sum + s.duracao_minutos, 0);
  const totalValor = selectedServices.reduce((sum, s) => sum + s.valor, 0);

  const proximosDias = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  const handleServiceToggle = (servico) => {
    setSelectedServices(prev => 
      prev.some(s => s.id === servico.id)
        ? prev.filter(s => s.id !== servico.id)
        : [...prev, servico]
    );
  };

  const handleDataSelect = (data) => {
    setSelectedData(data);
    setSelectedHorario(null); // Reset horário quando muda a data
  };

  const handleConfirmarAgendamento = async () => {
    setIsLoading(true);
    setError("");

    try {
      const dataHora = setMinutes(setHours(selectedData, parseInt(selectedHorario.split(':')[0])), parseInt(selectedHorario.split(':')[1]));
      
      const agendamentoData = {
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        cliente_telefone: cliente.telefone,
        servico: selectedServices.map(s => s.nome).join(", "),
        profissional: selectedProfissional.nome,
        profissional_id: selectedProfissional.id !== "qualquer" ? selectedProfissional.id : null,
        data_hora: dataHora.toISOString(),
        duracao_minutos: totalDuracao,
        valor: totalValor,
        status: "agendado",
        status_pagamento: "pendente",
        observacoes: observacoes,
        risco_no_show: "baixo"
      };

      await Agendamento.create(agendamentoData);
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      setError("Erro ao agendar. Tente novamente.");
    }
    
    setIsLoading(false);
  };

  const canProceedToStep2 = selectedServices.length > 0;
  const canProceedToStep3 = selectedProfissional !== null;
  const canProceedToStep4 = selectedData !== null && selectedHorario !== null;

  return (
    <div className="space-y-6">
      {/* Header com Steps */}
      <Card className="glass-effect border-0 premium-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCancel}
              className="text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= num 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step > num ? <Check className="w-4 h-4" /> : num}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AnimatePresence mode="wait">
        {/* Step 1: Selecionar Serviços */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-purple-500" />
                  Escolha seus serviços
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {servicos.map((servico) => (
                  <div 
                    key={servico.id}
                    onClick={() => handleServiceToggle(servico)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedServices.some(s => s.id === servico.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{servico.nome}</h3>
                        {servico.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{servico.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {servico.duracao_minutos} min
                          </div>
                          <div className="flex items-center gap-1 font-medium text-green-600">
                            <DollarSign className="w-3 h-3" />
                            R$ {servico.valor?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      {selectedServices.some(s => s.id === servico.id) && (
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {selectedServices.length > 0 && (
              <Card className="glass-effect border-0 premium-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-gray-700">Resumo:</span>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{totalDuracao} minutos</p>
                      <p className="font-bold text-green-600">R$ {totalValor.toFixed(2)}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setStep(2)}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                    disabled={!canProceedToStep2}
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {/* Step 2: Selecionar Profissional */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-500" />
                  Escolha o profissional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {PROFISSIONAIS.map((profissional) => (
                  <div 
                    key={profissional.id}
                    onClick={() => setSelectedProfissional(profissional)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedProfissional?.id === profissional.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{profissional.nome}</h3>
                        {profissional.especialidades.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Especialista em: {profissional.especialidades.join(", ")}
                          </p>
                        )}
                      </div>
                      {selectedProfissional?.id === profissional.id && (
                        <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                disabled={!canProceedToStep3}
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Selecionar Data e Horário */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            {/* Selecionar Data */}
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-500" />
                  Escolha a data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {proximosDias.slice(0, 8).map((data) => (
                    <button
                      key={data.toISOString()}
                      onClick={() => handleDataSelect(data)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        selectedData && format(selectedData, 'yyyy-MM-dd') === format(data, 'yyyy-MM-dd')
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium text-gray-900">
                        {format(data, 'EEE', { locale: ptBR })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(data, 'dd/MM')}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Selecionar Horário */}
            {selectedData && (
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-500" />
                    Escolha o horário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {HORARIOS_DISPONIVEIS.map((horario) => (
                      <button
                        key={horario}
                        onClick={() => setSelectedHorario(horario)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          selectedHorario === horario
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <p className="font-medium text-gray-900">{horario}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setStep(4)}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                disabled={!canProceedToStep4}
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirmação */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="space-y-6"
          >
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle>Confirme seu agendamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Serviços:</h4>
                    <p className="text-gray-600">{selectedServices.map(s => s.nome).join(", ")}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Profissional:</h4>
                    <p className="text-gray-600">{selectedProfissional.nome}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Data e Horário:</h4>
                    <p className="text-gray-600">
                      {format(selectedData, "EEEE, d 'de' MMMM", { locale: ptBR })} às {selectedHorario}
                    </p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-medium text-gray-900">Total:</span>
                    <span className="font-bold text-green-600">R$ {totalValor.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Alguma observação especial para o seu agendamento..."
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setStep(3)}
                className="flex-1"
                disabled={isLoading}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleConfirmarAgendamento}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Agendando...
                  </div>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}