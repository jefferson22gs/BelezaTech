import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Sparkles, Download, Palette, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { UploadFile, GenerateImage } from "@/api/integrations";

const estilosLogo = [
  { value: "moderno", label: "Moderno", desc: "Linhas limpas e tipografia sans-serif" },
  { value: "elegante", label: "Elegante", desc: "Sofisticado com detalhes refinados" },
  { value: "vintage", label: "Vintage", desc: "Retrô com elementos clássicos" },
  { value: "minimalista", label: "Minimalista", desc: "Simples e clean" },
  { value: "colorido", label: "Colorido", desc: "Vibrante e chamativo" }
];

export default function OnboardingLogo({ data, updateData, onNext, onPrev, isFirstStep }) {
  const [activeTab, setActiveTab] = useState("upload");
  const [nomeParaLogo, setNomeParaLogo] = useState(data.nome_salao || "");
  const [estiloSelecionado, setEstiloSelecionado] = useState(data.estilo_logo || "moderno");
  const [logosGerados, setLogosGerados] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (data.nome_salao !== nomeParaLogo) {
      setNomeParaLogo(data.nome_salao);
    }
  }, [data.nome_salao]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setNomeParaLogo(newName);
    updateData({ nome_salao: newName });
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const { file_url } = await UploadFile({ file });
      updateData({ logo_url: file_url });
    } catch (error) {
      setError("Erro ao fazer upload do logo. Tente novamente.");
    }

    setIsUploading(false);
  };

  const gerarLogos = async () => {
    if (!data.nome_salao.trim()) {
      setError("Digite o nome do salão para gerar o logo");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const estilo = estilosLogo.find(e => e.value === estiloSelecionado);
      const prompt = `Create a professional logo for a beauty salon called "${data.nome_salao}". Style: ${estilo.desc}. The logo should be clean, modern, and suitable for a beauty/hair salon business. Include salon-related elements like scissors, hair, or beauty symbols. High quality, vector-style design with a transparent background.`;

      const logos = [];
      
      for (let i = 0; i < 3; i++) {
        const { url } = await GenerateImage({ 
          prompt: prompt + ` Variation ${i + 1}. ${i === 0 ? 'More elegant and luxurious' : i === 1 ? 'More modern and minimalist' : 'More playful and creative'}`
        });
        logos.push({
          id: i,
          url: url,
          style: i === 0 ? 'Elegante' : i === 1 ? 'Moderno' : 'Criativo'
        });
      }

      setLogosGerados(logos);
    } catch (error) {
      setError("Erro ao gerar logos. Tente novamente.");
    }

    setIsGenerating(false);
  };

  const selecionarLogo = (logoUrl) => {
    updateData({ 
      logo_url: logoUrl,
      estilo_logo: estiloSelecionado
    });
  };

  const podeAvancar = data.logo_url && data.nome_salao;

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Identidade Visual do Seu Salão
        </h2>
        <p className="text-lg text-gray-600">
          Faça upload do seu logo existente ou deixe nossa IA criar um para você
        </p>
      </motion.div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-lg p-1 shadow-lg border">
          <Button
            variant={activeTab === "upload" ? "default" : "ghost"}
            onClick={() => setActiveTab("upload")}
            className={activeTab === "upload" ? "bg-purple-500 text-white" : ""}
          >
            <Upload className="w-4 h-4 mr-2" />
            Fazer Upload
          </Button>
          <Button
            variant={activeTab === "generate" ? "default" : "ghost"}
            onClick={() => setActiveTab("generate")}
            className={activeTab === "generate" ? "bg-purple-500 text-white" : ""}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Gerar com IA
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Configurações */}
        <div className="lg:col-span-2">
          {activeTab === "upload" ? (
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-purple-500" />
                  Upload do Logo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Nome do Salão</Label>
                  <Input
                    value={nomeParaLogo}
                    onChange={handleNameChange}
                    placeholder="Digite o nome do seu salão"
                    className="h-12"
                  />
                </div>

                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  
                  {isUploading ? (
                    <div className="space-y-3">
                      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-gray-600">Fazendo upload...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto">
                        <Upload className="w-8 h-8 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-lg font-medium text-gray-700 mb-1">
                          Clique para fazer upload
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG ou SVG até 5MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-effect border-0 premium-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Gerador de Logo IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Nome do Salão</Label>
                  <Input
                    value={nomeParaLogo}
                    onChange={handleNameChange}
                    placeholder="Digite o nome do seu salão"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Estilo do Logo</Label>
                  <Select value={estiloSelecionado} onValueChange={setEstiloSelecionado}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {estilosLogo.map(estilo => (
                        <SelectItem key={estilo.value} value={estilo.value}>
                          <div>
                            <div className="font-medium">{estilo.label}</div>
                            <div className="text-xs text-gray-500">{estilo.desc}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={gerarLogos}
                  disabled={isGenerating || !data.nome_salao.trim()}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                >
                  {isGenerating ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Gerando logos...
                    </div>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Gerar Logos
                    </>
                  )}
                </Button>

                {/* Logos Gerados */}
                {logosGerados.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Escolha seu logo:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {logosGerados.map((logo) => (
                        <motion.div
                          key={logo.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: logo.id * 0.1 }}
                          className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                            data.logo_url === logo.url 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => selecionarLogo(logo.url)}
                        >
                          <img
                            src={logo.url}
                            alt={`Logo ${logo.style}`}
                            className="w-full h-24 object-contain mb-2"
                          />
                          <div className="text-center">
                            <Badge variant="outline" className="text-xs">
                              {logo.style}
                            </Badge>
                          </div>
                          {data.logo_url === logo.url && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center">
                              ✓
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="glass-effect border-0 premium-shadow sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-500" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.logo_url ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <img
                      src={data.logo_url}
                      alt="Logo preview"
                      className="max-w-full max-h-32 mx-auto object-contain"
                    />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {data.nome_salao || "Seu Salão"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Logo selecionado com sucesso!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    Seu logo aparecerá aqui
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botões de navegação */}
      <div className="flex justify-between mt-12">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isFirstStep}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <Button
          onClick={onNext}
          disabled={!podeAvancar}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white flex items-center gap-2"
        >
          Próximo
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}