// src/components/AdminLayout.tsx

import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Home, Package, ShoppingBag, Users, Gift, LogOut, Megaphone } from 'lucide-react'; // ✨ ADICIONE Megaphone ✨
import { useAuth } from '../hooks/useAuth';

const AdminLayout: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4 shadow-lg">
        <div className="text-2xl font-bold mb-8 text-orange-500">
          Painel de Administrador 
        </div>
        <nav className="flex-grow">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className="flex items-center p-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/admin/orders"
                className="flex items-center p-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <ShoppingBag className="h-5 w-5 mr-3" />
                Encomendas
              </Link>
            </li>
            <li>
              <Link
                to="/admin/products"
                className="flex items-center p-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Package className="h-5 w-5 mr-3" />
                Produtos
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center p-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Users className="h-5 w-5 mr-3" />
                Utilizadores
              </Link>
            </li>
            {/* ✨ ADICIONE ESTE NOVO ITEM ✨ */}
            <li>
              <Link
                to="/admin/campaigns"
                className="flex items-center p-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Megaphone className="h-5 w-5 mr-3" />
                Campanhas
              </Link>
            </li>
            <li>
              <Link
                to="/admin/coupons"
                className="flex items-center p-2 text-gray-200 hover:bg-gray-700 rounded-md transition-colors duration-200"
              >
                <Gift className="h-5 w-5 mr-3" />
                Cupões
              </Link>
            </li>
          </ul>
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-2 text-red-400 hover:bg-gray-700 rounded-md transition-colors duration-200"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8">
        <Outlet /> {/* Aqui será renderizado o conteúdo da rota de admin aninhada */}
      </main>
    </div>
  );
};

export default AdminLayout;