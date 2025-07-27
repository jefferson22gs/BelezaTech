export class GoalSimulator {
  static simularMeta(metaDesejada, dadosAtuais) {
    const {
      faturamentoAtual = 0,
      agendamentosUltimoMes = 0,
      ticketMedioAtual = 0,
      clientesAtivos = 0,
      diasRestantes = 30
    } = dadosAtuais;

    const valorRestante = metaDesejada - faturamentoAtual;
    const mediadiariaNecessaria = valorRestante / diasRestantes;

    // Cenários possíveis
    const cenarios = this.calcularCenarios(valorRestante, ticketMedioAtual, clientesAtivos, diasRestantes);
    
    // Análise de viabilidade
    const viabilidade = this.analisarViabilidade(metaDesejada, dadosAtuais);
    
    // Estratégias personalizadas
    const estrategias = this.gerarEstrategias(valorRestante, ticketMedioAtual, clientesAtivos);

    return {
      metaDesejada,
      valorRestante,
      mediadiariaNecessaria,
      cenarios,
      viabilidade,
      estrategias,
      resumo: this.gerarResumo(metaDesejada, valorRestante, viabilidade, estrategias)
    };
  }

  static calcularCenarios(valorRestante, ticketMedio, clientesAtivos, diasRestantes) {
    return [
      {
        nome: "Manter Ticket Médio",
        descricao: `Mantendo ticket médio de R$ ${ticketMedio.toFixed(2)}`,
        clientesNecessarios: Math.ceil(valorRestante / ticketMedio),
        clientesPorDia: Math.ceil(valorRestante / ticketMedio / diasRestantes),
        viabilidade: valorRestante / ticketMedio <= clientesAtivos * 2 ? "alta" : "media",
        acao: "Focar em agendar mais clientes existentes"
      },
      {
        nome: "Aumentar Ticket Médio",
        descricao: `Aumentando ticket médio para R$ ${(ticketMedio * 1.3).toFixed(2)}`,
        clientesNecessarios: Math.ceil(valorRestante / (ticketMedio * 1.3)),
        aumentoNecessario: "30%",
        viabilidade: "media",
        acao: "Implementar upsell e cross-sell"
      },
      {
        nome: "Cenário Misto",
        descricao: `Aumentando ticket médio 15% + mais clientes`,
        ticketNovo: ticketMedio * 1.15,
        clientesNecessarios: Math.ceil(valorRestante / (ticketMedio * 1.15)),
        viabilidade: "alta",
        acao: "Estratégia equilibrada recomendada"
      }
    ];
  }

  static analisarViabilidade(meta, dados) {
    const { faturamentoAtual, agendamentosUltimoMes, ticketMedioAtual } = dados;
    
    const crescimentoNecessario = ((meta - faturamentoAtual) / faturamentoAtual) * 100;
    
    let nivel, cor, icone, mensagem;
    
    if (crescimentoNecessario <= 20) {
      nivel = "MUITO ALTA";
      cor = "green";
      icone = "✅";
      mensagem = "Meta facilmente alcançável com pequenos ajustes";
    } else if (crescimentoNecessario <= 50) {
      nivel = "ALTA";
      cor = "blue";
      icone = "🎯";
      mensagem = "Meta desafiadora mas realista com estratégia focada";
    } else if (crescimentoNecessario <= 100) {
      nivel = "MÉDIA";
      cor = "yellow";
      icone = "⚡";
      mensagem = "Meta ambiciosa - requer mudanças significativas";
    } else {
      nivel = "BAIXA";
      cor = "red";
      icone = "🚨";
      mensagem = "Meta muito ambiciosa - considere revisar o prazo";
    }

    return {
      nivel,
      cor,
      icone,
      mensagem,
      crescimentoNecessario: crescimentoNecessario.toFixed(1)
    };
  }

  static gerarEstrategias(valorRestante, ticketMedio, clientesAtivos) {
    const estrategias = [];

    // Estratégia 1: Aumento de frequência
    estrategias.push({
      titulo: "Aumentar Frequência de Retorno",
      descricao: "Contatar clientes inativos e incentivar retorno mais frequente",
      impacto: `+R$ ${(clientesAtivos * ticketMedio * 0.3).toFixed(0)}/mês`,
      dificuldade: "Fácil",
      prazo: "1-2 semanas",
      acoes: [
        "Ligar para clientes que não agendaram há 60+ dias",
        "Oferecer desconto de retorno de 10%",
        "Criar campanha de WhatsApp para reativação"
      ]
    });

    // Estratégia 2: Upsell
    estrategias.push({
      titulo: "Programa de Upsell Sistemático",
      descricao: "Aumentar ticket médio oferecendo serviços complementares",
      impacto: `+R$ ${(ticketMedio * 0.4).toFixed(0)} por cliente`,
      dificuldade: "Médio",
      prazo: "2-3 semanas",
      acoes: [
        "Treinar equipe para sugerir serviços complementares",
        "Criar combos promocionais atrativos",
        "Implementar sistema de comissão por upsell"
      ]
    });

    // Estratégia 3: Novos clientes
    estrategias.push({
      titulo: "Aquisição de Novos Clientes",
      descricao: "Campanha focada em atrair novos clientes",
      impacto: `+R$ ${(ticketMedio * 10).toFixed(0)} (10 novos clientes)`,
      dificuldade: "Difícil",
      prazo: "3-4 semanas",
      acoes: [
        "Programa de indicação com recompensas",
        "Promoção para primeiro atendimento",
        "Marketing digital direcionado"
      ]
    });

    return estrategias;
  }

  static gerarResumo(meta, valorRestante, viabilidade, estrategias) {
    let resumo = `🎯 **SIMULAÇÃO DE META: R$ ${meta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n\n`;
    
    resumo += `💰 Valor restante para atingir: **R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n`;
    resumo += `${viabilidade.icone} Viabilidade: **${viabilidade.nivel}** (${viabilidade.crescimentoNecessario}% de crescimento)\n`;
    resumo += `💡 ${viabilidade.mensagem}\n\n`;

    resumo += `🚀 **PLANO DE AÇÃO RECOMENDADO:**\n\n`;
    
    estrategias.slice(0, 2).forEach((estrategia, index) => {
      resumo += `**${index + 1}. ${estrategia.titulo}**\n`;
      resumo += `• Impacto: ${estrategia.impacto}\n`;
      resumo += `• Prazo: ${estrategia.prazo}\n`;
      resumo += `• Primeira ação: ${estrategia.acoes[0]}\n\n`;
    });

    return resumo;
  }
}