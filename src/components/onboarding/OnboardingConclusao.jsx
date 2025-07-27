import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Sparkles, Crown, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  "✨ Identidade visual personalizada aplicada",
  "🎨 Tema de cores configurado", 
  "🏪 Informações do salão salvas",
  "🚀 Plataforma pronta para uso"
];

export default function OnboardingConclusao({ data, onPrev, onFinish, isLoading }) {
  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Perfeito! Sua plataforma está pronta! 🎉
        </h2>
        
        <p className="text-lg text-gray-600 mb-8">
          Configuramos tudo com a identidade visual do <strong>{data.nome_salao}</strong>.
          Agora você pode começar a usar o BelezaTech Infinite!
        </p>
      </motion.div>

      {/* Preview final */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <Card className="glass-effect border-0 premium-shadow">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Resumo da Configuração
                </h3>
                
                <div className="space-y-3 mb-6">
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-purple-900">
                      {data.nome_salao}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700">
                    Sua plataforma personalizada está configurada e pronta para revolucionar a gestão do seu salão!
                  </p>
                </div>
              </div>

              <div className="text-center">
                {data.logo_url && (
                  <div className="mb-6">
                    <div 
                      className="inline-block p-6 rounded-xl shadow-lg"
                      style={{ backgroundColor: data.cores_tema.fundo }}
                    >
                      <img
                        src={data.logo_url}
                        alt={`Logo ${data.nome_salao}`}
                        className="max-w-32 max-h-32 mx-auto object-contain"
                      />
                    </div>
                  </div>
                )}
                
                {/* Mini preview da interface */}
                <div 
                  className="rounded-lg overflow-hidden shadow-lg max-w-xs mx-auto"
                  style={{ backgroundColor: data.cores_tema.fundo }}
                >
                  <div 
                    className="p-3 flex items-center gap-2"
                    style={{ backgroundColor: data.cores_tema.primaria }}
                  >
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: data.cores_tema.acento }}
                    >
                      <Crown className="w-3 h-3 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">BelezaTech</div>
                      <div className="flex items-center gap-1">
                        <span className="text-white/80 text-xs">Infinite</span>
                        <Sparkles className="w-2 h-2 text-white/80" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.cores_tema.primaria }} />
                      <div className="flex-1 h-2 rounded" style={{ backgroundColor: data.cores_tema.primaria + '20' }} />
                    </div>
                    <div className="flex gap-1">
                      <div 
                        className="px-2 py-1 rounded text-xs text-white font-medium"
                        style={{ backgroundColor: data.cores_tema.secundaria }}
                      >
                        Dashboard
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1.5 rounded" style={{ backgroundColor: data.cores_tema.primaria + '15' }} />
                      <div className="h-1.5 w-2/3 rounded" style={{ backgroundColor: data.cores_tema.secundaria + '15' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Call to action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-8 text-white mb-8">
          <h3 className="text-2xl font-bold mb-4">
            Pronto para começar a transformar seu salão? 
          </h3>
          <p className="text-purple-100 mb-6">
            Sua plataforma BelezaTech Infinite está configurada e pronta. 
            Agora você pode adicionar seus serviços, cadastrar clientes e começar a agendar!
          </p>
          
          <Button
            onClick={onFinish}
            disabled={isLoading}
            size="lg"
            className="bg-white text-purple-600 hover:bg-gray-50 font-semibold px-8"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                Finalizando...
              </div>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                Começar a usar agora!
              </>
            )}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para revisar
        </Button>
      </motion.div>
    </div>
  );
}