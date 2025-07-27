import React, { useState } from "react";
import { Servico } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const categorias = [
  { value: "cabelo", label: "Cabelo", color: "bg-purple-100 text-purple-800" },
  { value: "manicure", label: "Manicure", color: "bg-pink-100 text-pink-800" },
  { value: "pedicure", label: "Pedicure", color: "bg-blue-100 text-blue-800" },
  { value: "sobrancelha", label: "Sobrancelha", color: "bg-green-100 text-green-800" },
  { value: "depilacao", label: "Depilação", color: "bg-orange-100 text-orange-800" },
  { value: "estetica", label: "Estética", color: "bg-indigo-100 text-indigo-800" },
  { value: "massagem", label: "Massagem", color: "bg-teal-100 text-teal-800" },
  { value: "outros", label: "Outros", color: "bg-gray-100 text-gray-800" }
];

export default function ConfigServicos({ servicos, onReload }) {
  const [showModal, setShowModal] = useState(false);
  const [editingServico, setEditingServico] = useState(null);
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    duracao_minutos: 60,
    valor: 0,
    descricao: "",
    ativo: true
  });

  const resetForm = () => {
    setFormData({
      nome: "",
      categoria: "",
      duracao_minutos: 60,
      valor: 0,
      descricao: "",
      ativo: true
    });
    setEditingServico(null);
  };

  const handleNew = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (servico) => {
    setFormData({
      nome: servico.nome,
      categoria: servico.categoria,
      duracao_minutos: servico.duracao_minutos,
      valor: servico.valor,
      descricao: servico.descricao || "",
      ativo: servico.ativo !== false
    });
    setEditingServico(servico);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      if (editingServico) {
        await Servico.update(editingServico.id, formData);
      } else {
        await Servico.create(formData);
      }
      
      setShowModal(false);
      resetForm();
      onReload();
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
    }
  };

  const handleDelete = async (servico) => {
    if (window.confirm(`Tem certeza que deseja excluir "${servico.nome}"?`)) {
      try {
        await Servico.delete(servico.id);
        onReload();
      } catch (error) {
        console.error("Erro ao excluir serviço:", error);
      }
    }
  };

  const getCategoriaInfo = (categoria) => {
    return categorias.find(c => c.value === categoria) || categorias[categorias.length - 1];
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
                  <Plus className="w-4 h-4 text-white" />
                </div>
                Gerenciar Serviços
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Configure os serviços oferecidos pelo seu salão
              </p>
            </div>
            <Button 
              onClick={handleNew}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de serviços */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicos.map((servico, index) => {
          const categoriaInfo = getCategoriaInfo(servico.categoria);
          
          return (
            <motion.div
              key={servico.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect border-0 premium-shadow h-full hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{servico.nome}</CardTitle>
                      <Badge className={`${categoriaInfo.color} text-xs`}>
                        {categoriaInfo.label}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(servico)}
                        className="h-8 w-8 text-gray-500 hover:text-purple-600"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(servico)}
                        className="h-8 w-8 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {servico.descricao && (
                      <p className="text-sm text-gray-600">
                        {servico.descricao}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3 h-3" />
                        <span>{servico.duracao_minutos} min</span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-green-600">
                        <DollarSign className="w-3 h-3" />
                        <span>R$ {servico.valor?.toFixed(2)}</span>
                      </div>
                    </div>

                    {servico.ativo === false && (
                      <Badge variant="secondary" className="text-xs">
                        Inativo
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {servicos.length === 0 && (
        <Card className="glass-effect border-0 premium-shadow">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum serviço cadastrado
            </h3>
            <p className="text-gray-600 mb-4">
              Comece adicionando os serviços que seu salão oferece
            </p>
            <Button 
              onClick={handleNew}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar primeiro serviço
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de cadastro/edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingServico ? "Editar Serviço" : "Novo Serviço"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Serviço</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Corte Feminino"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select 
                value={formData.categoria} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(categoria => (
                    <SelectItem key={categoria.value} value={categoria.value}>
                      {categoria.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (min)</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData(prev => ({ ...prev, duracao_minutos: Number(e.target.value) }))}
                  min="15"
                  step="15"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$)</Label>
                <Input
                  id="valor"
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: Number(e.target.value) }))}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição detalhada do serviço..."
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
                {editingServico ? "Atualizar" : "Cadastrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}