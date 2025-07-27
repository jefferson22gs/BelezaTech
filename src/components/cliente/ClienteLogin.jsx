import React, { useState } from "react";
import { Cliente } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Phone, Mail, User, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function ClienteLogin({ onLogin, configuracao }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Login - buscar cliente existente por telefone
        const clientes = await Cliente.filter({ 
          telefone: formData.telefone 
        });
        
        if (clientes.length > 0) {
          onLogin(clientes[0]);
        } else {
          setError("Cliente não encontrado. Cadastre-se primeiro.");
        }
      } else {
        // Cadastro - verificar se já existe e criar se necessário
        const clientesExistentes = await Cliente.filter({ 
          telefone: formData.telefone 
        });
        
        if (clientesExistentes.length > 0) {
          setError("Este telefone já está cadastrado. Faça login.");
          return;
        }

        const novoCliente = await Cliente.create({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email,
          status: "ativo",
          pontos_fidelidade: 0,
          valor_total_gasto: 0
        });
        
        onLogin(novoCliente);
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      setError("Erro ao processar solicitação. Tente novamente.");
    }
    
    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({ nome: "", telefone: "", email: "" });
    setError("");
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="glass-effect rounded-xl p-6 premium-shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo(a)!
          </h2>
          <p className="text-gray-600">
            Agende seus serviços de forma rápida e prática
          </p>
          <div className="flex items-center justify-center gap-1 mt-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-purple-600 font-medium">
              Powered by BelezaTech Infinite
            </span>
          </div>
        </div>
      </motion.div>

      {/* Login/Cadastro Form */}
      <Card className="glass-effect border-0 premium-shadow">
        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? "Entrar na minha conta" : "Criar minha conta"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      className="pl-10"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="telefone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isLogin ? "Entrando..." : "Cadastrando..."}
                </div>
              ) : (
                isLogin ? "Entrar" : "Cadastrar"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="link"
              onClick={toggleMode}
              className="text-purple-600 hover:text-purple-700"
            >
              {isLogin 
                ? "Não tem conta? Cadastre-se aqui" 
                : "Já tem conta? Entre aqui"
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "⏰", title: "Agendamento 24h", desc: "A qualquer hora" },
          { icon: "📅", title: "Histórico", desc: "Todos seus agendamentos" },
          { icon: "⭐", title: "Fidelidade", desc: "Ganhe pontos" },
          { icon: "🔔", title: "Lembretes", desc: "Nunca esqueça" }
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="glass-effect rounded-lg p-3 text-center premium-shadow"
          >
            <div className="text-lg mb-1">{feature.icon}</div>
            <h4 className="font-medium text-xs text-gray-900">{feature.title}</h4>
            <p className="text-xs text-gray-600">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}