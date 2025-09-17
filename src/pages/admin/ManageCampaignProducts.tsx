import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    image_url: string;
}

interface Campaign {
    id: number;
    name: string;
    products: Product[];
}

const ManageCampaignProducts: React.FC = () => {
    const { campaignId } = useParams<{ campaignId: string }>();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaignData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/listar`);
            const foundCampaign = response.data.find((c: Campaign) => c.id === parseInt(campaignId as string));
            setCampaign(foundCampaign || null);
        } catch (err) {
            console.error('Erro ao buscar a campanha:', err);
            setError('Falha ao carregar os dados da campanha.');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllProducts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
            setAllProducts(response.data);
        } catch (err) {
            console.error('Erro ao buscar produtos:', err);
            toast.error('Falha ao carregar a lista de produtos.');
        }
    };

    useEffect(() => {
        fetchCampaignData();
        fetchAllProducts();
    }, [campaignId]);

    const handleAddProduct = async () => {
        if (!selectedProduct) {
            toast.error('Por favor, selecione um produto.');
            return;
        }
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${campaignId}/adicionar-produto`, {
                productId: selectedProduct,
            });
            toast.success('Produto adicionado com sucesso!');
            setSelectedProduct(null); // Limpa a seleção
            fetchCampaignData(); // Recarrega a campanha para ver a alteração
        } catch (err) {
            console.error('Erro ao adicionar produto:', err);
            toast.error('Erro ao adicionar produto à campanha.');
        }
    };

    const handleRemoveProduct = async (productId: number) => {
        if (window.confirm('Tem certeza que deseja remover este produto da campanha?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/${campaignId}/remover-produto/${productId}`);
                toast.success('Produto removido com sucesso!');
                fetchCampaignData(); // Recarrega a campanha
            } catch (err) {
                console.error('Erro ao remover produto:', err);
                toast.error('Erro ao remover produto da campanha.');
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">A carregar...</div>;
    }

    if (error || !campaign) {
        return <div className="p-8 text-center text-red-500">Erro: {error || 'Campanha não encontrada.'}</div>;
    }

    // Filtra os produtos que já estão na campanha para o seletor
    const availableProducts = allProducts.filter(p => !campaign.products.some(cp => cp.id === p.id));

    return (
        <div className="p-8 bg-white rounded-lg shadow-xl min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerir Produtos da Campanha: "{campaign.name}"</h1>
            <button onClick={() => navigate(-1)} className="text-blue-500 hover:underline mb-6">
                ← Voltar para as campanhas
            </button>

            {/* Secção de Adicionar Produto */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Adicionar Produto</h2>
                <div className="flex items-end space-x-4">
                    <div className="flex-1">
                        <label htmlFor="product-select" className="block text-gray-700 font-bold mb-2">
                            Selecione um Produto
                        </label>
                        <select
                            id="product-select"
                            value={selectedProduct || ''}
                            onChange={(e) => setSelectedProduct(parseInt(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">-- Selecionar Produto --</option>
                            {availableProducts.map(product => (
                                <option key={product.id} value={product.id}>{product.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleAddProduct}
                        className="flex items-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                    >
                        <Plus className="mr-2" size={20} /> Adicionar
                    </button>
                </div>
            </div>

            {/* Secção de Produtos na Campanha */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Produtos na Campanha ({campaign.products.length})</h2>
                {campaign.products.length === 0 ? (
                    <p className="text-gray-500">Esta campanha não tem produtos.</p>
                ) : (
                    <ul className="space-y-4">
                        {campaign.products.map(product => (
                            <li key={product.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex items-center space-x-4">
                                    <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                                    <span className="text-gray-800 font-medium">{product.name}</span>
                                </div>
                                <button
                                    onClick={() => handleRemoveProduct(product.id)}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ManageCampaignProducts;