import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Save, XCircle, CheckCircle, Info } from 'lucide-react';
import axios from 'axios';

// Tipagem atualizada para o cupão
interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  athlete_name: string | null;
  is_specific: boolean; // Adicionado
  product_id: number | null; // Adicionado
  is_active: boolean; // Adicionado
}

// Tipagem para os produtos
interface Product {
    id: number;
    name: string;
    original_price: number;
}

const CouponEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
  const navigate = useNavigate();

  const [couponData, setCouponData] = useState<Coupon | null>(null);
  const [products, setProducts] = useState<Product[]>([]); // Novo estado para os produtos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000); 
  };
  
  // Função para buscar os dados do cupão
  const fetchCoupon = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Nota: o 'id' que vem da URL é o `code`, não o `id` interno do cupão
      // A sua rota de backend deve tratar isso.
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cupoes/listar/${id}`);
      setCouponData(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar o cupão:', err);
      setError(err.response?.data?.message || 'Erro ao carregar os dados do cupão.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Função para buscar os produtos
  const fetchProducts = useCallback(async () => {
    try {
        const response = await axios.get<Product[]>('https://powernutrition-backend-production-7883.up.railway.app/api/products/listar/');
        setProducts(response.data);
    } catch (err: any) {
        console.error('Erro ao buscar produtos:', err);
        showToast('Não foi possível carregar a lista de produtos.', 'error');
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCoupon();
      fetchProducts();
    }
  }, [id, fetchCoupon, fetchProducts]);

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!couponData) return;

    setIsSubmitting(true);
    setError(null);
    
    // Preparar o payload para a atualização
    const payload = {
        code: couponData.code,
        discount_percentage: couponData.discount_percentage,
        athlete_name: couponData.athlete_name === '' ? null : couponData.athlete_name,
        is_specific: couponData.is_specific,
        product_id: couponData.is_specific ? couponData.product_id : null,
    };

    try {
      // Agora, a sua rota de backend espera o ID interno para a atualização
      // O id na URL é o `code`, mas o `couponData.id` é o id real do banco de dados
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cupoes/atualizar/${couponData.id}`, payload);
      
      showToast('Cupão atualizado com sucesso!', 'success');
      
      setTimeout(() => navigate('/admin/coupons'), 1500);
      
    } catch (err: any) {
      console.error('Erro ao atualizar o cupão:', err);
      const errorMessage = err.response?.data?.message || 'Erro ao atualizar o cupão. Tente novamente.';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toastStyles = {
    success: { bg: 'bg-green-500', icon: CheckCircle },
    error: { bg: 'bg-red-500', icon: XCircle },
    info: { bg: 'bg-gray-700', icon: Info },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg shadow-xl animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-4 text-lg text-gray-700 font-semibold">A carregar cupão...</p>
      </div>
    );
  }

  if (error && !couponData) {
    return (
      <div className="p-8 text-center bg-red-50 border-2 border-red-300 rounded-lg shadow-md">
        <p className="text-xl text-red-700 font-bold mb-4">Ocorreu um Erro:</p>
        <p className="text-gray-700 mb-6">{error}</p>
      </div>
    );
  }

  if (!couponData) {
    return <p className="text-center text-lg text-gray-500">Cupão não encontrado.</p>;
  }

  return (
    <motion.div
      className="p-8 bg-white rounded-lg shadow-2xl border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6">
        Editar Cupão: {couponData.code}
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Altere os dados do cupão e clique em guardar para aplicar as alterações.
      </p>

      <div className="p-6 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="flex flex-col">
            <label htmlFor="code" className="text-sm font-medium text-gray-300 mb-1">Código do Cupão</label>
            <input
              id="code"
              type="text"
              className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200"
              value={couponData.code}
              onChange={(e) => setCouponData({ ...couponData, code: e.target.value })}
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="discount" className="text-sm font-medium text-gray-300 mb-1">Valor do Desconto (%)</label>
            <input
              id="discount"
              type="number"
              className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200"
              value={couponData.discount_percentage}
              onChange={(e) => setCouponData({ ...couponData, discount_percentage: Number(e.target.value) })}
              min="1"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="athlete_name" className="text-sm font-medium text-gray-300 mb-1">Nome do Atleta (Opcional)</label>
            <input
              id="athlete_name"
              type="text"
              className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200"
              value={couponData.athlete_name || ''}
              onChange={(e) => setCouponData({ ...couponData, athlete_name: e.target.value })}
            />
          </div>
          
          {/* Campos novos para edição */}
          <div className="flex items-center space-x-2">
            <input
              id="is_specific"
              type="checkbox"
              checked={couponData.is_specific}
              onChange={(e) => setCouponData({
                ...couponData,
                is_specific: e.target.checked,
                product_id: e.target.checked ? couponData.product_id : null,
              })}
              className="w-4 h-4 text-orange-500 border-gray-600 rounded focus:ring-orange-400 bg-gray-700"
            />
            <label htmlFor="is_specific" className="text-sm font-medium text-gray-300">
              Cupão para Produto Específico?
            </label>
          </div>

          {couponData.is_specific && (
            <div className="flex flex-col">
              <label htmlFor="product_id" className="text-sm font-medium text-gray-300 mb-1">
                Selecione o Produto
              </label>
              <select
                id="product_id"
                className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200"
                value={couponData.product_id || ''}
                onChange={(e) => setCouponData({ ...couponData, product_id: Number(e.target.value) })}
                required
              >
                <option value="" disabled>Selecione um produto...</option>
                {products.map(product => (
                    <option key={product.id} value={product.id}>
                        {product.name}
                    </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-4">
            <motion.button
              type="submit"
              className="flex-grow px-6 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="inline-block mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="inline-block mr-2 h-5 w-5" />
              )}
              {isSubmitting ? 'A Guardar...' : 'Guardar Alterações'}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate('/admin/coupons')}
              className="px-6 py-3 bg-gray-600 text-white font-bold rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
            >
              <XCircle className="inline-block mr-2 h-5 w-5" />
              Cancelar
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CouponEdit;