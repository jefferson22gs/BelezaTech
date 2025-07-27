import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ShieldCheck, CreditCard, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Header from '../components/landing/Header';
import { mercadoPago } from '.@/api/functions/mercadoPago';

const features = [
  'Comece com 15 dias de teste gratuito',
  'Acesso a todas as funcionalidades',
  'Suporte prioritário incluso',
  'Cancele a qualquer momento'
];

export default function Assinatura() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTokenValid, setIsTokenValid] = useState(null);
  
  // Verificar se há parâmetros de retorno do pagamento
  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');

  useEffect(() => {
    // Validar token do Mercado Pago ao carregar a página
    validateMercadoPagoToken();
  }, []);

  const validateMercadoPagoToken = async () => {
    try {
      const response = await mercadoPago({ action: 'validate_token' });
      if (response.status === 200) {
        setIsTokenValid(true);
      } else {
        setIsTokenValid(false);
        setError('Configuração do Mercado Pago pendente. Entre em contato com o suporte.');
      }
    } catch (err) {
      setIsTokenValid(false);
      setError('Não foi possível validar a configuração de pagamento.');
    }
  };

  const handleAssinar = async () => {
    if (!isTokenValid) {
      setError('Sistema de pagamento não configurado. Entre em contato com o suporte.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await mercadoPago({
        action: 'create_subscription',
        plan: 'infinite'
      });
      
      if (response.status === 200 && response.data.success) {
        const { checkout_url } = response.data;
        window.location.href = checkout_url;
      } else {
        throw new Error(response.data.error || 'Erro ao criar preferência de pagamento');
      }
    } catch (err) {
      console.error('Erro ao processar assinatura:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Erro desconhecido';
      
      if (errorMessage.toLowerCase().includes('token')) {
        setError('Erro de configuração do Mercado Pago. Verifique as credenciais ou entre em contato com o suporte.');
      } else {
        setError(`Erro ao processar pagamento: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-6 py-12 md:py-24 flex justify-center">
        <Card className="max-w-lg shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Quase lá!</CardTitle>
            <CardDescription className="text-lg">Complete sua assinatura e transforme seu salão.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status de configuração */}
            {isTokenValid === false && (
              <Alert variant="destructive">
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Sistema de pagamento em configuração. Entre em contato com o suporte para ativar sua conta.
                </AlertDescription>
              </Alert>
            )}

            {/* Alertas de status de pagamento */}
            {paymentStatus === 'success' && (
              <Alert className="border-green-200 bg-green-50">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Pagamento aprovado! Sua assinatura está ativa.
                </AlertDescription>
              </Alert>
            )}
            
            {paymentStatus === 'failure' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Pagamento não foi aprovado. Tente novamente.
                </AlertDescription>
              </Alert>
            )}
            
            {paymentStatus === 'pending' && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Pagamento pendente. Aguarde a confirmação.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="p-6 rounded-lg bg-purple-50 border border-purple-200 text-center">
                <p className="text-purple-800">Plano <span className="font-bold">BelezaTech Infinite</span></p>
                <p className="text-4xl font-extrabold text-purple-900">R$49,99<span className="text-lg font-normal text-gray-600">/mês</span></p>
                <p className="text-sm text-purple-600 mt-2">Primeiros 15 dias grátis</p>
            </div>
            
            <ul className="space-y-3">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white h-12 text-lg" 
              onClick={handleAssinar} 
              disabled={isLoading || isTokenValid === false}
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {isLoading ? 'Processando...' : 
               isTokenValid === false ? 'Sistema em Configuração' : 
               'Assinar com Mercado Pago'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-4 h-4 text-gray-400" />
              <span>Pagamento seguro e processado pelo Mercado Pago.</span>
            </div>

            <div className="text-center">
              <Link to={createPageUrl('LandingPage')} className="text-purple-600 hover:text-purple-800 text-sm">
                ← Voltar para a página inicial
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-gray-500 text-center">
              Você será redirecionado para o ambiente seguro do Mercado Pago para finalizar a transação. Seus dados de pagamento não são armazenados em nossos servidores. A assinatura será renovada automaticamente e pode ser cancelada a qualquer momento no seu painel.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}