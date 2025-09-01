import React from 'react';
import Footer from '../components/FooterPage';
const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-orange-500 mb-6">
          Política de Privacidade
        </h1>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 text-gray-300 leading-relaxed">
          <p className="mb-4">
            A sua privacidade é importante para nós. Esta Política de Privacidade explica como a RD Power Nutrition recolhe, usa e protege as suas informações pessoais quando visita o nosso site.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Recolha de Informações</h2>
          <p className="mb-4">
            Recolhemos informações que nos fornece diretamente, como nome, endereço de e-mail e dados de pagamento, ao fazer uma compra ou ao subscrever a nossa newsletter. Também recolhemos dados de forma automática, como o seu endereço IP e informações do seu navegador, para melhorar a sua experiência no site.
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Uso das Informações</h2>
          <p className="mb-4">
            Utilizamos as informações recolhidas para processar as suas encomendas, gerir a sua conta, enviar comunicações de marketing (com o seu consentimento) e melhorar os nossos serviços.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Partilha de Informações</h2>
          <p className="mb-4">
            Não vendemos ou alugamos as suas informações pessoais a terceiros. Podemos partilhar dados com fornecedores de serviços (como empresas de envio ou processadores de pagamento) que nos ajudam a operar o nosso negócio, mas apenas na medida necessária para a prestação desses serviços.
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

export default PrivacyPolicyPage;