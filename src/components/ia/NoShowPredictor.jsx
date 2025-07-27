import { format, differenceInDays, parseISO } from 'date-fns';

export class NoShowPredictor {
  static calcularRiscoNoShow(agendamento, historico = [], cliente = null) {
    let pontuacao = 0;
    const fatores = [];

    // Fator 1: Histórico de faltas do cliente (peso: 40%)
    if (historico.length > 0) {
      const totalAgendamentos = historico.length;
      const faltas = historico.filter(h => h.status === 'faltou').length;
      const taxaFalta = faltas / totalAgendamentos;
      
      if (taxaFalta > 0.3) {
        pontuacao += 40;
        fatores.push(`Cliente tem ${(taxaFalta * 100).toFixed(0)}% de histórico de faltas`);
      } else if (taxaFalta > 0.15) {
        pontuacao += 25;
        fatores.push(`Cliente tem ${(taxaFalta * 100).toFixed(0)}% de histórico de faltas`);
      }
    }

    // Fator 2: Tempo até o agendamento (peso: 25%)
    const diasAteAgendamento = differenceInDays(parseISO(agendamento.data_hora), new Date());
    if (diasAteAgendamento > 14) {
      pontuacao += 20;
      fatores.push('Agendamento muito distante (>14 dias)');
    } else if (diasAteAgendamento > 7) {
      pontuacao += 10;
      fatores.push('Agendamento distante (>7 dias)');
    }

    // Fator 3: Dia da semana e horário (peso: 15%)
    const dataAgendamento = parseISO(agendamento.data_hora);
    const diaSemana = dataAgendamento.getDay();
    const hora = dataAgendamento.getHours();
    
    if (diaSemana === 1) { // Segunda-feira
      pontuacao += 10;
      fatores.push('Segunda-feira tem maior índice de faltas');
    }
    
    if (hora <= 9) { // Muito cedo
      pontuacao += 8;
      fatores.push('Horário muito cedo aumenta risco de falta');
    }

    // Fator 4: Valor do serviço (peso: 10%)
    if (agendamento.valor > 200) {
      pontuacao += 5;
      fatores.push('Serviços caros têm maior chance de cancelamento');
    }

    // Fator 5: Cliente novo (peso: 10%)
    if (!cliente || historico.length === 0) {
      pontuacao += 15;
      fatores.push('Cliente novo ou sem histórico');
    }

    // Determinar nível de risco
    let nivelRisco;
    if (pontuacao >= 50) {
      nivelRisco = 'alto';
    } else if (pontuacao >= 25) {
      nivelRisco = 'medio';
    } else {
      nivelRisco = 'baixo';
    }

    return {
      risco: nivelRisco,
      pontuacao: pontuacao,
      fatores: fatores,
      recomendacoes: this.gerarRecomendacoes(nivelRisco, pontuacao)
    };
  }

  static gerarRecomendacoes(risco, pontuacao) {
    const recomendacoes = [];
    
    if (risco === 'alto') {
      recomendacoes.push('💳 Solicite um sinal via link de pagamento');
      recomendacoes.push('📞 Confirme por telefone 1 dia antes');
      recomendacoes.push('⚠️ Considere ter um cliente em lista de espera');
    } else if (risco === 'medio') {
      recomendacoes.push('📱 Envie lembrete personalizado no WhatsApp');
      recomendacoes.push('🔔 Configure lembrete adicional 2 horas antes');
    } else {
      recomendacoes.push('✅ Cliente confiável, processo padrão');
    }
    
    return recomendacoes;
  }
}