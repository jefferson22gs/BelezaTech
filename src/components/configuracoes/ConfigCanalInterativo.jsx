import React, { useState, useEffect } from "react";
import { CanalConfig } from "@/api/entities";
import { Servico } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tv, 
  Settings, 
  Star, 
  Sparkles,
  Wifi,
  Instagram,
  Facebook,
  Phone,
  Save,
  ExternalLink,
  Copy,
  Layout,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { UploadFile } from "@/api/integrations";

const layoutOptions = [
  { value: 'barra_lateral', label: 'Barra Lateral', desc: 'Conteúdo principal + barra lateral com widgets' },
  { value: 'rodape', label: 'Rodapé', desc: 'Conteúdo principal + rodapé com informações' },
  { value: 'tela_cheia', label: 'Tela Cheia', desc: 'Conteúdo principal ocupando toda a tela' }
];

const categoriasPilulas = [
  { value: 'motivacional', label: '💪 Motivacional', desc: 'Frases inspiradoras e motivacionais' },
  { value: 'dicas_beleza', label: '✨ Dicas de Beleza', desc: 'Dicas práticas de cuidados pessoais' },
  { value: 'curiosidades', label: '🤔 Curiosidades', desc: 'Fatos interessantes sobre beleza e bem-estar' },
  { value: 'humor', label: '😄 Humor', desc: 'Frases leves e divertidas para descontrair' },
  { value: 'tendencias', label: '🔥 Tendências', desc: 'Tendências atuais de beleza e moda' }
];

const widgetsDisponiveis = [
  { value: 'cardapio_servicos', label: 'Cardápio de Serviços', desc: 'Exibe serviços e preços em rotação' },
  { value: 'fila_atendimento', label: 'Fila de Atendimento', desc: 'Status dos atendimentos em tempo real' },
  { value: 'pilulas_ia', label: 'Pílulas de Bem-Estar', desc: 'Conteúdo motivacional gerado por IA' },
  { value: 'redes_sociais', label: 'Redes Sociais', desc: 'Links e informações das redes sociais' },
  { value: 'clima', label: 'Clima Local', desc: 'Informações meteorológicas da região' }
];

