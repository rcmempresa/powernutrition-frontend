import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth'; // Certifique-se de que o caminho para useAuth está correto
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { Link } from 'react-router-dom'; // Importação do Link para navegação
import { motion } from 'framer-motion'; // Importa framer-motion
import { Loader2 } from 'lucide-react'; // Importação do Loader2

// Tipagem para uma encomenda (ajuste conforme o seu modelo de dados)
interface Order {
  id: string | number;
  user_id: string | number;
  username?: string; // Nome do utilizador vindo do backend
  address_id: string | number;
  address_line1?: string; // Primeira linha da morada vinda do backend
  total_price: number | string;
  status: string;
  payment_method: string;
  easypay_id?: string; // ID do Easypay vindo do backend
  created_at: string;
}

const OrdersList: React.FC = () => {
  const { getAuthToken } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 20;

  // Estados para filtros de pesquisa
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Estados para ordenação
  const [sortKey, setSortKey] = useState<keyof Order>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoading(false);
        return;
      }

      // A API de backend agora devolve todos os dados, sem filtros nem paginação
      const response = await axios.get('http://localhost:3000/api/orders/admin/encomendas', { // Verifique esta URL se for diferente
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data); // Recebemos todas as encomendas e filtramos no frontend
    } catch (err: any) {
      console.error('Erro ao buscar encomendas:', err);
      setError(err.response?.data?.message || 'Erro ao carregar as encomendas.');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]); // Apenas getAuthToken é uma dependência, pois não passamos filtros para a API

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Lógica de filtragem e ordenação no frontend (baseada em todos os dados recebidos)
  const sortedAndFilteredOrders = orders
    .filter(order => {
      // Filtrar por termo de pesquisa (ID, Nome de Utilizador, Método de Pagamento, Linha da Morada, Easypay ID)
      const matchesSearchTerm = searchTerm === '' || 
        String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.username && String(order.username).toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(order.payment_method).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.address_line1 && String(order.address_line1).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.easypay_id && String(order.easypay_id).toLowerCase().includes(searchTerm.toLowerCase()));

      // Filtrar por status
      const matchesStatus = filterStatus === '' || order.status === filterStatus;

      // Filtrar por data
      const orderDate = parseISO(order.created_at);
      const matchesStartDate = !startDate || isAfter(orderDate, parseISO(startDate));
      const matchesEndDate = !endDate || isBefore(orderDate, parseISO(endDate + 'T23:59:59')); 

      return matchesSearchTerm && matchesStatus && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => {
      // Lógica de ordenação
      if (sortKey === 'created_at') {
        const dateA = parseISO(a.created_at);
        const dateB = parseISO(b.created_at);
        return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else if (sortKey === 'total_price') {
        const priceA = Number(a.total_price);
        const priceB = Number(b.total_price);
        return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
      }
      return 0; // Sem alteração de ordem para outras chaves não definidas
    });

  // Lógica de paginação no frontend (baseada em sortedAndFilteredOrders)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = sortedAndFilteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedAndFilteredOrders.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Função genérica para lidar com a mudança de filtros de texto e select
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setCurrentPage(1); // Resetar para a primeira página ao aplicar qualquer filtro
  };

  // Lidar com a mudança de ordenação
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortKey(key as keyof Order);
    setSortDirection(direction as 'asc' | 'desc');
    setCurrentPage(1); // Resetar para a primeira página ao mudar a ordenação
  };

  // Variantes de animação para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  // Função auxiliar para obter a cor do status
  const getStatusColorClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pago':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'enviado':
        return 'bg-blue-100 text-blue-800'; // Alterado de laranja para azul para manter o contraste do tema claro
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-100 rounded-lg shadow-xl animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        <p className="ml-4 text-lg text-gray-700 font-semibold">A carregar encomendas...</p>
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

  return (
    <motion.div 
      className="p-8 bg-white rounded-lg shadow-2xl border border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        Gestão de Encomendas
      </h1>
      
      {/* --- Filtros de Pesquisa, Data e Ordenação (Menu Dark) --- */}
      <div className="mb-8 flex flex-wrap gap-4 items-center p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700"> {/* Fundo mais escuro */}
        <input
          type="text"
          placeholder="Pesquisar por ID, Utilizador, Morada, Pagamento..."
          value={searchTerm}
          onChange={handleFilterChange(setSearchTerm)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 flex-grow text-gray-100 bg-gray-700 placeholder-gray-400 transition-all duration-200 focus:ring-2"
        />
        <select
          value={filterStatus}
          onChange={handleFilterChange(setFilterStatus)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
        >
          <option value="">Todos os Status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="enviado">Enviado</option>
          <option value="cancelado">Cancelado</option>
        </select>

        {/* Campo de filtro por data de início */}
        <input
          type="date"
          value={startDate}
          onChange={handleFilterChange(setStartDate)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
          aria-label="Data de Início"
        />
        {/* Campo de filtro por data de fim */}
        <input
          type="date"
          value={endDate}
          onChange={handleFilterChange(setEndDate)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
          aria-label="Data de Fim"
        />
        
        {/* Campo de ordenação */}
        <select
          value={`${sortKey}-${sortDirection}`}
          onChange={handleSortChange}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
          aria-label="Ordenar por"
        >
          <option value="created_at-desc">Data (Mais Recente)</option>
          <option value="created_at-asc">Data (Mais Antiga)</option>
          <option value="total_price-desc">Preço (Maior)</option>
          <option value="total_price-asc">Preço (Menor)</option>
        </select>

        <motion.button
          onClick={() => { // Botão para limpar todos os filtros
            setSearchTerm('');
            setFilterStatus('');
            setStartDate('');
            setEndDate('');
            setSortKey('created_at'); // Resetar ordenação
            setSortDirection('desc'); // Resetar ordenação
            setCurrentPage(1);
          }}
          className="px-6 py-3 bg-gray-700 text-gray-200 font-bold rounded-lg shadow-md hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 border border-gray-600"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Limpar Filtros
        </motion.button>
      </div>
      {/* --- Fim dos Filtros --- */}

      {sortedAndFilteredOrders.length === 0 && !loading ? (
        <p className="text-lg text-gray-700 p-4 bg-gray-50 rounded-lg shadow-md">Nenhuma encomenda encontrada com os filtros e ordenação aplicados.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50"> {/* Cabeçalho da tabela com cor de destaque */}
              <tr>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">ID Encomenda</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Utilizador</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Morada (Linha 1)</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">ID Easypay</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Total</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Status</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Data</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentOrders.map((order, index) => (
                <motion.tr 
                  key={order.id} 
                  className={`border-b border-gray-100 last:border-b-0 hover:bg-orange-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index} // Para escalonar a animação das linhas
                >
                  <td className="py-3 px-4 text-sm text-gray-800">{String(order.id).substring(0, 8)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{order.username || String(order.user_id).substring(0, 8) + '...'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{order.address_line1 || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{order.easypay_id ? String(order.easypay_id).substring(0, 8) + '...' : 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">€{Number(order.total_price).toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 capitalize">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <Link to={`/admin/orders/${order.id}`} className="text-orange-600 hover:text-orange-800 hover:underline font-medium transition-colors duration-200">Ver Detalhes</Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Controles de Paginação */}
      {sortedAndFilteredOrders.length > itemsPerPage && (
        <div className="flex justify-center mt-8 space-x-3">
          <motion.button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Anterior
          </motion.button>
          {Array.from({ length: totalPages }, (_, i) => (
            <motion.button
              key={i + 1}
              onClick={() => paginate(i + 1)}
              className={`px-4 py-2 rounded-lg font-semibold shadow-sm transition-all duration-300 ${
                currentPage === i + 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {i + 1}
            </motion.button>
          ))}
          <motion.button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-5 py-2 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Próxima
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default OrdersList;
