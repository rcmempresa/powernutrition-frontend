import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader2, Edit, Trash2, CheckCircle, XCircle, ListOrdered } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { format, parseISO, isAfter, isBefore } from 'date-fns';

// Tipagem para um utilizador, refletindo a estrutura exata da resposta do backend
interface BackendUser {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
}

// Tipagem para o utilizador como será usado no estado do frontend
interface UserForDisplay {
  id: string;
  username: string;
  email: string;
  is_admin_display: 'Sim' | 'Não';
  status_display: 'Ativo' | 'Inativo';
  created_at: string;
  updated_at: string;
  full_name: string;
}

const UsersList: React.FC = () => {
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  const [users, setUsers] = useState<UserForDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Estados para filtros de pesquisa
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Estados para ordenação
  const [sortKey, setSortKey] = useState<keyof UserForDisplay>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Novos estados para o modal de encomendas
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserForDisplay | null>(null);
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Função para buscar utilizadores do backend
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoading(false);
        return;
      }

      // Requisição para listar utilizadores
      const response = await axios.get<BackendUser[]>('http://localhost:3000/api/users/listar/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedUsers: UserForDisplay[] = response.data.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        is_admin_display: user.is_admin ? 'Sim' : 'Não',
        status_display: user.is_active ? 'Ativo' : 'Inativo',
        created_at: user.created_at,
        updated_at: user.updated_at,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
      }));

      setUsers(fetchedUsers);
    } catch (err: any) {
      console.error('Erro ao buscar utilizadores:', err);
      setError(err.response?.data?.message || 'Erro ao carregar os utilizadores.');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  // NOVO: Função para buscar encomendas de um utilizador específico
  const fetchUserOrders = async (user: UserForDisplay) => {
    setSelectedUser(user);
    setIsOrdersModalOpen(true);
    setOrdersLoading(true);
    setOrdersError(null);
    setUserOrders([]); // Limpar dados anteriores

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado.');
      }

      const response = await axios.get(`http://localhost:3000/api/users/${user.id}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserOrders(response.data);
    } catch (err: any) {
      console.error('Erro ao buscar encomendas do utilizador:', err);
      setOrdersError(err.response?.data?.message || 'Erro ao carregar as encomendas.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Função para lidar com a eliminação de utilizadores
  const handleDeleteUser = useCallback(async (userId: string) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja eliminar o utilizador com ID: ${userId}? Esta ação é irreversível.`);
    if (!confirmDelete) {
      return;
    }

    setDeleteStatus(null);
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setDeleteStatus('Erro: Token de autenticação não encontrado.');
        setLoading(false);
        return;
      }

      await axios.delete(`http://localhost:3000/api/users/remover/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeleteStatus('Utilizador eliminado com sucesso!');
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
    } catch (err: any) {
      console.error('Erro ao eliminar utilizador:', err);
      setDeleteStatus(err.response?.data?.message || 'Erro ao eliminar utilizador. Tente novamente.');
    } finally {
      setLoading(false);
      setTimeout(() => setDeleteStatus(null), 3000);
    }
  }, [getAuthToken]);

  // Lógica de filtragem e ordenação no frontend
  const sortedAndFilteredUsers = users
    .filter(user => {
      const matchesSearchTerm = searchTerm === '' || 
        String(user.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === '' || user.status_display === filterStatus;
      const matchesRole = filterRole === '' || user.is_admin_display === filterRole;

      const userDate = parseISO(user.created_at);
      const matchesStartDate = !startDate || isAfter(userDate, parseISO(startDate));
      const matchesEndDate = !endDate || isBefore(userDate, parseISO(endDate + 'T23:59:59')); 

      return matchesSearchTerm && matchesStatus && matchesRole && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => {
      if (sortKey === 'created_at') {
        const dateA = parseISO(a.created_at);
        const dateB = parseISO(b.created_at);
        return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else if (sortKey === 'username') {
        return sortDirection === 'asc' ? a.username.localeCompare(b.username) : b.username.localeCompare(a.username);
      } else if (sortKey === 'email') {
        return sortDirection === 'asc' ? a.email.localeCompare(b.email) : b.email.localeCompare(a.email);
      }
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = sortedAndFilteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedAndFilteredUsers.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortKey(key as keyof UserForDisplay);
    setSortDirection(direction as 'asc' | 'desc');
    setCurrentPage(1);
  };

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

  // Função auxiliar para obter a cor do status
  const getStatusColorClass = (status: 'Ativo' | 'Inativo') => {
    return status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColorClass = (role: 'Sim' | 'Não') => {
    return role === 'Sim' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg shadow-xl animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-4 text-lg text-gray-700 font-semibold">A carregar utilizadores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-fade-in">
        <p className="text-xl text-red-700 font-bold mb-4">Ocorreu um Erro:</p>
        <p className="text-gray-700 mb-6">{error}</p>
        <motion.button 
          onClick={() => fetchUsers()}
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
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        Gestão de Utilizadores
      </h1>
      <p className="text-lg text-gray-700 mb-8">Aqui você poderá ver, adicionar, editar e remover utilizadores da sua loja.</p>
      
      <div className="mb-8 flex justify-end">
        <Link to="/admin/users/new">
          <motion.button
            className="flex items-center px-6 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Adicionar Novo Utilizador
          </motion.button>
        </Link>
      </div>

      {/* --- Filtros de Pesquisa, Data e Ordenação (Menu Dark) --- */}
      <div className="mb-8 flex flex-wrap gap-4 items-center p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
        <input
          type="text"
          placeholder="Pesquisar (Nome, Email)"
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
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
        </select>
        
        <select
          value={filterRole}
          onChange={handleFilterChange(setFilterRole)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
        >
          <option value="">Todas as Roles</option>
          <option value="Sim">Admin</option>
          <option value="Não">Utilizador</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={handleFilterChange(setStartDate)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
          aria-label="Data de Início"
        />
        <input
          type="date"
          value={endDate}
          onChange={handleFilterChange(setEndDate)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
          aria-label="Data de Fim"
        />
        
        <select
          value={`${sortKey}-${sortDirection}`}
          onChange={handleSortChange}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
          aria-label="Ordenar por"
        >
          <option value="created_at-desc">Data Criação (Recente)</option>
          <option value="created_at-asc">Data Criação (Antiga)</option>
          <option value="username-asc">Nome de Utilizador (A-Z)</option>
          <option value="username-desc">Nome de Utilizador (Z-A)</option>
          <option value="email-asc">Email (A-Z)</option>
          <option value="email-desc">Email (Z-A)</option>
        </select>

        <motion.button
          onClick={() => {
            setSearchTerm('');
            setFilterStatus('');
            setFilterRole('');
            setStartDate('');
            setEndDate('');
            setSortKey('created_at');
            setSortDirection('desc');
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

      {/* Mensagens de Feedback para Eliminação */}
      <AnimatePresence>
        {deleteStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg mb-6 flex items-center ${
              deleteStatus.includes('sucesso') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {deleteStatus.includes('sucesso') ? <CheckCircle className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
            <p className="font-semibold">{deleteStatus}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {sortedAndFilteredUsers.length === 0 && !loading ? (
        <p className="text-lg text-gray-700 p-4 bg-gray-50 rounded-lg shadow-md">Nenhum utilizador encontrado com os filtros e ordenação aplicados.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">ID Utilizador</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Nome Completo</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Username</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Email</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Admin</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Data Criação</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentUsers.map((user, index) => (
                <motion.tr 
                  key={user.id} 
                  className={`border-b border-gray-100 last:border-b-0 hover:bg-orange-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <td className="py-3 px-4 text-sm text-gray-800">{String(user.id).substring(0, 8)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{user.full_name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{user.username}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColorClass(user.is_admin_display)}`}>
                      {user.is_admin_display}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    {format(parseISO(user.created_at), 'dd/MM/yyyy HH:mm')}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => fetchUserOrders(user)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Ver Encomendas"
                      >
                        <ListOrdered className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => navigate(`/admin/users/edit/${user.id}`)} 
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Editar Utilizador"
                      >
                        <Edit className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Remover Utilizador"
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

      {/* Controles de Paginação */}
      {sortedAndFilteredUsers.length > itemsPerPage && (
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

      {/* NOVO: Modal de Encomendas do Utilizador */}
      <AnimatePresence>
        {isOrdersModalOpen && selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">
                  Encomendas de: {selectedUser.full_name}
                </h2>
                <button
                  onClick={() => setIsOrdersModalOpen(false)}
                  className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                  &times;
                </button>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                </div>
              ) : ordersError ? (
                <div className="text-center text-red-500 text-lg p-4 bg-red-50 rounded-lg">{ordersError}</div>
              ) : userOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">ID Encomenda</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Total</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Estado</th>
                        <th className="py-3 px-4 text-left text-sm font-semibold text-gray-600 uppercase">Data</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {userOrders.map(order => (
                        <tr key={order.id}>
                          <td className="py-3 px-4 text-sm text-gray-800">{String(order.id).substring(0, 8)}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">€{parseFloat(order.total_price).toFixed(2)}</td>
                          <td className="py-3 px-4 text-sm text-gray-800">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800">{format(parseISO(order.created_at), 'dd/MM/yyyy HH:mm')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-lg p-4">
                  Este utilizador não tem encomendas registadas.
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UsersList;