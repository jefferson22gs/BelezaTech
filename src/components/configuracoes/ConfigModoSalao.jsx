
import React, { useState, useEffect } from "react";
import { PortfolioSalao } from "@/api/entities";
import { PromocaoSalao } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tv, 
  Upload, 
  Plus, 
  Trash2, 
  Eye, 
  QrCode, 
  Copy,
  Gift,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Printer
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { UploadFile } from "@/api/integrations";

export default function ConfigModoSalao() {
  const [portfolio, setPortfolio] = useState([]);
  const [promocoes, setPromocoes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(''); // New state for QR code URL
  
  // Estados para novo item do portfólio
  const [novoPortfolio, setNovoPortfolio] = useState({
    titulo: '',
    categoria: 'corte',
    profissional: '',
    descricao: '',
    imagem_url: ''
  });

  // Estados para nova promoção
  const [novaPromocao, setNovaPromocao] = useState({
    titulo: '',
    descricao: '',
    desconto_porcentagem: 0,
    codigo_cupom: '',
    data_inicio: '',
    data_fim: '',
    imagem_url: ''
  });

  useEffect(() => {
    loadData();
    generateQRCode(); // Call QR code generation on component mount
  }, []);

  const loadData = async () => {
    try {
      const [portfolioData, promocoesData] = await Promise.all([
        PortfolioSalao.list("-ordem"),
        PromocaoSalao.list("-created_date")
      ]);
      
      setPortfolio(portfolioData);
      setPromocoes(promocoesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  // Function to generate QR Code
  const generateQRCode = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const checkInUrl = `${currentUrl}/CheckInCliente?salao=demo`;
    
    // Using a reliable, free QR code API: goqr.me (api.qrserver.com)
    // Parameters: size, data (encoded URL), format, margin, quiet zone, colors
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}&format=png&margin=20&qzone=1&color=000000&bgcolor=ffffff`;
    
    setQrCodeUrl(qrUrl);
  };

  const handleUploadImagem = async (file, tipo = 'portfolio') => {
    if (!file) return '';

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      return file_url;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      return '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddPortfolio = async (e) => {
    e.preventDefault();
    
    if (!novoPortfolio.titulo || !novoPortfolio.imagem_url) return;

    try {
      await PortfolioSalao.create(novoPortfolio);
      setNovoPortfolio({
        titulo: '',
        categoria: 'corte',
        profissional: '',
        descricao: '',
        imagem_url: ''
      });
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar ao portfólio:", error);
    }
  };

  const handleAddPromocao = async (e) => {
    e.preventDefault();
    
    if (!novaPromocao.titulo || !novaPromocao.data_inicio || !novaPromocao.data_fim) return;

    try {
      await PromocaoSalao.create(novaPromocao);
      setNovaPromocao({
        titulo: '',
        descricao: '',
        desconto_porcentagem: 0,
        codigo_cupom: '',
        data_inicio: '',
        data_fim: '',
        imagem_url: ''
      });
      loadData();
    } catch (error) {
      console.error("Erro ao adicionar promoção:", error);
    }
  };

  const handleDeleteItem = async (id, type) => {
    if (!window.confirm(`Tem certeza que deseja excluir este ${type === 'portfolio' ? 'item do portfólio' : 'promoção'}?`)) {
      return;
    }

    try {
      if (type === 'portfolio') {
        await PortfolioSalao.delete(id);
      } else {
        await PromocaoSalao.delete(id);
      }
      loadData();
    } catch (error) {
      console.error("Erro ao excluir item:", error);
    }
  };

  const toggleAtivo = async (item, type) => {
    try {
      const newItem = { ...item, ativo: !item.ativo };
      if (type === 'portfolio') {
        await PortfolioSalao.update(item.id, newItem);
      } else {
        await PromocaoSalao.update(item.id, newItem);
      }
      loadData();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Aqui você poderia adicionar um toast de sucesso
  };

  // Function to download QR Code
  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = 'qr-code-checkin-salao.png'; // Suggested filename
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link); // Clean up
  };

  // Function to print QR Code with a custom layout
  const printQRCode = () => {
    if (!qrCodeUrl) return;

    const printWindow = window.open('', '_blank');
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const checkInUrl = `${currentUrl}/CheckInCliente?salao=demo`;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code Check-in - Salão</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body { 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
            text-align: center; 
            padding: 20px;
            margin: 0;
            color: #333;
            -webkit-print-color-adjust: exact; /* For better color printing */
          }
          .container { 
            max-width: 450px; 
            margin: 0 auto; 
            border: 2px solid #ddd;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            background-color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .qr-code-wrapper { 
            margin: 20px 0; 
            padding: 10px;
            border: 1px solid #eee;
            border-radius: 5px;
            background-color: #f9f9f9;
          }
          .qr-code { 
            width: 250px; 
            height: 250px;
            display: block;
            margin: 0 auto;
          }
          .title { 
            font-size: 28px; 
            font-weight: bold; 
            margin-bottom: 5px;
            color: #5b21b6; /* Purple color */
          }
          .subtitle { 
            font-size: 18px; 
            color: #666; 
            margin-bottom: 20px;
          }
          .instructions {
            font-size: 15px;
            color: #555;
            margin-top: 20px;
            line-height: 1.6;
            text-align: left;
            width: 100%;
            max-width: 300px;
          }
          .instructions ol {
            padding-left: 20px;
            margin-top: 10px;
          }
          .instructions li {
            margin-bottom: 8px;
          }
          .url-display {
            font-size: 12px;
            color: #999;
            margin-top: 25px;
            word-break: break-all;
            background-color: #f0f0f0;
            padding: 8px 12px;
            border-radius: 5px;
            width: 100%;
            max-width: 350px;
          }
          /* Print-specific adjustments */
          @media print {
            body { 
              padding: 0; 
            }
            .container { 
              border: 2px dashed #000; 
              box-shadow: none; 
              page-break-after: always; /* Ensure a clean page break if multiple QRs were printed */
            }
            .qr-code-wrapper, .url-display {
              background-color: transparent;
              border: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">Check-in Rápido</div>
          <div class="subtitle">Escaneie o QR Code para confirmar sua chegada!</div>
          <div class="qr-code-wrapper">
            <img class="qr-code" src="${qrCodeUrl}" alt="QR Code Check-in" />
          </div>
          <div class="instructions">
            <p><strong>Siga os passos simples:</strong></p>
            <ol>
              <li>Abra o aplicativo da câmera no seu celular ou um leitor de QR Code.</li>
              <li>Aponte a câmera para este código.</li>
              <li>Clique no link que aparecer na tela para abrir a página de check-in.</li>
              <li>Confirme seus dados e pronto! Você já estará em nossa lista de espera/atendimento.</li>
            </ol>
          </div>
          <div class="url-display">
            Link Direto: ${checkInUrl}
          </div>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  // Updated URL for the interactive channel
  const canalInterativoUrl = `${currentUrl}/CanalInterativo?salao=demo`;
  const checkInUrl = `${currentUrl}/CheckInCliente?salao=demo`;

  return (
    <div className="space-y-6">
      {/* URLs e QR Codes */}
      <Card className="glass-effect border-0 premium-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-purple-500" />
            Canal Interativo do Salão
          </CardTitle>
          <p className="text-sm text-gray-600">
            Links para acessar o canal interativo e sistema de check-in
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Canal Interativo (Smart TV)</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                value={canalInterativoUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(canalInterativoUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(canalInterativoUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Acesse este link na Smart TV para exibir o canal interativo
            </p>
          </div>

          <div>
            <Label className="text-sm font-medium">Check-in do Cliente</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input 
                value={checkInUrl}
                readOnly
                className="flex-1"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(checkInUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => window.open(checkInUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* QR Code para Check-in - Updated Section */}
          <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
            <div className="flex-shrink-0 flex justify-center items-center">
              <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center shadow-lg border-2 border-gray-200">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code Check-in" 
                    className="w-full h-full object-contain rounded-lg p-2"
                  />
                ) : (
                  <QrCode className="w-24 h-24 text-gray-400 animate-pulse" />
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-lg text-blue-900 mb-2">
                QR Code para Check-in
              </h4>
              <p className="text-sm text-blue-700 mb-4">
                Este QR code aparece automaticamente no Canal Interativo da TV e permite que os clientes façam check-in quando chegarem ao salão.
              </p>
              
              <div className="space-y-3">
                <div className="text-sm text-blue-600">
                  <strong>Como funciona:</strong>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>O QR code é exibido automaticamente na TV do salão</li>
                    <li>Cliente escaneia com a câmera do celular</li>
                    <li>É direcionado para confirmar sua chegada</li>
                    <li>O status é atualizado na sua agenda automaticamente</li>
                  </ol>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    onClick={printQRCode}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir QR Code
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={downloadQRCode}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Baixar PNG
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.open(checkInUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Testar Link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciamento de Conteúdo */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
          <TabsTrigger value="promocoes">Promoções</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulário para adicionar ao portfólio */}
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="w-5 h-5 text-purple-500" />
                  Adicionar ao Portfólio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPortfolio} className="space-y-4">
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={novoPortfolio.titulo}
                      onChange={(e) => setNovoPortfolio({...novoPortfolio, titulo: e.target.value})}
                      placeholder="Ex: Corte Bob Moderno"
                      required
                    />
                  </div>

                  <div>
                    <Label>Categoria</Label>
                    <Select 
                      value={novoPortfolio.categoria} 
                      onValueChange={(value) => setNovoPortfolio({...novoPortfolio, categoria: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="corte">Corte</SelectItem>
                        <SelectItem value="coloracao">Coloração</SelectItem>
                        <SelectItem value="penteado">Penteado</SelectItem>
                        <SelectItem value="sobrancelha">Sobrancelha</SelectItem>
                        <SelectItem value="manicure">Manicure</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Profissional</Label>
                    <Input
                      value={novoPortfolio.profissional}
                      onChange={(e) => setNovoPortfolio({...novoPortfolio, profissional: e.target.value})}
                      placeholder="Nome do profissional"
                    />
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={novoPortfolio.descricao}
                      onChange={(e) => setNovoPortfolio({...novoPortfolio, descricao: e.target.value})}
                      placeholder="Descreva o trabalho realizado..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Imagem</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = await handleUploadImagem(file);
                            setNovoPortfolio({...novoPortfolio, imagem_url: url});
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                      {isUploading && (
                        <p className="text-sm text-gray-500 mt-1">Fazendo upload...</p>
                      )}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!novoPortfolio.titulo || !novoPortfolio.imagem_url || isUploading}
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Adicionar ao Portfólio
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista do portfólio */}
            <div className="lg:col-span-2">
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle>Itens do Portfólio</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-2 gap-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="animate-pulse">
                          <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : portfolio.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum item no portfólio ainda</p>
                      <p className="text-sm">Adicione fotos dos seus trabalhos</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {portfolio.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={item.imagem_url}
                              alt={item.titulo}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => toggleAtivo(item, 'portfolio')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDeleteItem(item.id, 'portfolio')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm truncate">{item.titulo}</h4>
                              <Badge variant={item.ativo ? "default" : "secondary"} className="text-xs">
                                {item.ativo ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500">{item.categoria}</p>
                            {item.profissional && (
                              <p className="text-xs text-purple-600">{item.profissional}</p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="promocoes" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Formulário para adicionar promoção */}
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="w-5 h-5 text-purple-500" />
                  Nova Promoção
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPromocao} className="space-y-4">
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={novaPromocao.titulo}
                      onChange={(e) => setNovaPromocao({...novaPromocao, titulo: e.target.value})}
                      placeholder="Ex: Mega Promoção de Natal"
                      required
                    />
                  </div>

                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={novaPromocao.descricao}
                      onChange={(e) => setNovaPromocao({...novaPromocao, descricao: e.target.value})}
                      placeholder="Detalhes da promoção..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Desconto (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={novaPromocao.desconto_porcentagem}
                      onChange={(e) => setNovaPromocao({...novaPromocao, desconto_porcentagem: parseInt(e.target.value) || 0})}
                    />
                  </div>

                  <div>
                    <Label>Código do Cupom (opcional)</Label>
                    <Input
                      value={novaPromocao.codigo_cupom}
                      onChange={(e) => setNovaPromocao({...novaPromocao, codigo_cupom: e.target.value})}
                      placeholder="Ex: NATAL2024"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Data Início</Label>
                      <Input
                        type="date"
                        value={novaPromocao.data_inicio}
                        onChange={(e) => setNovaPromocao({...novaPromocao, data_inicio: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label>Data Fim</Label>
                      <Input
                        type="date"
                        value={novaPromocao.data_fim}
                        onChange={(e) => setNovaPromocao({...novaPromocao, data_fim: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Imagem (opcional)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = await handleUploadImagem(file);
                            setNovaPromocao({...novaPromocao, imagem_url: url});
                          }
                        }}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={!novaPromocao.titulo || !novaPromocao.data_inicio || !novaPromocao.data_fim || isUploading}
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Criar Promoção
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de promoções */}
            <div className="lg:col-span-2">
              <Card className="glass-effect border-0 premium-shadow">
                <CardHeader>
                  <CardTitle>Promoções</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="animate-pulse p-4 border rounded-lg">
                          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                        </div>
                      ))}
                    </div>
                  ) : promocoes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma promoção cadastrada</p>
                      <p className="text-sm">Crie promoções para atrair mais clientes</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {promocoes.map((promocao) => (
                        <motion.div
                          key={promocao.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{promocao.titulo}</h4>
                                <Badge variant={promocao.ativo ? "default" : "secondary"}>
                                  {promocao.ativo ? "Ativa" : "Inativa"}
                                </Badge>
                                {promocao.desconto_porcentagem > 0 && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {promocao.desconto_porcentagem}% OFF
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{promocao.descricao}</p>
                              <div className="text-xs text-gray-500">
                                {promocao.data_inicio && format(new Date(promocao.data_inicio), 'dd/MM/yyyy')} - {promocao.data_fim && format(new Date(promocao.data_fim), 'dd/MM/yyyy')}
                                {promocao.codigo_cupom && (
                                  <span className="ml-4 bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                    Cupom: {promocao.codigo_cupom}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => toggleAtivo(promocao, 'promocao')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => handleDeleteItem(promocao.id, 'promocao')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
