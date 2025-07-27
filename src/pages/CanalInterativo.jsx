import React, { useState, useEffect } from "react";
import { SalaoConfig } from "@/api/entities";
import { CanalConfig } from "@/api/entities";
import { PortfolioSalao } from "@/api/entities";
import { PromocaoSalao } from "@/api/entities";
import { Agendamento } from "@/api/entities";
import { Servico } from "@/api/entities";
import { PilulasBemEstar } from "@/api/entities";
import { Crown, Sparkles, Clock, User, Star, Gift, ChevronRight, QrCode, Smartphone, Wifi, Instagram, Facebook, Phone, MapPin } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { InvokeLLM } from "@/api/integrations";

export default function CanalInterativo() {
  const [configuracao, setConfiguracao] = useState(null);
  const [canalConfig, setCanalConfig] = useState(null);
  const [portfolio, setPortfolio] = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [filaAtendimento, setFilaAtendimento] = useState([]);
  const [pilulasBemEstar, setPilulasBemEstar] = useState([]);
  const [currentMainSlide, setCurrentMainSlide] = useState(0);
  const [currentPilula, setCurrentPilula] = useState(0);
  const [currentServico, setCurrentServico] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [qrContext, setQrContext] = useState({ action: 'checkin', text: 'Faça seu check-in' });

  const salaoSlug = new URLSearchParams(window.location.search).get('salao') || 'demo';

  useEffect(() => {
    loadData();
    generateDailyContent();
    
    // Atualizar horário a cada segundo
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Slide principal - 8 segundos
    const mainSlideInterval = setInterval(() => {
      setCurrentMainSlide(prev => prev + 1);
    }, 8000);

    // Pílulas - 15 segundos
    const pilulaInterval = setInterval(() => {
      setCurrentPilula(prev => prev + 1);
    }, 15000);

    // Serviços - 6 segundos
    const servicoInterval = setInterval(() => {
      setCurrentServico(prev => prev + 1);
    }, 6000);

    // QR Context - 30 segundos
    const qrInterval = setInterval(() => {
      updateQRContext();
    }, 30000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(mainSlideInterval);
      clearInterval(pilulaInterval);
      clearInterval(servicoInterval);
      clearInterval(qrInterval);
    };
  }, []);

  const loadData = async () => {
    try {
      // Carregar configurações
      const [configData, canalData] = await Promise.all([
        SalaoConfig.list(),
        CanalConfig.list()
      ]);
      
      if (configData.length > 0) {
        setConfiguracao(configData[0]);
        applyCustomTheme(configData[0].cores_tema);
      }
      
      if (canalData.length > 0) {
        setCanalConfig(canalData[0]);
      }

      // Carregar conteúdo
      const [portfolioData, promocoesData, servicosData, agendamentosData, pilulasData] = await Promise.all([
        PortfolioSalao.filter({ ativo: true }),
        PromocaoSalao.filter({ ativo: true }),
        Servico.filter({ ativo: true }),
        Agendamento.list('-data_hora', 20),
        PilulasBemEstar.list('-created_date', 50)
      ]);

      setPortfolio(portfolioData.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
      
      // Filtrar promoções válidas
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const promocoesValidas = promocoesData.filter(p => 
        p.data_inicio <= hoje && p.data_fim >= hoje
      );
      setPromocoes(promocoesValidas);
      
      setServicos(servicosData);
      setPilulasBemEstar(pilulasData);

      // Fila de atendimento do dia
      const agendamentosHoje = agendamentosData.filter(a => 
        isToday(parseISO(a.data_hora)) && 
        ['confirmado', 'em_andamento', 'cliente_chegou'].includes(a.status)
      );
      setFilaAtendimento(agendamentosHoje);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const generateDailyContent = async () => {
    try {
      // Verificar se já existe conteúdo para hoje
      const hoje = format(new Date(), 'yyyy-MM-dd');
      const pilulasHoje = await PilulasBemEstar.filter({ 
        data_criacao: hoje 
      });

      if (pilulasHoje.length < 10) { // Gerar mais conteúdo se necessário
        const categorias = ['motivacional', 'dicas_beleza', 'curiosidades', 'humor', 'tendencias'];
        
        for (const categoria of categorias) {
          const prompt = `Gere uma frase curta e inspiradora para um salão de beleza na categoria ${categoria}. 
          Deve ter no máximo 80 caracteres, ser positiva e adequada para um ambiente profissional de beleza.
          Inclua um emoji adequado no início da frase.`;

          try {
            const response = await InvokeLLM({ prompt });
            
            await PilulasBemEstar.create({
              categoria: categoria,
              conteudo: response,
              data_criacao: hoje,
              gerado_por_ia: true
            });
          } catch (error) {
            console.log("Erro ao gerar conteúdo IA:", error);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao gerar conteúdo diário:", error);
    }
  };

  const updateQRContext = () => {
    const contexts = [
      { action: 'checkin', text: 'Faça seu check-in', icon: '📱' },
      { action: 'avaliacao', text: 'Avalie nosso atendimento', icon: '⭐' },
      { action: 'instagram', text: 'Siga nosso Instagram', icon: '📸' },
      { action: 'wifi', text: 'Conecte-se ao Wi-Fi', icon: '📶' },
      { action: 'agendamento', text: 'Agende seu próximo horário', icon: '📅' }
    ];
    
    const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
    setQrContext(randomContext);
  };

  const applyCustomTheme = (cores) => {
    if (!cores) return;
    
    document.documentElement.style.setProperty('--primary', cores.primaria);
    document.documentElement.style.setProperty('--secondary', cores.secundaria);
    document.documentElement.style.setProperty('--accent', cores.acento);
  };

  // Conteúdo principal (zona principal)
  const mainContent = [
    // Destaque da semana
    ...(canalConfig?.destaque_semana?.ativo ? [{
      type: 'destaque',
      content: canalConfig.destaque_semana
    }] : []),
    // Portfolio
    ...portfolio.map(item => ({ type: 'portfolio', content: item })),
    // Promoções
    ...promocoes.map(item => ({ type: 'promocao', content: item }))
  ];

  const currentMainContent = mainContent[currentMainSlide % mainContent.length];
  const currentPilulaContent = pilulasBemEstar[currentPilula % pilulasBemEstar.length];
  const currentServicoContent = servicos[currentServico % servicos.length];

  const renderMainZone = () => {
    if (!currentMainContent) return null;

    switch (currentMainContent.type) {
      case 'destaque':
        return (
          <motion.div
            key={`destaque-${currentMainSlide}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="h-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden"
          >
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            
            <Star className="w-16 h-16 text-white mb-6 drop-shadow-lg" />
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              🌟 DESTAQUE DA SEMANA
            </h2>
            <h3 className="text-3xl lg:text-5xl font-bold text-black mb-6">
              {currentMainContent.content.titulo}
            </h3>
            <p className="text-xl lg:text-2xl text-black/80 mb-8 max-w-3xl">
              {currentMainContent.content.descricao}
            </p>
            
            {currentMainContent.content.preco_promocional && (
              <div className="bg-black text-white px-8 py-4 rounded-full text-2xl lg:text-3xl font-bold mb-4">
                A partir de R$ {currentMainContent.content.preco_promocional.toFixed(2)}
              </div>
            )}
            
            <div className="text-black/70 text-lg">
              Oferta válida até {format(parseISO(currentMainContent.content.valido_ate || new Date()), 'dd/MM/yyyy')}
            </div>
          </motion.div>
        );

      case 'portfolio':
        return (
          <motion.div
            key={`portfolio-${currentMainSlide}`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="h-full flex items-center justify-center p-8"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center h-full max-w-7xl">
              <div className="space-y-6">
                <div className="text-purple-200 text-lg font-medium tracking-wider">
                  ✨ NOSSO PORTFÓLIO
                </div>
                <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                  {currentMainContent.content.titulo}
                </h2>
                {currentMainContent.content.descricao && (
                  <p className="text-xl lg:text-2xl text-purple-100">
                    {currentMainContent.content.descricao}
                  </p>
                )}
                {currentMainContent.content.profissional && (
                  <div className="flex items-center gap-3 text-purple-200 text-lg">
                    <User className="w-5 h-5" />
                    <span>Trabalho realizado por {currentMainContent.content.profissional}</span>
                  </div>
                )}
                <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                  <span className="text-white font-medium text-lg capitalize">
                    {currentMainContent.content.categoria.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  rotate: 0,
                  // Efeito Ken Burns
                  x: [0, -10, 10, 0],
                  y: [0, -5, 5, 0]
                }}
                transition={{ 
                  duration: 8,
                  x: { repeat: Infinity, duration: 8 },
                  y: { repeat: Infinity, duration: 6 }
                }}
                className="relative"
              >
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl relative">
                  <img
                    src={currentMainContent.content.imagem_url}
                    alt={currentMainContent.content.titulo}
                    className="w-full h-full object-cover transform scale-105 transition-transform duration-8000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-black p-4 rounded-full shadow-xl">
                  <Star className="w-8 h-8" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        );

      case 'promocao':
        return (
          <motion.div
            key={`promocao-${currentMainSlide}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="h-full flex items-center justify-center p-8"
          >
            <div className="bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 rounded-3xl p-12 text-center shadow-2xl max-w-5xl">
              <Gift className="w-20 h-20 mx-auto mb-8 text-white drop-shadow-lg" />
              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                🎁 {currentMainContent.content.titulo}
              </h2>
              <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
                {currentMainContent.content.descricao}
              </p>
              
              <div className="flex flex-wrap justify-center gap-6">
                {currentMainContent.content.desconto_porcentagem > 0 && (
                  <div className="bg-white text-purple-600 px-8 py-4 rounded-full text-2xl lg:text-3xl font-bold shadow-lg">
                    {currentMainContent.content.desconto_porcentagem}% OFF
                  </div>
                )}
                {currentMainContent.content.codigo_cupom && (
                  <div className="bg-yellow-400 text-black px-8 py-4 rounded-full text-xl lg:text-2xl font-bold shadow-lg">
                    CUPOM: {currentMainContent.content.codigo_cupom}
                  </div>
                )}
              </div>
              
              <div className="mt-8 text-white/80 text-lg">
                Válido até {format(parseISO(currentMainContent.content.data_fim), 'dd/MM/yyyy')}
              </div>
            </div>
          </motion.div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center text-white text-2xl">
            Carregando conteúdo...
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Layout com barra lateral */}
      <div className="h-full flex">
        {/* Zona Principal - 70% */}
        <div className="flex-1 h-full relative">
          {/* Header fixo na zona principal */}
          <div className="absolute top-0 left-0 right-0 z-10 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {configuracao?.logo_url ? (
                  <img 
                    src={configuracao.logo_url} 
                    alt="Logo" 
                    className="h-12 w-auto object-contain"
                  />
                ) : (
                  <Crown className="w-12 h-12 text-white" />
                )}
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {configuracao?.nome_salao || "Salão de Beleza"}
                  </h1>
                  <div className="flex items-center gap-2 text-white/70 text-sm">
                    <span>Canal Interativo</span>
                    <Sparkles className="w-3 h-3" />
                  </div>
                </div>
              </div>
              
              <div className="text-right text-white">
                <div className="text-2xl font-bold">
                  {format(currentTime, 'HH:mm:ss')}
                </div>
                <div className="text-white/70 text-sm">
                  {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="h-full pt-20">
            <AnimatePresence mode="wait">
              {renderMainZone()}
            </AnimatePresence>
          </div>
        </div>

        {/* Barra Lateral - 30% */}
        <div className="w-96 h-full bg-black/20 backdrop-blur-sm border-l border-white/10 flex flex-col">
          {/* QR Code Contextual */}
          <div className="p-6 border-b border-white/10">
            <motion.div
              key={qrContext.action}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-white rounded-2xl p-4 mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/CheckInCliente?salao=' + salaoSlug)}&format=png&margin=10`}
                  alt="QR Code"
                  className="w-32 h-32 mx-auto"
                />
              </div>
              <div className="text-lg font-bold text-white mb-1">
                {qrContext.icon} {qrContext.text}
              </div>
              <p className="text-white/70 text-sm">
                <Smartphone className="w-3 h-3 inline mr-1" />
                Use a câmera do celular
              </p>
            </motion.div>
          </div>

          {/* Widget: Fila de Atendimento */}
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próximos Atendimentos
            </h3>
            {filaAtendimento.length === 0 ? (
              <p className="text-white/60 text-sm">Nenhum atendimento no momento</p>
            ) : (
              <div className="space-y-3">
                {filaAtendimento.slice(0, 3).map((agendamento, index) => (
                  <motion.div
                    key={agendamento.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-white/10 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {agendamento.cliente_nome}
                      </p>
                      <p className="text-white/70 text-sm truncate">
                        {agendamento.servico}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-sm">
                        {format(parseISO(agendamento.data_hora), 'HH:mm')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Widget: Cardápio de Serviços */}
          <div className="p-6 border-b border-white/10 flex-1">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5" />
              Nossos Serviços
            </h3>
            {currentServicoContent && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentServico}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg p-4 backdrop-blur-sm"
                >
                  <h4 className="text-white font-bold text-lg mb-2">
                    {currentServicoContent.nome}
                  </h4>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/70 text-sm capitalize">
                      {currentServicoContent.categoria.replace('_', ' ')}
                    </span>
                    <span className="text-green-400 font-bold">
                      R$ {currentServicoContent.valor?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <Clock className="w-3 h-3" />
                    <span>{currentServicoContent.duracao_minutos} min</span>
                  </div>
                  {currentServicoContent.descricao && (
                    <p className="text-white/80 text-sm mt-2 line-clamp-2">
                      {currentServicoContent.descricao}
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Widget: Pílulas de Bem-Estar */}
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Momento Zen
            </h3>
            {currentPilulaContent && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPilula}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-4 text-center backdrop-blur-sm"
                >
                  <p className="text-white text-lg leading-relaxed">
                    {currentPilulaContent.conteudo}
                  </p>
                  <div className="text-white/50 text-xs mt-2 capitalize">
                    {currentPilulaContent.categoria.replace('_', ' ')}
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Info Fixas */}
          <div className="p-6">
            <div className="space-y-2 text-sm">
              {canalConfig?.info_fixas?.wifi_nome && (
                <div className="flex items-center gap-2 text-white/70">
                  <Wifi className="w-4 h-4" />
                  <span>Wi-Fi: {canalConfig.info_fixas.wifi_nome}</span>
                </div>
              )}
              {canalConfig?.info_fixas?.instagram && (
                <div className="flex items-center gap-2 text-white/70">
                  <Instagram className="w-4 h-4" />
                  <span>@{canalConfig.info_fixas.instagram}</span>
                </div>
              )}
              {canalConfig?.info_fixas?.telefone_contato && (
                <div className="flex items-center gap-2 text-white/70">
                  <Phone className="w-4 h-4" />
                  <span>{canalConfig.info_fixas.telefone_contato}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}