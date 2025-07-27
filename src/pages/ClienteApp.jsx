import React, { useState, useEffect } from "react";
import { SalaoConfig } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { Agendamento } from "@/api/entities";
import { Servico } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Star,
  Plus,
  History,
  Crown,
  Sparkles,
  MapPin,
  Instagram,
  Facebook
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

import ClienteLogin from "../components/cliente/ClienteLogin";
import ClientePerfil from "../components/cliente/ClientePerfil";
import NovoAgendamentoCliente from "../components/cliente/NovoAgendamentoCliente";
import HistoricoAgendamentos from "../components/cliente/HistoricoAgendamentos";

export default function ClienteApp() {
  const [configuracao, setConfiguracao] = useState(null);
  const [clienteLogado, setClienteLogado] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [activeView, setActiveView] = useState('login');
  const [isLoading, setIsLoading] = useState(true);

  // Extrair o slug do salão da URL
  const salaoSlug = new URLSearchParams(window.location.search).get('salao') || 'demo';

  useEffect(() => {
    loadSalaoConfig();
    
    // Instalar service worker para PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  useEffect(() => {
    if (clienteLogado) {
      loadClienteData();
    }
  }, [clienteLogado]);

  const loadSalaoConfig = async () => {
    try {
      // Simular busca por configuração baseada no slug
      const configs = await SalaoConfig.list();
      if (configs.length > 0) {
        setConfiguracao(configs[0]);
        applyCustomTheme(configs[0].cores_tema);
        
        // Carregar serviços do salão
        const servicosData = await Servico.list();
        setServicos(servicosData);
      }
    } catch (error) {
      console.error("Erro ao carregar configuração do salão:", error);
    }
    setIsLoading(false);
  };

  const loadClienteData = async () => {
    if (!clienteLogado) return;
    
    try {
      // Carregar agendamentos do cliente
      const agendamentosData = await Agendamento.filter({
        cliente_telefone: clienteLogado.telefone
      });
      setAgendamentos(agendamentosData.sort((a, b) => 
        new Date(b.data_hora) - new Date(a.data_hora)
      ));
    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error);
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

  const handleClienteLogin = (cliente) => {
    setClienteLogado(cliente);
    setActiveView('home');
  };

  const handleLogout = () => {
    setClienteLogado(null);
    setActiveView('login');
    setAgendamentos([]);
  };

  const handleNovoAgendamento = () => {
    loadClienteData();
    setActiveView('home');
  };

  const handleInstallPWA = () => {
    // Lógica para instalar PWA
    alert("Para instalar o app, use o menu do navegador e selecione 'Instalar app' ou 'Adicionar à tela inicial'");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Carregando {configuracao?.nome_salao || 'salão'}...</p>
        </div>
      </div>
    );
  }

  // CSS personalizado para o tema do salão
  const customCSS = configuracao?.cores_tema ? `
    :root {
      --primary: ${hexToHsl(configuracao.cores_tema.primaria)};
      --secondary: ${hexToHsl(configuracao.cores_tema.secundaria)};
      --accent: ${hexToHsl(configuracao.cores_tema.acento)};
    }
    
    .glass-effect {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .premium-shadow {
      box-shadow: 0 8px 32px rgba(139, 92, 246, 0.1);
    }
  ` : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/30 to-pink-50/30">
      <style>{customCSS}</style>
      
      {/* PWA Install Banner */}
      {!clienteLogado && (
        <div className="bg-purple-600 text-white text-center py-2 px-4 text-sm">
          <span>💡 Instale nosso app para agendar mais facilmente!</span>
          <button onClick={handleInstallPWA} className="ml-2 underline">
            Instalar
          </button>
        </div>
      )}
      
      {/* Header do PWA */}
      <div className="glass-effect border-b border-gray-200/50 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {configuracao?.logo_url ? (
              <img 
                src={configuracao.logo_url} 
                alt="Logo" 
                className="w-10 h-10 object-contain rounded-lg"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                {configuracao?.nome_salao || "Salão de Beleza"}
              </h1>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-600">Agendamento Online</span>
                <Sparkles className="w-2.5 h-2.5 text-purple-500" />
              </div>
            </div>
          </div>
          
          {clienteLogado && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-gray-600"
            >
              Sair
            </Button>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-md mx-auto px-4 py-6">
        {!clienteLogado ? (
          <>
            <ClienteLogin 
              onLogin={handleClienteLogin}
              configuracao={configuracao}
            />
            
            {/* Informações do Salão */}
            {configuracao && (
              <Card className="glass-effect border-0 premium-shadow mt-6">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {configuracao.nome_salao}
                    </h2>
                    
                    {configuracao.endereco && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{configuracao.endereco}</span>
                      </div>
                    )}
                    
                    {configuracao.telefone && (
                      <div className="flex items-center justify-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{configuracao.telefone}</span>
                      </div>
                    )}
                    
                    {/* Redes Sociais */}
                    <div className="flex justify-center gap-4 pt-4">
                      {configuracao.instagram && (
                        <a href={configuracao.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="w-6 h-6 text-gray-600 hover:text-purple-600" />
                        </a>
                      )}
                      {configuracao.facebook && (
                        <a href={configuracao.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="w-6 h-6 text-gray-600 hover:text-purple-600" />
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Navigation Pills */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={activeView === 'home' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('home')}
                className={activeView === 'home' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : ''}
              >
                <UserIcon className="w-4 h-4 mr-1" />
                Início
              </Button>
              <Button
                variant={activeView === 'agendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('agendar')}
                className={activeView === 'agendar' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : ''}
              >
                <Plus className="w-4 h-4 mr-1" />
                Agendar
              </Button>
              <Button
                variant={activeView === 'historico' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveView('historico')}
                className={activeView === 'historico' ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white' : ''}
              >
                <History className="w-4 h-4 mr-1" />
                Histórico
              </Button>
            </div>

            {/* Views */}
            {activeView === 'home' && (
              <ClientePerfil 
                cliente={clienteLogado}
                agendamentos={agendamentos}
                configuracao={configuracao}
                onNovoAgendamento={() => setActiveView('agendar')}
              />
            )}

            {activeView === 'agendar' && (
              <NovoAgendamentoCliente 
                cliente={clienteLogado}
                servicos={servicos}
                configuracao={configuracao}
                onSuccess={handleNovoAgendamento}
                onCancel={() => setActiveView('home')}
              />
            )}

            {activeView === 'historico' && (
              <HistoricoAgendamentos 
                agendamentos={agendamentos}
                onReload={loadClienteData}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}