import React from 'react';
import Footer from '../components/FooterPage';
const ShippingMethodsPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-orange-500 mb-6">
          Métodos de Envio
        </h1>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 text-gray-300 leading-relaxed">
          <p className="mb-4">
            Na RD Power Nutrition, garantimos que a sua encomenda chega de forma rápida e segura. Abaixo, pode encontrar os nossos métodos de envio e prazos estimados.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Prazos de Envio</h2>
          <ul className="list-disc list-inside mb-4 space-y-2">
            <li><strong>Portugal Continental:</strong> 4 a 7 dias úteis.</li>
            <li><strong>Ilhas (Açores e Madeira):</strong> 2 a 3 dias úteis.</li>
            <li><strong>Europa:</strong> 5 a 10 dias úteis.</li>
          </ul>
          <p className="mb-4">
            Os prazos de entrega são estimados e podem variar em períodos de maior tráfego (por exemplo, feriados). Todas as encomendas são processadas e enviadas no prazo de 24 a 48 horas após a confirmação do pagamento.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Custos de Envio</h2>
          <p className="mb-4">
            Os custos de envio são calculados no checkout, com base no peso da encomenda e na morada de entrega.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Rastreamento da Encomenda</h2>
          <p className="mb-4">
            Após o envio da sua encomenda, receberá um e-mail com um código de rastreamento. Pode usar este código para acompanhar o estado da sua entrega no site da transportadora.
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

export default ShippingMethodsPage;