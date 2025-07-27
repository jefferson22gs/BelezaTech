
import { ConfigWhatsApp } from "@/api/entities";
import { MensagemWhatsApp } from "@/api/entities";
import { Agendamento } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { EvolutionService } from "./EvolutionService";
import { format, addHours, subHours, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export class AutomacaoManager {
  constructor() {
    this.evolutionService = null;
    this.config = null;
  }

  // Inicializar o serviço
  async inicializar() {
    try {
      const configs = await ConfigWhatsApp.list();
      if (configs.length > 0) {
        this.config = configs[0];
        
        if (this.config.ativo && this.config.status === 'conectado') {
          this.evolutionService = new EvolutionService(this.config);
        }
      }
    } catch (error) {
      console.error('Erro ao inicializar automação:', error);
    }
  }

  // Processar variáveis do template
  processarTemplate(template, dadosAgendamento, dadosCliente) {
    if (!template) return '';

    const variaveis = {
      nome: dadosCliente?.nome || dadosAgendamento?.cliente_nome,
      data: format(new Date(dadosAgendamento.data_hora), "EEEE, dd 'de' MMMM", { locale: ptBR }),
      horario: format(new Date(dadosAgendamento.data_hora), "HH:mm"),
      servico: dadosAgendamento.servico,
      profissional: dadosAgendamento.profissional,
      valor: `R$ ${dadosAgendamento.valor?.toFixed(2)}`,
      nome_salao: "Seu Salão", // Pode vir da configuração
      cupom: this.config?.cupom_aniversario || "NIVER15",
      desconto: `${this.config?.desconto_aniversario || 15}%`
    };

    let mensagem = template;
    Object.keys(variaveis).forEach(key => {
      const placeholder = `{{${key}}}`;
      mensagem = mensagem.replace(new RegExp(placeholder, 'g'), variaveis[key]);
    });

    return mensagem;
  }

  // Enviar mensagem de confirmação
  async enviarConfirmacao(agendamento) {
    if (!this.evolutionService || !this.config?.ativo) return;

    try {
      const cliente = await Cliente.filter({ telefone: agendamento.cliente_telefone });
      const dadosCliente = cliente[0];

      const mensagem = this.processarTemplate(
        this.config.mensagem_confirmacao,
        agendamento,
        dadosCliente
      );

      const resultado = await this.evolutionService.enviarMensagem(
        agendamento.cliente_telefone,
        mensagem
      );

      // Registrar no histórico
      await MensagemWhatsApp.create({
        agendamento_id: agendamento.id,
        cliente_telefone: agendamento.cliente_telefone,
        cliente_nome: agendamento.cliente_nome,
        tipo_mensagem: "confirmacao",
        conteudo: mensagem,
        status_envio: "enviada",
        data_envio: new Date().toISOString(),
        webhook_id: resultado?.key?.id
      });

      return { sucesso: true, resultado };
    } catch (error) {
      console.error('Erro ao enviar confirmação:', error);
      
      // Registrar erro no histórico
      await MensagemWhatsApp.create({
        agendamento_id: agendamento.id,
        cliente_telefone: agendamento.cliente_telefone,
        cliente_nome: agendamento.cliente_nome,
        tipo_mensagem: "confirmacao",
        conteudo: "Erro ao enviar mensagem",
        status_envio: "erro",
        data_envio: new Date().toISOString(),
        erro_detalhes: error.message
      });

      return { sucesso: false, erro: error.message };
    }
  }

  // Enviar lembrete com botões
  async enviarLembrete(agendamento) {
    if (!this.evolutionService || !this.config?.ativo) return;

    try {
      const cliente = await Cliente.filter({ telefone: agendamento.cliente_telefone });
      const dadosCliente = cliente[0];

      const mensagem = this.processarTemplate(
        this.config.mensagem_lembrete,
        agendamento,
        dadosCliente
      );

      // Enviar com botões de confirmação
      const resultado = await this.evolutionService.enviarMensagemComBotoes(
        agendamento.cliente_telefone,
        mensagem,
        ["✅ SIM - Confirmo presença", "❌ NÃO - Preciso cancelar"]
      );

      // Registrar no histórico
      await MensagemWhatsApp.create({
        agendamento_id: agendamento.id,
        cliente_telefone: agendamento.cliente_telefone,
        cliente_nome: agendamento.cliente_nome,
        tipo_mensagem: "lembrete",
        conteudo: mensagem,
        status_envio: "enviada",
        data_envio: new Date().toISOString(),
        webhook_id: resultado?.key?.id
      });

      return { sucesso: true, resultado };
    } catch (error) {
      console.error('Erro ao enviar lembrete:', error);
      
      await MensagemWhatsApp.create({
        agendamento_id: agendamento.id,
        cliente_telefone: agendamento.cliente_telefone,
        cliente_nome: agendamento.cliente_nome,
        tipo_mensagem: "lembrete",
        conteudo: "Erro ao enviar mensagem",
        status_envio: "erro",
        data_envio: new Date().toISOString(),
        erro_detalhes: error.message
      });

      return { sucesso: false, erro: error.message };
    }
  }

  // Enviar parabéns de aniversário
  async enviarAniversario(cliente) {
    if (!this.evolutionService || !this.config?.ativo) return;

    try {
      const mensagem = this.processarTemplate(
        this.config.mensagem_aniversario,
        { cliente_nome: cliente.nome }, // Mock de agendamento
        cliente
      );

      const resultado = await this.evolutionService.enviarMensagem(
        cliente.telefone,
        mensagem
      );

      // Registrar no histórico
      await MensagemWhatsApp.create({
        cliente_telefone: cliente.telefone,
        cliente_nome: cliente.nome,
        tipo_mensagem: "aniversario",
        conteudo: mensagem,
        status_envio: "enviada",
        data_envio: new Date().toISOString(),
        webhook_id: resultado?.key?.id
      });

      // Atualizar data do último aniversário enviado
      await Cliente.update(cliente.id, {
        ...cliente,
        ultimo_aniversario_enviado: new Date().toISOString().split('T')[0]
      });

      return { sucesso: true, resultado };
    } catch (error) {
      console.error('Erro ao enviar parabéns:', error);
      
      await MensagemWhatsApp.create({
        cliente_telefone: cliente.telefone,
        cliente_nome: cliente.nome,
        tipo_mensagem: "aniversario",
        conteudo: "Erro ao enviar mensagem",
        status_envio: "erro",
        data_envio: new Date().toISOString(),
        erro_detalhes: error.message
      });

      return { sucesso: false, erro: error.message };
    }
  }

  // Verificar lembretes pendentes (deve ser chamado periodicamente)
  async processarLembretes() {
    if (!this.config?.ativo) return;

    try {
      const agora = new Date();
      const em24h = addHours(agora, 24);
      
      // Buscar agendamentos que precisam de lembrete
      const agendamentos = await Agendamento.filter({
        status: ['agendado', 'confirmado']
      });

      const agendamentosParaLembrete = agendamentos.filter(agendamento => {
        const dataAgendamento = new Date(agendamento.data_hora);
        const diff = dataAgendamento.getTime() - agora.getTime();
        const horasRestantes = diff / (1000 * 60 * 60);
        
        // Enviar lembrete entre 22-26 horas antes
        return horasRestantes >= 22 && horasRestantes <= 26;
      });

      const resultados = [];
      for (const agendamento of agendamentosParaLembrete) {
        // Verificar se já foi enviado lembrete
        const jaEnviado = await MensagemWhatsApp.filter({
          agendamento_id: agendamento.id,
          tipo_mensagem: 'lembrete',
          status_envio: 'enviada'
        });

        if (jaEnviado.length === 0) {
          const resultado = await this.enviarLembrete(agendamento);
          resultados.push({ agendamento: agendamento.id, resultado });
        }
      }

      return resultados;
    } catch (error) {
      console.error('Erro ao processar lembretes:', error);
      return [];
    }
  }

  // Verificar aniversários (deve ser chamado diariamente)
  async processarAniversarios() {
    if (!this.config?.ativo) return;

    try {
      const hoje = new Date();
      const clientes = await Cliente.list();

      const aniversariantes = clientes.filter(cliente => {
        if (!cliente.data_nascimento) return false;
        
        const nascimento = new Date(cliente.data_nascimento);
        const aniversarioEsteAno = new Date(hoje.getFullYear(), nascimento.getMonth(), nascimento.getDate());
        
        // Verificar se é aniversário hoje e se ainda não foi enviado este ano
        const ehAniversario = isSameDay(hoje, aniversarioEsteAno);
        const jaEnviadoEsteAno = cliente.ultimo_aniversario_enviado && 
          new Date(cliente.ultimo_aniversario_enviado).getFullYear() === hoje.getFullYear();
        
        return ehAniversario && !jaEnviadoEsteAno;
      });

      const resultados = [];
      for (const cliente of aniversariantes) {
        const resultado = await this.enviarAniversario(cliente);
        resultados.push({ cliente: cliente.id, resultado });
      }

      return resultados;
    } catch (error) {
      console.error('Erro ao processar aniversários:', error);
      return [];
    }
  }

  // Processar resposta do webhook
  async processarRespostaWebhook(dadosWebhook) {
    try {
      // Encontrar mensagem relacionada
      const mensagem = await MensagemWhatsApp.filter({
        webhook_id: dadosWebhook.key?.id
      });

      if (mensagem.length > 0) {
        const msg = mensagem[0];
        
        // Atualizar status baseado no tipo de evento
        let novoStatus = msg.status_envio;
        let resposta = null;

        switch (dadosWebhook.event) {
          case 'messages.upsert':
            if (dadosWebhook.data?.message) {
              novoStatus = 'respondida';
              resposta = dadosWebhook.data.message.conversation || 
                        dadosWebhook.data.message.extendedTextMessage?.text ||
                        'Resposta recebida';
            }
            break;
          case 'messages.update':
            if (dadosWebhook.data?.update?.status === 3) {
              novoStatus = 'lida';
            } else if (dadosWebhook.data?.update?.status === 2) {
              novoStatus = 'entregue';
            }
            break;
        }

        // Atualizar mensagem
        await MensagemWhatsApp.update(msg.id, {
          ...msg,
          status_envio: novoStatus,
          resposta_cliente: resposta,
          data_resposta: resposta ? new Date().toISOString() : msg.data_resposta
        });

        // Se foi um lembrete com resposta positiva, atualizar agendamento
        if (msg.tipo_mensagem === 'lembrete' && resposta && 
            (resposta.toLowerCase().includes('sim') || resposta.toLowerCase().includes('confirmo'))) {
          
          if (msg.agendamento_id) {
            await Agendamento.update(msg.agendamento_id, {
              status: 'confirmado'
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao processar resposta webhook:', error);
    }
  }

  async notificarProfissionalClienteChegou(agendamento) {
    try {
      // Esta seria a implementação para notificar o profissional
      console.log(`Cliente ${agendamento.cliente_nome} chegou para atendimento com ${agendamento.profissional}`);
      
      // Implementar envio de notificação via WhatsApp ou sistema interno
      // Por exemplo, enviar para o grupo de profissionais ou diretamente para o profissional responsável
      // Exemplo de como poderia ser se tivéssemos o telefone do profissional e um template:
      /*
      if (this.evolutionService && this.config?.ativo && agendamento.profissional_telefone) {
        const mensagemNotificacao = `⚠️ Cliente ${agendamento.cliente_nome} chegou para o agendamento de ${agendamento.servico} às ${format(new Date(agendamento.data_hora), "HH:mm")}.`;
        await this.evolutionService.enviarMensagem(agendamento.profissional_telefone, mensagemNotificacao);
        console.log(`Notificação enviada para ${agendamento.profissional_telefone}`);
      }
      */
      
      return true;
    } catch (error) {
      console.error('Erro ao notificar profissional:', error);
      return false;
    }
  }
}

// Instância global do manager
export const automacaoManager = new AutomacaoManager();
