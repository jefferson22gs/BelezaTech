import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Phone, User, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClienteCard({ cliente, onEdit }) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(createPageUrl(`ClienteDetalhe?id=${cliente.id}`));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className="glass-effect border-0 premium-shadow hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={cliente.foto_perfil} />
            <AvatarFallback className="bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold">
              {cliente.nome?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{cliente.nome}</h3>
            {cliente.status === 'vip' && (
              <Badge className="mt-1 bg-yellow-100 text-yellow-800 border-yellow-200">
                <Star className="w-3 h-3 mr-1" />
                VIP
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Phone className="w-4 h-4" />
              <span>{cliente.telefone}</span>
            </div>
            {cliente.tags && cliente.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {cliente.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="w-full" onClick={handleViewProfile}>
              <User className="w-4 h-4 mr-2" /> Ver Perfil
            </Button>
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Edit className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}