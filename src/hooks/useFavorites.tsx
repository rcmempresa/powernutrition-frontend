// src/hooks/useFavorites.tsx
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

// Tipagem para um favorito, agora usando variant_id.
interface FavoriteData {
  variant_id: number;
}

// Contexto para os favoritos
interface FavoritesContextType {
  favoriteVariantIds: Set<number>;
  favoriteItemCount: number;
  toggleFavorite: (variantId: number, event?: React.MouseEvent) => Promise<void>;
  checkIfFavorite: (variantId: number) => boolean;
  refreshFavorites: () => Promise<void>;
  loadingFavorites: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider para o contexto dos favoritos
export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, loadingAuth, getAuthToken } = useAuth();
  const [favoriteVariantIds, setFavoriteVariantIds] = useState<Set<number>>(new Set());
  const [favoriteItemCount, setFavoriteItemCount] = useState<number>(0);
  const [loadingFavorites, setLoadingFavorites] = useState<boolean>(true);

  // Função para buscar os IDs das variantes favoritas
  const fetchFavoriteVariantIds = useCallback(async () => {
    setLoadingFavorites(true);
    if (!isAuthenticated || loadingAuth) {
      setFavoriteVariantIds(new Set());
      setFavoriteItemCount(0);
      setLoadingFavorites(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setFavoriteVariantIds(new Set());
      setFavoriteItemCount(0);
      setLoadingFavorites(false);
      return;
    }

    try {
      const response = await axios.get<FavoriteData[]>(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/listar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Mapeia os IDs das variantes, não dos produtos
      const ids = new Set(response.data.map(f => f.variant_id));
      setFavoriteVariantIds(ids);
      setFavoriteItemCount(response.data.length);
    } catch (error) {
      console.error('Erro ao buscar favoritos do utilizador:', error);
      toast.error('Erro ao carregar os seus favoritos.');
      setFavoriteVariantIds(new Set());
      setFavoriteItemCount(0);
    } finally {
      setLoadingFavorites(false);
    }
  }, [isAuthenticated, loadingAuth, getAuthToken]);

  useEffect(() => {
    fetchFavoriteVariantIds();
  }, [fetchFavoriteVariantIds]);

  const toggleFavorite = useCallback(async (variantId: number, event?: React.MouseEvent) => {
    event?.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Precisa de estar autenticado para gerir favoritos.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Token de autenticação não encontrado. Por favor, faça login.');
      return;
    }

    const isCurrentlyFavorite = favoriteVariantIds.has(variantId);

    try {
      if (isCurrentlyFavorite) {
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/remove/${variantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteVariantIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(variantId);
          return newSet;
        });
        setFavoriteItemCount(prev => prev - 1);
        toast.success('Variante removida dos favoritos!');
      } else {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/add`, { variantId }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setFavoriteVariantIds(prev => new Set(prev).add(variantId));
        setFavoriteItemCount(prev => prev + 1);
        toast.success('Variante adicionada aos favoritos!');
      }
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error);
      toast.error(error.response?.data?.message || 'Erro ao gerir favorito.');
    }
  }, [isAuthenticated, getAuthToken, favoriteVariantIds]);

  const checkIfFavorite = useCallback((variantId: number) => {
    return favoriteVariantIds.has(variantId);
  }, [favoriteVariantIds]);

  const refreshFavorites = useCallback(async () => {
    await fetchFavoriteVariantIds();
  }, [fetchFavoriteVariantIds]);

  return (
    <FavoritesContext.Provider value={{
      favoriteVariantIds,
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

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
