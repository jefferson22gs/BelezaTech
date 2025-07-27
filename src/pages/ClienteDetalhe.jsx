import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Cliente } from '@/api/entities';
import { Agendamento } from '@/api/entities';
import { GaleriaCliente } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Edit, FileText, GalleryHorizontal, Phone, Mail, UserPlus, Upload, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

export default function ClienteDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);
  const [agendamentos, setAgendamentos] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [anotacoes, setAnotacoes] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const clienteData = await Cliente.get(id);
      setCliente(clienteData);
      setAnotacoes(clienteData.anotacoes_tecnicas || '');
      
      const agendamentosData = await Agendamento.filter({ cliente_id: id }, "-data_hora");
      setAgendamentos(agendamentosData);

      const galeriaData = await GaleriaCliente.filter({ cliente_id: id }, "-created_date");
      setGaleria(galeriaData);

    } catch (error) {
      console.error("Erro ao carregar dados do cliente:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleSaveAnotacoes = async () => {
    await Cliente.update(id, { anotacoes_tecnicas: anotacoes });
    alert("Anotações salvas com sucesso!");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const { file_url } = await UploadFile({ file });
      await GaleriaCliente.create({
        cliente_id: id,
        imagem_url: file_url,
        descricao: 'Nova imagem'
      });
      loadData(); // Recarregar galeria
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
    }
  };
  
  const handleDeleteImage = async (imageId) => {
    if(window.confirm("Tem certeza que deseja apagar esta imagem?")) {
        await GaleriaCliente.delete(imageId);
        loadData();
    }
  };

  if (isLoading) return <div className="p-6">Carregando perfil do cliente...</div>;
  if (!cliente) return <div className="p-6">Cliente não encontrado.</div>;

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header do Perfil */}
        <Card className="mb-8">
          <CardContent className="p-6 flex flex-col md:flex-row items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={cliente.foto_perfil} />
              <AvatarFallback className="text-3xl bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold">
                {cliente.nome?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{cliente.nome}</h1>
              <div className="text-gray-600 flex flex-col sm:flex-row sm:gap-6 mt-2">
                <span className="flex items-center gap-2"><Phone className="w-4 h-4"/>{cliente.telefone}</span>
                <span className="flex items-center gap-2"><Mail className="w-4 h-4"/>{cliente.email || 'N/A'}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {cliente.tags?.map(tag => <Badge key={tag}>{tag}</Badge>)}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
              <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Editar Perfil</Button>
            </div>
          </CardContent>
        </Card>

        {/* Abas */}
        <Tabs defaultValue="historico">
          <TabsList>
            <TabsTrigger value="historico"><Calendar className="w-4 h-4 mr-2"/>Histórico de Agendamentos</TabsTrigger>
            <TabsTrigger value="anotacoes"><FileText className="w-4 h-4 mr-2"/>Anotações Técnicas</TabsTrigger>
            <TabsTrigger value="galeria"><GalleryHorizontal className="w-4 h-4 mr-2"/>Galeria do Cliente</TabsTrigger>
          </TabsList>
          
          <TabsContent value="historico">
            <Card>
              <CardHeader><CardTitle>Histórico de Agendamentos</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agendamentos.map(ag => (
                    <div key={ag.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{ag.servico}</p>
                        <p className="text-sm text-gray-500">{format(new Date(ag.data_hora), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} com {ag.profissional}</p>
                      </div>
                      <div className="text-right">
                         <p className="font-semibold text-green-600">R$ {ag.valor?.toFixed(2)}</p>
                         <Badge>{ag.status}</Badge>
                      </div>
                    </div>
                  ))}
                  {agendamentos.length === 0 && <p>Nenhum agendamento encontrado.</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anotacoes">
            <Card>
              <CardHeader><CardTitle>Anotações Técnicas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Textarea 
                    placeholder="Digite aqui fórmulas, alergias, preferências e outras informações importantes sobre o cliente."
                    rows={10}
                    value={anotacoes}
                    onChange={(e) => setAnotacoes(e.target.value)}
                />
                <Button onClick={handleSaveAnotacoes}>Salvar Anotações</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="galeria">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle>Galeria do Cliente</CardTitle>
                <Button asChild>
                    <label htmlFor="upload-galeria">
                        <Upload className="w-4 h-4 mr-2" /> Fazer Upload
                        <input type="file" id="upload-galeria" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galeria.map(img => (
                    <div key={img.id} className="relative group">
                        <img src={img.imagem_url} alt={img.descricao} className="rounded-lg w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Button variant="destructive" size="icon" onClick={() => handleDeleteImage(img.id)}>
                                <Trash2 className="w-4 h-4"/>
                            </Button>
                        </div>
                    </div>
                  ))}
                </div>
                {galeria.length === 0 && <p>Nenhuma imagem na galeria.</p>}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}