
import React, { useState, useEffect } from "react";
import { Agendamento } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { Servico } from "@/api/entities";
import { BloqueioHorario } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, View, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfWeek, addDays, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

import AgendaVisaoSemanal from "../components/agenda/AgendaVisaoSemanal";
import NovoAgendamentoModal from "../components/agenda/NovoAgendamentoModal";

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [bloqueios, setBloqueios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [modalState, setModalState] = useState({
    isOpen: false,
    isEditing: false,
    agendamento: null,
    defaultData: null,
  });

  const [dataAtual, setDataAtual] = useState(new Date());

  useEffect(() => {
    loadData();
  }, [dataAtual]); // Recarregar dados quando a semana muda

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Definir o intervalo da semana para a query
      const semanaInicio = startOfWeek(dataAtual, { weekStartsOn: 0 });
      const semanaFim = addDays(semanaInicio, 7);

      const [agendamentosData, clientesData, servicosData, bloqueiosData] = await Promise.all([
        Agendamento.list(), // Idealmente, filtrar por data no backend
        Cliente.list("-created_date"),
        Servico.list(),
        BloqueioHorario.list() // Idealmente, filtrar por data
      ]);
      
      setAgendamentos(agendamentosData);
      setClientes(clientesData);
      setServicos(servicosData);
      setBloqueios(bloqueiosData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
    setIsLoading(false);
  };

  const handleOpenModal = (isEditing = false, agendamento = null, defaultData = null) => {
    setModalState({ isOpen: true, isEditing, agendamento, defaultData });
  };
  
  const handleCloseModal = () => {
    setModalState({ isOpen: false, isEditing: false, agendamento: null, defaultData: null });
  };

  const handleSaveAgendamento = async (data) => {
    try {
      if (modalState.isEditing) {
        await Agendamento.update(modalState.agendamento.id, data);
      } else {
        await Agendamento.create(data);
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
    }
  };
  
  const handleDeleteAgendamento = async (id) => {
    if(window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      await Agendamento.delete(id);
      handleCloseModal();
      loadData();
    }
  };
  
  const handleSaveBloqueio = async (data) => {
    await BloqueioHorario.create(data);
    loadData();
  };

  const semanaAtual = startOfWeek(dataAtual, { weekStartsOn: 0 });
  const diasSemana = Array.from({ length: 7 }, (_, i) => addDays(semanaAtual, i));
  const hoje = new Date();

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agenda Inteligente</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              {format(semanaAtual, "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setDataAtual(subDays(dataAtual, 7))}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setDataAtual(hoje)}
              className="hidden sm:flex"
            >
              Hoje
            </Button>
            <Button
              variant="outline"
              onClick={() => setDataAtual(addDays(dataAtual, 7))}
              className="flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleOpenModal(false, null, { data_hora: new Date() })}
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agendar
            </Button>
          </div>
        </motion.div>

        {/* Visão Semanal */}
        <AgendaVisaoSemanal
          agendamentos={agendamentos}
          bloqueios={bloqueios}
          diasSemana={diasSemana}
          isLoading={isLoading}
          onAgendamentoClick={(agendamento) => handleOpenModal(true, agendamento)}
          onSlotClick={(data_hora) => handleOpenModal(false, null, { data_hora })}
          onBloqueioCreate={handleSaveBloqueio}
          onAgendamentoUpdate={handleSaveAgendamento}
        />

        {/* Modal Novo/Edição Agendamento */}
        {modalState.isOpen && (
          <NovoAgendamentoModal
            isOpen={modalState.isOpen}
            isEditing={modalState.isEditing}
            agendamentoData={modalState.agendamento}
            defaultData={modalState.defaultData}
            onClose={handleCloseModal}
            onSave={handleSaveAgendamento}
            onDelete={handleDeleteAgendamento}
            clientes={clientes}
            servicos={servicos}
          />
        )}
      </div>
    </div>
  );
}
