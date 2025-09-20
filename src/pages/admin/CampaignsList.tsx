import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Edit, Package, CircleDot, CircleDashed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Definir as interfaces para os tipos de dados
interface Product {
    id: number;
    name: string;
    image_url: string;
}

interface Campaign {
    id: number;
    name: string;
    is_active: boolean;
    image_url?: string; // ✨ NOVO: Adicione o URL da imagem da campanha
    products: Product[];
}

const CampaignsList: React.FC = () => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignActive, setNewCampaignActive] = useState(true);
    const [campaignImage, setCampaignImage] = useState<File | null>(null); // ✨ NOVO: Estado para o arquivo de imagem
    const [isCreating, setIsCreating] = useState(false); // ✨ NOVO: Estado para o loading da criação

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Campaign[]>(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/listar`);
            setCampaigns(response.data);
        } catch (err) {
            console.error('Erro ao buscar campanhas:', err);
            setError('Falha ao carregar as campanhas.');
            toast.error('Falha ao carregar as campanhas.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    // ✨ NOVO: Função para lidar com a seleção do arquivo
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCampaignImage(e.target.files[0]);
        } else {
            setCampaignImage(null);
        }
    };

    // ✨ CORRIGIDO: Lógica de criação com upload de imagem em duas etapas
    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        let imageUrl = '';

        try {
            // Passo 1: Fazer o upload da imagem se existir um arquivo
            if (campaignImage) {
                const formData = new FormData();
                formData.append('image', campaignImage);

                const uploadResponse = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/images/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                imageUrl = uploadResponse.data.url;
                toast.success('Imagem carregada com sucesso!');
            }

            // Passo 2: Criar a campanha com a URL da imagem
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/criar`, {
                name: newCampaignName,
                is_active: newCampaignActive,
                image_url: imageUrl, // Envia a URL da imagem (pode ser uma string vazia se não houver upload)
            });
            
            toast.success('Campanha criada com sucesso!');
            setNewCampaignName('');
            setNewCampaignActive(true);
            setCampaignImage(null);
            setShowAddModal(false);
            fetchCampaigns();
        } catch (err: any) {
            console.error('Erro ao criar campanha:', err);
            toast.error(err.response?.data?.message || 'Erro ao criar campanha.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteCampaign = async (campaignId: number) => {
        if (window.confirm('Tem certeza que deseja apagar esta campanha e todas as suas ligações de produtos? Esta ação é irreversível.')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${campaignId}`);
                toast.success('Campanha eliminada com sucesso!');
                fetchCampaigns(); // Recarregar a lista
            } catch (err) {
                console.error('Erro ao eliminar campanha:', err);
                toast.error('Erro ao eliminar a campanha.');
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">A carregar campanhas...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
    }

    return (
        <div className="p-8 bg-white rounded-lg shadow-xl min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Gestão de Campanhas</h1>
                <motion.button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Plus className="mr-2 h-5 w-5" /> Adicionar Nova Campanha
                </motion.button>
            </div>

            {campaigns.length === 0 ? (
                <p className="text-center text-gray-500 text-lg">Nenhuma campanha encontrada.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map(campaign => (
                        <div key={campaign.id} className="bg-gray-100 rounded-lg p-6 shadow-md border border-gray-200 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{campaign.name}</h3>
                                <div className="flex items-center text-sm font-medium text-gray-700 mb-4">
                                    {campaign.is_active ? (
                                        <>
                                            <CircleDot className="text-green-500 mr-1" size={16} /> Ativa
                                        </>
                                    ) : (
                                        <>
                                            <CircleDashed className="text-gray-500 mr-1" size={16} /> Inativa
                                        </>
                                    )}
                                </div>
                                {/* ✨ NOVO: Exibe a imagem da campanha se ela existir */}
                                {campaign.image_url && (
                                    <div className="mb-4">
                                        <img 
                                            src={campaign.image_url} 
                                            alt={`Imagem de ${campaign.name}`} 
                                            className="w-full h-auto rounded-lg"
                                        />
                                    </div>
                                )}
                                <div className="mb-4">
                                    <h4 className="font-bold text-gray-800">Produtos ({campaign.products.length})</h4>
                                    <ul className="list-disc list-inside mt-2 text-gray-700 text-sm max-h-24 overflow-y-auto">
                                        {campaign.products.length > 0 ? (
                                            campaign.products.map(product => (
                                                <li key={product.id}>{product.name}</li>
                                            ))
                                        ) : (
                                            <li>Nenhum produto associado.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                            <div className="flex space-x-2 mt-4">
                                <Link
                                    to={`/admin/campaigns/${campaign.id}`}
                                    className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                                >
                                    Gerir Produtos
                                </Link>
                                <button
                                    onClick={() => handleDeleteCampaign(campaign.id)}
                                    className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal para adicionar nova campanha */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full"
                        >
                            <h2 className="text-2xl font-bold mb-4">Adicionar Nova Campanha</h2>
                            <form onSubmit={handleCreateCampaign}>
                                <div className="mb-4">
                                    <label htmlFor="campaignName" className="block text-gray-700 font-bold mb-2">Nome da Campanha</label>
                                    <input
                                        type="text"
                                        id="campaignName"
                                        value={newCampaignName}
                                        onChange={(e) => setNewCampaignName(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        required
                                    />
                                </div>
                                
                                {/* ✨ NOVO: Campo para upload da imagem */}
                                <div className="mb-4">
                                    <label htmlFor="campaignImage" className="block text-gray-700 font-bold mb-2">Imagem da Campanha</label>
                                    <input
                                        type="file"
                                        id="campaignImage"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="w-full text-sm text-gray-500"
                                    />
                                    {campaignImage && (
                                        <p className="mt-2 text-sm text-gray-500">Ficheiro selecionado: {campaignImage.name}</p>
                                    )}
                                </div>
                                
                                <div className="mb-4 flex items-center">
                                    <input
                                        type="checkbox"
                                        id="campaignActive"
                                        checked={newCampaignActive}
                                        onChange={(e) => setNewCampaignActive(e.target.checked)}
                                        className="mr-2"
                                    />
                                    <label htmlFor="campaignActive" className="text-gray-700">Ativa</label>
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition duration-200"
                                        disabled={isCreating}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                                        disabled={isCreating}
                                    >
                                        {isCreating ? (
                                            <div className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                A Criar...
                                            </div>
                                        ) : (
                                            'Criar Campanha'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CampaignsList;