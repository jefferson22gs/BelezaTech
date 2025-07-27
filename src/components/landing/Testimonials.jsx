import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  { name: 'Juliana Martins', salon: 'Studio J', text: 'O BelezaTech mudou o jogo para o meu salão. A agenda inteligente e os lembretes por WhatsApp diminuíram as faltas em 80%!'},
  { name: 'Ricardo Alves', salon: 'Barbearia do Ricardo', text: 'O Canal na TV é um sucesso. Os clientes comentam e se sentem mais engajados enquanto esperam. Virou um diferencial enorme.'},
  { name: 'Camila Ferreira', salon: 'Espaço Beleza Pura', text: 'Finalmente tenho controle total do meu financeiro. Consigo ver meu lucro real e pagar as comissões sem dor de cabeça. Recomendo!'},
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Amado por donos de salão em todo o Brasil</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
                <p className="font-bold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.salon}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}