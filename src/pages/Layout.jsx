

import React, { useEffect, useState } from "react";
import { User } from "@/api/entities";
import { SalaoConfig } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Crown, 
  Sparkles, 
  Home, 
  Calendar, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  DollarSign,
  MessageCircle,
  ShoppingBag,
  GraduationCap,
  Package
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Dashboard", icon: Home, page: "Dashboard" },
  { name: "Agenda", icon: Calendar, page: "Agenda" },
  { name: "Financeiro", icon: DollarSign, page: "Financeiro" },
  { name: "Clientes", icon: Users, page: "Clientes" },
  { name: "Marketplace", icon: ShoppingBag, page: "Marketplace" },
  { name: "Estoque", icon: Package, page: "Estoque" },
  { name: "Academy", icon: GraduationCap, page: "Academy" },
  { name: "WhatsApp", icon: MessageCircle, page: "ConfiguracoesWhatsApp" },
  { name: "Configurações", icon: Settings, page: "Configuracoes" },
];

// Lista de páginas que não exigem login
const PUBLIC_PAGES = ["LandingPage", "Assinatura", "CheckInCliente", "CanalInterativo", "ClienteApp"];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [configuracao, setConfiguracao] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Se a página atual for pública, não tente carregar dados do usuário
    if (PUBLIC_PAGES.includes(currentPageName)) {
      setIsLoading(false);
      return;
    }
    loadUserAndConfig();
  }, [currentPageName]);

  const loadUserAndConfig = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Inicializar dados do usuário se necessário
      if (!userData.plano) {
        await User.updateMyUserData({
          plano: "trial",
          status_assinatura: "ativo",
          data_fim_trial: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          onboarding_completo: false
        });
      }
      
      // Adicionar delay para evitar rate limit
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const configs = await SalaoConfig.filter({ created_by: userData.email });
      if (configs.length > 0) {
        const config = configs[0];
        setConfiguracao(config);
        
        if (config.cores_tema) {
          applyCustomTheme(config.cores_tema);
        }
        
        if (!config.onboarding_completo && currentPageName !== 'Onboarding') {
          navigate(createPageUrl("Onboarding"));
          return;
        }
      } else if (currentPageName !== 'Onboarding') {
        navigate(createPageUrl("Onboarding"));
        return;
      }
    } catch (error) {
      console.error("Erro ao carregar dados de usuário e configuração:", error);
      
      // Se for erro de autenticação, redirecionar para login
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        await User.loginWithRedirect(window.location.origin + '/Dashboard');
        return;
      }
      
      // Se for erro de rate limit, tentar novamente após um tempo
      if (error.message.includes('429') || error.message.includes('Rate limit')) {
        setTimeout(() => {
          loadUserAndConfig();
        }, 5000);
        return;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const hexToHsl = (hex) => {
    if (!hex) return "0 0% 50%";
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return "0 0% 50%";
    
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const getContrastingColor = (hex) => {
    if (!hex) return "0 0% 0%";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 155 ? "0 0% 10%" : "0 0% 100%";
  };

  const applyCustomTheme = (cores) => {
    if (!cores) return;
    const root = document.documentElement;
    
    root.style.setProperty('--background', hexToHsl(cores.fundo));
    root.style.setProperty('--foreground', hexToHsl(cores.texto));
    
    root.style.setProperty('--card', hexToHsl(cores.fundo));
    root.style.setProperty('--card-foreground', hexToHsl(cores.texto));
    
    root.style.setProperty('--popover', hexToHsl(cores.fundo));
    root.style.setProperty('--popover-foreground', hexToHsl(cores.texto));
    
    root.style.setProperty('--primary', hexToHsl(cores.primaria));
    root.style.setProperty('--primary-foreground', getContrastingColor(cores.primaria));
    
    root.style.setProperty('--secondary', hexToHsl(cores.secundaria));
    root.style.setProperty('--secondary-foreground', getContrastingColor(cores.secundaria));
    
    root.style.setProperty('--accent', hexToHsl(cores.acento));
    root.style.setProperty('--accent-foreground', getContrastingColor(cores.acento));

    const mutedFg = hexToHsl(cores.texto).replace(/(\d+%)(\s*)$/, (match, p1) => `${p1} / 0.6`);
    root.style.setProperty('--muted-foreground', mutedFg);
    
    const mutedBg = hexToHsl(cores.fundo).replace(/(\d+%)\s+(\d+%)\s*$/, (match, p1, p2) => `${p1} ${Math.max(0, parseInt(p2)-5)}%`);
    root.style.setProperty('--muted', mutedBg);
    
    const border = hexToHsl(cores.primaria).replace(/(\d+%)(\s*)$/, (match, p1) => `${p1} / 0.2`);
    root.style.setProperty('--border', border);
    root.style.setProperty('--input', border);
    root.style.setProperty('--ring', hexToHsl(cores.primaria));
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl("LandingPage"));
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <Crown className="w-9 h-9 text-white" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              BelezaTech
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-lg font-medium text-gray-600">Infinite</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }

  // Se for página pública, renderizar apenas o conteúdo
  if (PUBLIC_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-blue-50/50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                BelezaTech
              </h1>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-gray-600">Infinite</span>
                <Sparkles className="w-2.5 h-2.5 text-purple-500" />
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-4 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.page)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {menuItems.find(item => item.page === currentPageName)?.name || currentPageName}
                </h2>
                {configuracao && (
                  <p className="text-sm text-gray-600">{configuracao.nome_salao}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        {user?.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

