import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, DollarSign, Trash2, PlusCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { format, parseISO } from 'date-fns';
import automacaoManager from "../whatsapp/AutomacaoManager";

const profissionaisDisponiveis = ["Maria Silva", "João Santos", "Ana Costa", "Pedro Oliveira"];

export default function NovoAgendamentoModal({ 
  isOpen, isEditing, agendamentoData, defaultData, onClose, onSave, onDelete, clientes, servicos 
}) {
  const [formData, setFormData] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  useEffect(() => {
    const initialData = isEditing ? agendamentoData : {
      cliente_id: '',
      cliente_nome: '',
      cliente_telefone: '',
      servico: '',
      profissional: '',
      data_hora: new Date().toISOString(),
      duracao_minutos: 0,
      valor: 0,
      observacoes: '',
      status: 'agendado',
      ...defaultData
    };
    
    setFormData(initialData);

    if (isEditing && initialData.servico && typeof initialData.servico === 'string') {
        // Verificar se servico é uma string antes de usar split
        const serviceNames = initialData.servico.split(', ');
        const initialServices = servicos?.filter(s => serviceNames.includes(s.nome)) || [];
        setSelectedServices(initialServices);
    } else {
        setSelectedServices([]);
    }

  }, [isOpen, isEditing, agendamentoData, defaultData, servicos]);

  useEffect(() => {
    const totalDuration = selectedServices.reduce((sum, s) => sum + (s.duracao_minutos || 0), 0);
    const totalValue = selectedServices.reduce((sum, s) => sum + (s.valor || 0), 0);
    const serviceNames = selectedServices.map(s => s.nome).join(', ');
    
    setFormData(prev => ({
      ...prev,
      duracao_minutos: totalDuration,
      valor: totalValue,
      servico: serviceNames
    }));
  }, [selectedServices]);

  const handleClienteChange = (clienteId) => {
    const cliente = clientes?.find(c => c.id === clienteId);
    if (cliente) {
      setFormData(prev => ({
        ...prev,
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        cliente_telefone: cliente.telefone
      }));
      setShowNewClientForm(false);
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => 
      prev.some(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await onSave(formData);
      
      // Se for um novo agendamento, enviar confirmação por WhatsApp
      if (!isEditing) {
        setTimeout(() => {
          automacaoManager.enviarConfirmacaoImediata(formData);
        }, 1000);
      }
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };

  const dataFormatada = formData.data_hora ? 
    (formData.data_hora instanceof Date ? 
      format(formData.data_hora, "yyyy-MM-dd'T'HH:mm") : 
      format(parseISO(formData.data_hora), "yyyy-MM-dd'T'HH:mm")
    ) : '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-500" />
            {isEditing ? "Editar Agendamento" : "Novo Agendamento"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Cliente */}
          <div className="space-y-2">
            <Label>Cliente</Label>
            {!showNewClientForm ? (
                <>
                <Select onValueChange={handleClienteChange} value={formData.cliente_id || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes?.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setShowNewClientForm(true)}>
                    <PlusCircle className="w-3 h-3 mr-1" />
                    Adicionar novo cliente
                </Button>
                </>
            ) : (
                <div className="p-4 border rounded-lg space-y-2 bg-gray-50">
                    <Input 
                      placeholder="Nome do novo cliente" 
                      value={formData.cliente_nome || ''} 
                      onChange={e => setFormData({...formData, cliente_nome: e.target.value})} 
                      required
                    />
                    <Input 
                      placeholder="Telefone do novo cliente" 
                      value={formData.cliente_telefone || ''} 
                      onChange={e => setFormData({...formData, cliente_telefone: e.target.value})} 
                      required
                    />
                    <Button variant="link" size="sm" className="p-0 h-auto" onClick={() => setShowNewClientForm(false)}>
                        Selecionar cliente existente
                    </Button>
                </div>
            )}
          </div>
          
          {/* Serviços */}
          <div className="space-y-2">
            <Label>Serviços</Label>
            <div className="p-3 border rounded-lg max-h-40 overflow-y-auto space-y-2">
              {servicos?.map(s => (
                <div key={s.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${s.id}`}
                    checked={selectedServices.some(sel => sel.id === s.id)}
                    onCheckedChange={() => handleServiceToggle(s)}
                  />
                  <Label htmlFor={`service-${s.id}`} className="flex justify-between w-full font-normal">
                    <span>{s.nome}</span>
                    <span className="text-gray-500 text-xs">R$ {(s.valor || 0).toFixed(2)}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Profissional */}
          <div className="space-y-2">
            <Label>Profissional</Label>
            <Select value={formData.profissional || ''} onValueChange={(v) => setFormData(p => ({ ...p, profissional: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione o profissional" /></SelectTrigger>
              <SelectContent>{profissionaisDisponiveis.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* Data e Hora */}
          <div className="space-y-2">
            <Label>Data e Hora</Label>
            <Input
              type="datetime-local"
              value={dataFormatada}
              onChange={(e) => setFormData(p => ({ ...p, data_hora: e.target.value }))}
              required
            />
          </div>

          {/* Duração e Valor */}
          <div className="p-3 rounded-lg bg-gray-50 flex justify-between items-center text-sm">
             <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span>Duração: <strong>{formData.duracao_minutos || 0} min</strong></span>
             </div>
             <div className="flex items-center gap-2 text-green-700">
                <DollarSign className="w-4 h-4" />
                <span>Valor: <strong>R$ {(formData.valor || 0).toFixed(2)}</strong></span>
             </div>
          </div>
          
          {/* Observações */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.observacoes || ''}
              onChange={(e) => setFormData(p => ({ ...p, observacoes: e.target.value }))}
              placeholder="Observações sobre o agendamento..."
              rows={2}
            />
          </div>

          <DialogFooter className="pt-4">
            {isEditing && (
              <Button type="button" variant="destructive" onClick={() => onDelete(formData.id)} className="mr-auto">
                <Trash2 className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Fechar
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"
              disabled={!formData.cliente_nome || selectedServices.length === 0 || !formData.profissional || !formData.data_hora}
            >
              {isEditing ? "Salvar Alterações" : "Agendar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}