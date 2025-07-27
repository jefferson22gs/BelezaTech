export class EvolutionService {
  constructor(config) {
    this.apiUrl = config.api_url;
    this.apiKey = config.api_key;
    this.instanceName = config.nome_instancia;
    this.webhookUrl = config.webhook_url;
  }

  // Criar instância
  async criarInstancia() {
    try {
      const response = await fetch(`${this.apiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify({
          instanceName: this.instanceName,
          token: this.apiKey,
          qrcode: true,
          markMessagesRead: true,
          delMessagesOnAck: false,
          syncFullHistory: false,
          webhookUrl: this.webhookUrl,
          webhookByEvents: true,
          webhookBase64: false,
          chatwootAccountId: null,
          chatwootToken: null,
          chatwootUrl: null,
          chatwootSignMsg: false,
          chatwootReopenConversation: false,
          chatwootConversationPending: false
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar instância: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao criar instância:', error);
      throw error;
    }
  }

  // Conectar instância e obter QR Code
  async conectarInstancia() {
    try {
      const response = await fetch(`${this.apiUrl}/instance/connect/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao conectar instância: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao conectar instância:', error);
      throw error;
    }
  }

  // Verificar status da instância
  async verificarStatus() {
    try {
      const response = await fetch(`${this.apiUrl}/instance/connectionState/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao verificar status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      throw error;
    }
  }

  // Obter QR Code
  async obterQRCode() {
    try {
      const response = await fetch(`${this.apiUrl}/instance/qrcode/${this.instanceName}`, {
        method: 'GET',
        headers: {
          'apikey': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter QR Code: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      throw error;
    }
  }

  // Enviar mensagem de texto
  async enviarMensagem(numero, mensagem) {
    try {
      const response = await fetch(`${this.apiUrl}/message/sendText/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify({
          number: this.formatarNumero(numero),
          textMessage: {
            text: mensagem
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
    }
  }

  // Enviar mensagem com botões
  async enviarMensagemComBotoes(numero, mensagem, botoes) {
    try {
      const response = await fetch(`${this.apiUrl}/message/sendButtons/${this.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey
        },
        body: JSON.stringify({
          number: this.formatarNumero(numero),
          buttonsMessage: {
            text: mensagem,
            buttons: botoes.map((botao, index) => ({
              buttonId: `btn_${index}`,
              buttonText: { displayText: botao },
              type: 1
            })),
            headerType: 1
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar mensagem com botões: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem com botões:', error);
      throw error;
    }
  }

  // Desconectar instância
  async desconectarInstancia() {
    try {
      const response = await fetch(`${this.apiUrl}/instance/logout/${this.instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao desconectar instância: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao desconectar instância:', error);
      throw error;
    }
  }

  // Deletar instância
  async deletarInstancia() {
    try {
      const response = await fetch(`${this.apiUrl}/instance/delete/${this.instanceName}`, {
        method: 'DELETE',
        headers: {
          'apikey': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar instância: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao deletar instância:', error);
      throw error;
    }
  }

  // Formatar número para padrão internacional
  formatarNumero(numero) {
    // Remove todos os caracteres não numéricos
    let numeroLimpo = numero.replace(/\D/g, '');
    
    // Se não tem código do país, adiciona +55 (Brasil)
    if (numeroLimpo.length === 11 && numeroLimpo.startsWith('11')) {
      numeroLimpo = '55' + numeroLimpo;
    } else if (numeroLimpo.length === 10) {
      numeroLimpo = '5511' + numeroLimpo;
    }
    
    return numeroLimpo + '@s.whatsapp.net';
  }
}