import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  MapPin, 
  User, 
  Mail,
  ChevronDown // Mantenha este se precisar dele em outro lugar
} from 'lucide-react';
import Footer from '../components/FooterPage';

// Tipagem para os dados do utilizador (recomendado para TypeScript)
interface UserData {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state_province: string;
    postal_code: string;
    country: string;
    is_admin: boolean;
    created_at: string;
}

const MyAccountPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { isAuthenticated, user, getAuthToken, loadingAuth } = useAuth();
    
    // ✨ ESTADOS PARA GERIR OS DADOS DO FORMULÁRIO E MODO DE EDIÇÃO ✨
    const [userData, setUserData] = useState<UserData | null>(null);
    const [formData, setFormData] = useState<Omit<UserData, 'id' | 'email' | 'is_admin' | 'created_at' | 'updated_at'> | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (loadingAuth) {
                return;
            }

            if (!isAuthenticated || !user || !id) {
                toast.error("É necessário iniciar sessão para ver esta página.");
                navigate('/login');
                return;
            }

            if (user.id !== parseInt(id)) {
                toast.error("Não tem permissão para ver esta página.");
                navigate('/');
                return;
            }

            try {
                const token = getAuthToken();
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/listar/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUserData(response.data);
                // Inicializa o estado do formulário com os dados recebidos
                setFormData(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Erro ao buscar dados do utilizador:", err);
                setError("Erro ao carregar dados. Por favor, tente novamente.");
                setLoading(false);
                toast.error("Erro ao carregar os seus dados.");
            }
        };

        fetchUserData();
    }, [id, isAuthenticated, user, getAuthToken, navigate, loadingAuth]);

    // ✨ FUNÇÃO PARA LIDAR COM A ATUALIZAÇÃO DO PERFIL ✨
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const token = getAuthToken();
            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/atualizar/${id}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // Atualiza o estado da página com os novos dados
            setUserData(formData as UserData);
            setEditMode(false);
            toast.success("Perfil atualizado com sucesso!");
        } catch (err) {
            console.error("Erro ao atualizar o perfil:", err);
            toast.error("Erro ao atualizar. Por favor, tente novamente.");
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Função para lidar com a mudança nos campos do formulário
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => (prev ? { ...prev, [name]: value } : null));
    };

    if (loadingAuth || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-400 text-lg">Carregando os seus dados...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-red-500 text-lg">{error}</p>
            </div>
        );
    }

    if (!userData || !formData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-gray-400 text-lg">Dados do utilizador não encontrados.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow py-12 px-4 md:px-8 lg:px-16">
                <div className="max-w-4xl mx-auto bg-gray-800 text-white p-6 md:p-10 rounded-xl shadow-lg border border-gray-700">
                    
                    <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-100">A Minha Conta</h1>
                        {!editMode ? (
                            <button
                                onClick={() => setEditMode(true)}
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                            >
                                Editar Perfil
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setEditMode(false)}
                                    className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={isUpdating}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        isUpdating ? 'bg-orange-800 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'
                                    }`}
                                >
                                    {isUpdating ? 'A Guardar...' : 'Guardar Alterações'}
                                </button>
                            </div>
                        )}
                    </div>

                    {!editMode ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            <div>
                                <p className="text-sm font-semibold text-gray-400">Nome de Utilizador</p>
                                <p className="text-gray-200 mt-1 text-lg">{userData.username}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400">Email</p>
                                <p className="text-gray-200 mt-1 text-lg">{userData.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400">Nome Completo</p>
                                <p className="text-gray-200 mt-1 text-lg">{userData.first_name} {userData.last_name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-400">Telefone</p>
                                <p className="text-gray-200 mt-1 text-lg">{userData.phone_number}</p>
                            </div>
                            <div className="md:col-span-2 mt-4">
                                <h2 className="text-xl font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2">Detalhes de Morada</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400">Morada</p>
                                        <p className="text-gray-200 mt-1 text-lg">{userData.address_line1}</p>
                                        {userData.address_line2 && (
                                            <p className="text-gray-200 mt-1 text-lg">{userData.address_line2}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400">Cidade</p>
                                        <p className="text-gray-200 mt-1 text-lg">{userData.city}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400">Código Postal</p>
                                        <p className="text-gray-200 mt-1 text-lg">{userData.postal_code}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-400">País</p>
                                        <p className="text-gray-200 mt-1 text-lg">{userData.country}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                            {/* Campos não editáveis para referência */}
                            <div>
                                <label className="text-sm font-semibold text-gray-400" htmlFor="username">Nome de Utilizador</label>
                                <input
                                    id="username"
                                    type="text"
                                    value={formData.username}
                                    disabled
                                    className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-400 rounded-md focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-400" htmlFor="email">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-400 rounded-md focus:outline-none"
                                />
                            </div>
                            
                            {/* CAMPOS EDITÁVEIS */}
                            <div>
                                <label className="text-sm font-semibold text-gray-400" htmlFor="first_name">Primeiro Nome</label>
                                <input
                                    id="first_name"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-400" htmlFor="last_name">Último Nome</label>
                                <input
                                    id="last_name"
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-gray-400" htmlFor="phone_number">Telefone</label>
                                <input
                                    id="phone_number"
                                    type="text"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <div className="md:col-span-2 mt-4">
                                <h2 className="text-xl font-bold text-gray-100 mb-4 border-b border-gray-700 pb-2">Detalhes de Morada</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-400" htmlFor="address_line1">Morada 1</label>
                                        <input
                                            id="address_line1"
                                            type="text"
                                            name="address_line1"
                                            value={formData.address_line1}
                                            onChange={handleChange}
                                            className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-400" htmlFor="address_line2">Morada 2 (Opcional)</label>
                                        <input
                                            id="address_line2"
                                            type="text"
                                            name="address_line2"
                                            value={formData.address_line2 || ''}
                                            onChange={handleChange}
                                            className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-400" htmlFor="city">Cidade</label>
                                        <input
                                            id="city"
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-400" htmlFor="state_province">Distrito/Província</label>
                                        <input
                                            id="state_province"
                                            type="text"
                                            name="state_province"
                                            value={formData.state_province}
                                            onChange={handleChange}
                                            className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-400" htmlFor="postal_code">Código Postal</label>
                                        <input
                                            id="postal_code"
                                            type="text"
                                            name="postal_code"
                                            value={formData.postal_code}
                                            onChange={handleChange}
                                            className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-400" htmlFor="country">País</label>
                                        <input
                                            id="country"
                                            type="text"
                                            name="country"
                                            value={formData.country}
                                            onChange={handleChange}
                                            className="w-full mt-1 px-3 py-2 bg-gray-700 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* ✨ FOOTER ADICIONADO AQUI ✨ */}
           <Footer />
        </div>
    );
};

export default MyAccountPage;