import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Loader2, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { format, parseISO, isAfter, isBefore } from 'date-fns';

// Tipagem para um produto, refletindo a estrutura exata da resposta do backend
interface BackendProduct {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number; // Stock total online
  sku: string;
  image_url: string;
  category_id: number;
  category_name?: string;
  brand: string;
  weight_unit: string;
  weight_value: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  flavor_id?: number;
  flavor_name?: string;
  original_price?: string;
  stock_ginasio: number; // Stock específico do ginásio
  rating?: string;
  reviewcount?: number;
}

// Tipagem para o produto como será usado no estado do frontend (inclui campos para filtros)
interface ProductForDisplay {
  id: number;
  name: string;
  category_id: number;
  category_display: string;
  price: number;
  // 'stock' aqui representa o stock TOTAL combinado para efeitos de ordenação/filtragem geral.
  // Os valores 'stock_quantity' e 'stock_ginasio' são mantidos para exibição individual.
  stock: number; 
  status_display: 'Ativo' | 'Inativo';
  flavor_id?: number;
  flavor_display: string;
  description: string;
  sku: string;
  image_url: string;
  brand: string;
  weight_unit: string;
  weight_value: number;
  original_price?: number;
  stock_ginasio: number;
  stock_quantity: number; // Manter stock_quantity também aqui para exibir separadamente
  rating?: number;
  reviewcount?: number;
  created_at: string;
  updated_at: string;
}

