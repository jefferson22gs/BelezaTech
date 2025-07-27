import React, { useState, useEffect } from "react";
import { ItemEstoque } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Plus, Trash2, Package, ShoppingBag } from "lucide-react";
import AdicionarProdutoModal from "../components/estoque/AdicionarProdutoModal";
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Estoque() {
    const [itens, setItens] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadItens();
    }, []);

    const loadItens = async () => {
        setIsLoading(true);
        try {
            const data = await ItemEstoque.list("-ultima_atualizacao");
            setItens(data);
        } catch (error) {
            console.error("Erro ao carregar itens do estoque:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateQuantidade = async (item, novaQuantidade) => {
        if (novaQuantidade < 0) return;
        try {
            await ItemEstoque.update(item.id, { quantidade: novaQuantidade });
            loadItens();
        } catch (error) {
            console.error("Erro ao atualizar quantidade:", error);
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm("Tem certeza que deseja remover este item do estoque?")) {
            try {
                await ItemEstoque.delete(itemId);
                loadItens();
            } catch (error) {
                console.error("Erro ao deletar item:", error);
            }
        }
    };
    
    const getStatus = (item) => {
        if (item.quantidade === 0) return { label: "Esgotado", color: "bg-red-600 text-white" };
        if (item.quantidade <= item.limite_baixo_estoque) return { label: "Estoque baixo", color: "bg-yellow-400 text-yellow-900" };
        return { label: "Em estoque", color: "bg-green-100 text-green-800" };
    };

    return (
        <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-8"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Gestão de Estoque</h1>
                        <p className="text-lg text-gray-600">Controle os produtos utilizados e vendidos no seu salão.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Produto
                    </Button>
                </motion.div>

                <Card className="glass-effect border-0 premium-shadow">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-600" />
                            Itens em Estoque
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead className="text-center">Quantidade</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    [...Array(3)].map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell><div className="h-4 bg-gray-200 rounded w-3/4"></div></TableCell>
                                            <TableCell><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></TableCell>
                                            <TableCell><div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div></TableCell>
                                            <TableCell><div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    itens.map(item => {
                                        const status = getStatus(item);
                                        return (
                                            <TableRow key={item.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <img src={item.imagem_url || `https://via.placeholder.com/40?text=${item.nome_produto.charAt(0)}`} alt={item.nome_produto} className="w-10 h-10 object-contain rounded-md" />
                                                        <div>
                                                            <p className="font-medium">{item.nome_produto}</p>
                                                            <p className="text-xs text-gray-500">{item.marca}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantidade(item, item.quantidade - 1)}>-</Button>
                                                        <span className="font-bold w-8 text-center">{item.quantidade}</span>
                                                        <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleUpdateQuantidade(item, item.quantidade + 1)}>+</Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={status.color}>{status.label}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                   <div className="flex gap-2 justify-end">
                                                      {status.label === 'Estoque baixo' && (
                                                          <Button variant="secondary" size="sm" onClick={() => navigate(createPageUrl('Marketplace'))}>
                                                              <ShoppingBag className="w-3 h-3 mr-2"/>
                                                              Comprar
                                                          </Button>
                                                      )}
                                                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                                                          <Trash2 className="w-4 h-4 text-red-500" />
                                                      </Button>
                                                   </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <AdicionarProdutoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={loadItens}
            />
        </div>
    );
}