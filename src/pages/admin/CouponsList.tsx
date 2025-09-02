import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader2, Edit, Trash2, CheckCircle, XCircle, BarChart2, Info } from 'lucide-react';
import axios from 'axios';

// Tipagem para um cupão, refletindo a estrutura do seu backend
interface BackendCoupon {
  id: string;
  code: string;
  discount_percentage: number;
  athlete_name: string;
  created_at: string;
  updated_at: string;
}

// Tipagem para o cupão como será usado no estado do frontend
interface CouponForDisplay {
  id: string;
  code: string;
  discount: number;
  athlete_name: string;
  status_display: 'Ativo' | 'Inativo'; 
  created_at: string;
}

const CouponsList: React.FC = () => {
  const navigate = useNavigate();
  // Simulação de autenticação, substitua por seu `useAuth` real
  const getAuthToken = () => 'seu_token_de_autenticacao'; 
  
  const [coupons, setCoupons] = useState<CouponForDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para o toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Estado para o formulário de criação
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discount_percentage: 0,
    athlete_name: '',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000); // Ocultar após 4 segundos
  };

  // Função para buscar cupões do backend
  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulação: A sua API deve ter uma rota de listagem de cupões
      const response = await axios.get<BackendCoupon[]>('${import.meta.env.VITE_BACKEND_URL}´/api/cupoes/listar', {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      
      const fetchedCoupons: CouponForDisplay[] = response.data.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        discount: coupon.discount_percentage,
        athlete_name: coupon.athlete_name,
        // Supondo que um cupão é sempre ativo ao ser criado, ou baseado em uma propriedade do backend
        status_display: 'Ativo', 
        created_at: coupon.created_at,
      }));

      setCoupons(fetchedCoupons);
    } catch (err: any) {
      console.error('Erro ao buscar cupões:', err);
      setError(err.response?.data?.message || 'Erro ao carregar os cupões.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Lidar com a submissão do formulário para criar um novo cupão
  const handleCreateCoupon = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('${import.meta.env.VITE_BACKEND_URL}´/api/cupoes/criar', newCouponForm);

      const createdCoupon: BackendCoupon = response.data;
      
      setCoupons(prevCoupons => [
        ...prevCoupons,
        {
          id: createdCoupon.id,
          code: createdCoupon.code,
          discount: createdCoupon.discount_percentage,
          athlete_name: createdCoupon.athlete_name,
          status_display: 'Ativo',
          created_at: createdCoupon.created_at,
        }
      ]);
      
      setNewCouponForm({ code: '', discount_percentage: 0, athlete_name: '' });
      showToast('Cupão criado com sucesso!', 'success');
      
    } catch (err: any) {
      console.error('Falha ao criar o cupão:', err);
      setError(err.response?.data?.message || 'Erro ao criar cupão. Tente novamente.');
      showToast(err.response?.data?.message || 'Erro ao criar cupão.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Lidar com a eliminação de cupões
  const handleDeleteCoupon = useCallback(async (couponId: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja eliminar o cupão com ID: ${couponId}? Esta ação é irreversível.`);
    if (!confirmDelete) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulação: A sua API deve ter uma rota de remoção de cupões
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cupoes/remover/${couponId}`);
      
      setCoupons(prevCoupons => prevCoupons.filter(c => c.id !== couponId));
      showToast('Cupão eliminado com sucesso!', 'success');
      
    } catch (err: any) {
      console.error('Erro ao eliminar cupão:', err);
      showToast(err.response?.data?.message || 'Erro ao eliminar cupão. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Lidar com a visualização do uso do cupão
  const handleViewUsage = async (couponCode: string) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cupoes/usage/${couponCode}`);
      const usageCount = response.data.usage_count; 
      showToast(`O cupão "${couponCode}" foi usado ${usageCount} vezes.`, 'info');
    } catch (err: any) {
      console.error('Erro ao buscar utilizações do cupão:', err);
      showToast('Erro ao buscar o número de utilizações.', 'error');
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Variantes de animação para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 8px 16px rgba(249, 115, 22, 0.4)" },
    tap: { scale: 0.95 }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1, 
      x: 0, 
      transition: { 
        delay: i * 0.05, 
        duration: 0.3, 
        ease: "easeOut" 
      } 
    }),
  };
  
  const getStatusColorClass = (status: 'Ativo' | 'Inativo') => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  // Mapeamento de tipo de toast para cor e ícone
  const toastStyles = {
    success: { bg: 'bg-green-500', icon: CheckCircle },
    error: { bg: 'bg-red-500', icon: XCircle },
    info: { bg: 'bg-gray-700', icon: Info },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg shadow-xl animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-4 text-lg text-gray-700 font-semibold">A carregar cupões...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-fade-in">
        <p className="text-xl text-red-700 font-bold mb-4">Ocorreu um Erro:</p>
        <p className="text-gray-700 mb-6">{error}</p>
        <motion.button 
          onClick={() => fetchCoupons()}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Tentar Novamente
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
      {/* Componente Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className={`fixed bottom-5 left-1/2 -translate-x-1/2 flex items-center p-4 rounded-lg text-white font-semibold shadow-xl z-50 transition-colors duration-300 ${toastStyles[toastType].bg}`}
          >
            {React.createElement(toastStyles[toastType].icon, { className: "w-6 h-6 mr-3" })}
            <span className="text-sm">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        Gestão de Cupões
      </h1>
      <p className="text-lg text-gray-700 mb-8">Crie, edite e elimine cupões de desconto para a sua loja.</p>

      {/* Formulário de Criação de Cupão com estilo Dark */}
      <div className="mb-10 p-6 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-100 mb-4">Criar Novo Cupão</h2>
        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="code" className="text-sm font-medium text-gray-300 mb-1">Código do Cupão</label>
            <input
              id="code"
              type="text"
              className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 placeholder-gray-400 transition-all duration-200"
              value={newCouponForm.code}
              onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="discount" className="text-sm font-medium text-gray-300 mb-1">Valor do Desconto (%)</label>
            <input
              id="discount"
              type="number"
              className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 placeholder-gray-400 transition-all duration-200"
              value={newCouponForm.discount_percentage}
              onChange={(e) => setNewCouponForm({ ...newCouponForm, discount_percentage: Number(e.target.value) })}
              min="1"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="athlete_name" className="text-sm font-medium text-gray-300 mb-1">Nome do Atleta</label>
            <input
              id="athlete_name"
              type="text"
              className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 placeholder-gray-400 transition-all duration-200"
              value={newCouponForm.athlete_name}
              onChange={(e) => setNewCouponForm({ ...newCouponForm, athlete_name: e.target.value })}
              required
            />
          </div>
          <motion.button
            type="submit"
            className="w-full px-6 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <PlusCircle className="inline-block mr-2 h-5 w-5" />
            Adicionar Cupão
          </motion.button>
        </form>
      </div>

      {/* Tabela de Cupões */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cupões Existentes</h2>
        {coupons.length === 0 ? (
          <p className="text-lg text-gray-700 p-4 bg-gray-50 rounded-lg shadow-md">Nenhum cupão encontrado. Crie um novo acima!</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-orange-50">
                <tr>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Código</th>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Desconto</th>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Atleta</th>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Estado</th>
                  <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {coupons.map((coupon, index) => (
                  <motion.tr
                    key={coupon.id}
                    className={`border-b border-gray-100 last:border-b-0 hover:bg-orange-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{coupon.code}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{coupon.discount}%</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{coupon.athlete_name}</td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(coupon.status_display)}`}>
                        {coupon.status_display}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-800">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          onClick={() => handleViewUsage(coupon.code)}
                          className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Ver Utilizações"
                        >
                          <BarChart2 className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => navigate(`/admin/cupoes/editar/${coupon.code}`)} 
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Editar Cupão"
                        >
                          <Edit className="h-5 w-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          title="Eliminar Cupão"
                        >
                          <Trash2 className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CouponsList;