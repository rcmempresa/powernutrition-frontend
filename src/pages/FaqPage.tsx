import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Footer from '../components/FooterPage';

const faqData = [
  {
    question: "Como faço uma encomenda?",
    answer: "Para fazer uma encomenda, basta navegar pelos nossos produtos, adicioná-los ao carrinho e seguir para o checkout. Preencha os seus dados de envio e pagamento para finalizar a compra."
  },
  {
    question: "Quais os métodos de pagamento aceites?",
    answer: "Aceitamos pagamentos por cartão de crédito (Visa, Mastercard), PayPal e MBWay."
  },
  {
    question: "Qual o prazo de entrega?",
    answer: "O prazo de entrega é de 2 a 5 dias úteis, dependendo da sua localização. Após a confirmação do pagamento, receberá um e-mail com o código de rastreamento da sua encomenda."
  },
  {
    question: "Posso devolver um produto?",
    answer: "Sim, pode devolver qualquer produto no prazo de 14 dias após a receção, desde que esteja selado e na sua embalagem original. Por favor, consulte a nossa Política de Devolução para mais detalhes."
  },
  {
    question: "Os produtos são veganos?",
    answer: "Alguns dos nossos produtos são veganos. Para saber se um produto específico é adequado para a sua dieta, verifique a descrição na página do produto."
  }
];

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-700 py-4">
      <button
        className="flex justify-between items-center w-full text-left text-lg font-semibold text-white hover:text-orange-500 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-orange-500' : ''}`} />
      </button>
      <div
        className={`mt-2 transition-all duration-300 ease-in-out overflow-hidden text-gray-400 ${isOpen ? 'max-h-96 opacity-100 pt-2' : 'max-h-0 opacity-0'}`}
      >
        <p>{answer}</p>
      </div>
    </div>
  );
};

const FaqPage = () => {
  return (
    <div className="bg-gray-900 text-white min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-orange-500 mb-6">
          Perguntas Frequentes
        </h1>
        <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
          Encontre as respostas para as suas dúvidas mais comuns. Se não encontrar o que procura, entre em contacto connosco.
        </p>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 md:p-8">
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FaqPage;