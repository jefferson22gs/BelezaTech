import React, { useState, useEffect } from 'react';
import { ProdutoMarketplace } from '@/api/entities';
import { ItemEstoque } from '@/api/entities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, ShoppingBag, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const categorias = [
    { label: "Todos", value: "todos" },
    { label: "Shampoos", value: "shampoo" },
    { label: "Condicionadores", value: "condicionador" },
    { label: "Máscaras", value: "mascara" },
    { label: "Coloração", value: "coloracao" },
    { label: "Esmaltes", value: "esmalte" },
];

export default function Marketplace() {
    const [produtos, setProdutos] = useState([]);
    const [sugestoes, setSugestoes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categoriaAtiva, setCategoriaAtiva] = useState('todos');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [produtosData, estoqueBaixoData] = await Promise.all([
                ProdutoMarketplace.list(),
                ItemEstoque.filter({ quantidade: { $lte: '$limite_baixo_estoque' } })
            ]);
            setProdutos(produtosData);
            
            // Simula sugestões inteligentes
            const sugestoesFinais = produtosData.filter(p => 
                estoqueBaixoData.some(e => e.nome_produto.toLowerCase().includes(p.nome.toLowerCase()))
            ).slice(0, 4);
            setSugestoes(sugestoesFinais);

        } catch (error) {
            console.error("Erro ao carregar dados do marketplace:", error);
        }
        setIsLoading(false);
    };

    const produtosFiltrados = produtos.filter(p => {
        const porCategoria = categoriaAtiva === 'todos' || p.categoria === categoriaAtiva;
        const porBusca = searchTerm === '' || p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.marca.toLowerCase().includes(searchTerm.toLowerCase());
        return porCategoria && porBusca;
    });

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Marketplace de Produtos</h1>
                    <p className="text-lg text-gray-600">
                        Os melhores produtos para o seu salão, com entrega rápida e segura.
                    </p>
                </motion.div>

                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        placeholder="Buscar por produto ou marca..."
                        className="h-12 pl-12 rounded-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {sugestoes.length > 0 && (
                     <Card className="mb-8 glass-effect border-0 premium-shadow">
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-purple-700">
                                <Zap className="w-5 h-5" />
                                Sugestões para o seu Salão
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {sugestoes.map(produto => (
                                    <div key={produto.id} className="text-center p-2 rounded-lg hover:bg-purple-50">
                                        <img src={produto.imagem_url} alt={produto.nome} className="w-20 h-20 object-contain mx-auto mb-2" />
                                        <p className="text-xs font-medium truncate">{produto.nome}</p>
                                        <Button size="sm" className="mt-2 text-xs h-7">Repor</Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-center flex-wrap gap-2 mb-8">
                    {categorias.map(cat => (
                        <Button 
                            key={cat.value} 
                            variant={categoriaAtiva === cat.value ? 'default' : 'outline'}
                            onClick={() => setCategoriaAtiva(cat.value)}
                            className={`rounded-full ${categoriaAtiva === cat.value ? 'bg-purple-600' : 'bg-white'}`}
                        >
                            {cat.label}
                        </Button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {produtosFiltrados.map((produto, index) => (
                        <motion.div
                            key={produto.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="h-full flex flex-col group overflow-hidden glass-effect border-0 premium-shadow hover:shadow-lg transition-all duration-300">
                                <CardContent className="p-4 flex-grow flex flex-col">
                                    <div className="relative mb-4">
                                        <img src={produto.imagem_url} alt={produto.nome} className="w-full h-40 object-contain rounded-t-lg" />
                                        <Badge className="absolute top-2 left-2">{produto.categoria}</Badge>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-xs text-gray-500">{produto.marca}</p>
                                        <h3 className="font-semibold text-sm mb-2">{produto.nome}</h3>
                                    </div>
                                    <div className="flex justify-between items-center mt-4">
                                        <p className="text-lg font-bold text-purple-700">R$ {produto.preco.toFixed(2)}</p>
                                        <Button size="sm" className="group-hover:bg-purple-700">
                                            <ShoppingCart className="w-4 h-4 mr-2" />
                                            Comprar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

            </div>
        </div>
    );
}