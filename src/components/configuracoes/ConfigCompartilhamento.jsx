import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SalaoConfig } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Share2, Copy, Eye, Crown, Sparkles, QrCode } from "lucide-react";
import { motion } from "framer-motion";

export default function ConfigCompartilhamento() {
  const [user, setUser] = useState(null);
  const [salao, setSalao] = useState(null);
  const [linkCompartilhamento, setLinkCompartilhamento] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadUserAndSalaoData();
  }, []);

  const loadUserAndSalaoData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const salaoConfigs = await SalaoConfig.filter({ created_by: userData.email });
      if (salaoConfigs.length > 0) {
        const salaoConfig = salaoConfigs[0];
        setSalao(salaoConfig);
        
        // Gerar link de compartilhamento
        const baseUrl = "https://preview--beleza-tech-infinite-74a5ff02.base44.app";
        const linkPublico = `${baseUrl}/agendamento/${salaoConfig.id}`;
        setLinkCompartilhamento(linkPublico);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(linkCompartilhamento);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  };

  const abrirPreview = () => {
    window.open(linkCompartilhamento, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-effect border-0 premium-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-500" />
              Compartilhamento de Agendamento
            </CardTitle>
            <p className="text-sm text-gray-600">
              Permita que seus clientes agendem diretamente online através de um link personalizado.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {salao ? (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <Crown className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Seu sistema de agendamento online está ativo!</strong> 
                    <br />Os clientes podem agendar através do link abaixo.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div>
                    <Label>Link de Agendamento Online</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        value={linkCompartilhamento}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={copyToClipboard}
                        className="px-3"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={abrirPreview}
                        className="px-3"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    {copied && (
                      <p className="text-sm text-green-600 mt-1">✅ Link copiado!</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">💬 WhatsApp</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Compartilhe facilmente com seus clientes
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const message = `Olá! Agende seu horário no ${salao.nome_salao} através do nosso sistema online: ${linkCompartilhamento}`;
                          const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                      >
                        Compartilhar no WhatsApp
                      </Button>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">📱 Redes Sociais</h4>
                      <p className="text-sm text-gray-600 mb-3">
                        Divulgue nas suas redes sociais
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const message = `🌟 Agende seu horário online no ${salao.nome_salao}! Link na bio: ${linkCompartilhamento}`;
                          copyToClipboard();
                          alert("Texto copiado! Cole no seu post.");
                        }}
                      >
                        Copiar Texto para Post
                      </Button>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview da Página do Cliente
                    </h4>
                    <div className="bg-white rounded-lg shadow-sm p-4 border">
                      <div className="text-center mb-4">
                        {salao.logo_url && (
                          <img
                            src={salao.logo_url}
                            alt={salao.nome_salao}
                            className="max-h-12 mx-auto object-contain mb-2"
                          />
                        )}
                        <h3 
                          className="text-xl font-bold"
                          style={{ color: salao.cores_tema?.primaria }}
                        >
                          {salao.nome_salao}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Agende seu horário online
                        </p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-gray-50 rounded">
                          👤 Dados pessoais
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          ✨ Escolha do serviço
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          📅 Data e horário
                        </div>
                        <div className="p-2 bg-gray-50 rounded text-center text-white font-medium"
                             style={{ backgroundColor: salao.cores_tema?.primaria }}>
                          ✅ Confirmar Agendamento
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  Complete primeiro a configuração do seu salão para ativar o compartilhamento.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}