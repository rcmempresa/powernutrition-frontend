import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Footer from '../components/FooterPage';

// ✨ INTERFACE CORRIGIDA ✨
interface CartItem {
  id: string;
  product_name: string; // ✨ Propriedade 'name' do produto, usada na ProductPage
  price: number;
  quantity: number;
  image_url: string;
  flavor_name?: string; 
  product_image?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  rating: number;
  is_sold_out: boolean;
  product_image?: string;
}

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onBack: () => void;
  onCheckout: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ items, onUpdateQuantity, onRemoveItem, onBack, onCheckout }) => {
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Estados para os produtos "Pode Também Gostar"
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [loadingRandom, setLoadingRandom] = useState(true);
  const [errorRandom, setErrorRandom] = useState<string | null>(null);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - discount;

  const navigate = useNavigate();

  // Função para buscar produtos aleatórios - Mantida conforme solicitado
  const fetchRandomProducts = async () => {
    try {
      setLoadingRandom(true);
      setErrorRandom(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
      if (!response.ok) {
        throw new Error('Erro ao buscar a lista de produtos.');
      }
      const allProducts = await response.json();
      const shuffled = allProducts.sort(() => 0.5 - Math.random());
      setRandomProducts(shuffled.slice(0, 4));
    } catch (err) {
      console.error("Erro ao buscar produtos aleatórios:", err);
      setErrorRandom("Não foi possível carregar produtos relacionados.");
    } finally {
      setLoadingRandom(false);
    }
  };

  const handleApplyCoupon = async () => {
    setCouponError(null);
    if (!couponCode) {
      setCouponError("Por favor, insira um código de cupão.");
      return;
    }
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/coupons/apply`, {
        couponCode: couponCode,
        items: items.map(item => ({
          price: item.price,
          quantity: item.quantity
        }))
      });
      setDiscount(response.data.discount);
      toast.success('Cupão aplicado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao aplicar cupão:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao aplicar o cupão. Verifique o código.';
      setCouponError(errorMessage);
      setDiscount(0);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchRandomProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button 
              onClick={onBack}
              className="hover:text-orange-500 transition-colors"
            >
              Início
            </button>
            <span>/</span>
            <span className="text-gray-900">O Seu Carrinho de Compras</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {items.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center flex flex-col items-center justify-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">O seu carrinho está vazio</p>
                <button 
                  onClick={onBack}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Continuar Compras
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg overflow-hidden">
                {/* Tabela de itens do carrinho */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 uppercase tracking-wider">
                    <div className="col-span-6">Produto</div>
                    <div className="col-span-3 text-center">Quantidade</div>
                    <div className="col-span-3 text-right">Total</div>
                  </div>
                </div>

                {/* Itens do carrinho */}
                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center space-x-4 border-b border-gray-100 pb-4">
                        <img
                          src={item.product_image}
                          alt={item.name}
                          className="h-16 w-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          {/* ✨ ALTERAÇÃO: Nome e Sabor acima do preço */}
                          <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                          {item.flavor_name && (
                            <p className="text-sm text-gray-600">Sabor: {item.flavor_name}</p>
                          )}
                          <p className="text-orange-500 font-semibold">{item.price.toFixed(2)}€</p>
                          {/* FIM DA ALTERAÇÃO */}
                          
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              className="rounded-full bg-gray-100 p-1 hover:bg-gray-200"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="ml-4 text-red-500 hover:text-red-700 text-sm"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instruções de encomenda */}
            <div className="mt-8 bg-white rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Instruções especiais da encomenda</h3>
              <textarea
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Adicione instruções especiais para a sua encomenda..."
              />
            </div>
          </div>

          {/* Resumo da encomenda e cupão */}
          <div className="space-y-6">
            {/* Resumo do total */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumo da Encomenda</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-bold">€ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span className="font-medium">Desconto do Cupão</span>
                    <span className="font-bold">- € {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-2xl border-t border-gray-200 pt-4">
                  <span className="font-bold">TOTAL</span>
                  <span className="font-extrabold text-orange-500">€ {total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600">Impostos e envio calculados na finalização</p>
              </div>
              
              <button 
                onClick={onCheckout}
                className="w-full bg-orange-500 text-white py-4 rounded-lg font-medium text-lg hover:bg-orange-600 transition-colors mt-6"
              >
                FINALIZAR COMPRA
              </button>
            </div>
          </div>
        </div>

        {/* Coleção "Pode Também Gostar" */}
        {randomProducts.length > 0 && (
          <div className="mt-8 lg:mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8 lg:mb-12">Pode Também Gostar</h2>
            {loadingRandom ? (
                <p className="text-center text-gray-500">A carregar produtos...</p>
            ) : errorRandom ? (
                <p className="text-center text-red-500">{errorRandom}</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {randomProducts.map((relatedProduct) => (
                    <div
                    key={relatedProduct.id}
                    className="group cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/produto/${relatedProduct.id}`)}
                    >
                    <div className="bg-white rounded-2xl p-8 mb-4 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all border border-gray-200">
                        <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="w-full h-40 md:h-48 object-cover rounded-lg mb-4"
                        />
                    </div>
                    <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < (relatedProduct.rating || 0) ? 'text-orange-500 fill-current' : 'text-gray-300'}`}
                        />
                        ))}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{relatedProduct.name}</h3>
                    <p className="text-orange-500 font-bold text-lg md:text-xl">
                        € {(Number(relatedProduct.price) || 0).toFixed(2)}
                    </p>
                    </div>
                ))}
                </div>
            )}
          </div>
        )}
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CartPage;