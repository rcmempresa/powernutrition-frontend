import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Twitter, Instagram, Facebook, MapPin, User, ArrowRight } from 'lucide-react';
import Footer from '../components/FooterPage';

// ----------------------------------------------------
// Importe as imagens que você salvou
import multibancoLogo from '/multibanco.png';
import mbwayLogo from '/mbway.png';
import creditCardLogo from '/cartao.png';
// ----------------------------------------------------

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as {
    orderId: string;
    paymentMethod: string;
    paymentDetails?: {
      method: string;
      entity?: string;
      reference?: string;
      payment_id?: string;
      url?: string;
    };
    total_price: number;
    shipping_address: {
      address_line1: string;
      city: string;
      postal_code: string;
    };
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-500">Detalhes da encomenda não encontrados. Por favor, volte para o checkout.</p>
      </div>
    );
  }

  const { orderId, paymentMethod, paymentDetails, total_price, shipping_address } = state;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl w-full bg-white rounded-lg shadow-xl overflow-hidden md:p-12 p-8">
          <div className="flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
              Encomenda Confirmada!
            </h1>
            <p className="mt-2 text-xl text-gray-600">
              Obrigado pela sua compra.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              A sua encomenda #{orderId} foi processada com sucesso.
            </p>
          </div>

          {/* Detalhes do Pagamento (apenas para Multibanco) */}
          {paymentMethod === 'multibanco' && paymentDetails && (
            <div className="mt-8 border-t border-gray-200 pt-8 text-center">
              <img src={multibancoLogo} alt="Logótipo Multibanco" className="mx-auto h-16 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                Detalhes de Pagamento Multibanco
              </h2>
              <p className="mt-4 text-lg text-gray-700">
                Por favor, efetue o pagamento usando os seguintes dados:
              </p>
              <div className="mt-4 inline-block bg-gray-100 p-6 rounded-lg text-left">
                <p className="text-xl font-bold text-gray-800">
                  Entidade: <span className="font-mono text-red-500">{paymentDetails.entity}</span>
                </p>
                <p className="text-xl font-bold text-gray-800 mt-2">
                  Referência: <span className="font-mono text-red-500">{paymentDetails.reference}</span>
                </p>
                <p className="text-xl font-bold text-gray-800 mt-2">
                  Valor: <span className="font-mono text-red-500">€{total_price.toFixed(2)}</span>
                </p>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                O seu pedido será processado assim que o pagamento for recebido.
              </p>
            </div>
          )}
          
          {/* Detalhes do Pagamento (apenas para MBWay) */}
          {paymentMethod === 'mbway' && (
            <div className="mt-8 border-t border-gray-200 pt-8 text-center">
              <img src={mbwayLogo} alt="Logótipo MBWay" className="mx-auto h-16 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                Pagamento MBWay
              </h2>
              <p className="mt-4 text-lg text-gray-700">
                Foi enviada uma notificação para a sua app MBWay. Por favor, confirme o pagamento.
              </p>
              <p className="mt-4 text-sm text-gray-500">
                O seu pedido será processado assim que o pagamento for confirmado.
              </p>
            </div>
          )}

          {/* NOVO: Detalhes do Pagamento para Cartão de Crédito */}
          {paymentMethod === 'cc' && (
            <div className="mt-8 border-t border-gray-200 pt-8 text-center">
              <img src={creditCardLogo} alt="Logótipo Cartão de Crédito" className="mx-auto h-16 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">
                Pagamento por Cartão de Crédito
              </h2>
              <p className="mt-4 text-lg text-gray-700">
                O seu pagamento foi processado com sucesso.
              </p>
              
              {paymentDetails?.url && (
                <div className="mt-4">
                  <p className="text-md text-gray-500">
                    Se não foi redirecionado, clique no link abaixo:
                  </p>
                  <a
                    href={paymentDetails.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg text-blue-600 hover:underline font-bold"
                  >
                    Continuar para o Pagamento
                  </a>
                </div>
              )}
              
              <p className="mt-4 text-sm text-gray-500">
                Receberá um e-mail de confirmação em breve.
              </p>
            </div>
          )}

          {/* Resumo da Encomenda */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900">Resumo da Encomenda</h2>
            <div className="mt-4 space-y-4">
              <div className="flex justify-between text-gray-700">
                <span>Método de Pagamento</span>
                <span className="font-medium capitalize">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Total</span>
                <span className="font-bold text-xl text-red-500">€{total_price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Endereço de Envio */}
          {shipping_address && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900">Endereço de Envio</h2>
              <div className="mt-4 text-gray-700">
                <p>{shipping_address.address_line1}</p>
                <p>{shipping_address.city}, {shipping_address.postal_code}</p>
              </div>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/" className="text-lg text-red-500 hover:text-red-600 font-medium transition-colors">
              Voltar para a Loja
            </Link>
          </div>
        </div>
      </main>
      
      {/* Footer */}
     <Footer />
    </div>
  );
};

export default OrderConfirmationPage;