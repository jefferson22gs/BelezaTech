
import React, { useState, useEffect } from "react";
import { Agendamento } from "@/api/entities";
import { SalaoConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, User, Crown, Sparkles } from "lucide-react";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import automacaoManager from "../components/whatsapp/AutomacaoManager";

export default function CheckInCliente() {
  const [configuracao, setConfiguracao] = useState(null);
  const [step, setStep] = useState('buscar'); // 'buscar', 'confirmar', 'sucesso'
  const [telefone, setTelefone] = useState('');
  const [agendamentosEncontrados, setAgendamentosEncontrados] = useState([]);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Extrair o slug do salão da URL
  const salaoSlug = new URLSearchParams(window.location.search).get('salao') || 'demo';

  useEffect(() => {
    loadSalaoConfig();
  }, []);

  const loadSalaoConfig = async () => {
    try {
      const configs = await SalaoConfig.list();
      if (configs.length > 0) {
        setConfiguracao(configs[0]);
        applyCustomTheme(configs[0].cores_tema);
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
    }
  };

  const applyCustomTheme = (cores) => {
    if (!cores) return;
    
    document.documentElement.style.setProperty('--primary', hexToHsl(cores.primaria));
    document.documentElement.style.setProperty('--secondary', hexToHsl(cores.secundaria));
    document.documentElement.style.setProperty('--accent', hexToHsl(cores.acento));
  };

  const hexToHsl = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "0 0% 50%";
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const sum = max + min;
    const l = sum / 2;
    
    let h, s;
    if (diff === 0) {
      h = s = 0;
    } else {
      s = l > 0.5 ? diff / (2 - sum) : diff / sum;
      switch (max) {
        case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const buscarAgendamentos = async () => {
    if (!telefone.trim()) {
      setError('Por favor, digite seu telefone');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Buscar agendamentos do telefone para hoje
      const agendamentos = await Agendamento.filter({
        cliente_telefone: telefone.trim()
      });

      const agendamentosHoje = agendamentos.filter(a => 
        isToday(new Date(a.data_hora)) && 
        ['confirmado', 'agendado'].includes(a.status)
      );

      if (agendamentosHoje.length === 0) {
        setError('Não encontramos nenhum agendamento seu para hoje. Verifique se o telefone está correto.');
      } else {
        setAgendamentosEncontrados(agendamentosHoje);
        setStep('confirmar');
      }

    } catch (error) {
      setError('Erro ao buscar agendamentos. Tente novamente.');
      console.error('Erro ao buscar agendamentos:', error);
    }

    setIsLoading(false);
  };

  const confirmarCheckIn = async (agendamento) => {
    setIsLoading(true);
    
    try {
      // Atualizar status do agendamento
      await Agendamento.update(agendamento.id, {
        ...agendamento,
        status: 'cliente_chegou'
      });

      setAgendamentoSelecionado(agendamento);
      setStep('sucesso');

      // Opcional: Notificar profissional via WhatsApp
      setTimeout(() => {
        automacaoManager.notificarProfissionalClienteChegou(agendamento);
      }, 1000);

    } catch (error) {
      setError('Erro ao confirmar check-in. Tente novamente.');
      console.error('Erro ao confirmar check-in:', error);
    }

    setIsLoading(false);
  };

  const resetar = () => {
    setStep('buscar');
    setTelefone('');
    setAgendamentosEncontrados([]);
    setAgendamentoSelecionado(null);
    setError('');
  };

  // CSS personalizado para o tema
  const customCSS = configuracao?.cores_tema ? `
    :root {
      --primary: ${hexToHsl(configuracao.cores_tema.primaria)};
      --secondary: ${hexToHsl(configuracao.cores_tema.secundaria)};
      --accent: ${hexToHsl(configuracao.cores_tema.acento)};
    }
    
    .gradient-primary {
      background: linear-gradient(135deg, ${configuracao.cores_tema.primaria}, ${configuracao.cores_tema.secundaria});
    }
  ` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <style>{customCSS}</style>
      
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {configuracao?.logo_url ? (
              <img 
                src={configuracao.logo_url} 
                alt="Logo" 
                className="w-12 h-12 object-contain rounded-lg"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-7 h-7 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-xl text-gray-900">
                {configuracao?.nome_salao || "Salão de Beleza"}
              </h1>
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">Check-in Digital</span>
                <Sparkles className="w-3 h-3 text-purple-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Conteúdo */}
        <AnimatePresence mode="wait">
          {step === 'buscar' && (
            <motion.div
              key="buscar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-center">
                    <User className="w-5 h-5 text-purple-500" />
                    Confirme sua Chegada
                  </CardTitle>
                  <p className="text-sm text-gray-600 text-center">
                    Digite seu telefone para encontrar seu agendamento de hoje
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label htmlFor="telefone" className="text-sm font-medium text-gray-700">
                      Número de Telefone
                    </label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          buscarAgendamentos();
                        }
                      }}
                    />
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={buscarAgendamentos}
                    disabled={isLoading}
                    className="w-full gradient-primary text-white"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Buscando...
                      </div>
                    ) : (
                      'Buscar Agendamento'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'confirmar' && (
            <motion.div
              key="confirmar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle className="text-center">Seus Agendamentos de Hoje</CardTitle>
                  <p className="text-sm text-gray-600 text-center">
                    Selecione o agendamento para confirmar sua chegada
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agendamentosEncontrados.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors"
                      onClick={() => confirmarCheckIn(agendamento)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {agendamento.servico}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {agendamento.profissional}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {format(new Date(agendamento.data_hora), 'HH:mm')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            R$ {(agendamento.valor || 0).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={resetar}
                    className="w-full mt-4"
                  >
                    Voltar
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 'sucesso' && (
            <motion.div
              key="sucesso"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="glass-effect border-0 premium-shadow">
                <CardContent className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Check-in Realizado!
                  </h2>
                  
                  <p className="text-gray-600 mb-6">
                    Sua chegada foi confirmada com sucesso. O profissional foi notificado.
                  </p>

                  {agendamentoSelecionado && (
                    <div className="bg-purple-50 rounded-lg p-4 mb-6 text-left">
                      <h3 className="font-semibold text-purple-900 mb-2">
                        Detalhes do seu atendimento:
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Serviço:</strong> {agendamentoSelecionado.servico}</p>
                        <p><strong>Profissional:</strong> {agendamentoSelecionado.profissional}</p>
                        <p><strong>Horário:</strong> {format(new Date(agendamentoSelecionado.data_hora), 'HH:mm')}</p>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-500">
                    Aguarde ser chamado(a). Obrigado por escolher nosso salão!
                  </p>

                  <Button
                    onClick={resetar}
                    variant="outline"
                    className="mt-6"
                  >
                    Fazer Novo Check-in
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
