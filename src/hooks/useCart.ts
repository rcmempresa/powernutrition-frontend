// hooks/useCart.ts
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

// A tipagem foi atualizada para usar variant_id, que é o identificador único do item no carrinho
interface CartItem {
  id: string; // Este é o ID do ITEM do carrinho na sua DB (cart_item_id)
  variant_id: number; // ✨ Este é o ID da variante na sua DB
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  weight_value?: string;
  flavor?: string;
}

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const useCart = (getToken: () => string | null) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callApi = useCallback(async (endpoint: string, method: string, data?: any, showAuthErrorToast: boolean = true) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        const errorMessage = 'Faça login para adicionar produtos ao carrinho.';
        console.error("Erro de autenticação:", errorMessage);
        if (showAuthErrorToast) {
          toast.error(errorMessage);
        }
        throw new Error(errorMessage);
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erro da API: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
          console.error(`Erro da API para ${endpoint}:`, errorData);
        } catch (parseError) {
          console.error(`Erro da API para ${endpoint} (não JSON):`, errorText);
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');
      const hasBody = responseText.length > 0;

      if (response.status !== 204 && hasBody && hasJsonContent) {
        try {
          return JSON.parse(responseText);
        } catch (jsonParseError) {
          console.error(`Erro ao parsear JSON da API para ${endpoint}:`, jsonParseError, 'Texto recebido:', responseText);
          throw new Error('Formato de resposta inesperado do servidor.');
        }
      }
      return null;

    } catch (err: any) {
      const errorMessage = err.message || 'Ocorreu um erro desconhecido na comunicação com o servidor.';
      console.error(`Erro inesperado na chamada da API para ${endpoint}:`, err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const fetchCart = useCallback(async () => {
    try {
      const data = await callApi('/cart/listar', 'GET', undefined, false);
      if (data && data.items && Array.isArray(data.items)) {
        const itemsWithNumbers = data.items.map(item => ({
          ...item,
          price: Number(item.price)
        }));
        setItems(itemsWithNumbers);
      } else {
        console.warn('A API de carrinho retornou um formato inesperado ou vazio:', data);
        setItems([]);
      }
    } catch (e) {
      console.error("Falha ao carregar o carrinho:", e);
      setItems([]);
    }
  }, [callApi]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // A função addItem foi corrigida para usar o ID da variante
  const addItem = useCallback(async (product: {
    // ✨ Agora a função addItem deve receber o product_id, não o variant_id.
    // O seu código do componente deve ser corrigido para passar product.id
    product_id: number;
    name: string;
    price: number;
    image_url: string;
    weight_value?: string;
    flavor?: string;
  }) => {
    try {
      await callApi('/cart/adicionar', 'POST', {
        product_id: product.product_id, // ✨ Use product_id aqui para o backend
        quantity: 1,
      });
      toast.success('Produto adicionado ao carrinho!');
      await fetchCart();
      setIsOpen(true);
    } catch (e) {
      console.error("Erro ao adicionar item ao carrinho:", e);
      toast.error("Erro ao adicionar ao carrinho. Por favor, tente novamente.");
    }
  }, [callApi, fetchCart]);

  // A função removeItem foi corrigida para usar o variant_id
  const removeItem = useCallback(async (cartItemId: string) => {
    try {
      const itemToRemove = items.find(item => item.id === cartItemId);
      if (!itemToRemove) {
        console.error(`Item com ID ${cartItemId} não encontrado no carrinho local para remoção.`);
        toast.error('Item não encontrado no carrinho.');
        return;
      }
      await callApi(`/cart/remover/${itemToRemove.variant_id}`, 'DELETE', undefined, false);
      toast.success('Item removido com sucesso!');
      await fetchCart();
    } catch (e) {
      console.error("Erro ao remover item do carrinho:", e);
      toast.error('Erro ao remover item do carrinho.');
    }
  }, [callApi, fetchCart, items]);

  // A função updateQuantity foi corrigida para usar o variant_id
  const updateQuantity = useCallback(async (cartItemId: string, newQuantity: number) => {
    const itemToUpdate = items.find(item => item.id === cartItemId);
    if (!itemToUpdate) {
      console.error(`Item com ID ${cartItemId} não encontrado no carrinho local.`);
      return;
    }
    if (newQuantity <= 0) {
      await removeItem(cartItemId);
      return;
    }
    try {
      await callApi('/cart/atualizar', 'PATCH', {
        variantId: itemToUpdate.variant_id, // ✨ Usa o variant_id para atualizar a quantidade
        quantity: newQuantity,
      }, false);
      toast.success('Quantidade atualizada!');
      await fetchCart();
    } catch (e) {
      console.error("Erro ao atualizar quantidade do item:", e);
    }
  }, [callApi, removeItem, items, fetchCart]);

  const openCart = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    items,
    isOpen,
    itemCount,
    subtotal,
    loading,
    error,
    addItem,
    updateQuantity,
    removeItem,
    openCart,
    closeCart
  };
};