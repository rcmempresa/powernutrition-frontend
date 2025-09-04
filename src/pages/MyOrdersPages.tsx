import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../contexts/AuthContext';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
}

interface Order {
    id: number;
    total_price: string;
    created_at: string;
    status: string;
    payment_method: string;
    order_items: OrderItem[];
}


const MyOrdersPage: React.FC = () => {
    const { isAuthenticated, user, getAuthToken } = useAuthContext();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setLoading(false);
            return;
        }

        // ✅ Chame a função getAuthToken() para obter o token
        const token = getAuthToken();

        if (!token) {
            setLoading(false);
            setError("Token de autenticação não encontrado.");
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/listar/proprias`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setOrders(response.data);
            } catch (err: any) {
                console.error("Erro ao buscar encomendas:", err);
                setError("Não foi possível carregar as suas encomendas. Por favor, tente novamente mais tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, user, getAuthToken]); // ✅ Adicione getAuthToken à lista de dependências

    // ... (restante do código do componente)
};

export default MyOrdersPage;