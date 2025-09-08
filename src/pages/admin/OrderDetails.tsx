import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react'; 
import { motion } from 'framer-motion'; // Importa framer-motion

// Tipagem para os detalhes da encomenda (deve ser abrangente)
interface OrderDetails {
  id: string | number;
  user_id: string;
  username: string;
  user_email?: string;
  address_id: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  total_price: number | string; 
  status: string;
  payment_method: string;
  easypay_id?: string;
  coupon_code?: string;
  created_at: string;
  updated_at: string;
  items: Array<{
    product_id: string;
    product_name: string;
    image_url: string;
    quantity: number;
    item_price: number | string;
  }>;
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();

  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/admin/encomendas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const processedData: OrderDetails = {
        ...response.data,
        total_price: Number(response.data.total_price),
        items: response.data.items.map((item: any) => ({
          ...item,
          quantity: Number(item.quantity),
          item_price: Number(item.item_price)
        }))
      };
      setOrderDetails(processedData);

    } catch (err: any) {
      console.error('Erro ao buscar detalhes da encomenda:', err);
      setError(err.response?.data?.message || 'Erro ao carregar os detalhes da encomenda.');
    } finally {
      setLoading(false);
    }
  }, [id, getAuthToken]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Variantes de animação para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  // Função auxiliar para obter a cor do status
  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'enviado':
        return 'bg-blue-100 text-blue-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg shadow-xl animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="ml-4 text-lg text-gray-700 font-semibold">A carregar detalhes da encomenda...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-fade-in">
        <p className="text-xl text-red-700 font-bold mb-4">Ocorreu um Erro:</p>
        <p className="text-gray-700 mb-6">{error}</p>
        <motion.button 
          onClick={() => navigate('/admin/orders')}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Voltar para Encomendas
        </motion.button>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="p-8 text-center bg-yellow-50 border-2 border-yellow-300 rounded-lg shadow-md animate-fade-in">
        <p className="text-xl text-yellow-700 font-bold mb-4">Detalhes da encomenda não encontrados.</p>
        <motion.button 
          onClick={() => navigate('/admin/orders')}
          className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Voltar para Encomendas
        </motion.button>
      </div>
    );
  }

  return (
    <motion.div 
      className="p-8 bg-white rounded-lg shadow-2xl border border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        Detalhes da Encomenda <span className="text-orange-600 ml-3">#{String(orderDetails.id).substring(0, 8)}</span>
      </h1>
      
      <motion.button 
        onClick={() => navigate('/admin/orders')}
        className="mb-8 px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-700 transition-all duration-300 transform hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Voltar para Encomendas
      </motion.button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Informações Gerais */}
        <motion.div 
          className="bg-gray-50 p-8 rounded-lg shadow-xl border border-gray-200 transform hover:scale-[1.01] transition-transform duration-200"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 border-gray-200 pb-2">Informações Gerais</h2>
          <p className="text-gray-700 mb-3"><strong>ID:</strong> {orderDetails.id}</p>
          <p className="text-gray-700 mb-3"><strong>Status:</strong> 
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColorClass(orderDetails.status)}`}>
              {orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1)}
            </span>
          </p>
          <p className="text-gray-700 mb-3 text-xl font-bold"><strong>Total:</strong> <span className="text-red-600">€{orderDetails.total_price.toFixed(2)}</span></p>
          <p className="text-gray-700 mb-3"><strong>Método de Pagamento:</strong> {orderDetails.payment_method}</p>
          {orderDetails.easypay_id && <p className="text-gray-700 mb-3"><strong>ID Easypay:</strong> {orderDetails.easypay_id}</p>}
          {orderDetails.coupon_code && <p className="text-gray-700 mb-3"><strong>Cupão Aplicado:</strong> <span className="font-mono text-orange-600">{orderDetails.coupon_code}</span></p>}
          <p className="text-gray-700 mb-3"><strong>Criado em:</strong> {format(new Date(orderDetails.created_at), 'dd/MM/yyyy HH:mm')}</p>
          <p className="text-gray-700"><strong>Última Atualização:</strong> {format(new Date(orderDetails.updated_at), 'dd/MM/yyyy HH:mm')}</p>
        </motion.div>

        {/* Informações do Utilizador */}
        <motion.div 
          className="bg-gray-50 p-8 rounded-lg shadow-xl border border-gray-200 transform hover:scale-[1.01] transition-transform duration-200"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 border-gray-200 pb-2">Detalhes do Utilizador</h2>
          <p className="text-gray-700 mb-3"><strong>ID Utilizador:</strong> {orderDetails.user_id}</p>
          <p className="text-gray-700 mb-3"><strong>Nome:</strong> {orderDetails.username}</p>
          {orderDetails.user_email && <p className="text-gray-700 mb-3"><strong>Email:</strong> <span className="text-blue-600">{orderDetails.user_email}</span></p>}
        </motion.div>
      </div>

      {/* Endereço de Envio */}
      <motion.div 
        className="bg-gray-50 p-8 rounded-lg shadow-xl border border-gray-200 transform hover:scale-[1.01] transition-transform duration-200 mb-8"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 border-gray-200 pb-2">Endereço de Envio</h2>
        <p className="text-gray-700 mb-3"><strong>ID Morada:</strong> {orderDetails.address_id}</p>
        <p className="text-gray-700 mb-3">{orderDetails.address_line1}</p>
        {orderDetails.address_line2 && <p className="text-gray-700 mb-3">{orderDetails.address_line2}</p>}
        <p className="text-gray-700 mb-3">{orderDetails.city}, {orderDetails.postal_code}</p>
        <p className="text-gray-700 mb-3">{orderDetails.state_province}, {orderDetails.country}</p>
      </motion.div>

      {/* Itens da Encomenda */}
      <motion.div 
        className="bg-gray-50 p-8 rounded-lg shadow-xl border border-gray-200 transform hover:scale-[1.01] transition-transform duration-200"
        variants={itemVariants}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 border-gray-200 pb-2">Itens da Encomenda</h2>
        {orderDetails.items && orderDetails.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Produto</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Quantidade</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Preço Unitário</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b-2 border-gray-200">Total do Item</th>
                </tr>
              </thead>
              <tbody>
                {orderDetails.items.map((item, index) => (
                  <tr 
                    key={item.product_id} 
                    className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-100 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex items-center">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.product_name} className="h-12 w-12 object-cover rounded-full shadow-md border border-gray-300 mr-4" />
                        )}
                        <span className="font-medium text-gray-900">{item.product_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">{item.quantity}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">€{Number(item.item_price).toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 font-semibold">€{(Number(item.quantity) * Number(item.item_price)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-700">Nenhum item encontrado para esta encomenda.</p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OrderDetails;