export default function ConfigCanalInterativo() {
  const [config, setConfig] = useState({
    layout_escolhido: 'barra_lateral',
    destaque_semana: {
      ativo: false,
      servico_id: '',
      titulo: '',
      descricao: '',
      preco_promocional: 0,
      imagem_url: '',
      video_url: '',
      valido_ate: ''
    },
    pilulas_config: {
      ativo: true,
      categorias: ['motivacional', 'dicas_beleza'],
      frequencia_atualizacao: 30
    },
    info_fixas: {
      wifi_nome: '',
      wifi_senha: '',
      instagram: '',
      facebook: '',
      telefone_contato: ''
    },
    widgets_ativos: ['cardapio_servicos', 'fila_atendimento', 'pilulas_ia']
  });

  const [servicos, setServicos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [configData, servicosData] = await Promise.all([
        CanalConfig.list(),
        Servico.list()
      ]);

      if (configData.length > 0) {
        setConfig(configData[0]);
      }
      setServicos(servicosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existingConfigs = await CanalConfig.list();
      
      if (existingConfigs.length > 0) {
        await CanalConfig.update(existingConfigs[0].id, config);
      } else {
        await CanalConfig.create(config);
      }
      
      alert("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar configurações");
    }
    setIsSaving(false);
  };

  const handleUploadImagem = async (file) => {
    try {
      const { file_url } = await UploadFile({ file });
      setConfig(prev => ({
        ...prev,
        destaque_semana: {
          ...prev.destaque_semana,
          imagem_url: file_url
        }
      }));
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const canalUrl = `${currentUrl}/CanalInterativo?salao=demo`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect border-0 premium-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Tv className="w-4 h-4 text-white" />
            </div>
            Canal Interativo do Salão
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <p className="text-sm text-gray-600">
              Configure sua experiência de digital signage para Smart TV
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(canalUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visualizar Canal
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(canalUrl)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar URL
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="layout" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="destaque">Destaque</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="pilulas">IA Content</TabsTrigger>
        </TabsList>

        {/* Aba Layout */}
        <TabsContent value="layout" className="space-y-6">
          <Card className="glass-effect border-0 premium-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-purple-500" />
                Layout da Tela
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {layoutOptions.map((layout) => (
                  <motion.div
                    key={layout.value}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      config.layout_escolhido === layout.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setConfig(prev => ({ ...prev, layout_escolhido: layout.value }))}
                  >
                    <h4 className="font-semibold text-lg mb-2">{layout.label}</h4>
                    <p className="text-sm text-gray-600">{layout.desc}</p>
                    {config.layout_escolhido === layout.value && (
                      <Badge className="mt-2 bg-purple-500">Selecionado</Badge>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Informações Fixas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Fixas</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Wi-Fi</Label>
                    <Input
                      value={config.info_fixas.wifi_nome}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        info_fixas: { ...prev.info_fixas, wifi_nome: e.target.value }
                      }))}
                      placeholder="Nome da rede Wi-Fi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Senha do Wi-Fi</Label>
                    <Input
                      value={config.info_fixas.wifi_senha}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        info_fixas: { ...prev.info_fixas, wifi_senha: e.target.value }
                      }))}
                      placeholder="Senha da rede"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Instagram</Label>
                    <Input
                      value={config.info_fixas.instagram}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        info_fixas: { ...prev.info_fixas, instagram: e.target.value }
                      }))}
                      placeholder="@seusalao"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone de Contato</Label>
                    <Input
                      value={config.info_fixas.telefone_contato}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        info_fixas: { ...prev.info_fixas, telefone_contato: e.target.value }
                      }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Destaque da Semana */}
        <TabsContent value="destaque" className="space-y-6">
          <Card className="glass-effect border-0 premium-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Destaque da Semana
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.destaque_semana.ativo}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    destaque_semana: { ...prev.destaque_semana, ativo: checked }
                  }))}
                />
                <Label>Ativar Destaque da Semana</Label>
              </div>

              {config.destaque_semana.ativo && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Serviço Base</Label>
                    <Select
                      value={config.destaque_semana.servico_id}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        destaque_semana: { ...prev.destaque_semana, servico_id: value }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicos.map(servico => (
                          <SelectItem key={servico.id} value={servico.id}>
                            {servico.nome} - R$ {servico.valor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título do Destaque</Label>
                      <Input
                        value={config.destaque_semana.titulo}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          destaque_semana: { ...prev.destaque_semana, titulo: e.target.value }
                        }))}
                        placeholder="Ex: Super Promoção de Dezembro!"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preço Promocional</Label>
                      <Input
                        type="number"
                        value={config.destaque_semana.preco_promocional}
                        onChange={(e) => setConfig(prev => ({
                          ...prev,
                          destaque_semana: { ...prev.destaque_semana, preco_promocional: parseFloat(e.target.value) || 0 }
                        }))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={config.destaque_semana.descricao}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        destaque_semana: { ...prev.destaque_semana, descricao: e.target.value }
                      }))}
                      placeholder="Descreva a promoção..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Válido até</Label>
                    <Input
                      type="date"
                      value={config.destaque_semana.valido_ate}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        destaque_semana: { ...prev.destaque_semana, valido_ate: e.target.value }
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Imagem de Destaque</Label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleUploadImagem(file);
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    />
                    {config.destaque_semana.imagem_url && (
                      <img
                        src={config.destaque_semana.imagem_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mt-2"
                      />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Widgets */}
        <TabsContent value="widgets" className="space-y-6">
          <Card className="glass-effect border-0 premium-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                Widgets da Barra Lateral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {widgetsDisponiveis.map((widget) => (
                  <div key={widget.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={config.widgets_ativos.includes(widget.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setConfig(prev => ({
                            ...prev,
                            widgets_ativos: [...prev.widgets_ativos, widget.value]
                          }));
                        } else {
                          setConfig(prev => ({
                            ...prev,
                            widgets_ativos: prev.widgets_ativos.filter(w => w !== widget.value)
                          }));
                        }
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{widget.label}</h4>
                      <p className="text-sm text-gray-600">{widget.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Pílulas IA */}
        <TabsContent value="pilulas" className="space-y-6">
          <Card className="glass-effect border-0 premium-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-500" />
                Pílulas de Bem-Estar (IA)
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure o conteúdo motivacional gerado automaticamente por IA
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.pilulas_config.ativo}
                  onCheckedChange={(checked) => setConfig(prev => ({
                    ...prev,
                    pilulas_config: { ...prev.pilulas_config, ativo: checked }
                  }))}
                />
                <Label>Ativar Pílulas de Bem-Estar</Label>
              </div>

              {config.pilulas_config.ativo && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Categorias de Conteúdo
                    </Label>
                    <div className="space-y-3">
                      {categoriasPilulas.map((categoria) => (
                        <div key={categoria.value} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Checkbox
                            checked={config.pilulas_config.categorias.includes(categoria.value)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setConfig(prev => ({
                                  ...prev,
                                  pilulas_config: {
                                    ...prev.pilulas_config,
                                    categorias: [...prev.pilulas_config.categorias, categoria.value]
                                  }
                                }));
                              } else {
                                setConfig(prev => ({
                                  ...prev,
                                  pilulas_config: {
                                    ...prev.pilulas_config,
                                    categorias: prev.pilulas_config.categorias.filter(c => c !== categoria.value)
                                  }
                                }));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{categoria.label}</h4>
                            <p className="text-sm text-gray-600">{categoria.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Frequência de Atualização (segundos)</Label>
                    <Select
                      value={config.pilulas_config.frequencia_atualizacao.toString()}
                      onValueChange={(value) => setConfig(prev => ({
                        ...prev,
                        pilulas_config: { ...prev.pilulas_config, frequencia_atualizacao: parseInt(value) }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 segundos</SelectItem>
                        <SelectItem value="30">30 segundos</SelectItem>
                        <SelectItem value="60">1 minuto</SelectItem>
                        <SelectItem value="120">2 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão de Salvar */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
        >
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}