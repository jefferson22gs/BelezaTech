import React, { useState, useEffect } from 'react';
import { ConteudoAcademy } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, BookOpen, Clock, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const categorias = {
  tecnicas_corte: { label: "Técnicas de Corte", color: "bg-blue-100 text-blue-800" },
  marketing_digital: { label: "Marketing Digital", color: "bg-purple-100 text-purple-800" },
  gestao_financeira: { label: "Gestão Financeira", color: "bg-green-100 text-green-800" },
  colorimetria: { label: "Colorimetria", color: "bg-red-100 text-red-800" },
  tendencias: { label: "Tendências", color: "bg-yellow-100 text-yellow-800" },
};

export default function Academy() {
  const [conteudos, setConteudos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    loadConteudos();
  }, []);

  const loadConteudos = async () => {
    setIsLoading(true);
    try {
      const data = await ConteudoAcademy.list();
      setConteudos(data);
    } catch (error) {
      console.error("Erro ao carregar conteúdos:", error);
    }
    setIsLoading(false);
  };

  const conteudosFiltrados = filtro === 'todos' 
    ? conteudos 
    : conteudos.filter(c => c.categoria === filtro);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">BelezaTech Academy</h1>
          <p className="text-gray-600">Aprenda com os melhores especialistas e leve seu salão para o próximo nível.</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Badge
            onClick={() => setFiltro('todos')}
            className={`cursor-pointer transition-all ${filtro === 'todos' ? 'bg-purple-600 text-white' : 'bg-white'}`}
          >
            Todos
          </Badge>
          {Object.entries(categorias).map(([key, value]) => (
            <Badge
              key={key}
              onClick={() => setFiltro(key)}
              className={`cursor-pointer transition-all ${filtro === key ? 'bg-purple-600 text-white' : 'bg-white'}`}
            >
              {value.label}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
             Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="w-full h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardContent>
                </Card>
              ))
          ) : (
            conteudosFiltrados.map(conteudo => (
              <motion.div key={conteudo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.random() * 0.2 }}>
                <Link to={createPageUrl(`ConteudoDetalhe?id=${conteudo.id}`)}>
                    <Card className="glass-effect border-0 premium-shadow h-full flex flex-col hover:shadow-xl transition-all duration-300">
                        <CardHeader className="p-0 relative">
                            <img src={conteudo.thumbnail_url} alt={conteudo.titulo} className="w-full h-40 object-cover rounded-t-lg" />
                            <div className="absolute top-2 right-2">
                                <Badge className={categorias[conteudo.categoria].color}>{categorias[conteudo.categoria].label}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 flex-1 flex flex-col">
                            <h3 className="font-semibold text-lg text-gray-900 flex-1">{conteudo.titulo}</h3>
                            <p className="text-sm text-gray-600 mt-1">{conteudo.descricao}</p>
                        </CardContent>
                        <CardFooter className="p-4 flex justify-between items-center text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                {conteudo.tipo === 'video' ? <PlayCircle className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                                <span>{conteudo.tipo === 'video' ? 'Vídeo' : 'Artigo'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{conteudo.duracao_minutos} min</span>
                            </div>
                        </CardFooter>
                    </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}