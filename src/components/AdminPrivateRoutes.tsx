// src/components/AdminPrivateRoute.tsx

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Importe o seu hook de autenticação

const AdminPrivateRoutes: React.FC = () => {
  const { user, isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    // Pode exibir um spinner ou uma mensagem de carregamento enquanto verifica a autenticação
    return <div className="flex items-center justify-center min-h-screen">A verificar permissões...</div>;
  }

  if (!isAuthenticated) {
    // Se não estiver autenticado, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_admin) {
    // Se não for admin, redireciona para uma página de "acesso negado" ou para a página inicial
    // Você pode criar uma página mais amigável para acesso negado.
    return <Navigate to="/" replace />; 
  }

  // Se for autenticado e admin, renderiza o componente filho (a rota aninhada)
  return <Outlet />;
};

export default AdminPrivateRoutes;
