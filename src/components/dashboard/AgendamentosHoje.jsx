
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Phone, AlertTriangle, CheckCircle, User, Calendar } from "lucide-react";
import { format } from "date-fns";
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

const riscoColors = {
  baixo: "text-green-600",
  medio: "text-yellow-600",
  alto: "text-red-600"
};

export default function AgendamentosHoje({ agendamentos, isLoading }) {
  if (isLoading) {
    return (
      <Card className="glass-effect border-0 premium-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-gray-100">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3" />
                  <div className="h-3 bg-gray-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-effect border-0 premium-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Agendamentos de Hoje
          </div>
          <Badge variant="outline" className="text-xs">
            {agendamentos.length} agendamentos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-96 overflow-y-auto">
          {agendamentos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-1">
              {agendamentos.map((agendamento, index) => (
                <motion.div
                  key={agendamento.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold">
                      {agendamento.cliente_nome?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">
                        {agendamento.cliente_nome}
                      </h4>
                      {agendamento.risco_no_show === 'alto' && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{agendamento.servico}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{format(new Date(agendamento.data_hora), 'HH:mm')}</span>
                      <span>•</span>
                      <span>{agendamento.profissional}</span>
                      <span>•</span>
                      <span className="font-medium text-green-600">
                        R$ {agendamento.valor?.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge className={statusColors[agendamento.status]}>
                      {statusLabels[agendamento.status]}
                    </Badge>
                    {agendamento.risco_no_show && agendamento.risco_no_show !== 'baixo' && (
                      <span className={`text-xs font-medium ${riscoColors[agendamento.risco_no_show]}`}>
                        Risco {agendamento.risco_no_show}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
