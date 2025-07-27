import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: 'Preciso instalar algum programa?',
    a: 'Não! O BelezaTech é 100% online. Você pode acessá-lo de qualquer computador, tablet ou celular com internet.'
  },
  {
    q: 'Meus dados estão seguros?',
    a: 'Sim. Usamos criptografia de ponta e servidores seguros para garantir a proteção total dos seus dados e dos seus clientes.'
  },
  {
    q: 'Existe contrato de fidelidade?',
    a: 'Não. Você pode cancelar sua assinatura a qualquer momento, sem multas ou complicações.'
  },
  {
    q: 'Como funciona o suporte?',
    a: 'Nosso suporte é humanizado e rápido, disponível por WhatsApp e e-mail para te ajudar com qualquer dúvida.'
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Perguntas Frequentes</h2>
        </div>
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-left">{faq.q}</AccordionTrigger>
                <AccordionContent className="text-gray-600 text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}