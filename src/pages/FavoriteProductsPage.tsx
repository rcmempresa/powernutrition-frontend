// src/pages/FavoriteProductsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartCrack,
  Loader2,
  XCircle,
  Eye
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useFavorites } from '../hooks/useFavorites';
import Footer from '../components/FooterPage';

// Tipagem para a resposta da API, agora inclui o ID da variante favorita
interface FavoriteProduct {
  id: number; // ID do produto principal
  variant_id: number; // ID da variante favorita
  name: string;
  description: string;
  price: number;
  original_price?: number;
  stock_quantity: number;
  sku: string;
  image_url: string;
  category_id: number;
  category_name?: string;
  brand?: string;
  weight_unit?: string;
  weight_value?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  flavor_id?: number;
  flavor_name?: string;
  stock_ginasio?: number;
  rating?: number;
  reviewcount?: number;
  favorited_at: string;
}

// Tipagem para a resposta bruta da API
interface RawFavoriteProductApiResponse {
  id: number;
  variant_id: number;
  name: string;
  description: string;
  price: string | number;
  original_price?: string | number;
  stock_quantity: number;
  sku: string;
  image_url: string;
  category_id: number;
  category_name?: string;
  brand?: string;
  weight_unit?: string;
  weight_value?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  flavor_id?: number;
  flavor_name?: string;
  stock_ginasio?: number;
  rating?: number;
  reviewcount?: number;
  favorited_at: string;
}

const FavoriteProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAuthToken, isAuthenticated, loadingAuth } = useAuth();
  const { refreshFavorites, loadingFavorites: loadingFavoritesHook } = useFavorites();

  const [favoriteProducts, setFavoriteProducts] = useState<FavoriteProduct[]>([]);
  const [loadingLocal, setLoadingLocal] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const fetchProductsDetails = useCallback(async () => {
    setLoadingLocal(true);
    setError(null);

    if (loadingAuth || loadingFavoritesHook) {
      setLoadingLocal(true);
      return;
    }

    if (!isAuthenticated) {
      setLoadingLocal(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setError('Token de autenticação não encontrado. Por favor, faça login.');
      setLoadingLocal(false);
      return;
    }

    try {
      // O endpoint /api/favorites/listar já deve retornar os detalhes completos dos produtos favoritos.
      const response = await axios.get<RawFavoriteProductApiResponse[]>(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/listar`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const processedFavorites: FavoriteProduct[] = response.data.map(item => ({
        ...item,
        price: parseFloat(item.price as string),
        original_price: item.original_price ? parseFloat(item.original_price as string) : undefined,
      }));

      setFavoriteProducts(processedFavorites);
    } catch (err: any) {
      console.error('Erro ao buscar produtos favoritos:', err);
      setError(err.response?.data?.message || 'Erro ao carregar os seus produtos favoritos.');
      setFavoriteProducts([]);
    } finally {
      setLoadingLocal(false);
    }
  }, [getAuthToken, isAuthenticated, loadingAuth, loadingFavoritesHook]);

  useEffect(() => {
    fetchProductsDetails();
  }, [fetchProductsDetails]);

  const handleRemoveFavorite = useCallback(async (variantId: number) => {
    let removingToastId: string | undefined;
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Token de autenticação não encontrado. Por favor, faça login.');
        return;
      }

      removingToastId = toast.loading('A remover dos favoritos...');

      // Agora a requisição DELETE usa o variantId, como no seu backend
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/remove/${variantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Variante removida dos favoritos!', { id: removingToastId });
      // Atualiza a lista localmente para uma resposta mais rápida
      setFavoriteProducts(prev => prev.filter(product => product.variant_id !== variantId));
      refreshFavorites(); // Sincroniza o estado global
    } catch (err: any) {
      console.error('Erro ao remover favorito:', err);
      if (removingToastId) {
        toast.error(err.response?.data?.message || 'Erro ao remover produto dos favoritos.', { id: removingToastId });
      } else {
        toast.error(err.response?.data?.message || 'Erro ao remover produto dos favoritos.');
      }
    }
  }, [getAuthToken, refreshFavorites]);

  if (!loadingAuth && !isAuthenticated) {
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 bg-white rounded-lg shadow-xl max-w-2xl mx-auto my-12 text-center">
          <HeartCrack className="h-24 w-24 text-gray-400 mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Ops, você não está logado!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Para ver e gerir os seus produtos favoritos, por favor, faça login ou crie uma conta.
          </p>
          <motion.button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Fazer Login Agora
          </motion.button>
        </div>
        <Footer />
      </>
    );
  }

  if (loadingLocal || loadingFavoritesHook) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg shadow-xl animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-4 text-lg text-gray-700 font-semibold">A carregar os seus favoritos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="p-8 text-center bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-fade-in max-w-xl mx-auto my-8">
          <p className="text-xl text-red-700 font-bold mb-4">Ocorreu um Erro:</p>
          <p className="text-gray-700 mb-6">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <motion.div
        className="flex-grow p-8 bg-white rounded-lg shadow-2xl border border-gray-100 max-w-7xl mx-auto my-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
          <HeartCrack className="mr-3 h-10 w-10 text-orange-500" />
          Os Seus Produtos Favoritos
        </h1>
        <p className="text-lg text-gray-700 mb-8">Aqui está a lista de produtos que marcou como favoritos.</p>

        {favoriteProducts.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg shadow-md border border-gray-200">
            <p className="text-xl text-gray-700 font-semibold mb-4">Ainda não tem produtos favoritos.</p>
            <p className="text-gray-600 mb-6">Comece a explorar a nossa loja e adicione alguns produtos!</p>
            <motion.button
              onClick={() => navigate('/produtos')}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Ir para a Loja
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {favoriteProducts.map((product, index) => (
                <motion.div
                  key={product.variant_id} // Usamos o variant_id como key para ser único e estável
                  className="bg-gray-50 rounded-lg shadow-lg border border-gray-200 flex flex-col overflow-hidden transform hover:scale-105 transition-transform duration-200 ease-in-out"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  custom={index}
                >
                  <Link to={`/produto/${product.id}`} className="block relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={product.image_url || 'https://placehold.co/400x300/FDBA74/FFFFFF?text=Sem+Imagem'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e: any) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/FDBA74/FFFFFF?text=Imagem+Indisponível"; }}
                    />
                    {product.original_price && product.price < product.original_price && (
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        PROMOÇÃO
                      </span>
                    )}
                  </Link>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">
                      <Link to={`/produto/${product.id}`} className="hover:text-orange-600 transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    {product.brand && <p className="text-sm text-gray-600 mb-1">{product.brand}</p>}
                    {product.flavor_name && <p className="text-sm text-gray-600 mb-1">Sabor: {product.flavor_name}</p>}
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
                      <div>
                        {product.original_price && product.price < product.original_price ? (
                          <>
                            <span className="text-xl font-bold text-orange-600 mr-2">€{product.price.toFixed(2)}</span>
                            <span className="text-gray-500 line-through text-sm">€{product.original_price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-xl font-bold text-gray-900">€{product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <motion.button
                        onClick={() => navigate(`/produto/${product.id}`)}
                        className="flex-1 mr-2 px-4 py-2 bg-orange-500 text-white rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-200 flex items-center justify-center text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                      </motion.button>
                      <motion.button
                        onClick={() => handleRemoveFavorite(product.variant_id)} // Usa o variant_id para remover
                        className="px-3 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        title="Remover dos Favoritos"
                      >
                        <HeartCrack className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
      <Footer />
    </div>
  );
};

export default FavoriteProductsPage;