import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  User, 
  AlertTriangle, 
  DollarSign,
  Brain,
  Shield,
  Target
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";

const statusColors = {
  agendado: "bg-blue-200 border-blue-400 text-blue-800",
  confirmado: "bg-green-200 border-green-400 text-green-800",
  em_andamento: "bg-yellow-200 border-yellow-400 text-yellow-800",
  concluido: "bg-purple-200 border-purple-400 text-purple-800",
  cancelado: "bg-gray-200 border-gray-400 text-gray-600",
  faltou: "bg-red-200 border-red-400 text-red-800"
};

const riscoColors = {
  baixo: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: Shield },
  medio: { bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: AlertTriangle },
  alto: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: AlertTriangle }
};

export default function AgendamentoCard({ agendamento, onClick }) {
  const risco = agendamento.risco_no_show || 'baixo';
  const riscoStyle = riscoColors[risco];
  const RiscoIcon = riscoStyle.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className="glass-effect border-0 premium-shadow hover:shadow-lg transition-all duration-300 cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Header com nome do cliente e IA Risk Score */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg mb-1">
                {agendamento.cliente_nome}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                {format(parseISO(agendamento.data_hora), 'HH:mm')}
                <span>•</span>
                <span>{agendamento.duracao_minutos}min</span>
              </div>
            </div>
            
            {/* IA Risk Score */}
            <div className={`px-2 py-1 rounded-lg border ${riscoStyle.bg} ${riscoStyle.text} ${riscoStyle.border}`}>
              <div className="flex items-center gap-1 text-xs">
                <Brain className="w-3 h-3" />
                <RiscoIcon className="w-3 h-3" />
                <span className="font-medium">
                  Risco {risco.charAt(0).toUpperCase() + risco.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Serviço */}
          <div className="mb-3">
            <p className="font-medium text-gray-800 mb-1">{agendamento.servico}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{agendamento.profissional}</span>
            </div>
          </div>

          {/* Valor e Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600">
                R$ {(agendamento.valor || 0).toFixed(2)}
              </span>
            </div>
            
            <Badge className={statusColors[agendamento.status]}>
              {agendamento.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Recomendações da IA para riscos altos */}
          {risco === 'alto' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-3 h-3 text-red-600" />
                <span className="text-xs font-medium text-red-700">IA Recomenda:</span>
              </div>
              <p className="text-xs text-red-600">
                💳 Solicitar sinal via link de pagamento • 📞 Confirmação por telefone
              </p>
            </motion.div>
          )}

          {/* Botões de ação rápida */}
          <div className="flex gap-2 mt-3">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                // Ação de confirmação
              }}
            >
              Confirmar
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="flex-1 text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                // Ação de reagendar
              }}
            >
              Reagendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}