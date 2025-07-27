import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Crown, Sparkles } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        await User.me();
        // Se o usuário está logado, vai para o Dashboard
        navigate(createPageUrl('Dashboard'));
      } catch (error) {
        // Se não está logado, vai para a Landing Page
        navigate(createPageUrl('LandingPage'));
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // Tela de carregamento elegante enquanto a verificação acontece
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

  return null; // O conteúdo não será renderizado, pois o redirecionamento é feito no useEffect
}