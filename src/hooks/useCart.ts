// hooks/useCart.ts
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';

interface CartItem {
  id: string; // Este é o ID do ITEM do carrinho na sua DB (cart_item_id)
  product_id: number; // Este é o ID do PRODUTO na sua DB
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  weight_value?: string;
  flavor?: string;
}

const API_BASE_URL = 'http://localhost:3000/api';

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
        // Tenta parsear o erro apenas se houver conteúdo
        const errorText = await response.text(); // Lê como texto primeiro
        let errorMessage = `Erro da API: ${response.statusText}`;
        try {
          const errorData = JSON.parse(errorText); // Tenta parsear JSON
          errorMessage = errorData.message || errorMessage;
          console.error(`Erro da API para ${endpoint}:`, errorData);
        } catch (parseError) {
          // Se não for JSON, usa o texto bruto ou a mensagem padrão
          console.error(`Erro da API para ${endpoint} (não JSON):`, errorText);
          errorMessage = errorText || errorMessage; // Usa o texto se houver
        }
        throw new Error(errorMessage);
      }

      // --- Lógica de parsing de sucesso mais robusta ---
      const responseText = await response.text(); // Leia o corpo como texto primeiro
      const contentType = response.headers.get('content-type');
      const hasJsonContent = contentType && contentType.includes('application/json');
      const hasBody = responseText.length > 0; // Verifica se o corpo não está vazio

      if (response.status !== 204 && hasBody && hasJsonContent) {
        try {
          return JSON.parse(responseText); // Tenta parsear o texto lido como JSON
        } catch (jsonParseError) {
          // Captura erros de parsing JSON para respostas OK que deveriam ser JSON
          console.error(`Erro ao parsear JSON da API para ${endpoint}:`, jsonParseError, 'Texto recebido:', responseText);
          throw new Error('Formato de resposta inesperado do servidor.');
        }
      }
      // Retorna null para 204 No Content, ou se não houver cabeçalho JSON, ou se o corpo estiver vazio
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

  // --- MODIFICAÇÃO CHAVE: Remover item passando apenas product_id no body ---
  const removeItem = useCallback(async (cartItemId: string) => {
    try {
      // Encontra o item para obter o product_id
      const itemToRemove = items.find(item => item.id === cartItemId);

      if (!itemToRemove) {
        console.error(`Item com ID ${cartItemId} não encontrado no carrinho local para remoção.`);
        toast.error('Item não encontrado no carrinho.');
        return;
      }

     
      // Chama a API com o product_id no corpo da requisição DELETE
       await callApi(`/cart/remover/${itemToRemove.product_id}`, 'DELETE', {
        product_id: itemToRemove.product_id,
      }, false);

      toast.success('Item removido com sucesso!');
      await fetchCart();
    } catch (e) {
      console.error("Erro ao remover item do carrinho:", e);
      toast.error('Erro ao remover item do carrinho.');
    }
  }, [callApi, fetchCart, items]); // Adicionado 'items' nas dependências

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
            productId: itemToUpdate.product_id,
            quantity: newQuantity,
        }, false);
        toast.success('Quantidade atualizada!');
        await fetchCart();
    } catch (e) {
        console.error("Erro ao atualizar quantidade do item:", e);
    }
  }, [callApi, removeItem, items, fetchCart]);

  const addItem = useCallback(async (product: Omit<CartItem, 'quantity' | 'id' | 'product_id'> & { id: number; name: string; price: number; image_url: string; }) => {
    try {
      await callApi('/cart/adicionar', 'POST', {
        product_id: product.id,
        quantity: 1,
      });
      toast.success('Produto adicionado ao carrinho!');
      await fetchCart();
      setIsOpen(true);
    } catch (e) {
      console.error("Erro ao adicionar item ao carrinho:", e);
    }
  }, [callApi, fetchCart]);

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