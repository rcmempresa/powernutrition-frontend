import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  User,
  ArrowRight
} from 'lucide-react';
import Footer from '../components/FooterPage';
import { useAuthContext } from '../contexts/AuthContext.tsx'; // Importe o hook do contexto

const API_BASE_URL = 'http://localhost:3000/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const auth = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Login bem-sucedido!');
        auth.login(data.token);
        
        // Redirecione imediatamente
        navigate('/');
        
      } else {
        const errorMessage = data.message || 'Credenciais inválidas. Tente novamente.';
        toast.error(`Erro ao fazer login: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Erro de rede ou comunicação:', error);
      toast.error('Ocorreu um erro ao conectar ao servidor. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-f0f2f5">
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        padding: '20px 0'
      }}>
        <div style={{
          padding: '40px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          width: '350px',
          maxWidth: '90%'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Login</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', color: '#555' }}>Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', color: '#555' }}>Senha:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  boxSizing: 'border-box',
                  fontSize: '16px'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#777' }}>
            Não tem uma conta? <Link to="/register" style={{ color: '#007bff', textDecoration: 'none' }}>Registre-se aqui.</Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};