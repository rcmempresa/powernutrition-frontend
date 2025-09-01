// src/hooks/useAuth.tsx

import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode'; // Importação corrigida aqui!
import axios from 'axios';

// Definição de tipo para o payload do JWT (adapte conforme o seu token)
interface DecodedToken {
  id: string;
  email: string;
  is_admin: boolean; // Supondo que o seu token JWT contém esta informação
  exp: number; // Data de expiração
}

interface User {
  id: string;
  email: string;
  is_admin: boolean;
  username?: string; // Adicione outras propriedades do utilizador que você queira
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  const getAuthToken = useCallback(() => {
    return localStorage.getItem('authToken');
  }, []);

  const validateToken = useCallback((token: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; 

      if (decoded.exp < currentTime) {
        // Token expirado
        localStorage.removeItem('authToken');
        return null;
      }
      return decoded;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      localStorage.removeItem('authToken');
      return null;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      setLoadingAuth(true);
      const token = getAuthToken();
      if (token) {
        const decoded = validateToken(token);
        if (decoded) {
          setUser({
            id: decoded.id,
            email: decoded.email,
            is_admin: decoded.is_admin,
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoadingAuth(false);
    };

    checkAuth();

    // Opcional: listener para mudanças no localStorage se o token for manipulado fora do hook
    const handleStorageChange = () => {
      checkAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);

  }, [getAuthToken, validateToken]);

  const login = useCallback((token: string) => {
    localStorage.setItem('authToken', token);
    const decoded = validateToken(token);
    if (decoded) {
      setUser({
        id: decoded.id,
        email: decoded.email,
        is_admin: decoded.is_admin,
      });
      setIsAuthenticated(true);
    }
  }, [validateToken]);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return { user, isAuthenticated, loadingAuth, login, logout, getAuthToken };
};
