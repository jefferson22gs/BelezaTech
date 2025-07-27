import React, { useState, useEffect } from 'react';
import { Cliente } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Badge as BadgeIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ClienteFormModal({ isOpen, onClose, onSave, cliente }) {
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    tags: [],
    status: 'ativo'
  });
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (cliente) {
      setFormData({
        nome: cliente.nome || '',
        telefone: cliente.telefone || '',
        email: cliente.email || '',
        data_nascimento: cliente.data_nascimento || '',
        tags: cliente.tags || [],
        status: cliente.status || 'ativo'
      });
    } else {
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        data_nascimento: '',
        tags: [],
        status: 'ativo'
      });
    }
  }, [cliente, isOpen]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d*)/, '($1) $2');
    }
    setFormData(prev => ({ ...prev, telefone: value }));
  }

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nome.trim()) newErrors.nome = "Nome é obrigatório.";
    if (!formData.telefone.trim()) newErrors.telefone = "Telefone é obrigatório.";
    else if (formData.telefone.replace(/\D/g, '').length < 10) newErrors.telefone = "Telefone inválido.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      if (cliente) {
        await Cliente.update(cliente.id, formData);
      } else {
        await Cliente.create(formData);
      }
      onSave();
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo</Label>
            <Input id="nome" value={formData.nome} onChange={handleInputChange} />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" value={formData.telefone} onChange={handlePhoneChange} placeholder="(00) 00000-0000" />
            {errors.telefone && <p className="text-xs text-red-500">{errors.telefone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input id="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (etiquetas)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)}><X className="w-3 h-3" /></button>
                    </Badge>
                ))}
            </div>
            <Input 
                id="tags" 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Digite uma tag e aperte Enter"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar Cliente'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}