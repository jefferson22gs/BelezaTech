import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Check, Play, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Coluna Esquerda - Texto */}
          <div className="lg:text-left text-center">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4" />
              Usado por 500+ salões no Brasil
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              A plataforma completa para <span className="text-purple-600">revolucionar</span> seu salão
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              Agenda inteligente, marketing automatizado, gestão financeira e um canal de TV exclusivo para seus clientes. Tudo em um só lugar por apenas <strong>R$ 49,99/mês</strong>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to={createPageUrl('Assinatura')}>
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg w-full sm:w-auto">
                  Teste 15 dias grátis
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Play className="w-4 h-4 mr-2" />
                Ver demonstração
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Sem cartão de crédito
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Cancele quando quiser
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-green-500" />
                Suporte brasileiro
              </span>
            </div>
          </div>

          {/* Coluna Direita - Imagem/Demo */}
          <div className="lg:block hidden">
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Agendamento confirmado</p>
                      <p className="text-sm text-gray-600">Maria Silva - 14:30</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-sm text-gray-600">✨ Corte + Escova</p>
                    <p className="text-sm font-semibold text-gray-900">R$ 85,00</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Faturamento Hoje</h3>
                  <p className="text-2xl font-bold text-green-600">R$ 1.240,00</p>
                  <p className="text-sm text-gray-600">+15% vs ontem</p>
                </div>
              </div>
              
              {/* Elementos flutuantes */}
              <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Online</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-3">
                <p className="text-sm text-gray-600">💡 IA sugere:</p>
                <p className="font-semibold text-sm">Oferecer hidratação</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}