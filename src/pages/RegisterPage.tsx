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

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

export const RegisterPage: React.FC = () => {
  // Campos de autenticação
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  // Campos de perfil/endereço
  const [first_name, setFirstName] = useState<string>('');
  const [last_name, setLastName] = useState<string>('');
  const [phone_number, setPhoneNumber] = useState<string>('');
  const [address_line1, setAddressLine1] = useState<string>('');
  const [address_line2, setAddressLine2] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state_province, setStateProvince] = useState<string>('');
  const [postal_code, setPostalCode] = useState<string>('');
  const [country, setCountry] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem!');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          first_name,
          last_name,
          phone_number,
          address_line1,
          address_line2,
          city,
          state_province,
          postal_code,
          country,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registro bem-sucedido! Faça login para continuar.');
        navigate('/login');
      } else {
        const errorMessage = data.message || 'Erro ao registrar. Tente novamente.';
        toast.error(`Falha no registro: ${errorMessage}`);
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
          width: '500px',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>Registro de Nova Conta</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {/* Campos de Autenticação */}
            <div>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Nome de Usuário:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Senha:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Confirmar Senha:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }} />

            {/* Campos de Informações Pessoais e Endereço */}
            <div>
              <label htmlFor="first_name" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Primeiro Nome:</label>
              <input
                type="text"
                id="first_name"
                value={first_name}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="last_name" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Último Nome:</label>
              <input
                type="text"
                id="last_name"
                value={last_name}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="phone_number" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Telefone:</label>
              <input
                type="tel"
                id="phone_number"
                value={phone_number}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="address_line1" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Endereço Linha 1:</label>
              <input
                type="text"
                id="address_line1"
                value={address_line1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label htmlFor="address_line2" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Endereço Linha 2:</label>
              <input
                type="text"
                id="address_line2"
                value={address_line2}
                onChange={(e) => setAddressLine2(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="city" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Cidade:</label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="state_province" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Estado/Província:</label>
                <input
                  type="text"
                  id="state_province"
                  value={state_province}
                  onChange={(e) => setStateProvince(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="postal_code" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>Código Postal:</label>
                <input
                  type="text"
                  id="postal_code"
                  value={postal_code}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="country" style={{ display: 'block', marginBottom: '5px', color: '#555' }}>País:</label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                transition: 'background-color 0.3s ease',
                marginTop: '20px'
              }}
            >
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: '20px', color: '#777' }}>
            Já tem uma conta? <Link to="/login" style={{ color: '#28a745', textDecoration: 'none' }}>Faça login aqui.</Link>
          </p>
        </div>
      </main>

      {/* Footer */}
     <Footer />
    </div>
  );
};