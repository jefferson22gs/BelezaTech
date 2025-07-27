import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Bot, Tv, DollarSign, Users, Package } from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Agenda Inteligente', description: 'Otimize horários, evite conflitos e reduza faltas com lembretes automáticos via WhatsApp.' },
  { icon: Bot, title: 'Assistente de IA', description: 'Nossa IA identifica oportunidades de upsell e prevê o risco de no-show dos clientes.' },
  { icon: Tv, title: 'Canal Interativo na TV', description: 'Transforme a sala de espera em uma experiência com seu portfólio, promoções e fila de atendimento.' },
  { icon: DollarSign, title: 'Financeiro Descomplicado', description: 'Controle o faturamento, comissões e despesas com relatórios visuais e fáceis de entender.' },
  { icon: Users, title: 'CRM e Marketing', description: 'Fidelize clientes com campanhas de aniversário, reativação e um PWA de agendamento exclusivo para eles.' },
  { icon: Package, title: 'Gestão de Estoque e Compras', description: 'Controle seus produtos e compre de fornecedores parceiros diretamente na plataforma.' },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Tudo que você precisa para crescer</h2>
          <p className="text-lg text-gray-600 mt-4">Funcionalidades pensadas para simplificar sua rotina e impressionar seus clientes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}