// src/hooks/useFavorites.tsx
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth'; // Importa o hook de autenticação
import toast from 'react-hot-toast';

// Tipagem para um produto favorito simplificado, apenas o necessário para o estado
interface FavoriteProductData {
  id: number;
}

// Contexto para os favoritos
interface FavoritesContextType {
  favoriteProductIds: Set<number>;
  favoriteItemCount: number;
  toggleFavorite: (productId: number, event?: React.MouseEvent) => Promise<void>;
  checkIfFavorite: (productId: number) => boolean;
  refreshFavorites: () => Promise<void>; // Função para forçar um refresh da lista de favoritos
  loadingFavorites: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider para o contexto dos favoritos
export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loadingAuth, getAuthToken } = useAuth();
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<number>>(new Set());
  const [favoriteItemCount, setFavoriteItemCount] = useState<number>(0);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);

  // Função para buscar os IDs dos produtos favoritos
  const fetchFavoriteProductIds = useCallback(async () => {
    setLoadingFavorites(true);
    if (!isAuthenticated || loadingAuth) {
      setFavoriteProductIds(new Set()); // Limpa se não estiver autenticado
      setFavoriteItemCount(0);
      setLoadingFavorites(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setFavoriteProductIds(new Set());
      setFavoriteItemCount(0);
      setLoadingFavorites(false);
      return;
    }

    try {
      const response = await axios.get<FavoriteProductData[]>(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/listar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ids = new Set(response.data.map(p => p.id));
      setFavoriteProductIds(ids);
      setFavoriteItemCount(response.data.length);
    } catch (error) {
      console.error('Erro ao buscar favoritos do utilizador:', error);
      toast.error('Erro ao carregar os seus favoritos.');
      setFavoriteProductIds(new Set());
      setFavoriteItemCount(0);
    } finally {
      setLoadingFavorites(false);
    }
  }, [isAuthenticated, loadingAuth, getAuthToken]);

  // Efeito para buscar favoritos quando a autenticação muda ou o componente é montado
  useEffect(() => {
    fetchFavoriteProductIds();
  }, [fetchFavoriteProductIds]);

  // Função para adicionar ou remover um favorito
  const toggleFavorite = useCallback(async (productId: number, event?: React.MouseEvent) => {
    event?.stopPropagation(); // Previne que o clique no coração navegue para a página do produto

    if (!isAuthenticated) {
      toast.error('Precisa de estar autenticado para gerir favoritos.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Token de autenticação não encontrado. Por favor, faça login.');
      return;
    }

    const isCurrentlyFavorite = favoriteProductIds.has(productId);

    try {
      if (isCurrentlyFavorite) {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        setFavoriteItemCount(prev => prev - 1); // Decrementa a contagem
        toast.success('Produto removido dos favoritos!');
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/add`, { productId }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setFavoriteProductIds(prev => new Set(prev).add(productId));
        setFavoriteItemCount(prev => prev + 1); // Incrementa a contagem
        toast.success('Produto adicionado aos favoritos!');
      }
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error);
      toast.error(error.response?.data?.message || 'Erro ao gerir favorito.');
    }
  }, [isAuthenticated, getAuthToken, favoriteProductIds]);

  const checkIfFavorite = useCallback((productId: number) => {
    return favoriteProductIds.has(productId);
  }, [favoriteProductIds]);

  const refreshFavorites = useCallback(async () => {
    await fetchFavoriteProductIds();
  }, [fetchFavoriteProductIds]);

  return (
    <FavoritesContext.Provider value={{
      favoriteProductIds,
      favoriteItemCount,
      toggleFavorite,
      checkIfFavorite,
      refreshFavorites,
      loadingFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook personalizado para consumir o contexto de favoritos
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
