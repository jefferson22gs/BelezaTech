import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class PerformanceAnalyzer {
  static gerarRelatorioSemanal(agendamentos, transacoes, clientes) {
    const hoje = new Date();
    const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 });
    const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 });

    // Filtrar dados da semana
    const agendamentosSemana = agendamentos.filter(a => {
      const data = new Date(a.data_hora);
      return data >= inicioSemana && data <= fimSemana;
    });

    const faturamentoSemana = agendamentosSemana
      .filter(a => a.status_pagamento === 'pago')
      .reduce((sum, a) => sum + (a.valor || 0), 0);

    // Análises
    const analises = {
      faturamento: this.analisarFaturamento(agendamentosSemana, faturamentoSemana),
      servicos: this.analisarServicos(agendamentosSemana),
      profissionais: this.analisarProfissionais(agendamentosSemana),
      cancelamentos: this.analisarCancelamentos(agendamentosSemana),
      novosClientes: this.analisarNovosClientes(agendamentosSemana, clientes)
    };

    return this.gerarRelatorioTexto(analises, inicioSemana, fimSemana);
  }

  static analisarFaturamento(agendamentos, faturamento) {
    const totalAgendamentos = agendamentos.length;
    const agendamentosPagos = agendamentos.filter(a => a.status_pagamento === 'pago').length;
    const ticketMedio = agendamentosPagos > 0 ? faturamento / agendamentosPagos : 0;
    
    return {
      faturamento,
      totalAgendamentos,
      agendamentosPagos,
      ticketMedio,
      taxaConversao: totalAgendamentos > 0 ? (agendamentosPagos / totalAgendamentos * 100) : 0
    };
  }

  static analisarServicos(agendamentos) {
    const servicosMap = {};
    
    agendamentos.forEach(a => {
      if (!servicosMap[a.servico]) {
        servicosMap[a.servico] = { count: 0, faturamento: 0 };
      }
      servicosMap[a.servico].count++;
      servicosMap[a.servico].faturamento += (a.valor || 0);
    });

    const servicosOrdenados = Object.entries(servicosMap)
      .map(([nome, dados]) => ({
        nome,
        quantidade: dados.count,
        faturamento: dados.faturamento,
        ticketMedio: dados.faturamento / dados.count
      }))
      .sort((a, b) => b.faturamento - a.faturamento);

    return {
      maisLucrativo: servicosOrdenados[0],
      maisProcurado: servicosOrdenados.sort((a, b) => b.quantidade - a.quantidade)[0],
      todos: servicosOrdenados
    };
  }

  static analisarProfissionais(agendamentos) {
    const profissionaisMap = {};
    
    agendamentos.forEach(a => {
      if (!profissionaisMap[a.profissional]) {
        profissionaisMap[a.profissional] = { count: 0, faturamento: 0 };
      }
      profissionaisMap[a.profissional].count++;
      profissionaisMap[a.profissional].faturamento += (a.valor || 0);
    });

    const profissionaisOrdenados = Object.entries(profissionaisMap)
      .map(([nome, dados]) => ({
        nome,
        agendamentos: dados.count,
        faturamento: dados.faturamento,
        ticketMedio: dados.faturamento / dados.count
      }))
      .sort((a, b) => b.faturamento - a.faturamento);

    return profissionaisOrdenados;
  }

  static analisarCancelamentos(agendamentos) {
    const cancelados = agendamentos.filter(a => a.status === 'cancelado' || a.status === 'faltou');
    const taxaCancelamento = agendamentos.length > 0 ? (cancelados.length / agendamentos.length * 100) : 0;
    
    return {
      total: cancelados.length,
      taxa: taxaCancelamento,
      valorPerdido: cancelados.reduce((sum, a) => sum + (a.valor || 0), 0)
    };
  }

  static analisarNovosClientes(agendamentos, clientes) {
    const clientesNovos = clientes.filter(c => {
      const diasCriacao = differenceInDays(new Date(), new Date(c.created_date));
      return diasCriacao <= 7;
    });

    return {
      quantidade: clientesNovos.length,
      nomes: clientesNovos.map(c => c.nome)
    };
  }

  static gerarRelatorioTexto(analises, inicioSemana, fimSemana) {
    const periodo = `${format(inicioSemana, 'dd/MM', { locale: ptBR })} a ${format(fimSemana, 'dd/MM/yyyy', { locale: ptBR })}`;
    
    let relatorio = `📊 **RELATÓRIO SEMANAL DE PERFORMANCE**\n`;
    relatorio += `📅 Período: ${periodo}\n\n`;

    // Faturamento
    relatorio += `💰 **FATURAMENTO**\n`;
    relatorio += `• Total: R$ ${analises.faturamento.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    relatorio += `• Agendamentos: ${analises.faturamento.totalAgendamentos} (${analises.faturamento.agendamentosPagos} pagos)\n`;
    relatorio += `• Ticket Médio: R$ ${analises.faturamento.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    relatorio += `• Taxa de Conversão: ${analises.faturamento.taxaConversao.toFixed(1)}%\n\n`;

    // Serviços
    if (analises.servicos.maisLucrativo) {
      relatorio += `🏆 **SERVIÇOS EM DESTAQUE**\n`;
      relatorio += `• Mais Lucrativo: ${analises.servicos.maisLucrativo.nome} (R$ ${analises.servicos.maisLucrativo.faturamento.toFixed(2)})\n`;
      relatorio += `• Mais Procurado: ${analises.servicos.maisProcurado.nome} (${analises.servicos.maisProcurado.quantidade}x)\n\n`;
    }

    // Profissionais
    if (analises.profissionais.length > 0) {
      relatorio += `👥 **PERFORMANCE DOS PROFISSIONAIS**\n`;
      analises.profissionais.slice(0, 3).forEach((prof, index) => {
        const posicao = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
        relatorio += `${posicao} ${prof.nome}: R$ ${prof.faturamento.toFixed(2)} (${prof.agendamentos} agendamentos)\n`;
      });
      relatorio += `\n`;
    }

    // Cancelamentos
    if (analises.cancelamentos.taxa > 15) {
      relatorio += `⚠️ **ATENÇÃO - CANCELAMENTOS**\n`;
      relatorio += `• Taxa de cancelamento: ${analises.cancelamentos.taxa.toFixed(1)}% (acima do ideal)\n`;
      relatorio += `• Valor perdido: R$ ${analises.cancelamentos.valorPerdido.toFixed(2)}\n`;
      relatorio += `• Recomendação: Implemente confirmação por WhatsApp\n\n`;
    }

    // Novos clientes
    if (analises.novosClientes.quantidade > 0) {
      relatorio += `🎉 **NOVOS CLIENTES**\n`;
      relatorio += `• ${analises.novosClientes.quantidade} novos clientes esta semana\n`;
      if (analises.novosClientes.nomes.length <= 5) {
        relatorio += `• ${analises.novosClientes.nomes.join(', ')}\n`;
      }
      relatorio += `\n`;
    }

    // Recomendações estratégicas
    relatorio += `🚀 **RECOMENDAÇÕES PARA PRÓXIMA SEMANA**\n`;
    
    if (analises.faturamento.ticketMedio < 80) {
      relatorio += `• Focar em aumentar o ticket médio oferecendo serviços complementares\n`;
    }
    
    if (analises.cancelamentos.taxa > 10) {
      relatorio += `• Implementar sistema de confirmação 24h antes dos agendamentos\n`;
    }
    
    if (analises.novosClientes.quantidade < 3) {
      relatorio += `• Intensificar ações de marketing para atrair novos clientes\n`;
    }

    relatorio += `• Manter foco no serviço "${analises.servicos.maisLucrativo?.nome}" que está gerando mais resultado\n`;

    return relatorio;
  }
}