import React, { useState, useEffect, useCallback } from 'react';
import { X, Star, ShoppingCart as ShoppingCartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// 👈 ALTERAÇÃO: A interface do produto agora inclui variantes
interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  brand_name: string;
  variants: {
    id: string;
    preco: number;
    weight_value: string;
    weight_unit: string;
    flavor_name: string;
  }[];
}

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  cart: any; // Use a interface correta do seu useCart
  isOpen: boolean;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, cart, isOpen }) => {
  const navigate = useNavigate();
  // ✨ NOVO: Estado para a variante selecionada
  const [selectedVariant, setSelectedVariant] = useState<Product['variants'][0] | null>(null);

  // ✨ NOVO: Inicializa a variante selecionada quando o produto muda
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Define a primeira variante como padrão
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  // Se o modal não estiver aberto ou o produto for nulo, não renderizar nada
  if (!isOpen || !product) {
    return null;
  }
  
  // Obter sabores e pesos únicos para os botões
  const uniqueFlavors = Array.from(new Set(product.variants.map(v => v.flavor_name)));
  const uniqueWeights = Array.from(new Set(product.variants.map(v => `${v.weight_value} ${v.weight_unit}`)));
  
  // Lógica para selecionar a variante com base no sabor e peso
  const handleFlavorSelect = (flavorName: string) => {
    // Encontra a variante que corresponde ao novo sabor e ao peso atual
    const newVariant = product.variants.find(v =>
        v.flavor_name === flavorName &&
        v.weight_value === selectedVariant?.weight_value &&
        v.weight_unit === selectedVariant?.weight_unit
    );
    if (newVariant) {
        setSelectedVariant(newVariant);
    }
};

// Lógica para selecionar a variante com base no peso
const handleWeightSelect = (weight: string) => {
    // Encontra a variante que corresponde ao novo peso e ao sabor atual
    const [weightValue, weightUnit] = weight.split(' ');
    const newVariant = product.variants.find(v =>
        v.weight_value === weightValue &&
        v.weight_unit === weightUnit &&
        v.flavor_name === selectedVariant?.flavor_name
    );
    if (newVariant) {
        setSelectedVariant(newVariant);
    }
};


  // ✨ ALTERADO: Função de adicionar ao carrinho com a variante correta
  const handleAddToCart = useCallback(() => {
    if (cart && cart.addItem && selectedVariant) {
      cart.addItem({
        variant_id: selectedVariant.id, // ✨ Envia o ID da variante
        name: product.name,
        price: selectedVariant.preco, // ✨ Envia o preço da variante
        image_url: product.image_url,
        // Envia sabor e peso para exibição no carrinho, se necessário
        flavor: selectedVariant.flavor_name,
        weight_value: selectedVariant.weight_value,
      });
      toast.success(`${product.name} adicionado ao carrinho!`);
      onClose();
    } else {
      toast.warn("Por favor, selecione uma variante válida.");
    }
  }, [cart, product, selectedVariant, onClose]);

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
              <p className="text-red-500 font-bold text-2xl md:text-3xl">
                € {selectedVariant ? selectedVariant.preco.toFixed(2) : 'N/A'}
              </p>
            </div>

            {/* Rating (simulado) */}
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
                {uniqueWeights.map((weight, index) => (
                  <button
                    key={index}
                    onClick={() => handleWeightSelect(weight)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      `${selectedVariant?.weight_value} ${selectedVariant?.weight_unit}` === weight
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
              <h4 className="text-lg font-semibold text-gray-200 mb-2">Sabor:</h4>
              <div className="flex flex-wrap gap-3">
                {uniqueFlavors.map((flavor, index) => (
                  <button
                    key={index}
                    onClick={() => handleFlavorSelect(flavor)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      selectedVariant?.flavor_name === flavor
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>
          
            {/* Botão Adicionar ao Carrinho */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant}
              className="mt-8 w-full bg-red-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700"
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