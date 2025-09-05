import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Eye,
  ShoppingCart as ShoppingCartIcon,
  Star, // Certifique-se de que este ícone está importado
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import Footer from '../components/FooterPage';

// --- INTERFACES NECESSÁRIAS ---
interface Variant {
    id: number;
    preco: string;
    quantidade_em_stock: number;
    sku: string;
    weight_value: string;
    weight_unit: string;
    flavor_id: number;
    image_url?: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    image_url?: string;
    category_id: number;
    brand?: string;
    is_active: boolean;
    original_price?: string;
    rating?: string;
    reviewcount?: number;
    displayPrice: number;
    displayWeight: string;
    variants: Variant[];
    totalStock: number; // Adicionada para a lógica de stock
}

// --- FUNÇÃO DE BUSCA E PROCESSAMENTO DE PRODUTOS ---
async function fetchLatestProducts() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
    
    if (!response.data || !Array.isArray(response.data)) {
        console.warn("API returned invalid or empty data for latest products.");
        return [];
    }

    return response.data.map((product) => {
      const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
      let displayPriceValue = 0;
      let displayWeightValue = 'N/A';
      let productImage = product.image_url;
      let totalStock = 0;

      if (hasVariants) {
        // Calcula o stock total de todas as variantes
        totalStock = product.variants.reduce((sum, v) => sum + v.quantidade_em_stock, 0);
        
        // Encontra a variante com o menor preço
        const sortedVariants = product.variants.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
        const cheapestVariant = sortedVariants[0];

        if (cheapestVariant) {
          displayPriceValue = parseFloat(cheapestVariant.preco);
          displayWeightValue = `${cheapestVariant.weight_value}${cheapestVariant.weight_unit}`;
          if (cheapestVariant.image_url) {
              productImage = cheapestVariant.image_url;
          }
        }
      } else {
        if (product.original_price !== undefined && product.original_price !== null) {
          displayPriceValue = parseFloat(product.original_price);
        }
      }
      
      if (isNaN(displayPriceValue)) {
          displayPriceValue = 0;
      }

      return {
        ...product,
        displayPrice: displayPriceValue,
        displayWeight: displayWeightValue,
        image_url: productImage,
        totalStock,
      };
    });
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return [];
  }
}

// --- COMPONENTE HOMEPAGE ---
const HomePage = ({ cart, handleQuickViewOpen }) => {
  const navigate = useNavigate();
  const { checkIfFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated, getAuthToken } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchLatestProducts();
        setProducts(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  const handleAddToCart = useCallback((e, product) => {
    e.stopPropagation();
    if (cart && cart.addItem) {
        const cheapestVariant = product.variants?.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco))[0];

        if (cheapestVariant) {
            cart.addItem({
                id: cheapestVariant.id,
                name: product.name,
                price: parseFloat(cheapestVariant.preco),
                image: product.image_url
            });
            toast.success(`${product.name} adicionado ao carrinho!`);
        } else {
            toast.error("Produto sem variantes disponíveis para adicionar ao carrinho.");
        }
    } else {
        console.warn("Cart context or addItem function not available.");
        toast.error("Não foi possível adicionar ao carrinho.");
    }
  }, [cart]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Secção de Produtos Mais Recentes */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-100 mb-12 text-center">Produtos</h2>
          {loading ? (
            <p className="text-center text-gray-400">Carregando produtos...</p>
          ) : error ? (
            <p className="text-center text-red-500">Erro ao carregar produtos. Por favor, tente novamente.</p>
          ) : products.length === 0 ? (
            <p className="text-center text-gray-400">Nenhum produto encontrado.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/produto/${product.id}`)}
                >
                  <div className="relative bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
                    <div className="relative w-full h-48 md:h-56">
                      {(!product.is_active || product.totalStock === 0) && (
                          <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm z-10">
                              Esgotado
                          </div>
                      )}
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            className="bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-600 border border-gray-600" 
                            aria-label="Toggle favorite"
                            onClick={(e) => toggleFavorite(product.id, e)}
                        >
                            <Heart className={`w-4 h-4 transition-colors ${checkIfFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-300'}`} />
                        </button>
                        <button
                          className="bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-600 border border-gray-600"
                          aria-label="Quick view"
                          onClick={(e) => {
                              e.stopPropagation();
                              handleQuickViewOpen(product);
                          }}
                        >
                          <Eye className="w-4 h-4 text-gray-300" />
                        </button>
                        <button
                          className="bg-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-600 border border-gray-600"
                          aria-label="Add to cart"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <ShoppingCartIcon className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>

                      <div className="flex mb-2">
                        {parseFloat(product.rating || '0') > 0 ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(parseFloat(product.rating)) ? 'text-orange-500 fill-current' : 'text-gray-500'}`}
                                />
                            ))
                        ) : (
                            <div className="h-4"></div>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-100 mb-2">{product.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{product.displayWeight}</p>
                      
                      <div className="flex items-baseline space-x-2">
                          {product.original_price && product.displayPrice < parseFloat(product.original_price) && (
                              <p className="text-gray-500 line-through text-base md:text-lg">
                                  €{parseFloat(product.original_price).toFixed(2)}
                              </p>
                          )}
                          <p className="text-red-500 font-bold text-lg md:text-xl">
                              € {product.displayPrice.toFixed(2)}
                          </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;