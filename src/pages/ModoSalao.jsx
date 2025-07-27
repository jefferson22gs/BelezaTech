import React, { useState, useEffect } from "react";
import { SalaoConfig } from "@/api/entities";
import { PortfolioSalao } from "@/api/entities";
import { PromocaoSalao } from "@/api/entities";
import { Agendamento } from "@/api/entities";
import { Crown, Sparkles, Clock, User, Star, Gift, ChevronRight, QrCode, Smartphone } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function ModoSalao() {
  const [configuracao, setConfiguracao] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  const [filaAtendimento, setFilaAtendimento] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Extrair o slug do salão da URL
  const salaoSlug = new URLSearchParams(window.location.search).get('salao') || 'demo';

  useEffect(() => {
    loadData();
    generateQRCode();
    
    // Atualizar horário a cada segundo
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Trocar slide a cada 8 segundos
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => prev + 1);
    }, 8000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(slideInterval);
    };
  }, []);

  const generateQRCode = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const checkInUrl = `${currentUrl}/CheckInCliente?salao=${salaoSlug}`;
    
    // Usar a API do QR Server para gerar QR Code
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}&format=png&margin=10&qzone=1&color=000000&bgcolor=ffffff`;
    
    setQrCodeUrl(qrUrl);
  };

  const loadData = async () => {
    try {
      // Carregar configuração do salão
      const configs = await SalaoConfig.list();
      if (configs.length > 0) {
        setConfiguracao(configs[0]);
        applyCustomTheme(configs[0].cores_tema);
      }

      // Carregar portfólio ativo
      const portfolioData = await PortfolioSalao.filter({ ativo: true });
      setPortfolio(portfolioData.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));

      // Carregar promoções ativas
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const promocoesData = await PromocaoSalao.filter({ ativo: true });
      const promocoesValidas = promocoesData.filter(p => 
        p.data_inicio <= hoje && p.data_fim >= hoje
      );
      setPromocoes(promocoesValidas);

      // Carregar fila de atendimento do dia
      const agendamentosData = await Agendamento.list('-data_hora', 20);
      const agendamentosHoje = agendamentosData.filter(a => 
        isToday(parseISO(a.data_hora)) && 
        ['confirmado', 'em_andamento', 'cliente_chegou'].includes(a.status)
      );
      setFilaAtendimento(agendamentosHoje);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const applyCustomTheme = (cores) => {
    if (!cores) return;
    
    document.documentElement.style.setProperty('--primary', cores.primaria);
    document.documentElement.style.setProperty('--secondary', cores.secundaria);
    document.documentElement.style.setProperty('--accent', cores.acento);
    document.documentElement.style.setProperty('--background', cores.fundo);
  };

  // Combinar conteúdo para o carrossel
  const allContent = [
    // Slide de boas-vindas com QR Code
    {
      type: 'welcome',
      content: {
        titulo: 'Bem-vindos!',
        subtitulo: 'Escaneie o QR Code para fazer check-in'
      }
    },
    // Portfolio
    ...portfolio.map(item => ({ type: 'portfolio', content: item })),
    // Promoções
    ...promocoes.map(item => ({ type: 'promocao', content: item })),
    // Fila de atendimento
    {
      type: 'fila',
      content: {
        titulo: 'Fila de Atendimento',
        fila: filaAtendimento
      }
    }
  ];

  const currentContent = allContent[currentSlide % allContent.length];

  const renderSlide = (slideData) => {
    if (!slideData) return null;

    switch (slideData.type) {
      case 'welcome':
        return (
          <div className="flex flex-col lg:flex-row items-center justify-center h-full gap-12 px-12">
            {/* Lado esquerdo - Boas-vindas */}
            <div className="flex-1 text-center lg:text-left">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl lg:text-7xl font-bold text-white mb-4"
              >
                {slideData.content.titulo}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl lg:text-2xl text-white/80 mb-8"
              >
                {configuracao?.nome_salao || "Nosso Salão"}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-white/70"
              >
                {slideData.content.subtitulo}
              </motion.div>
            </div>

            {/* Lado direito - QR Code */}
            <div className="flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-3xl p-8 shadow-2xl"
              >
                <div className="text-center mb-6">
                  <QrCode className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Check-in Digital
                  </h3>
                  <p className="text-gray-600 flex items-center justify-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Use a câmera do seu celular
                  </p>
                </div>
                
                {qrCodeUrl && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code Check-in"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                )}
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    Confirme sua chegada em segundos
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 'portfolio':
        return (
          <div className="flex items-center justify-center h-full p-12">
            <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-white/60 text-lg font-medium">
                  NOSSO PORTFÓLIO
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold text-white">
                  {slideData.content.titulo}
                </h2>
                {slideData.content.descricao && (
                  <p className="text-xl text-white/80">
                    {slideData.content.descricao}
                  </p>
                )}
                {slideData.content.profissional && (
                  <div className="flex items-center gap-3 text-white/70">
                    <User className="w-5 h-5" />
                    <span>Por {slideData.content.profissional}</span>
                  </div>
                )}
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-white font-medium">
                    {slideData.content.categoria}
                  </span>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative"
              >
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src={slideData.content.imagem_url}
                    alt={slideData.content.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-black p-4 rounded-full shadow-lg">
                  <Star className="w-8 h-8" />
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 'promocao':
        return (
          <div className="flex items-center justify-center h-full p-12">
            <div className="max-w-6xl w-full">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-12 text-center shadow-2xl"
              >
                <Gift className="w-16 h-16 mx-auto mb-6 text-black" />
                <h2 className="text-4xl lg:text-6xl font-bold text-black mb-6">
                  {slideData.content.titulo}
                </h2>
                <p className="text-xl text-black/80 mb-8 max-w-3xl mx-auto">
                  {slideData.content.descricao}
                </p>
                
                <div className="flex flex-wrap justify-center gap-6">
                  {slideData.content.desconto_porcentagem > 0 && (
                    <div className="bg-black text-white px-6 py-3 rounded-full text-xl font-bold">
                      {slideData.content.desconto_porcentagem}% OFF
                    </div>
                  )}
                  {slideData.content.codigo_cupom && (
                    <div className="bg-white text-black px-6 py-3 rounded-full text-xl font-bold">
                      CUPOM: {slideData.content.codigo_cupom}
                    </div>
                  )}
                </div>
                
                <div className="mt-8 text-black/70">
                  Válido até {format(parseISO(slideData.content.data_fim), 'dd/MM/yyyy')}
                </div>
              </motion.div>
            </div>
          </div>
        );

      case 'fila':
        return (
          <div className="flex flex-col justify-center h-full p-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-6xl mx-auto w-full"
            >
              <div className="text-center mb-12">
                <h2 className="text-4xl lg:text-6xl font-bold text-white mb-4">
                  Próximos Atendimentos
                </h2>
                <p className="text-xl text-white/70">
                  {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>

              {slideData.content.fila.length === 0 ? (
                <div className="text-center text-white/60 text-2xl">
                  <Clock className="w-16 h-16 mx-auto mb-4" />
                  <p>Nenhum atendimento agendado para agora</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {slideData.content.fila.slice(0, 4).map((agendamento, index) => (
                    <motion.div
                      key={agendamento.id}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-3xl font-bold text-white bg-white/20 rounded-full w-16 h-16 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-white">
                            {agendamento.cliente_nome}
                          </h3>
                          <p className="text-white/70 text-lg">
                            {agendamento.servico}
                          </p>
                          <p className="text-white/60">
                            com {agendamento.profissional}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-white">
                        <div className="text-2xl font-bold">
                          {format(parseISO(agendamento.data_hora), 'HH:mm')}
                        </div>
                        <div className="text-white/70">
                          {agendamento.status === 'cliente_chegou' ? 'Chegou' : 'Agendado'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 overflow-hidden">
      {/* Header fixo */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex justify-between items-center">
          {/* Logo e nome */}
          <div className="flex items-center gap-4">
            {configuracao?.logo_url ? (
              <img 
                src={configuracao.logo_url} 
                alt="Logo" 
                className="h-16 w-auto object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {configuracao?.nome_salao || "Salão de Beleza"}
              </h1>
              <div className="flex items-center gap-2 text-white/70">
                <span>Powered by BelezaTech</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Horário atual */}
          <div className="text-right text-white">
            <div className="text-3xl font-bold">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-white/70 text-lg">
              {format(currentTime, "d 'de' MMMM", { locale: ptBR })}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="pt-24 h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="h-full"
          >
            {renderSlide(currentContent)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Indicador de slides */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-2">
          {allContent.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide % allContent.length
                  ? 'bg-white'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}