import { differenceInDays, parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export class RecommendationEngine {
  static gerarRecomendacoes(cliente, historico = [], servicos = []) {
    const recomendacoes = [];

    // Análise 1: Serviços recorrentes
    const servicosRecorrentes = this.analisarServicosRecorrentes(historico);
    servicosRecorrentes.forEach(rec => {
      recomendacoes.push({
        tipo: 'recorrente',
        titulo: `${rec.servico} - Cliente em Atraso`,
        descricao: `${cliente.nome} costuma fazer ${rec.servico} a cada ${rec.intervalo} dias. Último serviço foi há ${rec.diasAtraso} dias.`,
        prioridade: rec.diasAtraso > rec.intervalo * 1.5 ? 'alta' : 'media',
        acao: 'Oferecer agendamento',
        servico: rec.servico,
        icone: '🔄'
      });
    });

    // Análise 2: Upsell baseado em padrões
    const upsellSuggestions = this.analisarUpsell(historico, servicos);
    upsellSuggestions.forEach(up => {
      recomendacoes.push({
        tipo: 'upsell',
        titulo: `Oportunidade de Upsell: ${up.servico}`,
        descricao: up.motivo,
        prioridade: 'media',
        acao: 'Sugerir serviço adicional',
        servico: up.servico,
        icone: '💎'
      });
    });

    // Análise 3: Cross-sell inteligente
    const crossSellSuggestions = this.analisarCrossSell(historico, servicos);
    crossSellSuggestions.forEach(cross => {
      recomendacoes.push({
        tipo: 'crosssell',
        titulo: `Combo Sugerido: ${cross.servico}`,
        descricao: cross.motivo,
        prioridade: 'baixa',
        acao: 'Sugerir combo',
        servico: cross.servico,
        icone: '🎯'
      });
    });

    // Análise 4: Reativação de clientes inativos
    const ultimoAgendamento = historico.length > 0 ? 
      historico.sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))[0] : null;
    
    if (ultimoAgendamento) {
      const diasInativo = differenceInDays(new Date(), parseISO(ultimoAgendamento.data_hora));
      
      if (diasInativo > 60) {
        recomendacoes.push({
          tipo: 'reativacao',
          titulo: 'Cliente Inativo - Ação Necessária',
          descricao: `${cliente.nome} não agenda há ${diasInativo} dias. Valor total histórico: R$ ${this.calcularValorTotal(historico).toFixed(2)}`,
          prioridade: 'alta',
          acao: 'Campanha de reativação',
          icone: '🚨'
        });
      }
    }

    return recomendacoes.sort((a, b) => {
      const prioridades = { alta: 3, media: 2, baixa: 1 };
      return prioridades[b.prioridade] - prioridades[a.prioridade];
    });
  }

  static analisarServicosRecorrentes(historico) {
    const servicosMap = {};
    const recorrentes = [];

    // Agrupar por serviço
    historico.forEach(agendamento => {
      if (!servicosMap[agendamento.servico]) {
        servicosMap[agendamento.servico] = [];
      }
      servicosMap[agendamento.servico].push(parseISO(agendamento.data_hora));
    });

    // Analisar intervalos
    Object.keys(servicosMap).forEach(servico => {
      const datas = servicosMap[servico].sort((a, b) => b - a);
      
      if (datas.length >= 2) {
        const intervalos = [];
        for (let i = 0; i < datas.length - 1; i++) {
          intervalos.push(differenceInDays(datas[i], datas[i + 1]));
        }
        
        const intervaloMedio = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
        const ultimaData = datas[0];
        const diasAtraso = differenceInDays(new Date(), ultimaData);
        
        if (diasAtraso > intervaloMedio * 0.8) { // 80% do intervalo normal
          recorrentes.push({
            servico,
            intervalo: Math.round(intervaloMedio),
            diasAtraso,
            ultimaData: format(ultimaData, 'dd/MM/yyyy', { locale: ptBR })
          });
        }
      }
    });

    return recorrentes;
  }

  static analisarUpsell(historico, servicos) {
    const sugestoes = [];
    const servicosFeitos = [...new Set(historico.map(h => h.servico))];

    // Regras de upsell baseadas em padrões
    const regrasUpsell = [
      {
        se: ['Corte'],
        entao: 'Escova',
        motivo: 'Clientes que fazem corte frequentemente gostam de escova'
      },
      {
        se: ['Manicure'],
        entao: 'Pedicure',
        motivo: 'Combo manicure + pedicure é muito popular'
      },
      {
        se: ['Escova'],
        entao: 'Hidratação',
        motivo: 'Hidratação prolonga o efeito da escova'
      },
      {
        se: ['Corte', 'Escova'],
        entao: 'Coloração',
        motivo: 'Momento ideal para mudança de visual'
      }
    ];

    regrasUpsell.forEach(regra => {
      const temServicoBase = regra.se.some(s => servicosFeitos.includes(s));
      const naoTemServicoAlvo = !servicosFeitos.includes(regra.entao);
      
      if (temServicoBase && naoTemServicoAlvo) {
        sugestoes.push({
          servico: regra.entao,
          motivo: regra.motivo
        });
      }
    });

    return sugestoes;
  }

  static analisarCrossSell(historico, servicos) {
    const sugestoes = [];
    
    // Análise de sazonalidade e tendências
    const mesAtual = new Date().getMonth();
    
    if ([11, 0, 1].includes(mesAtual)) { // Verão
      sugestoes.push({
        servico: 'Progressiva',
        motivo: 'Verão é época ideal para progressivas (menos umidade)'
      });
    }
    
    if ([4, 5].includes(mesAtual)) { // Outono
      sugestoes.push({
        servico: 'Hidratação Profunda',
        motivo: 'Cabelos precisam de hidratação extra no outono'
      });
    }

    return sugestoes;
  }

  static calcularValorTotal(historico) {
    return historico.reduce((total, agendamento) => total + (agendamento.valor || 0), 0);
  }
}