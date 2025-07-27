import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, Users, Clock } from "lucide-react";

export default function FiltrosAgenda({ filtros, setFiltros, agendamentos }) {
  const profissionais = [...new Set(agendamentos.map(a => a.profissional))].filter(Boolean);
  
  const totalAgendamentos = agendamentos.length;
  const agendamentosConfirmados = agendamentos.filter(a => a.status === 'confirmado').length;
  const riscosAltos = agendamentos.filter(a => a.risco_no_show === 'alto').length;

  return (
    <Card className="glass-effect border-0 premium-shadow mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <Select 
              value={filtros.profissional} 
              onValueChange={(value) => setFiltros(prev => ({ ...prev, profissional: value }))}
            >
              <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Profissional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Profissionais</SelectItem>
                {profissionais.map(prof => (
                  <SelectItem key={prof} value={prof}>{prof}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={filtros.status} 
              onValueChange={(value) => setFiltros(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="w-36 h-8">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos Status</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="faltou">Faltou</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {totalAgendamentos} total
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
              <Clock className="w-3 h-3" />
              {agendamentosConfirmados} confirmados
            </Badge>
            {riscosAltos > 0 && (
              <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
                ⚠️ {riscosAltos} risco alto
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}