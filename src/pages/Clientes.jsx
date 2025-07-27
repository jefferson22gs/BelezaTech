import React, { useState, useEffect } from "react";
import { Cliente } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ClienteCard from "../components/clientes/ClienteCard";
import ClienteFormModal from "../components/clientes/ClienteFormModal";

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    setIsLoading(true);
    try {
      const data = await Cliente.list("-created_date");
      setClientes(data);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cliente = null) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setIsModalOpen(false);
  };

  const handleSave = () => {
    handleCloseModal();
    loadClientes(); // Recarrega a lista após salvar
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone.replace(/\D/g, '').includes(searchTerm.replace(/\D/g, ''))
  );

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Gestão de Clientes
            </h1>
            <p className="text-gray-600">
              Visualize, adicione e gerencie seus clientes.
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Novo Cliente
          </Button>
        </motion.div>

        {/* Search Bar */}
        <div className="mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            className="pl-10 h-12"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Client List */}
        {isLoading ? (
          <div className="text-center text-gray-500">Carregando clientes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredClientes.map((cliente) => (
                <ClienteCard key={cliente.id} cliente={cliente} onEdit={() => handleOpenModal(cliente)} />
              ))}
            </AnimatePresence>
          </div>
        )}
        
        {filteredClientes.length === 0 && !isLoading && (
            <div className="text-center py-16 text-gray-500">
                <p>Nenhum cliente encontrado.</p>
            </div>
        )}
      </div>

      <ClienteFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        cliente={selectedCliente}
      />
    </div>
  );
}