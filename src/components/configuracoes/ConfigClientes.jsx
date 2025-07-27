import React, { useState } from "react";
import { Cliente } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Phone, Mail, Star, User } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const statusColors = {
  ativo: "bg-green-100 text-green-800",
  inativo: "bg-gray-100 text-gray-800", 
  vip: "bg-yellow-100 text-yellow-800"
};

const statusLabels = {
  ativo: "Ativo",
  inativo: "Inativo",
  vip: "VIP"
};

export default function ConfigClientes({ clientes, onReload }) {
  const [showModal, setShowModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    data_nascimento: "",
    preferencias: "",
    status: "ativo"
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      data_nascimento: "",
      preferencias: "",
      status: "ativo"
    });
    setEditingCliente(null);
  };

  const handleNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (cliente) => {
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
      email: cliente.email || "",
      data_nascimento: cliente.data_nascimento || "",
      preferencias: cliente.preferencias || "",
      status: cliente.status || "ativo"
    });
    setEditingCliente(cliente);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCliente) {
        await Cliente.update(editingCliente.id, formData);
      } else {
        await Cliente.create(formData);
      }
      
      setShowModal(false);
      resetForm();
      onReload();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    }
  };

  const handleDelete = async (cliente) => {
    if (window.confirm(`Tem certeza que deseja excluir "${cliente.nome}"?`)) {
      try {
        await Cliente.delete(cliente.id);
        onReload();
      } catch (error) {
        console.error("Erro ao excluir cliente:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-effect border-0 premium-shadow">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                Gerenciar Clientes
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Cadastre e gerencie a base de clientes do seu salão
              </p>
            </div>
            <Button 
              onClick={handleNew}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de clientes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clientes.map((cliente, index) => (
          <motion.div
            key={cliente.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-effect border-0 premium-shadow h-full hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold">
                      {cliente.nome?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {cliente.nome}
                      </h3>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(cliente)}
                          className="h-7 w-7 text-gray-500 hover:text-purple-600"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(cliente)}
                          className="h-7 w-7 text-gray-500 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <Badge className={`${statusColors[cliente.status || 'ativo']} text-xs`}>
                      {cliente.status === 'vip' && <Star className="w-2 h-2 mr-1" />}
                      {statusLabels[cliente.status || 'ativo']}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {cliente.telefone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3 h-3" />
                    <span>{cliente.telefone}</span>
                  </div>
                )}
                
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}

                {cliente.preferencias && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    {cliente.preferencias.length > 60 
                      ? cliente.preferencias.substring(0, 60) + "..."
                      : cliente.preferencias
                    }
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>
                    {cliente.pontos_fidelidade || 0} pontos
                  </span>
                  <span>
                    R$ {(cliente.valor_total_gasto || 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {clientes.length === 0 && (
        <Card className="glass-effect border-0 premium-shadow">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum cliente cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando seus primeiros clientes
            </p>
            <Button 
              onClick={handleNew}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar primeiro cliente
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de cadastro/edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCliente ? "Editar Cliente" : "Novo Cliente"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do cliente"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="cliente@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData(prev => ({ ...prev, data_nascimento: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferencias">Preferências e Observações</Label>
              <Textarea
                id="preferencias"
                value={formData.preferencias}
                onChange={(e) => setFormData(prev => ({ ...prev, preferencias: e.target.value }))}
                placeholder="Anotações sobre preferências do cliente..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              >
                {editingCliente ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}