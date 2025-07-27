import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, DollarSign } from "lucide-react";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

const statusColors = {
  agendado: "bg-blue-100 text-blue-800",
  confirmado: "bg-green-100 text-green-800",
  em_andamento: "bg-yellow-100 text-yellow-800",
  concluido: "bg-purple-100 text-purple-800",
  cancelado: "bg-gray-100 text-gray-800",
  faltou: "bg-red-100 text-red-800"
};

const statusLabels = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado",
  faltou: "Faltou"
};

export default function HistoricoAgendamentos({ agendamentos }) {
  const agendamentosFuturos = agendamentos.filter(a => 
    isAfter(new Date(a.data_hora), new Date())
  ).sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora));
  
  const agendamentosPassados = agendamentos.filter(a => 
    !isAfter(new Date(a.data_hora), new Date())
  ).sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

  const AgendamentoCard = ({ agendamento, index, isFuturo }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`glass-effect border-0 premium-shadow ${
        isFuturo ? 'border-l-4 border-l-green-500' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{agendamento.servico}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                <User className="w-3 h-3" />
                {agendamento.profissional}
              </div>
            </div>
            <Badge className={statusColors[agendamento.status]}>
              {statusLabels[agendamento.status]}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(agendamento.data_hora), "dd/MM/yyyy")}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(agendamento.data_hora), "HH:mm")}
                </div>
              </div>
              <div className="flex items-center gap-1 font-medium text-green-600">
                <DollarSign className="w-3 h-3" />
                R$ {agendamento.valor?.toFixed(2)}
              </div>
            </div>
            
            {agendamento.observacoes && (
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {agendamento.observacoes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (agendamentos.length === 0) {
    return (
      <Card className="glass-effect border-0 premium-shadow">
        <CardContent className="p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum agendamento ainda
          </h3>
          <p className="text-gray-600">
            Seus agendamentos aparecerão aqui após você fazer o primeiro
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agendamentos Futuros */}
      {agendamentosFuturos.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-500" />
            Próximos Agendamentos
          </h2>
          <div className="space-y-3">
            {agendamentosFuturos.map((agendamento, index) => (
              <AgendamentoCard 
                key={agendamento.id} 
                agendamento={agendamento} 
                index={index}
                isFuturo={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Agendamentos Passados */}
      {agendamentosPassados.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Histórico
          </h2>
          <div className="space-y-3">
            {agendamentosPassados.map((agendamento, index) => (
              <AgendamentoCard 
                key={agendamento.id} 
                agendamento={agendamento} 
                index={index}
                isFuturo={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}