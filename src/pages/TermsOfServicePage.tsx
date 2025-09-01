import React from 'react';
import Footer from '../components/FooterPage';
const TermsOfServicePage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-orange-500 mb-6">
          Termos de Serviço
        </h1>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 text-gray-300 leading-relaxed">
          <p className="mb-4">
            Bem-vindo à RD Power Nutrition. Ao utilizar o nosso site e serviços, concorda em cumprir e ficar vinculado aos seguintes termos e condições. Por favor, leia-os atentamente.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Uso do Serviço</h2>
          <p className="mb-4">
            O nosso site e serviços são apenas para o seu uso pessoal e não comercial. Não pode modificar, copiar, distribuir, transmitir, exibir, executar, reproduzir, publicar, licenciar, criar trabalhos derivados, transferir ou vender qualquer informação, software, produtos ou serviços obtidos através do nosso site.
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Propriedade Intelectual</h2>
          <p className="mb-4">
            Todo o conteúdo e materiais do site, incluindo, sem limitação, texto, gráficos, logotipos, ícones de botões, imagens, clipes de áudio, downloads digitais e compilações de dados, são propriedade da RD Power Nutrition ou dos seus fornecedores de conteúdo e estão protegidos por leis de direitos de autor nacionais e internacionais.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Limitação de Responsabilidade</h2>
          <p className="mb-4">
            A RD Power Nutrition não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de usar o nosso site ou dos produtos comprados através dele.
          </p>

          {/* Adicione mais seções conforme necessário */}
          <p className="mt-8 text-sm text-gray-500">
            Última atualização: {new Date().toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfServicePage;