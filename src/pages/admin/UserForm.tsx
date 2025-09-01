import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Save, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

// Tipagem para os dados do utilizador a serem enviados/recebidos
interface UserFormData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password?: string; // Opcional para edição, mas necessário para criação
  is_admin: boolean;
  is_active: boolean;
  phone_number: string; // ✨ NOVO CAMPO ✨
  address_line1: string; // ✨ NOVO CAMPO ✨
  address_line2: string; // ✨ NOVO CAMPO ✨
  city: string; // ✨ NOVO CAMPO ✨
  state_province: string; // ✨ NOVO CAMPO ✨
  postal_code: string; // ✨ NOVO CAMPO ✨
  country: string; // ✨ NOVO CAMPO ✨
}

// Tipagem para a resposta do backend ao criar/atualizar um utilizador
interface UserResponse {
  id: string; // O ID do utilizador é crucial
  // ... outras propriedades do utilizador retornado pelo backend
}

const UserForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Obtém o ID para edição
  const { getAuthToken } = useAuth();

  const isEditing = !!id; // Verdadeiro se estiver a editar, falso se for novo

  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '', // Inicializa vazio para ser preenchido na criação
    is_admin: false,
    is_active: true,
    phone_number: '', // ✨ Inicialização do novo campo ✨
    address_line1: '', // ✨ Inicialização do novo campo ✨
    address_line2: '', // ✨ Inicialização do novo campo ✨
    city: '', // ✨ Inicialização do novo campo ✨
    state_province: '', // ✨ Inicialização do novo campo ✨
    postal_code: '', // ✨ Inicialização do novo campo ✨
    country: '', // ✨ Inicialização do novo campo ✨
  });

  const [loadingForm, setLoadingForm] = useState<boolean>(true);
  const [loadingPromote, setLoadingPromote] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Variantes de animação para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 8px 16px rgba(249, 115, 22, 0.4)" },
    tap: { scale: 0.95 }
  };

  // Função para carregar dados do utilizador se estiver em modo de edição
  const fetchUserData = useCallback(async () => {
    if (!isEditing || !id) {
      setLoadingForm(false);
      return;
    }

    setLoadingForm(true);
    setSubmitError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setSubmitError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoadingForm(false);
        return;
      }

      const response = await axios.get(`http://localhost:3000/api/users/listar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = response.data;

      setFormData({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        password: '', 
        is_admin: userData.is_admin,
        is_active: userData.is_active,
        phone_number: userData.phone_number || '', // ✨ Preenchimento do novo campo ✨
        address_line1: userData.address_line1 || '', // ✨ Preenchimento do novo campo ✨
        address_line2: userData.address_line2 || '', // ✨ Preenchimento do novo campo ✨
        city: userData.city || '', // ✨ Preenchimento do novo campo ✨
        state_province: userData.state_province || '', // ✨ Preenchimento do novo campo ✨
        postal_code: userData.postal_code || '', // ✨ Preenchimento do novo campo ✨
        country: userData.country || '', // ✨ Preenchimento do novo campo ✨
      });
    } catch (err: any) {
      console.error('Erro ao carregar dados do utilizador:', err);
      setSubmitError(err.response?.data?.message || 'Erro ao carregar dados do utilizador.');
    } finally {
      setLoadingForm(false);
    }
  }, [id, isEditing, getAuthToken]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingForm(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setSubmitError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoadingForm(false);
        return;
      }

      // Validação básica de campos obrigatórios (ajustada para os novos campos)
      if (!formData.username || !formData.email || (!isEditing && !formData.password) ||
          !formData.first_name || !formData.last_name || !formData.phone_number ||
          !formData.address_line1 || !formData.city || !formData.state_province ||
          !formData.postal_code || !formData.country
      ) {
        setSubmitError('Por favor, preencha todos os campos obrigatórios.');
        setLoadingForm(false);
        return;
      }

      let response;
      if (isEditing) {
        // Lógica para EDITAR utilizador
        const dataToUpdate = { ...formData };
        if (dataToUpdate.password === '') {
          delete dataToUpdate.password;
        }

        response = await axios.put<UserResponse>(`http://localhost:3000/api/users/atualizar/${id}`, dataToUpdate, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setSubmitSuccess('Utilizador atualizado com sucesso!');
      } else {
        // ✨ Lógica para CRIAR utilizador - Requisição para /api/users/register ✨
        response = await axios.post<UserResponse>('http://localhost:3000/api/users/register', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setSubmitSuccess('Utilizador adicionado com sucesso!');
        // Limpa o formulário após a criação
        setFormData({
          username: '', email: '', first_name: '', last_name: '', password: '',
          is_admin: false, is_active: true, phone_number: '', address_line1: '',
          address_line2: '', city: '', state_province: '', postal_code: '', country: '',
        });
      }
      
      // Redireciona para a lista de utilizadores após sucesso (criação ou atualização)
      setTimeout(() => navigate('/admin/users'), 1500);

    } catch (err: any) {
      console.error('Erro ao guardar utilizador:', err);
      setSubmitError(err.response?.data?.message || 'Erro ao guardar utilizador. Verifique os dados e tente novamente.');
    } finally {
      setLoadingForm(false);
    }
  };

  // Função para promover um utilizador a administrador
  const handlePromoteUser = useCallback(async () => {
    const confirmPromote = window.confirm(`Tem certeza que deseja promover ${formData.username} a administrador?`);
    if (!confirmPromote) {
      return;
    }

    setLoadingPromote(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setSubmitError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoadingPromote(false);
        return;
      }

      await axios.patch(`http://localhost:3000/api/users/promote/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      setSubmitSuccess('Utilizador promovido a administrador com sucesso!');
      setFormData(prev => ({ ...prev, is_admin: true }));
      setTimeout(() => navigate('/admin/users'), 1500);

    } catch (err: any) {
      console.error('Erro ao promover utilizador:', err);
      setSubmitError(err.response?.data?.message || 'Erro ao promover utilizador. Tente novamente.');
    } finally {
      setLoadingPromote(false);
    }
  }, [id, formData.username, getAuthToken, navigate]);


  return (
    <motion.div 
      className="p-8 bg-white rounded-lg shadow-2xl border border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        {isEditing ? `Editar Utilizador: ${formData.username || '...'}` : 'Adicionar Novo Utilizador'}
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        {isEditing ? 'Ajuste os detalhes do utilizador existente.' : 'Preencha os detalhes abaixo para adicionar um novo utilizador.'}
      </p>
      
      <div className="flex gap-4 mb-8">
        <motion.button 
          onClick={() => navigate('/admin/users')}
          className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg shadow-md hover:bg-gray-300 transition-all duration-300 transform hover:scale-105 flex items-center"
          variants={buttonVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <XCircle className="inline-block mr-2 h-5 w-5" />
          {isEditing ? 'Cancelar e Voltar' : 'Cancelar e Voltar'}
        </motion.button>

        {isEditing && !formData.is_admin && (
          <motion.button
            onClick={handlePromoteUser}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 flex items-center"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={loadingForm || loadingPromote}
          >
            {loadingPromote ? (
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            Promover a Administrador
          </motion.button>
        )}
      </div>


      {loadingForm ? (
        <div className="flex items-center justify-center min-h-[30vh] bg-gray-50 rounded-lg shadow-md">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="ml-4 text-md text-gray-700">A carregar {isEditing ? 'dados do utilizador' : 'formulário'}...</p>
        </div>
      ) : submitError ? (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-6">
          <p>Erro: {submitError}</p>
          {isEditing && (
             <motion.button 
                onClick={fetchUserData}
                className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Tentar Carregar Dados
            </motion.button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensagens de Feedback */}
          {submitSuccess && (
            <motion.div 
              className="p-4 bg-green-100 text-green-700 border border-green-300 rounded-lg mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="font-semibold">{submitSuccess}</p>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
            {/* Username */}
            <motion.div variants={itemVariants}>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>
            
            {/* First Name */}
            <motion.div variants={itemVariants}>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">Primeiro Nome <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Last Name */}
            <motion.div variants={itemVariants}>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">Último Nome <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Password (Required for new users, optional for edit) */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password {isEditing ? '(Deixe em branco para não alterar)' : '*'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Phone Number */}
            <motion.div variants={itemVariants}>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Número de Telefone <span className="text-red-500">*</span></label>
              <input
                type="tel" // Use type="tel" para números de telefone
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Address Line 1 */}
            <motion.div variants={itemVariants}>
              <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-1">Morada Linha 1 <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="address_line1"
                name="address_line1"
                value={formData.address_line1}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Address Line 2 (Optional) */}
            <motion.div variants={itemVariants}>
              <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-1">Morada Linha 2 (Opcional)</label>
              <input
                type="text"
                id="address_line2"
                name="address_line2"
                value={formData.address_line2}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* City */}
            <motion.div variants={itemVariants}>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Cidade <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* State/Province */}
            <motion.div variants={itemVariants}>
              <label htmlFor="state_province" className="block text-sm font-medium text-gray-700 mb-1">Distrito/Província <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="state_province"
                name="state_province"
                value={formData.state_province}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Postal Code */}
            <motion.div variants={itemVariants}>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">Código Postal <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Country */}
            <motion.div variants={itemVariants}>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">País <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>
            
            {/* Is Admin */}
            <motion.div variants={itemVariants} className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                id="is_admin"
                name="is_admin"
                checked={formData.is_admin}
                onChange={handleChange}
                className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-all duration-200"
              />
              <label htmlFor="is_admin" className="ml-2 block text-sm font-medium text-gray-700">É Administrador?</label>
            </motion.div>

            {/* Is Active */}
            <motion.div variants={itemVariants} className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-all duration-200"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Utilizador Ativo?</label>
            </motion.div>
          </div>

          {/* Botão de Submissão */}
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={loadingForm}
          >
            {loadingForm ? (
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {loadingForm ? 'A Guardar...' : (isEditing ? 'Atualizar Utilizador' : 'Adicionar Utilizador')}
          </motion.button>
        </form>
      )}
    </motion.div>
  );
};

export default UserForm;