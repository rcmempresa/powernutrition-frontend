import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { Loader2, Package, Euro, CreditCard } from 'lucide-react';

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

    const getPaymentMethodIcon = (method: string) => {
        switch(method) {
            case 'multibanco': return <CreditCard className="w-5 h-5 text-gray-500" />;
            case 'mbway': return <CreditCard className="w-5 h-5 text-gray-500" />;
            case 'cc': return <CreditCard className="w-5 h-5 text-gray-500" />;
            case 'cod': return <Package className="w-5 h-5 text-gray-500" />;
            default: return <Euro className="w-5 h-5 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                <p className="ml-2">A carregar encomendas...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Acesso Negado</h2>
                <p>Por favor, faça <Link to="/login" className="text-orange-500 hover:underline">login</Link> para ver as suas encomendas.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-white">
                <h2 className="text-3xl font-bold mb-4">Erro ao Carregar</h2>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
            <h1 className="text-4xl font-bold text-white mb-8">Minhas Encomendas</h1>
            {orders.length === 0 ? (
                <div className="text-center text-gray-400 p-8 border border-dashed border-gray-700 rounded-lg">
                    <p className="text-xl">Não tem encomendas registadas.</p>
                    <p className="mt-2 text-sm">Comece a comprar agora na nossa <Link to="/produtos" className="text-orange-500 hover:underline">loja</Link>!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-gray-700 pb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Encomenda #{order.id}</h2>
                                    <p className="text-sm text-gray-400">
                                        Data: {format(new Date(order.created_at), 'PPP', { locale: pt })}
                                    </p>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        {getPaymentMethodIcon(order.payment_method)}
                                        <span className="text-sm font-medium text-white capitalize">{order.payment_method}</span>
                                    </div>
                                    <div className="text-lg font-bold text-orange-500">
                                        €{parseFloat(order.total_price).toFixed(2)}
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                        order.status === 'pendente' ? 'bg-yellow-500 text-black' :
                                        order.status === 'pago' ? 'bg-green-500 text-white' :
                                        'bg-gray-500 text-white'
                                    }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {order.order_items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center text-gray-300">
                                        <div className="flex items-center">
                                            <span className="font-semibold text-white mr-2">{item.quantity}x</span>
                                            <span>{item.product_name}</span>
                                        </div>
                                        <span>€{parseFloat(item.price).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrdersPage;

