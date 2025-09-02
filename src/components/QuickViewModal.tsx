import React, { useState, useEffect, useCallback } from 'react';
import { X, Star, ShoppingCart as ShoppingCartIcon, Plus, Minus } from 'lucide-react'; // 👈 Adicionar Plus e Minus
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url: string;
  weight_value?: string;
  weight_unit?: string;
  flavor_id?: string;
  category_id?: number;
}

// 👈 ALTERAÇÃO: Interface para o item do carrinho com quantidade
interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  selectedWeight?: string | null;
  selectedFlavor?: string | null;
}

// 👈 ALTERAÇÃO: Interface do contexto do carrinho atualizada
interface CartContext {
  addItem: (item: CartItem) => void;
}

// 👈 ALTERAÇÃO: Interface de props do modal simplificada
interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  cart: CartContext;
  isOpen: boolean;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, cart, isOpen }) => {
  const navigate = useNavigate();

  const [selectedWeight, setSelectedWeight] = useState(product?.weight_value || null);
  const [selectedFlavor, setSelectedFlavor] = useState(product?.flavor_id || null);
  const [quantity, setQuantity] = useState(1); // 👈 NOVO: Estado para a quantidade
  
  const [flavorName, setFlavorName] = useState('Carregando...');
  const [loadingFlavor, setLoadingFlavor] = useState(true);
  const [errorFlavor, setErrorFlavor] = useState<string | null>(null);

  // Placeholder para simular variações
  const productWeights = product?.weight_value ? [`${product.weight_value} ${product.weight_unit}`] : ['250g', '500g', '1kg'];
  const productFlavors = product?.flavor_id ? [product.flavor_id] : ['Chocolate', 'Baunilha', 'Morango'];

  // Efeito para buscar o nome do sabor
  useEffect(() => {
    const fetchFlavorName = async () => {
      setLoadingFlavor(true);
      setErrorFlavor(null);
      if (product && product.flavor_id) {
        try {
          const flavorResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/flavors/listar/${product.flavor_id}`);
          if (!flavorResponse.ok) {
            console.warn(`Erro HTTP ao buscar sabor para ID ${product.flavor_id}. Status: ${flavorResponse.status}`);
            setFlavorName('Sabor Desconhecido');
            setErrorFlavor('Sabor não encontrado.');
          } else {
            const flavorData = await flavorResponse.json();
            setFlavorName(flavorData.name);
          }
        } catch (err) {
          console.error("Erro ao buscar nome do sabor:", err);
          setFlavorName('Erro ao carregar sabor');
          setErrorFlavor('Falha ao carregar sabor.');
        } finally {
          setLoadingFlavor(false);
        }
      } else {
        setFlavorName('N/A');
        setLoadingFlavor(false);
      }
    };

    fetchFlavorName();
  }, [product]);

  // Atualiza os estados de seleção quando o produto muda
  useEffect(() => {
    setSelectedWeight(product?.weight_value || null);
    setSelectedFlavor(product?.flavor_id || null);
  }, [product]);

  if (!isOpen || !product) {
    return null;
  }

  // Função para adicionar ao carrinho a partir do modal
  const handleAddToCart = useCallback(() => {
    if (cart && cart.addItem) {
      cart.addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url,
        selectedWeight: selectedWeight,
        selectedFlavor: flavorName,
      });
      onClose();
    } else {
      console.warn("Cart context or addItem function not available.");
    }
  }, [cart, product, selectedWeight, flavorName, onClose, quantity]); // 👈 ALTERAÇÃO: Adiciona 'quantity' à lista de dependências

  // Função para navegar para a página de detalhes do produto
  const handleViewDetails = useCallback(() => {
    if (product?.id) {
      navigate(`/produto/${product.id}`);
      onClose();
    }
  }, [navigate, product, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 animate-fadeIn">
      <div className="relative bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform scale-95 animate-scaleUp text-gray-100 border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600 transition-colors z-10"
          aria-label="Fechar visualização rápida"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row p-6 md:p-8 gap-6 md:gap-8">
          {/* Imagem do Produto */}
          <div className="flex-shrink-0 w-full md:w-1/2 lg:w-2/5">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-auto object-cover rounded-lg shadow-md border border-gray-700"
            />
          </div>

          {/* Detalhes do Produto */}
          <div className="flex-grow md:w-1/2 lg:w-3/5 space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">{product.name}</h2>
            <p className="text-gray-400 text-lg leading-relaxed">{product.description}</p>

            {/* Preço */}
            <div className="flex items-baseline space-x-3 mt-4">
              {product.original_price && product.price < product.original_price && (
                <p className="text-gray-500 line-through text-xl md:text-2xl">
                  € {product.original_price.toFixed(2)}
                </p>
              )}
              <p className="text-red-500 font-bold text-2xl md:text-3xl">
                € {product.price.toFixed(2)}
              </p>
            </div>

            {/* Rating (simulado, já que não vem da API) */}
            <div className="flex items-center text-orange-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" />
              ))}
              <span className="text-gray-400 text-sm ml-2">(Sem avaliações)</span>
            </div>

            {/* Opções de Peso/Unidade */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-gray-200 mb-2">Peso/Tamanho:</h4>
              <div className="flex flex-wrap gap-3">
                {productWeights.map((weight, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedWeight(weight)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedWeight === weight
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {weight}
                  </button>
                ))}
              </div>
            </div>

            {/* Opções de Sabor */}
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-200 mb-2">
                Sabor: {loadingFlavor ? 'Carregando...' : errorFlavor ? errorFlavor : flavorName}
              </h4>
              <div className="flex flex-wrap gap-3">
                {product.flavor_id && (
                  <button
                    onClick={() => setSelectedFlavor(product.flavor_id)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedFlavor === product.flavor_id
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {loadingFlavor ? 'Carregando...' : errorFlavor ? 'Erro' : flavorName}
                  </button>
                )}
              </div>
            </div>
          
            {/* Botão Adicionar ao Carrinho */}
            <button
              onClick={handleAddToCart}
              className="mt-8 w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <ShoppingCartIcon className="w-5 h-5 mr-2" />
              Adicionar ao Carrinho
            </button>

            {/* Botão "Ver Detalhes Completos" */}
            <button
              onClick={handleViewDetails}
              className="mt-4 w-full bg-gray-700 text-gray-300 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-gray-600 transition-colors"
            >
              Ver Detalhes Completos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;