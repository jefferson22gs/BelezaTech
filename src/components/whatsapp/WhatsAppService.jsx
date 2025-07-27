// Serviço para integração com WhatsApp
import { ConfigWhatsApp } from "@/api/entities";
import { MensagemWhatsApp } from "@/api/entities";
import { Agendamento } from "@/api/entities";
import { Cliente } from "@/api/entities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

class WhatsAppService {
  constructor() {
    this.config = null;
  }

  async getConfig() {
    if (!this.config) {
      const configs = await ConfigWhatsApp.list();
      this.config = configs.length > 0 ? configs[0] : null;
    }
    return this.config;
  }

  async enviarMensagem(telefone, mensagem, tipo, agendamentoId = null, clienteNome = "") {
    const config = await this.getConfig();
    
    if (!config || !config.ativo || config.status !== "conectado") {
      console.log("WhatsApp não configurado ou inativo");
      return false;
    }

    try {
      // Simular envio da mensagem via API do provedor
      const response = await this.simularEnvioAPI(config, telefone, mensagem);
      
      // Registrar a mensagem enviada
      const mensagemRecord = {
        agendamento_id: agendamentoId,
        cliente_telefone: telefone,
        cliente_nome: clienteNome,
        tipo_mensagem: tipo,
        conteudo: mensagem,
        status_envio: response.success ? "enviada" : "erro",
        data_envio: new Date().toISOString(),
        webhook_id: response.id || null,
        erro_detalhes: response.error || null
      };

      await MensagemWhatsApp.create(mensagemRecord);
      
      return response.success;
    } catch (error) {
      console.error("Erro ao enviar mensagem WhatsApp:", error);
      
      // Registrar erro
      await MensagemWhatsApp.create({
        cliente_telefone: telefone,
        cliente_nome: clienteNome,
        tipo_mensagem: tipo,
        conteudo: mensagem,
        status_envio: "erro",
        data_envio: new Date().toISOString(),
        erro_detalhes: error.message
      });
      
      return false;
    }
  }

  async simularEnvioAPI(config, telefone, mensagem) {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular sucesso na maioria dos casos
    const success = Math.random() > 0.1; // 90% de sucesso
    
    return {
      success,
      id: success ? `msg_${Date.now()}` : null,
      error: success ? null : "Número inválido ou indisponível"
    };
  }

  async enviarConfirmacaoAgendamento(agendamento) {
    const config = await this.getConfig();
    if (!config || !config.mensagem_confirmacao) return false;

    const cliente = await Cliente.get(agendamento.cliente_id);
    if (!cliente || !cliente.aceita_whatsapp) return false;

    const mensagem = this.processarTemplate(config.mensagem_confirmacao, {
      nome: agendamento.cliente_nome,
      data: format(new Date(agendamento.data_hora), "EEEE, d 'de' MMMM", { locale: ptBR }),
      horario: format(new Date(agendamento.data_hora), "HH:mm"),
      servico: agendamento.servico,
      profissional: agendamento.profissional,
      valor: `R$ ${agendamento.valor?.toFixed(2)}`,
      nome_salao: "Seu Salão"
    });

    return await this.enviarMensagem(
      agendamento.cliente_telefone,
      mensagem,
      "confirmacao",
      agendamento.id,
      agendamento.cliente_nome
    );
  }

  async enviarLembreteAgendamento(agendamento) {
    const config = await this.getConfig();
    if (!config || !config.mensagem_lembrete) return false;

    const cliente = await Cliente.get(agendamento.cliente_id);
    if (!cliente || !cliente.aceita_whatsapp) return false;

    const mensagem = this.processarTemplate(config.mensagem_lembrete, {
      nome: agendamento.cliente_nome,
      data: format(new Date(agendamento.data_hora), "EEEE, d 'de' MMMM", { locale: ptBR }),
      horario: format(new Date(agendamento.data_hora), "HH:mm"),
      servico: agendamento.servico,
      profissional: agendamento.profissional
    });

    return await this.enviarMensagem(
      agendamento.cliente_telefone,
      mensagem,
      "lembrete",
      agendamento.id,
      agendamento.cliente_nome
    );
  }

  async enviarParabensAniversario(cliente) {
    const config = await this.getConfig();
    if (!config || !config.mensagem_aniversario) return false;

    if (!cliente.aceita_whatsapp) return false;

    // Verificar se já enviou parabéns este ano
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const ultimoEnvio = cliente.ultimo_aniversario_enviado;
    
    if (ultimoEnvio && new Date(ultimoEnvio).getFullYear() === anoAtual) {
      return false; // Já enviou este ano
    }

    const mensagem = this.processarTemplate(config.mensagem_aniversario, {
      nome: cliente.nome,
      nome_salao: "Seu Salão",
      cupom: config.cupom_aniversario || "NIVER15",
      desconto: config.desconto_aniversario || 15
    });

    const sucesso = await this.enviarMensagem(
      cliente.telefone,
      mensagem,
      "aniversario",
      null,
      cliente.nome
    );

    if (sucesso) {
      // Atualizar data do último aniversário enviado
      await Cliente.update(cliente.id, {
        ultimo_aniversario_enviado: hoje.toISOString().split('T')[0]
      });
    }

    return sucesso;
  }

  processarTemplate(template, variaveis) {
    let mensagem = template;
    
    Object.keys(variaveis).forEach(key => {
      const placeholder = `{{${key}}}`;
      mensagem = mensagem.replace(new RegExp(placeholder, 'g'), variaveis[key]);
    });
    
    return mensagem;
  }

  async processarRespostaCliente(telefone, resposta, webhookId) {
    try {
      // Buscar a mensagem original pelo webhook ID
      const mensagens = await MensagemWhatsApp.filter({ webhook_id: webhookId });
      
      if (mensagens.length === 0) return;

      const mensagem = mensagens[0];
      
      // Atualizar status da mensagem
      await MensagemWhatsApp.update(mensagem.id, {
        status_envio: "respondida",
        resposta_cliente: resposta,
        data_resposta: new Date().toISOString()
      });

      // Se for resposta de lembrete, atualizar agendamento
      if (mensagem.tipo_mensagem === "lembrete" && mensagem.agendamento_id) {
        const respostaNormalizada = resposta.toLowerCase().trim();
        
        if (respostaNormalizada.includes("sim") || respostaNormalizada.includes("confirmo")) {
          await Agendamento.update(mensagem.agendamento_id, {
            status: "confirmado"
          });
        } else if (respostaNormalizada.includes("não") || respostaNormalizada.includes("cancelo")) {
          await Agendamento.update(mensagem.agendamento_id, {
            status: "cancelado"
          });
        }
      }

    } catch (error) {
      console.error("Erro ao processar resposta do cliente:", error);
    }
  }
}

// Instância singleton
const whatsAppService = new WhatsAppService();

export default whatsAppService;