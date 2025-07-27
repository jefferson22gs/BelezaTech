import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to={createPageUrl('LandingPage')} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">BelezaTech</span>
        </Link>
        <div className="flex items-center gap-4">
            <Link to={createPageUrl('Onboarding')}>
                <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to={createPageUrl('Assinatura')}>
                <Button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">Começar Agora</Button>
            </Link>
        </div>
      </div>
    </header>
  );
}