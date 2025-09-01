import React from 'react';
import Footer from '../components/FooterPage';
const ReturnPolicyPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-orange-500 mb-6">
          Política de Devolução
        </h1>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8 text-gray-300 leading-relaxed">
          <p className="mb-4">
            Na RD Power Nutrition, a sua satisfação é a nossa prioridade. Se não estiver completamente satisfeito com a sua compra, consulte a nossa política de devolução abaixo.
          </p>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Prazo de Devolução</h2>
          <p className="mb-4">
            Tem um prazo de 14 dias após a receção da sua encomenda para solicitar uma devolução. Para ser elegível para uma devolução, o seu artigo deve estar sem uso, com o selo intacto e na mesma condição em que o recebeu.
          </p>
          
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Processo de Devolução</h2>
          <ol className="list-decimal list-inside mb-4 space-y-2">
            <li>Contacte-nos através do nosso e-mail geral@rdpowernutrition.pt para iniciar o processo de devolução, indicando o número da encomenda e o motivo.</li>
            <li>Após a nossa aprovação, embale o artigo com cuidado e envie-o para a morada que lhe indicaremos. Os custos de envio da devolução são da responsabilidade do cliente, a menos que o produto esteja com defeito.</li>
            <li>Assim que recebermos e inspecionarmos o artigo devolvido, processaremos o reembolso no prazo de 7 a 10 dias úteis.</li>
          </ol>

          <h2 className="text-2xl font-bold text-white mt-8 mb-4">3. Produtos Não-Elegíveis</h2>
          <p className="mb-4">
            Não aceitamos devoluções de produtos que tenham sido abertos ou cujo selo de segurança tenha sido violado.
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

export default ReturnPolicyPage;