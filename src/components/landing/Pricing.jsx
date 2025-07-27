import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const features = [
  'Agenda Inteligente e Ilimitada',
  'Gestão Financeira Completa',
  'CRM e Automações de Marketing',
  'PWA de Agendamento para Clientes',
  'Canal Interativo para TV',
  'Gestão de Estoque e Compras',
  'BelezaTech Academy',
  'Suporte Prioritário via WhatsApp'
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Preço simples e transparente</h2>
          <p className="text-lg text-gray-600 mt-4">Um único plano com tudo que você precisa para decolar. Sem surpresas, sem taxas escondidas.</p>
        </div>
        <Card className="max-w-md mx-auto shadow-2xl border-2 border-purple-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Plano Infinite</CardTitle>
            <CardDescription>Tudo que o BelezaTech tem a oferecer.</CardDescription>
            <div className="my-4">
              <span className="text-5xl font-extrabold text-gray-900">R$49,99</span>
              <span className="text-gray-500">/mês</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Link to={createPageUrl('Assinatura')} className="w-full">
              <Button size="lg" className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                Iniciar meu teste de 15 dias
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}