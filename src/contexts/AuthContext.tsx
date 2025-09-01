// src/contexts/AuthContext.tsx

import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth'; // Importa o hook

// 1. Cria o contexto
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

// 2. Cria o provedor que usa o hook
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Cria o hook de consumo (pode manter o nome useAuth para consistência)
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
  }
  return context;
};