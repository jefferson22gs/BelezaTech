import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SalaoConfig } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

import OnboardingWelcome from "../components/onboarding/OnboardingWelcome";
import OnboardingLogo from "../components/onboarding/OnboardingLogo";
import OnboardingTema from "../components/onboarding/OnboardingTema";
import OnboardingConclusao from "../components/onboarding/OnboardingConclusao";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [onboardingData, setOnboardingData] = useState({
    nome_salao: "",
    logo_url: "",
    estilo_logo: "moderno",
    cores_tema: {
      primaria: "#8b5cf6",
      secundaria: "#a855f7",
      acento: "#fbbf24",
      texto: "#1f2937",
      fundo: "#ffffff",
    },
  });

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
        
        if (!userData.plano) {
          await User.updateMyUserData({
            plano: "trial",
            status_assinatura: "ativo",
            data_fim_trial: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            onboarding_completo: false
          });
        }
        
        // Preencher nome do salão se for o primeiro acesso
        if (!onboardingData.nome_salao && userData.full_name) {
          updateOnboardingData({ nome_salao: `Salão de ${userData.full_name.split(' ')[0]}` });
        }

      } catch (error) {
        console.error("Erro ao inicializar usuário:", error);
        await User.loginWithRedirect(window.location.origin + '/Onboarding');
      }
    };

    initializeUser();
  }, []);

  const updateOnboardingData = (newData) => {
    setOnboardingData(prev => ({ ...prev, ...newData }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);
    try {
      const finalData = { ...onboardingData, onboarding_completo: true };

      const existingConfigs = await SalaoConfig.filter({ created_by: user.email });
      if (existingConfigs.length > 0) {
        await SalaoConfig.update(existingConfigs[0].id, finalData);
      } else {
        await SalaoConfig.create(finalData);
      }

      await User.updateMyUserData({
        onboarding_completo: true
      });
      
      navigate(createPageUrl("Dashboard"));
    } catch (error) {
      console.error("Erro ao completar onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4 mx-auto">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Passo {currentStep} de 4
              </span>
              <span className="text-sm text-gray-500">
                {Math.round((currentStep / 4) * 100)}% completo
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                initial={{ width: "25%" }}
                animate={{ width: `${(currentStep / 4) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Steps */}
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <OnboardingWelcome
                key="welcome"
                user={user}
                onNext={nextStep}
              />
            )}
            {currentStep === 2 && (
              <OnboardingLogo
                key="logo"
                data={onboardingData}
                updateData={updateOnboardingData}
                onNext={nextStep}
                onPrev={prevStep}
                isFirstStep={false}
              />
            )}
            {currentStep === 3 && (
              <OnboardingTema
                key="tema"
                data={onboardingData}
                updateData={updateOnboardingData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 4 && (
              <OnboardingConclusao
                key="conclusao"
                data={onboardingData}
                onPrev={prevStep}
                onFinish={completeOnboarding}
                isLoading={isLoading}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}