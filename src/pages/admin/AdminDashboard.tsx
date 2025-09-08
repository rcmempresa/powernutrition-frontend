import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Users, Package, DollarSign, Gift, TrendingUp, AlertTriangle, UserCheck, BarChart2, ListOrdered, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = {
  'pending': '#ffc107',
  'processing': '#007bff',
  'shipped': '#28a745',
  'delivered': '#6610f2',
  'cancelled': '#dc3545',
};

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    newUsers: 0,
    lowStockProductsCount: 0,
    salesData: [],
    lowStockProducts: [],
    topUser: null,
    averageOrderValue: 0,
    topSellingProducts: [],
    orderStatusData: [],
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLowStockList, setShowLowStockList] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`);
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do dashboard.');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    hover: { scale: 1.05, boxShadow: "0 10px 15px rgba(0, 0, 0, 0.2)" },
    tap: { scale: 0.95 }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xl text-gray-500">
        A carregar dados do dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-xl text-red-500">
        Erro: {error}
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
        Painel de Administração
      </h1>
      <p className="text-lg text-gray-700 mb-8">Bem-vindo, Administrador! Veja um resumo da sua loja e utilize os cartões para gerir o seu negócio.</p>

      {/* NOVO: Secção de Cartões de Navegação (Gestão Rápida) */}
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Gestão Rápida</h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
        variants={containerVariants}
      >
        <Link to="/admin/orders">
          <motion.div 
            className="block p-6 bg-gray-800 text-gray-100 rounded-lg shadow-xl border border-gray-700 cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <h2 className="text-2xl font-semibold mb-2 text-orange-400 flex items-center"><Package className="mr-2" /> Gerir Encomendas</h2>
            <p className="text-gray-300">Visualize e atualize o status das encomendas e aceda aos detalhes.</p>
          </motion.div>
        </Link>
        <Link to="/admin/products">
          <motion.div 
            className="block p-6 bg-gray-800 text-gray-100 rounded-lg shadow-xl border border-gray-700 cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <h2 className="text-2xl font-semibold mb-2 text-green-400 flex items-center"><ShoppingBag className="mr-2" /> Gerir Produtos</h2>
            <p className="text-gray-300">Adicione, edite ou remova produtos da sua loja.</p>
          </motion.div>
        </Link>
        <Link to="/admin/users">
          <motion.div 
            className="block p-6 bg-gray-800 text-gray-100 rounded-lg shadow-xl border border-gray-700 cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <h2 className="text-2xl font-semibold mb-2 text-blue-400 flex items-center"><Users className="mr-2" /> Gerir Utilizadores</h2>
            <p className="text-gray-300">Visualize e defina as permissões dos utilizadores.</p>
          </motion.div>
        </Link>
        <Link to="/admin/coupons">
          <motion.div 
            className="block p-6 bg-gray-800 text-gray-100 rounded-lg shadow-xl border border-gray-700 cursor-pointer"
            variants={itemVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <h2 className="text-2xl font-semibold mb-2 text-purple-400 flex items-center"><Gift className="mr-2" /> Gerir Cupões</h2>
            <p className="text-gray-300">Crie e administre os cupões de desconto.</p>
          </motion.div>
        </Link>
      </motion.div>

      {/* Secção de Indicadores Chave de Performance (KPIs) - Mover para baixo */}
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Métricas Chave</h2>
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-10"
        variants={containerVariants}
      >
        <motion.div 
          className="bg-orange-50 p-6 rounded-lg shadow-md border-l-4 border-orange-500"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Total de Encomendas</h3>
            <ShoppingBag className="h-8 w-8 text-orange-500" />
          </div>
          <p className="text-4xl font-bold text-gray-900 mt-2">{dashboardData.totalOrders}</p>
          <p className="text-sm text-gray-500 mt-1">Dados atualizados</p>
        </motion.div>

        <motion.div 
          className="bg-green-50 p-6 rounded-lg shadow-md border-l-4 border-green-500"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Receita Total</h3>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-4xl font-bold text-gray-900 mt-2">€{dashboardData.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Dados atualizados</p>
        </motion.div>
        
        <motion.div 
          className="bg-blue-50 p-6 rounded-lg shadow-md border-l-4 border-blue-500"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Valor Médio</h3>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-4xl font-bold text-gray-900 mt-2">€{dashboardData.averageOrderValue.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-1">Por encomenda</p>
        </motion.div>

        <motion.div 
          className="bg-purple-50 p-6 rounded-lg shadow-md border-l-4 border-purple-500"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Melhor Cliente</h3>
            <UserCheck className="h-8 w-8 text-purple-500" />
          </div>
          {dashboardData.topUser ? (
            <>
              <p className="text-4xl font-bold text-gray-900 mt-2">{dashboardData.topUser.orderCount}</p>
              <p className="text-sm text-gray-500 mt-1">Encomendas de {dashboardData.topUser.username}</p>
            </>
          ) : (
            <p className="text-lg text-gray-500 mt-2">N/A</p>
          )}
        </motion.div>

        <motion.div 
          className="bg-yellow-50 p-6 rounded-lg shadow-md border-l-4 border-yellow-500"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Produtos com Stock Baixo</h3>
            <AlertTriangle className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-4xl font-bold text-gray-900 mt-2">{dashboardData.lowStockProductsCount}</p>
          <button 
            onClick={() => setShowLowStockList(true)}
            className="text-sm text-blue-500 hover:underline mt-1"
          >
            Veja a lista completa
          </button>
        </motion.div>
      </motion.div>

      {/* Seção de Gráficos e Tabelas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Gráfico de Desempenho de Vendas */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-100 mb-4 flex items-center"><TrendingUp className="mr-2" /> Desempenho de Vendas (últimos 6 meses)</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.salesData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <XAxis dataKey="name" stroke="#A0AEC0" />
                <YAxis stroke="#A0AEC0" />
                <Tooltip cursor={{ fill: '#4B5563', opacity: 0.1 }} />
                <Bar dataKey="sales" fill="#f97316" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* NOVO: Gráfico de Distribuição de Encomendas */}
        <div className="p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-100 mb-4 flex items-center"><Package className="mr-2" /> Estado das Encomendas</h2>
          <div className="h-80 w-full flex items-center justify-center">
            {dashboardData.orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardData.orderStatusData}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label
                  >
                    {dashboardData.orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
                <p className="text-gray-400">Sem dados de estados de encomenda.</p>
            )}
          </div>
        </div>
        
      </div>

      {/* NOVO: Tabela de Produtos Mais Vendidos */}
      <div className="p-6 bg-white rounded-lg shadow-xl border border-gray-100 mt-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <ListOrdered className="mr-2 text-green-600" /> Top 5 Produtos Mais Vendidos
        </h2>
        {dashboardData.topSellingProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Quantidade Vendida
                  </th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.topSellingProducts.map(product => (
                  <tr key={product.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <img className="w-full h-full rounded-full" src={product.image_url} alt={product.name} />
                        </div>
                        <div className="ml-3">
                          <p className="text-gray-900 whitespace-no-wrap">{product.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{product.total_sold}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center text-lg">Nenhum dado de venda disponível.</p>
        )}
      </div>

      {/* Modal/Seção para a lista de produtos com stock baixo */}
      <AnimatePresence>
        {showLowStockList && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Produtos com Stock Baixo</h2>
                <button onClick={() => setShowLowStockList(false)} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">&times;</button>
              </div>
              
              {dashboardData.lowStockProducts.length === 0 ? (
                <p className="text-gray-500 text-center text-lg mt-4">Nenhum produto com stock baixo. Tudo em ordem! 🎉</p>
              ) : (
                <div className="space-y-4">
                  {dashboardData.lowStockProducts.map((product) => (
                    <div key={product.id} className="bg-gray-100 p-4 rounded-lg flex items-center space-x-4">
                      <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600">Stock Total: <span className="font-bold text-red-500">{product.total_stock_ginasio + product.total_quantidade_em_stock}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;