import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Star,
  Plus,
  Gift,
  TrendingUp
} from "lucide-react";
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

export default function ClientePerfil({ cliente, agendamentos, onNovoAgendamento }) {
  const agendamentosFuturos = agendamentos.filter(a => 
    isAfter(new Date(a.data_hora), new Date())
  );
  
  const agendamentosPassados = agendamentos.filter(a => 
    !isAfter(new Date(a.data_hora), new Date())
  );

  const proximoAgendamento = agendamentosFuturos
    .sort((a, b) => new Date(a.data_hora) - new Date(b.data_hora))[0];

  const totalGasto = agendamentosPassados
    .filter(a => a.status === 'concluido')
    .reduce((sum, a) => sum + (a.valor || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header do Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-effect border-0 premium-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{cliente.nome}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {cliente.telefone}
                  </div>
                  {cliente.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {cliente.email}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-600 mb-1">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{cliente.pontos_fidelidade || 0}</span>
                </div>
                <p className="text-xs text-gray-500">pontos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { 
            icon: Calendar, 
            label: "Agendamentos", 
            value: agendamentos.length,
            color: "text-blue-600"
          },
          { 
            icon: TrendingUp, 
            label: "Total Gasto", 
            value: `R$ ${totalGasto.toFixed(0)}`,
            color: "text-green-600"
          },
          { 
            icon: Gift, 
            label: "Pontos", 
            value: cliente.pontos_fidelidade || 0,
            color: "text-purple-600"
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="glass-effect border-0 premium-shadow">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Próximo Agendamento */}
      {proximoAgendamento && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-0 premium-shadow border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-purple-500" />
                Próximo Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{proximoAgendamento.servico}</h3>
                    <p className="text-sm text-gray-600">com {proximoAgendamento.profissional}</p>
                  </div>
                  <Badge className={statusColors[proximoAgendamento.status]}>
                    {statusLabels[proximoAgendamento.status]}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(proximoAgendamento.data_hora), "EEEE, d 'de' MMMM", { locale: ptBR })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(proximoAgendamento.data_hora), "HH:mm")}
                  </div>
                </div>
                {proximoAgendamento.observacoes && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {proximoAgendamento.observacoes}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* CTA Novo Agendamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-effect border-0 premium-shadow bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Agendar Novo Serviço</h3>
            <p className="text-purple-100 mb-4 text-sm">
              Escolha o serviço, profissional e horário que preferir
            </p>
            <Button
              onClick={onNovoAgendamento}
              className="bg-white text-purple-600 hover:bg-gray-50 font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agendar Agora
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agendamentos Recentes */}
      {agendamentos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-effect border-0 premium-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Agendamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {agendamentos.slice(0, 3).map((agendamento, index) => (
                  <div key={agendamento.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{agendamento.servico}</h4>
                      <p className="text-sm text-gray-600">
                        {format(new Date(agendamento.data_hora), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                    <Badge className={statusColors[agendamento.status]} variant="outline">
                      {statusLabels[agendamento.status]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}