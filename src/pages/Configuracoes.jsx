
import React, { useState, useEffect } from "react";
import { Servico } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { SalaoConfig } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Scissors, Users, Palette, Tv, Share2 } from "lucide-react"; // Added Share2
import { motion } from "framer-motion";

import ConfigServicos from "../components/configuracoes/ConfigServicos";
import ConfigClientes from "../components/configuracoes/ConfigClientes";
import ConfigTema from "../components/configuracoes/ConfigTema";
import ConfigModoSalao from "../components/configuracoes/ConfigModoSalao";
import ConfigCompartilhamento from "../components/configuracoes/ConfigCompartilhamento"; // Added new import

export default function Configuracoes() {
  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [configuracao, setConfiguracao] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicosData, clientesData, userData] = await Promise.all([
        Servico.list(),
        Cliente.list(),
        User.me()
      ]);
      
      setServicos(servicosData);
      setClientes(clientesData);
      setUser(userData);

      // Carregar configuração do salão
      const configs = await SalaoConfig.filter({ created_by: userData.email });
      if (configs.length > 0) {
        setConfiguracao(configs[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const reloadServicos = async () => {
    const servicosData = await Servico.list();
    setServicos(servicosData);
  };

  const reloadClientes = async () => {
    const clientesData = await Cliente.list();
    setClientes(clientesData);
  };

  const updateConfiguracao = async (novaConfig) => {
    try {
      if (configuracao) {
        await SalaoConfig.update(configuracao.id, novaConfig);
        setConfiguracao(prev => ({ ...prev, ...novaConfig }));
      }
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">
            Gerencie os serviços, clientes e personalização do seu salão
          </p>
        </motion.div>

        <Tabs defaultValue="servicos" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto"> {/* Changed grid-cols-4 to grid-cols-5 and lg:w-96 to lg:w-auto */}
            <TabsTrigger value="servicos" className="flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              <span className="hidden sm:inline">Serviços</span>
            </TabsTrigger>
            <TabsTrigger value="clientes" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clientes</span>
            </TabsTrigger>
            <TabsTrigger value="tema" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Tema</span>
            </TabsTrigger>
            <TabsTrigger value="compartilhamento" className="flex items-center gap-2"> {/* Added new tab trigger */}
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </TabsTrigger>
            <TabsTrigger value="modo-salao" className="flex items-center gap-2">
              <Tv className="w-4 h-4" />
              <span className="hidden sm:inline">Modo Salão</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="servicos" className="space-y-6">
            <ConfigServicos 
              servicos={servicos}
              onReload={reloadServicos}
            />
          </TabsContent>

          <TabsContent value="clientes" className="space-y-6">
            <ConfigClientes 
              clientes={clientes}
              onReload={reloadClientes}
            />
          </TabsContent>

          <TabsContent value="tema" className="space-y-6">
            <ConfigTema 
              configuracao={configuracao}
              onUpdate={updateConfiguracao}
            />
          </TabsContent>

          <TabsContent value="compartilhamento" className="space-y-6"> {/* Added new tab content */}
            <ConfigCompartilhamento />
          </TabsContent>

          <TabsContent value="modo-salao" className="space-y-6">
            <ConfigModoSalao />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
