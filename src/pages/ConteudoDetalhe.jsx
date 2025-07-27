import React, { useState, useEffect } from 'react';
import { ConteudoAcademy } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, PlayCircle, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function ConteudoDetalhe() {
  const [conteudo, setConteudo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      loadConteudo(id);
    } else {
      setError("ID do conteúdo não encontrado.");
      setIsLoading(false);
    }
  }, []);

  const loadConteudo = async (id) => {
    try {
      const data = await ConteudoAcademy.get(id);
      setConteudo(data);
    } catch (err) {
      setError("Conteúdo não encontrado.");
      console.error(err);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
        <div className="p-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="aspect-video w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
    )
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to={createPageUrl('Academy')} className="flex items-center gap-2 text-purple-600 hover:text-purple-800 mb-6">
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Academy
          </Link>

          <Card className="glass-effect border-0 premium-shadow">
            <CardHeader>
              <Badge className="self-start mb-2">{conteudo.categoria}</Badge>
              <CardTitle className="text-3xl font-bold">{conteudo.titulo}</CardTitle>
              <p className="text-gray-600">{conteudo.descricao}</p>
            </CardHeader>
            <CardContent>
              {conteudo.tipo === 'video' ? (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${conteudo.url_conteudo.split('v=')[1]}`}
                    title={conteudo.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="prose max-w-none p-4 bg-white/50 rounded-lg">
                  <p>Este é um artigo. O conteúdo completo estaria aqui.</p>
                  <p>{conteudo.url_conteudo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}