const ProductsList: React.FC = () => {
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  const [products, setProducts] = useState<ProductForDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  // Estados para filtros de pesquisa
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterFlavor, setFilterFlavor] = useState<string>('');

  // Estados para ordenação
  const [sortKey, setSortKey] = useState<keyof ProductForDisplay>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Função para buscar produtos do backend
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoading(false);
        return;
      }

      const response = await axios.get<BackendProduct[]>(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const fetchedProducts: ProductForDisplay[] = response.data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        // Corrigido para garantir que o valor é um número, usando 0 como fallback
        price: Number(product.price) || 0,
        // Calcular o stock total com fallback para 0 para evitar NaN
        stock: (product.stock_quantity || 0) + (product.stock_ginasio || 0), 
        sku: product.sku,
        image_url: product.image_url,
        category_id: product.category_id,
        category_display: product.category_name || `ID: ${product.category_id}`,
        brand: product.brand,
        weight_unit: product.weight_unit,
        // Corrigido para garantir que o valor é um número
        weight_value: Number(product.weight_value) || 0,
        status_display: product.is_active ? 'Ativo' : 'Inativo',
        created_at: product.created_at,
        updated_at: product.updated_at,
        flavor_id: product.flavor_id,
        flavor_display: product.flavor_name || 'N/A',
        // Corrigido para garantir que o valor é um número
        original_price: product.original_price ? (Number(product.original_price) || 0) : undefined,
        stock_ginasio: product.stock_ginasio || 0,
        stock_quantity: product.stock_quantity || 0,
        // Corrigido para garantir que o valor é um número
        rating: product.rating ? (Number(product.rating) || 0) : undefined,
        reviewcount: product.reviewcount,
      }));

      setProducts(fetchedProducts);
    } catch (err: any) {
      console.error('Erro ao buscar produtos:', err);
      setError(err.response?.data?.message || 'Erro ao carregar os produtos.');
    } finally {
      setLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Lógica do modal de confirmação
  const openDeleteModal = (productId: number) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Função para lidar com a eliminação de produtos
  const handleDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;

    closeDeleteModal();
    setDeleteStatus(null);
    setLoading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        setDeleteStatus('Erro: Token de autenticação não encontrado.');
        setLoading(false);
        return;
      }

      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/eliminar/${productToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeleteStatus('Produto eliminado com sucesso!');
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productToDelete));
    } catch (err: any) {
      console.error('Erro ao eliminar produto:', err);
      setDeleteStatus(err.response?.data?.message || 'Erro ao eliminar produto. Tente novamente.');
    } finally {
      setLoading(false);
      setTimeout(() => setDeleteStatus(null), 3000);
    }
  }, [getAuthToken, productToDelete]);

  // Lógica de filtragem e ordenação no frontend
  const sortedAndFilteredProducts = products
    .filter(product => {
      // Filtrar por termo de pesquisa
      const matchesSearchTerm = searchTerm === '' || 
        String(product.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category_display.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.flavor_display.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtrar por status
      const matchesStatus = filterStatus === '' || product.status_display === filterStatus;

      // Filtrar por categoria
      const matchesCategory = filterCategory === '' || product.category_display === filterCategory;

      // Filtrar por sabor
      const matchesFlavor = filterFlavor === '' || product.flavor_display === filterFlavor;

      // Filtrar por data de criação
      const productDate = parseISO(product.created_at);
      const matchesStartDate = !startDate || isAfter(productDate, parseISO(startDate));
      const matchesEndDate = !endDate || isBefore(productDate, parseISO(endDate + 'T23:59:59')); 

      return matchesSearchTerm && matchesStatus && matchesCategory && matchesFlavor && matchesStartDate && matchesEndDate;
    })
    .sort((a, b) => {
      if (sortKey === 'created_at') {
        const dateA = parseISO(a.created_at);
        const dateB = parseISO(b.created_at);
        return sortDirection === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
      } else if (sortKey === 'price') {
        return sortDirection === 'asc' ? a.price - b.price : b.price - a.price;
      } else if (sortKey === 'name') {
        return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      } else if (sortKey === 'stock') { // 'stock' aqui refere-se ao stock TOTAL combinado
        return sortDirection === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      }
      return 0; 
    });

  // Lógica de paginação no frontend
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedAndFilteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedAndFilteredProducts.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Função genérica para lidar com a mudança de filtros de texto e select
  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  // Lidar com a mudança de ordenação
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [key, direction] = e.target.value.split('-');
    setSortKey(key as keyof ProductForDisplay);
    setSortDirection(direction as 'asc' | 'desc');
    setCurrentPage(1);
  };

  // Extrair categorias e sabores únicos para os dropdowns de filtro
  const uniqueCategories = Array.from(new Set(products.map(p => p.category_display))).sort();
  const uniqueFlavors = Array.from(new Set(products.map(p => p.flavor_display))).sort();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg shadow-xl animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-4 text-lg text-gray-700 font-semibold">A carregar produtos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-fade-in">
        <p className="text-xl text-red-700 font-bold mb-4">Ocorreu um Erro:</p>
        <p className="text-gray-700 mb-6">{error}</p>
        <motion.button 
          onClick={() => fetchProducts()}
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
        Gestão de Produtos
      </h1>
      <p className="text-lg text-gray-700 mb-8">Aqui você poderá ver, adicionar, editar e remover produtos da sua loja.</p>
      
      <div className="mb-8 flex justify-end">
        <Link to="/admin/products/new">
          <motion.button
            className="flex items-center px-6 py-3 bg-orange-500 text-white font-bold rounded-lg shadow-md hover:bg-orange-600 transition-all duration-300 transform hover:scale-105"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Adicionar Novo Produto
          </motion.button>
        </Link>
      </div>

      {/* --- Filtros de Pesquisa, Data e Ordenação (Menu Dark) --- */}
      <div className="mb-8 flex flex-wrap gap-4 items-center p-4 bg-gray-800 rounded-lg shadow-inner border border-gray-700">
        <input
          type="text"
          placeholder="Pesquisar (Nome, SKU, Marca, Cat., Sabor)"
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

        {/* Filtro por Categoria */}
        <select
          value={filterCategory}
          onChange={handleFilterChange(setFilterCategory)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
        >
          <option value="">Todas as Categorias</option>
          {uniqueCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        {/* Filtro por Sabor */}
        <select
          value={filterFlavor}
          onChange={handleFilterChange(setFilterFlavor)}
          className="p-3 border border-gray-600 rounded-lg shadow-sm focus:ring-orange-400 focus:border-orange-400 text-gray-100 bg-gray-700 transition-all duration-200 focus:ring-2"
        >
          <option value="">Todos os Sabores</option>
          {uniqueFlavors.map(flavor => (
            <option key={flavor} value={flavor}>{flavor}</option>
          ))}
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
          <option value="name-asc">Nome (A-Z)</option>
          <option value="name-desc">Nome (Z-A)</option>
          <option value="price-asc">Preço (Crescente)</option>
          <option value="price-desc">Preço (Decrescente)</option>
          <option value="stock-asc">Stock (Crescente)</option>
          <option value="stock-desc">Stock (Decrescente)</option>
        </select>

        <motion.button
          onClick={() => {
            setSearchTerm('');
            setFilterStatus('');
            setStartDate('');
            setEndDate('');
            setFilterCategory('');
            setFilterFlavor('');
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

      {sortedAndFilteredProducts.length === 0 && !loading ? (
        <p className="text-lg text-gray-700 p-4 bg-gray-50 rounded-lg shadow-md">Nenhum produto encontrado com os filtros e ordenação aplicados.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-orange-50">
              <tr>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">ID Produto</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Imagem</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Nome</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Categoria</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Sabor</th>
                {/* Antigo "Stock Total", agora "Stock Online" */}
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Preço</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Stock Online</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Stock Ginásio</th>
                {/* Nova coluna para o Stock Total (stock_quantity + stock_ginasio) */}
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Stock Total</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Ativo</th>
                <th className="py-4 px-4 text-left text-sm font-semibold text-orange-700 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {currentProducts.map((product, index) => (
                <motion.tr 
                  key={product.id} 
                  className={`border-b border-gray-100 last:border-b-0 hover:bg-orange-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <td className="py-3 px-4 text-sm text-gray-800">{String(product.id).substring(0, 8)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <img src={product.image_url} alt={product.name} className="h-12 w-12 object-cover rounded-md" />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{product.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{product.category_display}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{product.flavor_display}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">€{product.price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{product.stock_quantity}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{product.stock_ginasio}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{product.stock}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(product.status_display)}`}>
                      {product.status_display}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Editar Produto"
                      >
                        <Edit className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => navigate(`/admin/products/add-images/${product.id}`)}
                        className="text-orange-600 hover:text-orange-900 p-2 rounded-full hover:bg-orange-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Adicionar/Gerir Imagens"
                      >
                        <Loader2 className="h-5 w-5" />
                      </motion.button>
                      <motion.button
                        onClick={() => openDeleteModal(product.id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Remover Produto"
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
      {sortedAndFilteredProducts.length > itemsPerPage && (
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

      {/* Modal de Confirmação */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: -50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminação</h3>
              <p className="text-gray-700 mb-6">Tem certeza que deseja eliminar este produto? Esta ação é irreversível.</p>
              <div className="flex justify-end space-x-4">
                <motion.button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={handleDeleteProduct}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Eliminar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductsList;
