import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Save, XCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

// Tipagem para os dados do produto a serem enviados
interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  sku: string;
  image_url: string;
  category_id: number;
  brand: string;
  weight_unit: string;
  weight_value: number;
  is_active: boolean;
  flavor_id?: number;
  original_price?: number;
  stock_ginasio: number;
  rating?: number;
  reviewcount?: number;
}

// Tipagem para a resposta do backend ao criar um produto
interface CreatedProductResponse {
  id: number;
  // ... outras propriedades do produto retornado pelo backend
}

// Tipagem para as opções de categoria e sabor
interface CategoryOption {
  id: number;
  name: string;
}

interface FlavorOption {
  id: number;
  name: string;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getAuthToken } = useAuth();

  const isEditing = !!id;

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock_quantity: 0,
    sku: '',
    image_url: '',
    category_id: 0,
    brand: '',
    weight_unit: 'g',
    weight_value: 0,
    is_active: true,
    stock_ginasio: 0,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // ✨ Novo estado para o ficheiro de imagem e o status do upload ✨
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [flavors, setFlavors] = useState<FlavorOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

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

  // Função para buscar opções de categorias e sabores
  const fetchOptions = useCallback(async () => {
    setLoadingOptions(true);
    setOptionsError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setOptionsError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoadingOptions(false);
        return;
      }

      const categoriesResponse = await axios.get<CategoryOption[]>(`${import.meta.env.VITE_BACKEND_URL}/api/categories/listar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(categoriesResponse.data);

      const flavorsResponse = await axios.get<FlavorOption[]>(`${import.meta.env.VITE_BACKEND_URL}/api/flavors/listar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFlavors(flavorsResponse.data);

    } catch (err: any) {
      console.error('Erro ao buscar opções:', err);
      setOptionsError('Erro ao carregar opções de categorias/sabores.');
    } finally {
      setLoadingOptions(false);
    }
  }, [getAuthToken]);

  // Função para carregar dados do produto se estiver em modo de edição
  const fetchProductData = useCallback(async () => {
    if (!isEditing || !id) return;

    setLoading(true);
    setSubmitError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setSubmitError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const productData = response.data;
      
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: Number(productData.price) || 0,
        stock_quantity: productData.stock_quantity || 0,
        sku: productData.sku || '',
        image_url: productData.image_url || '',
        category_id: productData.category_id || 0,
        brand: productData.brand || '',
        weight_unit: productData.weight_unit || 'g',
        weight_value: Number(productData.weight_value) || 0,
        is_active: productData.is_active,
        flavor_id: productData.flavor_id || undefined,
        original_price: productData.original_price ? Number(productData.original_price) : undefined,
        stock_ginasio: productData.stock_ginasio || 0,
        rating: productData.rating ? Number(productData.rating) : undefined,
        reviewcount: productData.reviewcount || undefined,
      });
    } catch (err: any) {
      console.error('Erro ao carregar dados do produto:', err);
      setSubmitError(err.response?.data?.message || 'Erro ao carregar dados do produto.');
    } finally {
      setLoading(false);
    }
  }, [id, isEditing, getAuthToken]);

  useEffect(() => {
    fetchOptions();
    fetchProductData();
  }, [fetchOptions, fetchProductData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  };
  
  // ✨ Novo handler para o input de ficheiro ✨
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSubmitError(null); // Limpa o erro ao selecionar um novo ficheiro
    } else {
      setSelectedFile(null);
    }
  };
  
  // ✨ Nova função para fazer o upload da imagem para o backend ✨
  const uploadImage = async (file: File) => {
    const token = getAuthToken();
    const uploadUrl = `${import.meta.env.VITE_BACKEND_URL}/api/images/upload`;

    if (!token) {
      throw new Error('Token de autenticação não encontrado.');
    }

    const data = new FormData();
    data.append('image', file);

    try {
      const response = await axios.post<{ url: string }>(uploadUrl, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data.url;
    } catch (err) {
      console.error('Erro ao fazer upload da imagem:', err);
      throw new Error('Erro ao fazer upload da imagem.');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setSubmitError('Token de autenticação não encontrado. Por favor, faça login.');
        setLoading(false);
        return;
      }

      if (!formData.name || !formData.price || formData.category_id === 0) {
        setSubmitError('Por favor, preencha os campos obrigatórios: Nome, Preço e Categoria.');
        setLoading(false);
        return;
      }

      if (formData.stock_quantity <= 0 && formData.stock_ginasio <= 0) {
        setSubmitError('Pelo menos um dos campos de stock (Stock Total ou Stock Ginásio) deve ser maior que zero.');
        setLoading(false);
        return;
      }

      // ✨ Novo: Lógica de upload da imagem ✨
      let finalImageUrl = formData.image_url;
      if (selectedFile) {
        setUploadingImage(true);
        setSubmitSuccess('A carregar imagem...');
        finalImageUrl = await uploadImage(selectedFile);
        setUploadingImage(false);
        setSubmitSuccess(null); // Limpa a mensagem de sucesso temporária
      } else if (!isEditing && !formData.image_url) {
        // Se estiver a criar um produto e não tiver nem ficheiro nem URL
        setSubmitError('Por favor, selecione um ficheiro de imagem ou insira uma URL.');
        setLoading(false);
        return;
      }
      
      const dataToSend = {
        ...formData,
        image_url: finalImageUrl,
        price: String(formData.price),
        original_price: formData.original_price ? String(formData.original_price) : undefined,
        weight_value: String(formData.weight_value),
        flavor_id: formData.flavor_id && formData.flavor_id !== 0 ? formData.flavor_id : undefined,
      };

      let response;
      if (isEditing) {
        response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/atualizar/${id}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setSubmitSuccess('Produto atualizado com sucesso!');
        setTimeout(() => navigate('/admin/products'), 1500); 
      } else {
        response = await axios.post<CreatedProductResponse>(`${import.meta.env.VITE_BACKEND_URL}/api/products/criar`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const newProductId = response.data.id;
        setSubmitSuccess('Produto adicionado com sucesso! Redirecionando para adicionar imagens...');
        setTimeout(() => navigate(`/admin/products/add-images/${newProductId}`), 1500);
      }
      
    } catch (err: any) {
      console.error('Erro ao guardar produto:', err);
      setSubmitError(err.response?.data?.message || err.message || 'Erro ao guardar produto. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="p-8 bg-white rounded-lg shadow-2xl border border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        {isEditing ? `Editar Produto: ${formData.name || '...'}` : 'Adicionar Novo Produto'}
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        {isEditing ? 'Ajuste os detalhes do produto existente.' : 'Preencha os detalhes abaixo para adicionar um novo produto à sua loja.'}
      </p>
      
      <motion.button 
        onClick={() => navigate('/admin/products')}
        className="mb-8 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg shadow-md hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
        variants={buttonVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <XCircle className="inline-block mr-2 h-5 w-5" />
        {isEditing ? 'Cancelar e Voltar' : 'Cancelar e Voltar'}
      </motion.button>

      {/* Exibe loaders e erros combinados */}
      {loadingOptions || loading || uploadingImage ? (
        <div className="flex items-center justify-center min-h-[30vh] bg-gray-50 rounded-lg shadow-md">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="ml-4 text-md text-gray-700">
            {uploadingImage ? 'A carregar imagem...' : `A carregar ${isEditing ? 'dados do produto e' : 'opções de'} categoria e sabor...`}
          </p>
        </div>
      ) : optionsError || submitError ? (
        <div className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-6">
          <p>Erro: {optionsError || submitError}</p>
          {(optionsError || (submitError && isEditing)) && (
             <motion.button 
                onClick={isEditing ? () => fetchProductData() : () => fetchOptions()}
                className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                Tentar Novamente
            </motion.button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mensagem de sucesso global */}
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
            {/* Nome do Produto */}
            <motion.div variants={itemVariants}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Marca */}
            <motion.div variants={itemVariants}>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>
            
            {/* Categoria */}
            <motion.div variants={itemVariants}>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Categoria <span className="text-red-500">*</span></label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200"
              >
                <option value={0}>Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </motion.div>

            {/* Sabor (opcional) */}
            <motion.div variants={itemVariants}>
              <label htmlFor="flavor_id" className="block text-sm font-medium text-gray-700 mb-1">Sabor</label>
              <select
                id="flavor_id"
                name="flavor_id"
                value={formData.flavor_id || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200"
              >
                <option value="">Nenhum Sabor (Opcional)</option>
                {flavors.map(flavor => (
                  <option key={flavor.id} value={flavor.id}>{flavor.name}</option>
                ))}
              </select>
            </motion.div>

            {/* Preço */}
            <motion.div variants={itemVariants}>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Preço (€) <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price === 0 ? '' : formData.price} 
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Preço Original (Opcional) */}
            <motion.div variants={itemVariants}>
              <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-1">Preço Original (€) (Opcional)</label>
              <input
                type="number"
                id="original_price"
                name="original_price"
                value={formData.original_price === 0 ? '' : (formData.original_price || '')} 
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Stock Total */}
            <motion.div variants={itemVariants}>
              <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-1">Stock Total <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                value={formData.stock_quantity === 0 ? '' : formData.stock_quantity} 
                onChange={handleChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Stock Ginásio */}
            <motion.div variants={itemVariants}>
              <label htmlFor="stock_ginasio" className="block text-sm font-medium text-gray-700 mb-1">Stock Ginásio <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="stock_ginasio"
                name="stock_ginasio"
                value={formData.stock_ginasio === 0 ? '' : formData.stock_ginasio} 
                onChange={handleChange}
                min="0"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>
            
            {/* Peso e Unidade */}
            <motion.div variants={itemVariants} className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="weight_value" className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                <input
                  type="number"
                  id="weight_value"
                  name="weight_value"
                  value={formData.weight_value === 0 ? '' : formData.weight_value} 
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="weight_unit" className="block text-sm font-medium text-gray-700 mb-1">Unidade Peso</label>
                <select
                  id="weight_unit"
                  name="weight_unit"
                  value={formData.weight_unit}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200"
                >
                  <option value="g">gramas (g)</option>
                  <option value="kg">quilogramas (kg)</option>
                  <option value="ml">mililitros (ml)</option>
                  <option value="l">litros (l)</option>
                  <option value="caps">Cápsulas (caps)</option>
                </select>
              </div>
            </motion.div>

            {/* SKU */}
            <motion.div variants={itemVariants}>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>
            
            {/* ✨ Novo campo de upload de imagem ✨ */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <label htmlFor="image_file" className="block text-sm font-medium text-gray-700 mb-1">Imagem do Produto <span className="text-red-500">*</span></label>
              <input
                type="file"
                id="image_file"
                name="image_file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {/* Opção de inserir URL em vez de upload, se necessário */}
              <p className="mt-2 text-sm text-gray-500">Ou, se preferir, insira uma URL da imagem existente:</p>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200 mt-2"
              />
            </motion.div>

            {/* Descrição */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              ></textarea>
            </motion.div>

            {/* Produto Ativo */}
            <motion.div variants={itemVariants} className="md:col-span-2 flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-all duration-200"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Produto Ativo</label>
            </motion.div>
          </div>

          {/* Botão de Submissão */}
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={loading || uploadingImage}
          >
            {loading || uploadingImage ? (
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {uploadingImage ? 'A Carregar Imagem...' : (loading ? 'A Guardar...' : (isEditing ? 'Atualizar Produto' : 'Adicionar Produto'))}
          </motion.button>
        </form>
      )}
    </motion.div>
  );
};

export default ProductForm;