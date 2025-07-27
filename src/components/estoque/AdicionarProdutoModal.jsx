import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Camera, Sparkles, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ItemEstoque } from '@/api/entities';
import { productScan } from '@/api/functions';

export default function AdicionarProdutoModal({ isOpen, onClose, onSave }) {
  const [step, setStep] = useState(1); // 1: Método, 2: Formulário
  const [formData, setFormData] = useState({
    nome_produto: '',
    marca: '',
    categoria: '',
    codigo_barras: '',
    imagem_url: '',
    descricao: '',
    quantidade: '',
    unidade_medida: 'ml',
    limite_baixo_estoque: 5,
    preco_custo: '',
    preco_venda: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  const handleSearchProduct = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await productScan({ 
        action: 'search_product', 
        query: searchQuery 
      });
      
      if (response.status === 200) {
        setSearchResults(response.data.produtos || []);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanBarcode = async () => {
    if (!barcodeInput.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await productScan({ 
        action: 'scan_barcode', 
        barcode: barcodeInput 
      });
      
      if (response.status === 200) {
        const produto = response.data.produto;
        setFormData(prev => ({
          ...prev,
          nome_produto: produto.nome_produto,
          marca: produto.marca,
          categoria: produto.categoria,
          imagem_url: produto.imagem_url,
          codigo_barras: barcodeInput
        }));
        setStep(2);
      }
    } catch (error) {
      console.error('Erro no escaneamento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProduct = (produto) => {
    setFormData(prev => ({
      ...prev,
      nome_produto: produto.nome_produto,
      marca: produto.marca,
      categoria: produto.categoria,
      imagem_url: produto.imagem_url
    }));
    setStep(2);
  };

  const handleGenerateDescription = async () => {
    if (!formData.nome_produto || !formData.marca) return;
    
    setIsLoading(true);
    try {
      const response = await productScan({
        action: 'generate_description',
        nome_produto: formData.nome_produto,
        marca: formData.marca
      });
      
      if (response.status === 200) {
        setFormData(prev => ({
          ...prev,
          descricao: response.data.descricao
        }));
      }
    } catch (error) {
      console.error('Erro na geração da descrição:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await ItemEstoque.create({
        ...formData,
        quantidade: Number(formData.quantidade),
        limite_baixo_estoque: Number(formData.limite_baixo_estoque),
        preco_custo: formData.preco_custo ? Number(formData.preco_custo) : undefined,
        preco_venda: formData.preco_venda ? Number(formData.preco_venda) : undefined,
        ultima_atualizacao: new Date().toISOString()
      });
      onSave();
      handleClose();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      nome_produto: '',
      marca: '',
      categoria: '',
      codigo_barras: '',
      imagem_url: '',
      descricao: '',
      quantidade: '',
      unidade_medida: 'ml',
      limite_baixo_estoque: 5,
      preco_custo: '',
      preco_venda: ''
    });
    setSearchResults([]);
    setSearchQuery('');
    setBarcodeInput('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Como deseja adicionar o produto?' : 'Detalhes do Produto'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Busca por Nome */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold">Buscar por Nome</h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite o nome do produto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchProduct()}
                  />
                  <Button 
                    onClick={handleSearchProduct}
                    disabled={isLoading}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                  </Button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
                    {searchResults.map((produto, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleSelectProduct(produto)}
                      >
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome_produto}
                          className="w-12 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium">{produto.nome_produto}</p>
                          <p className="text-sm text-gray-600">{produto.marca}</p>
                          <Badge variant="outline" className="mt-1">
                            {produto.categoria}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Escaneamento de Código de Barras */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-500" />
                  <h3 className="font-semibold">Escanear Código de Barras</h3>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite ou escaneie o código de barras..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleScanBarcode()}
                  />
                  <Button 
                    onClick={handleScanBarcode}
                    disabled={isLoading}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Escanear'}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Adicionar Manualmente */}
              <div className="space-y-4">
                <h3 className="font-semibold">Ou adicionar manualmente</h3>
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  className="w-full"
                >
                  Preencher Informações Manualmente
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Preview do Produto */}
              {formData.imagem_url && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={formData.imagem_url}
                    alt={formData.nome_produto}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium">{formData.nome_produto}</p>
                    <p className="text-sm text-gray-600">{formData.marca}</p>
                  </div>
                </div>
              )}

              {/* Formulário */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Produto</Label>
                  <Input
                    value={formData.nome_produto}
                    onChange={(e) => handleInputChange('nome_produto', e.target.value)}
                    placeholder="Ex: Shampoo Hidratante"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    value={formData.marca}
                    onChange={(e) => handleInputChange('marca', e.target.value)}
                    placeholder="Ex: Wella"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => handleInputChange('categoria', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shampoo">Shampoo</SelectItem>
                      <SelectItem value="condicionador">Condicionador</SelectItem>
                      <SelectItem value="mascara">Máscara</SelectItem>
                      <SelectItem value="finalizador">Finalizador</SelectItem>
                      <SelectItem value="coloracao">Coloração</SelectItem>
                      <SelectItem value="esmalte">Esmalte</SelectItem>
                      <SelectItem value="cera">Cera</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Código de Barras</Label>
                  <Input
                    value={formData.codigo_barras}
                    onChange={(e) => handleInputChange('codigo_barras', e.target.value)}
                    placeholder="Ex: 7891234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => handleInputChange('quantidade', e.target.value)}
                    placeholder="Ex: 500"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade de Medida</Label>
                  <Select
                    value={formData.unidade_medida}
                    onValueChange={(value) => handleInputChange('unidade_medida', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ml">ML</SelectItem>
                      <SelectItem value="g">Gramas</SelectItem>
                      <SelectItem value="unidades">Unidades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Limite Estoque Baixo</Label>
                  <Input
                    type="number"
                    value={formData.limite_baixo_estoque}
                    onChange={(e) => handleInputChange('limite_baixo_estoque', e.target.value)}
                    placeholder="Ex: 5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço de Custo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.preco_custo}
                    onChange={(e) => handleInputChange('preco_custo', e.target.value)}
                    placeholder="Ex: 25.90"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL da Imagem</Label>
                <Input
                  value={formData.imagem_url}
                  onChange={(e) => handleInputChange('imagem_url', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label>Descrição</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={isLoading || !formData.nome_produto}
                    className="ml-auto"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Gerar com IA
                  </Button>
                </div>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descrição detalhada do produto..."
                  rows={4}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          {step === 1 ? (
            <Button onClick={() => setStep(2)}>
              Continuar
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Check className="w-4 h-4 mr-2" />
              Salvar Produto
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}