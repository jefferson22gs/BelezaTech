
import React, { useState, useEffect } from "react";
import { ConfigWhatsApp } from "@/api/entities";
import { MensagemWhatsApp } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageCircle,
  Phone,
  Settings,
  CheckCircle,
  AlertCircle,
  Zap,
  Gift,
  Calendar,
  Users,
  QrCode, // Added
  Smartphone, // Added
  Wifi, // Added
  WifiOff // Added
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EvolutionService } from "../components/whatsapp/EvolutionService"; // Added

export default function ConfiguracoesWhatsApp() {
  const [config, setConfig] = useState(null);
  const [mensagens, setMensagens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false); // Renamed from isTesting
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [qrCode, setQrCode] = useState(null); // Added
  const [evolutionService, setEvolutionService] = useState(null); // Added

  useEffect(() => {
    loadData();
  }, []);

  // Effect to initialize EvolutionService when config changes
  useEffect(() => {
    if (config && config.api_url && config.api_key && !evolutionService) {
      const service = new EvolutionService(config);
      setEvolutionService(service);
    }
    // Re-initialize service if API URL/Key change
    if (evolutionService && (evolutionService.apiUrl !== config.api_url || evolutionService.apiKey !== config.api_key || evolutionService.instanceName !== config.nome_instancia)) {
      const service = new EvolutionService(config);
      setEvolutionService(service);
    }
  }, [config, evolutionService]);

  // Polling for connection status when QR code is active
  useEffect(() => {
    let interval;
    if (config?.status === 'qrcode' && evolutionService) {
      interval = setInterval(async () => {
        try {
          const statusResult = await evolutionService.verificarStatus();
          if (statusResult.state === 'open') {
            const updatedConfig = {
              ...config,
              status: 'conectado',
              numero_conectado: statusResult.number,
              qr_code: null
            };
            setConfig(updatedConfig);
            setQrCode(null);
            setSuccess("WhatsApp conectado com sucesso!");

            // Save updated status to database
            if (config.id) {
              await ConfigWhatsApp.update(config.id, updatedConfig);
            }
          }
        } catch (error) {
          console.error("Erro ao verificar status do WhatsApp:", error);
          // If polling fails repeatedly, consider setting status to error
          // For now, let's keep it 'qrcode' as the QR might just be expired.
        }
      }, 3000); // Poll every 3 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [config?.status, evolutionService, config?.id]); // Added config.id to dependencies

  const processarVariaveis = (template, exemplo = false) => {
    if (!template) return "";

    const variaveis = exemplo ? {
      nome: "Maria Silva",
      data: "Segunda-feira, 15 de Janeiro",
      horario: "14:30",
      servico: "Corte e Escova",
      profissional: "Ana Costa",
      valor: "R$ 85,00",
      nome_salao: config?.nome_salao || "Seu Salão",
      cupom: config?.cupom_aniversario || "NIVER15",
      desconto: String(config?.desconto_aniversario || 15) // Ensure string for display
    } : {};

    let mensagem = String(template); // Ensure template is treated as a string
    Object.keys(variaveis).forEach(key => {
      const placeholder = `{{${key}}}`;
      mensagem = mensagem.replace(new RegExp(placeholder, 'g'), variaveis[key]);
    });

    return mensagem;
  };

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Carregar configuração do WhatsApp
      const configs = await ConfigWhatsApp.filter({ created_by: userData.email });
      if (configs.length > 0) {
        setConfig(configs[0]);
        if (configs[0].qr_code) {
          setQrCode(configs[0].qr_code);
        }
      } else {
        // Criar configuração padrão
        const novaConfig = {
          nome_instancia: `salao_${userData.id?.slice(0, 8) || 'demo'}`,
          api_provider: "evolution",
          api_url: "",
          api_key: "",
          webhook_url: "",
          status: "desconectado",
          ativo: false,
          mensagem_confirmacao: "✅ *Agendamento Confirmado!*\n\nOlá {{nome}}, seu agendamento foi confirmado:\n\n📅 Data: {{data}}\n🕐 Horário: {{horario}}\n✂️ Serviço: {{servico}}\n👤 Profissional: {{profissional}}\n💰 Valor: {{valor}}\n\n📍 {{nome_salao}}\n\nNos vemos em breve! 💜",
          mensagem_lembrete: "⏰ *Lembrete do seu agendamento*\n\nOlá {{nome}}! Lembrando que você tem agendamento amanhã:\n\n📅 {{data}} às {{horario}}\n✂️ {{servico}} com {{profissional}}\n\nPor favor, confirme sua presença:\n\n✅ *SIM* - Estarei presente\n❌ *NÃO* - Preciso cancelar",
          mensagem_aniversario: "🎉 *PARABÉNS, {{nome}}!* 🎂\n\nHoje é seu dia especial e queremos celebrar com você!\n\n🎁 Use o cupom *{{cupom}}* e ganhe {{desconto}}% de desconto em qualquer serviço até o final do mês.\n\nDesejamos um ano repleto de beleza e alegria!\n\nCom carinho,\n{{nome_salao}} 💜",
          cupom_aniversario: "NIVER15", // Default
          desconto_aniversario: 15, // Default
          nome_salao: userData.nome_salao || "Seu Salão" // Populate default name for preview
        };
        setConfig(novaConfig);
      }

      // Carregar histórico de mensagens
      const mensagensData = await MensagemWhatsApp.list("-data_envio");
      setMensagens(mensagensData.slice(0, 50)); // Últimas 50 mensagens
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados. Tente recarregar a página.");
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      // Ensure desconto_aniversario is an integer or null if empty string
      const configToSave = {
        ...config,
        desconto_aniversario: config?.desconto_aniversario ? parseInt(config.desconto_aniversario) : null
      };

      if (config.id) {
        await ConfigWhatsApp.update(config.id, configToSave);
      } else {
        const novaConfig = await ConfigWhatsApp.create(configToSave);
        setConfig(novaConfig);
      }
      setSuccess("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setError("Erro ao salvar configurações. Tente novamente.");
    }
    setIsSaving(false);
  };

  const handleConnect = async () => { // Renamed from handleTestConnection
    if (!evolutionService) {
      setError("Configure primeiro a URL da API, Chave e Nome da Instância.");
      return;
    }

    setIsConnecting(true);
    setError("");
    setSuccess("");
    setQrCode(null);
    setConfig(prev => ({ ...prev, status: 'conectando' }));

    try {
      // Step 1: Create/verify instance
      await evolutionService.criarInstancia();
      setSuccess("Instância Evolution API criada/verificada. Aguardando QR Code...");

      // Step 2: Request QR Code
      const qrResult = await evolutionService.obterQRCode();

      if (qrResult?.base64) {
        setQrCode(qrResult.base64);
        const updatedConfig = { ...config, status: 'qrcode', qr_code: qrResult.base64 };
        setConfig(updatedConfig);
        if (config.id) {
          await ConfigWhatsApp.update(config.id, updatedConfig);
        } else {
          const newConfigInDb = await ConfigWhatsApp.create(updatedConfig);
          setConfig(newConfigInDb); // Update with ID from DB
        }
        setSuccess("QR Code gerado! Escaneie com seu celular.");
      } else {
        setError("Erro ao obter QR Code. Verifique as credenciais da API.");
        setConfig(prev => ({ ...prev, status: 'erro' }));
      }
    } catch (error) {
      console.error("Erro ao conectar WhatsApp:", error);
      setError("Erro ao conectar. Verifique as configurações da API e o status do servidor Evolution.");
      setConfig(prev => ({ ...prev, status: 'erro', qr_code: null }));
    }
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    if (!evolutionService) return;

    setIsConnecting(true);
    setError("");
    setSuccess("");

    try {
      await evolutionService.desconectarInstancia();
      const updatedConfig = {
        ...config,
        status: 'desconectado',
        numero_conectado: null,
        qr_code: null
      };
      setConfig(updatedConfig);
      setQrCode(null);
      setSuccess("WhatsApp desconectado com sucesso!");

      // Update in database
      if (config.id) {
        await ConfigWhatsApp.update(config.id, updatedConfig);
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
      setError("Erro ao desconectar WhatsApp. Tente novamente.");
    }
    setIsConnecting(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      desconectado: { color: "bg-gray-100 text-gray-800", label: "Desconectado", icon: WifiOff },
      qrcode: { color: "bg-yellow-100 text-yellow-800", label: "Aguardando QR Code", icon: QrCode },
      conectando: { color: "bg-blue-100 text-blue-800", label: "Conectando...", icon: Wifi },
      conectado: { color: "bg-green-100 text-green-800", label: "Conectado", icon: CheckCircle },
      erro: { color: "bg-red-100 text-red-800", label: "Erro", icon: AlertCircle }
    };

    const { color, label, icon: Icon } = statusConfig[status] || statusConfig.desconectado;
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Automação WhatsApp</h1>
              <p className="text-gray-600">
                Configure mensagens automáticas para melhorar a comunicação com seus clientes
              </p>
            </div>
            {config && getStatusBadge(config.status)}
          </div>
        </motion.div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="configuracao" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5"> {/* Changed to grid-cols-5 */}
            <TabsTrigger value="configuracao" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configuração</span>
            </TabsTrigger>
            <TabsTrigger value="conexao" className="flex items-center gap-2"> {/* New Tab */}
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">Conexão</span>
            </TabsTrigger>
            <TabsTrigger value="mensagens" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="aniversarios" className="flex items-center gap-2"> {/* Kept existing tab */}
              <Gift className="w-4 h-4" />
              <span className="hidden sm:inline">Aniversários</span>
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba Configuração (Evolution API Settings) */}
          <TabsContent value="configuracao" className="space-y-6">
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  Configurações da Evolution API
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Defina os parâmetros de conexão com a sua instância da Evolution API.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome_instancia">Nome da Instância</Label>
                    <Input
                      id="nome_instancia"
                      value={config?.nome_instancia || ""}
                      onChange={(e) => setConfig(prev => ({ ...prev, nome_instancia: e.target.value }))}
                      placeholder="Ex: meu_salao_01"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api_provider">Provedor da API</Label>
                    <Select
                      value={config?.api_provider || "evolution"}
                      onValueChange={(value) => setConfig(prev => ({ ...prev, api_provider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="evolution">Evolution API</SelectItem>
                        <SelectItem value="waha">WAHA</SelectItem>
                        {/* Add other providers if needed */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_url">URL da API</Label>
                  <Input
                    id="api_url"
                    value={config?.api_url || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, api_url: e.target.value }))}
                    placeholder="https://sua-evolution-api.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_key">Chave da API (API Key)</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={config?.api_key || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
                    placeholder="Sua chave da Evolution API"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook_url">URL do Webhook (Opcional)</Label>
                  <Input
                    id="webhook_url"
                    value={config?.webhook_url || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
                    placeholder="https://seu-sistema.com/webhook/whatsapp"
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                  >
                    {isSaving ? "Salvando..." : "Salvar Configurações"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Conexão (New Tab for WhatsApp Connection) */}
          <TabsContent value="conexao" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-purple-500" />
                    Gerenciar Conexão WhatsApp
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Como conectar:</h4>
                    <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                      <li>Certifique-se que as configurações da API (URL, Chave, Instância) foram salvas.</li>
                      <li>Clique em "Conectar WhatsApp" abaixo.</li>
                      <li>Escaneie o QR Code que irá aparecer com o seu celular.</li>
                      <li>Aguarde a confirmação de conexão.</li>
                    </ol>
                  </div>

                  {config?.numero_conectado && config?.status === 'conectado' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-green-900">WhatsApp Conectado!</h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Número conectado: <span className="font-semibold">{config.numero_conectado}</span>
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {config?.status !== 'conectado' ? (
                      <Button
                        onClick={handleConnect}
                        disabled={isConnecting || !config?.api_url || !config?.api_key || !config?.nome_instancia}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white"
                      >
                        {isConnecting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Conectando...
                          </div>
                        ) : (
                          <>
                            <QrCode className="w-4 h-4 mr-2" />
                            Conectar WhatsApp
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleDisconnect}
                        disabled={isConnecting}
                        variant="destructive"
                        className="flex-1"
                      >
                        {isConnecting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Desconectando...
                          </div>
                        ) : (
                          <>
                            <WifiOff className="w-4 h-4 mr-2" />
                            Desconectar WhatsApp
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Activation Switch */}
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <h3 className="font-medium text-gray-900">Automações Ativas</h3>
                      <p className="text-sm text-gray-600">Ativar envio automático de mensagens</p>
                    </div>
                    <Switch
                      checked={config?.ativo || false}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, ativo: checked }))}
                      disabled={config?.status !== "conectado"}
                    />
                  </div>

                  {config?.status === "conectado" && config?.ativo && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <h4 className="font-medium text-green-900">Sistema Ativo</h4>
                      </div>
                      <p className="text-sm text-green-700">
                        Suas automações estão funcionando! Os clientes receberão:
                      </p>
                      <ul className="text-sm text-green-700 mt-2 space-y-1">
                        <li>• Confirmação ao agendar</li>
                        <li>• Lembrete 24h antes</li>
                        <li>• Parabéns no aniversário</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* QR Code Display Card */}
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-purple-500" />
                    QR Code para Conexão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {qrCode && config?.status === 'qrcode' ? (
                    <div className="text-center space-y-4">
                      <div className="bg-white p-4 rounded-lg inline-block shadow-lg">
                        <img
                          src={`data:image/png;base64,${qrCode}`}
                          alt="QR Code WhatsApp"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Smartphone className="w-4 h-4 text-yellow-600" />
                          <h4 className="font-medium text-yellow-900">Como escanear:</h4>
                        </div>
                        <ol className="text-sm text-yellow-700 space-y-1 text-left list-decimal list-inside">
                          <li>Abra o WhatsApp no seu celular.</li>
                          <li>Vá em *Configurações* (ou 3 pontos no Android, ou "Ajustes" no iOS).</li>
                          <li>Toque em *Aparelhos Conectados*.</li>
                          <li>Toque em *Conectar um aparelho*.</li>
                          <li>Escaneie este QR Code com a câmera do seu celular.</li>
                        </ol>
                      </div>
                    </div>
                  ) : config?.status === 'conectado' ? (
                    <div className="text-center py-12 text-gray-500">
                      <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-medium text-green-700">WhatsApp já está conectado!</p>
                      <p className="text-sm text-gray-600">Não é necessário escanear o QR Code novamente.</p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>QR Code aparecerá aqui após clicar em "Conectar WhatsApp"</p>
                      <p className="text-xs mt-2">Certifique-se de salvar suas configurações antes.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Aba Templates (formerly Mensagens) */}
          <TabsContent value="mensagens" className="space-y-6">
            <div className="grid gap-6">
              {/* Mensagem de Confirmação */}
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Mensagem de Confirmação
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Enviada automaticamente quando um agendamento é criado
                  </p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={config?.mensagem_confirmacao || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, mensagem_confirmacao: e.target.value }))}
                    rows={8}
                    placeholder="Digite a mensagem de confirmação..."
                  />
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Variáveis disponíveis:</h4>
                    <div className="text-sm text-blue-700 grid grid-cols-2 gap-1">
                      <span>• {"{{nome}}"} - Nome do cliente</span>
                      <span>• {"{{data}}"} - Data do agendamento</span>
                      <span>• {"{{horario}}"} - Horário do agendamento</span>
                      <span>• {"{{servico}}"} - Serviço agendado</span>
                      <span>• {"{{profissional}}"} - Nome do profissional</span>
                      <span>• {"{{valor}}"} - Valor do serviço</span>
                      <span>• {"{{nome_salao}}"} - Nome do salão</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">📱 Preview:</h4>
                    <div className="text-sm text-green-700 whitespace-pre-line bg-white p-3 rounded border">
                      {processarVariaveis(config?.mensagem_confirmacao, true) ||
                        'Configure sua mensagem de confirmação acima...'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mensagem de Lembrete */}
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-yellow-500" />
                    Mensagem de Lembrete
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Enviada 24 horas antes do agendamento
                  </p>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={config?.mensagem_lembrete || ""}
                    onChange={(e) => setConfig(prev => ({ ...prev, mensagem_lembrete: e.target.value }))}
                    rows={8}
                    placeholder="Digite a mensagem de lembrete..."
                  />
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Variáveis disponíveis:</h4>
                    <div className="text-sm text-blue-700 grid grid-cols-2 gap-1">
                      <span>• {"{{nome}}"} - Nome do cliente</span>
                      <span>• {"{{data}}"} - Data do agendamento</span>
                      <span>• {"{{horario}}"} - Horário do agendamento</span>
                      <span>• {"{{servico}}"} - Serviço agendado</span>
                      <span>• {"{{profissional}}"} - Nome do profissional</span>
                      <span>• {"{{nome_salao}}"} - Nome do salão</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">💡 Dica:</h4>
                    <p className="text-sm text-yellow-700">
                      Inclua botões de resposta rápida como "SIM" e "NÃO" para facilitar a confirmação do cliente.
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">📱 Preview:</h4>
                    <div className="text-sm text-green-700 whitespace-pre-line bg-white p-3 rounded border">
                      {processarVariaveis(config?.mensagem_lembrete, true) ||
                        'Configure sua mensagem de lembrete acima...'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                >
                  {isSaving ? "Salvando..." : "Salvar Templates"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Aba Aniversários (Existing Tab) */}
          <TabsContent value="aniversarios" className="space-y-6">
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-500" />
                  Mensagens de Aniversário
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Configure a mensagem automática de aniversário com cupom de desconto
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Mensagem de Aniversário</Label>
                    <Textarea
                      value={config?.mensagem_aniversario || ""}
                      onChange={(e) => setConfig(prev => ({ ...prev, mensagem_aniversario: e.target.value }))}
                      rows={8}
                      placeholder="Digite a mensagem de aniversário..."
                      className="mt-2"
                    />
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Variáveis disponíveis:</h4>
                    <div className="text-sm text-blue-700 grid grid-cols-2 gap-1">
                      <span>• {"{{nome}}"} - Nome do cliente</span>
                      <span>• {"{{nome_salao}}"} - Nome do salão</span>
                      <span>• {"{{cupom}}"} - Código do cupom (definido abaixo)</span>
                      <span>• {"{{desconto}}"} - Valor do desconto (definido abaixo)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cupom">Código do Cupom</Label>
                      <Input
                        id="cupom"
                        value={config?.cupom_aniversario || ""}
                        onChange={(e) => setConfig(prev => ({ ...prev, cupom_aniversario: e.target.value }))}
                        placeholder="NIVER15"
                      />
                    </div>
                    <div>
                      <Label htmlFor="desconto">Desconto (%)</Label>
                      <Input
                        id="desconto"
                        type="number"
                        min="5"
                        max="50"
                        value={config?.desconto_aniversario === null ? "" : config?.desconto_aniversario} // Handle null for display
                        onChange={(e) => setConfig(prev => ({ ...prev, desconto_aniversario: e.target.value === "" ? null : parseInt(e.target.value) || "" }))}
                        placeholder="15"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">📱 Preview da mensagem:</h4>
                  <div className="text-sm text-purple-700 whitespace-pre-line bg-white p-3 rounded border">
                    {processarVariaveis(config?.mensagem_aniversario, true) ||
                      'Configure sua mensagem de aniversário acima...'}
                  </div>
                </div>

                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                >
                  {isSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Histórico (Existing Tab) */}
          <TabsContent value="historico" className="space-y-6">
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-purple-500" />
                  Histórico de Mensagens
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Últimas mensagens enviadas pelo sistema
                </p>
              </CardHeader>
              <CardContent>
                {mensagens.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma mensagem enviada ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mensagens.slice(0, 10).map((mensagem) => (
                      <div
                        key={mensagem.id}
                        className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">
                              {mensagem.cliente_nome}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {mensagem.tipo_mensagem}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {mensagem.data_envio && format(new Date(mensagem.data_envio), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {mensagem.conteudo}
                          </p>
                        </div>
                        <Badge
                          className={
                            mensagem.status_envio === "enviada" ? "bg-green-100 text-green-800" :
                              mensagem.status_envio === "erro" ? "bg-red-100 text-red-800" :
                                "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {mensagem.status_envio}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
