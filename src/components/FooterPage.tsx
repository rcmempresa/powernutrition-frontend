import React from 'react';
import { Instagram, MapPin, User, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 lg:py-20">
        <div className="flex flex-wrap lg:flex-nowrap justify-between gap-8 lg:gap-12">
          {/* Coluna 1: Logo e Descrição */}
          <div className="flex-1 min-w-[200px] max-w-sm space-y-6">
            <div className="flex items-center">
              <img
                src="/rd_power.png"
                alt="RD Power Nutrition Logo"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              RD Power® foi fundada com a convicção de que o bem-estar é mais do que uma simples necessidade — é uma poderosa expressão de autocuidado e vitalidade.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.instagram.com/rdpower.nutrition/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Siga-nos no Instagram"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
              >
                <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
              </a>
            </div>
          </div>

          {/* Coluna 2: Links Rápidos */}
          <div className="flex-1 min-w-[150px]">
            <h3 className="text-lg font-bold text-gray-100 mb-6">Links Rápidos</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><a href="/produtos" className="hover:text-orange-500 transition-colors">Produtos</a></li>
              <li><a href="/sobre-nos" className="hover:text-orange-500 transition-colors">Sobre nós</a></li>
              <li><a href="/perguntas-frequentes" className="hover:text-orange-500 transition-colors">Perguntas Frequentes</a></li>
              <li><a href="/contacto" className="hover:text-orange-500 transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Coluna 3: Contacto */}
          <div className="flex-1 min-w-[150px]">
            <h3 className="text-lg font-bold text-gray-100 mb-6">Contacto</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 flex-shrink-0 text-orange-500" />
                <span>Caminho Poço Barral, N28, Funchal, Madeira</span>
              </li>
              <li className="flex items-center">
                <User className="w-5 h-5 mr-3 text-orange-500" />
                <span>+351 935708047</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-orange-500" />
                <span>geral@rdpowernutrition.pt</span>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Informações Legais */}
          <div className="flex-1 min-w-[150px]">
            <h3 className="text-lg font-bold text-gray-100 mb-6">Informações Legais</h3>
            <ul className="space-y-3 text-gray-300 text-sm">
              <li><a href="/termos-de-servico" className="hover:text-orange-500 transition-colors">Termos de Serviço</a></li>
              <li><a href="/politica-de-privacidade" className="hover:text-orange-500 transition-colors">Política de Privacidade</a></li>
              <li><a href="/politica-de-devolucao" className="hover:text-orange-500 transition-colors">Política de Devolução</a></li>
              <li><a href="/metodos-de-envio" className="hover:text-orange-500 transition-colors">Métodos de Envio</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-500 text-sm space-y-4">
          <p className="font-bold text-gray-400">
            Desenvolvido pela
            <a href="https://1way.pt" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 transition-colors ml-1 underline">1way.pt</a>
          </p>
          <p>
            &copy; {new Date().getFullYear()} RD Power Nutrition. Todos os direitos reservados.
          </p>
          <p>
            Os preços apresentados no site incluem IVA à taxa legal em vigor.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;