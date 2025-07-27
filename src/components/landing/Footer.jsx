import React from 'react';
import { Crown } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-8 text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <Crown className="w-6 h-6 text-purple-400" />
          <span className="text-xl font-bold">BelezaTech</span>
        </div>
        <p>&copy; {new Date().getFullYear()} BelezaTech. Todos os direitos reservados.</p>
        <p className="text-sm text-gray-400 mt-2">Feito para revolucionar o mercado da beleza.</p>
      </div>
    </footer>
  );
}