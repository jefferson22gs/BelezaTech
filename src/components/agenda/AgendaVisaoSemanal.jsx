import React from 'react';
import { format, isSameDay, setHours, setMinutes, addMinutes, isWithinInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Clock, User, AlertTriangle, Lock } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const statusColors = {
  agendado: "bg-blue-200 border-blue-400 text-blue-800",
  confirmado: "bg-green-200 border-green-400 text-green-800",
  em_andamento: "bg-yellow-200 border-yellow-400 text-yellow-800",
  concluido: "bg-purple-200 border-purple-400 text-purple-800",
  cancelado: "bg-gray-200 border-gray-400 text-gray-600",
  faltou: "bg-red-200 border-red-400 text-red-800"
};

const HORAS_DIA = Array.from({ length: 15 }, (_, i) => i + 8); // 8h às 22h

export default function AgendaVisaoSemanal({
  agendamentos,
  bloqueios,
  diasSemana,
  isLoading,
  onAgendamentoClick,
  onSlotClick,
  onBloqueioCreate,
  onAgendamentoUpdate
}) {

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    const agendamento = agendamentos.find(a => a.id === draggableId);
    if (!agendamento) return;
    
    const diaDestino = diasSemana[parseInt(destination.droppableId)];
    const [hora, minuto] = destination.index.split(':').map(Number);

    const novaDataHora = setMinutes(setHours(diaDestino, hora), minuto);

    onAgendamentoUpdate({ id: agendamento.id, data_hora: novaDataHora.toISOString() });
  };

  const getItemsForDay = (dia) => {
    const agendamentosDoDia = agendamentos.filter(a => isSameDay(parseISO(a.data_hora), dia));
    const bloqueiosDoDia = bloqueios.filter(b => isSameDay(parseISO(b.data_hora_inicio), dia));
    return [...agendamentosDoDia, ...bloqueiosDoDia].sort((a,b) => new Date(a.data_hora || a.data_hora_inicio) - new Date(b.data_hora || b.data_hora_inicio));
  }

  const getPositionAndHeight = (item) => {
    const inicio = parseISO(item.data_hora || item.data_hora_inicio);
    const duracao = item.duracao_minutos || (parseISO(item.data_hora_fim) - inicio) / 60000;
    
    const top = ((inicio.getHours() - 8) * 60 + inicio.getMinutes()) / (15 * 60) * 100;
    const height = (duracao / (15 * 60)) * 100;

    return { top: `${top}%`, height: `${height}%` };
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
        {/* Cabeçalho dos dias */}
        {diasSemana.map((dia, index) => (
          <div key={index} className="text-center py-3 border-b border-r border-gray-200">
            <p className="font-semibold text-gray-700 capitalize">{format(dia, 'EEE', { locale: ptBR })}</p>
            <p className={`text-2xl font-bold ${isSameDay(dia, new Date()) ? 'text-purple-600' : 'text-gray-800'}`}>{format(dia, 'd')}</p>
          </div>
        ))}
        
        {/* Corpo da agenda */}
        {diasSemana.map((dia, diaIndex) => (
          <Droppable key={diaIndex} droppableId={String(diaIndex)}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="relative border-r border-gray-100"
                style={{ height: `${HORAS_DIA.length * 60}px` }} // 60px por hora
              >
                {/* Linhas de hora */}
                {HORAS_DIA.map(hora => (
                  <div key={hora} className="h-[60px] border-t border-gray-100 flex items-start">
                    <span className="text-xs text-gray-400 -mt-2 ml-1">{hora}:00</span>
                  </div>
                ))}

                {/* Slots clicáveis */}
                {HORAS_DIA.map(hora => [0, 30].map(minuto => (
                    <div 
                        key={`${hora}:${minuto}`}
                        className="absolute w-full h-[30px]"
                        style={{ top: `${((hora-8)*60 + minuto) / (HORAS_DIA.length * 60) * 100}%` }}
                        onClick={() => onSlotClick(setMinutes(setHours(dia, hora), minuto))}
                    />
                )))}
                
                {/* Itens (Agendamentos e Bloqueios) */}
                {getItemsForDay(dia).map((item, itemIndex) => {
                  const { top, height } = getPositionAndHeight(item);
                  
                  if(item.servico) { // É um agendamento
                    return (
                       <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              position: 'absolute',
                              top,
                              height,
                              left: '4px', right: '4px'
                            }}
                            onClick={() => onAgendamentoClick(item)}
                            className={`p-2 rounded-lg text-xs leading-tight shadow-md cursor-pointer transition-all ${statusColors[item.status]} ${snapshot.isDragging ? 'shadow-2xl' : ''}`}
                          >
                            <p className="font-bold text-gray-900 truncate">{item.cliente_nome}</p>
                            <p className="truncate">{item.servico}</p>
                            <div className="flex items-center gap-1 mt-1 opacity-80">
                                <Clock className="w-3 h-3"/>
                                {format(parseISO(item.data_hora), 'HH:mm')}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    )
                  } else { // É um bloqueio
                     return (
                      <div
                        key={item.id}
                        style={{ position: 'absolute', top, height, left: '4px', right: '4px' }}
                        className="p-2 rounded-lg bg-gray-200 border-gray-400 text-gray-600 flex items-center justify-center text-xs"
                      >
                         <Lock className="w-3 h-3 mr-1"/> {item.motivo || 'Bloqueado'}
                      </div>
                    )
                  }
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}