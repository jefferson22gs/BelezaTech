import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Calendar, CreditCard, AlertTriangle } from "lucide-react";
import { mercadoPago } from "../.@/api/functions/mercadoPago";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StatusAssinatura() {
  const [assinatura, setAssinatura] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAssinatura();
  }, []);

  const loadAssinatura = async () => {
    try {
      const response = await mercadoPago({ action: 'get_subscription_status' });
      setAssinatura(response.data);
    } catch (error) {
      console.error("Erro ao carregar assinatura:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = async () => {
    if (window.confirm("Tem certeza que deseja cancelar sua assinatura?")) {
      try {
        await mercadoPago({ action: 'cancel_subscription' });
        loadAssinatura();
      } catch (error) {
        console.error("Erro ao cancelar:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="glass-effect border-0 premium-shadow">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assinatura) return null;

  const diasRestantes = assinatura.data_fim_assinatura ? 
    differenceInDays(new Date(assinatura.data_fim_assinatura), new Date()) : 0;

  const statusColors = {
    ativo: "bg-green-100 text-green-800",
    pendente: "bg-yellow-100 text-yellow-800",
    cancelado: "bg-red-100 text-red-800",
    inadimplente: "bg-red-100 text-red-800"
  };

  return (
    <Card className="glass-effect border-0 premium-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-500" />
          Status da Assinatura
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Plano Atual</p>
            <p className="font-semibold text-lg">BelezaTech Infinite</p>
          </div>
          <Badge className={statusColors[assinatura.status]}>
            {assinatura.status}
          </Badge>
        </div>

        {assinatura.plano === 'trial' && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Período de Teste</span>
            </div>
            <p className="text-sm text-yellow-700">
              Seu trial expira em {differenceInDays(new Date(assinatura.data_fim_trial), new Date())} dias
            </p>
          </div>
        )}

        {assinatura.status === 'ativo' && assinatura.data_fim_assinatura && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Próxima cobrança: {format(new Date(assinatura.data_fim_assinatura), "d 'de' MMMM", { locale: ptBR })}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CreditCard className="w-4 h-4" />
          <span>R$ 49,99/mês</span>
        </div>

        {assinatura.status === 'ativo' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCancelar}
            className="w-full"
          >
            Cancelar Assinatura
          </Button>
        )}
      </CardContent>
    </Card>
  );
}