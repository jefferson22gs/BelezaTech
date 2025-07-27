import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Palette, Zap, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Palette,
    title: "Identidade Visual Única",
    description: "Crie ou faça upload do seu logo e personalize as cores da interface"
  },
  {
    icon: Zap,
    title: "Configuração Rápida",
    description: "Em poucos minutos sua plataforma estará pronta para uso"
  },
  {
    icon: Users,
    title: "Gestão Completa", 
    description: "Clientes, serviços e agendamentos tudo em um só lugar"
  },
  {
    icon: TrendingUp,
    title: "Inteligência Artificial",
    description: "Insights automáticos para fazer seu negócio crescer"
  }
];

export default function OnboardingWelcome({ onNext, user }) {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Crown className="w-9 h-9 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              BelezaTech
            </h1>
            <div className="flex items-center gap-1">
              <span className="text-lg font-medium text-gray-600">Infinite</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Bem-vindo(a) ao futuro da gestão de salões!
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Olá {user?.full_name || 'usuário'}! Vamos configurar sua plataforma em poucos passos simples.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="glass-effect border-0 premium-shadow h-full hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-purple-50">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Card className="glass-effect border-0 premium-shadow inline-block">
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Pronto para começar?
            </h3>
            <p className="text-gray-600 mb-6">
              Vamos personalizar sua plataforma para que ela tenha a cara do seu salão!
            </p>
            <Button
              onClick={onNext}
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-8"
            >
              Começar Configuração
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}