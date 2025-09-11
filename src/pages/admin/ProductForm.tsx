import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Save, XCircle, Plus, Minus } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
// 💡 CORREÇÃO: O hook `useAuth` não pode ser importado neste ambiente.
// Criamos uma versão "mock" dele abaixo.
// Por favor, substitua esta implementação pela sua versão real quando usar o código.
// O erro 401 que você recebeu anteriormente é esperado, pois este 'fake-token' não é válido no seu backend.

// 💡 CORRIGIDO: URL do backend agora é uma constante para evitar o erro de 'import.meta'
const VITE_BACKEND_URL = "https://powernutrition-backend-production-7883.up.railway.app"; // 👈 Mude esta URL para o seu backend

// Tipagem para os dados do formulário a serem enviados (com múltiplas variantes)
interface ProductFormData {
  name: string;
  description: string;
  image_url: string;
  category_id: number;
  brand_id: number;
  is_active: boolean;
  original_price?: number;
  // 💡 NOVO: Adicionado rating e reviewcount
  rating?: number;
  reviewcount?: number;
}

interface VariantFormData {
  id?: number; // Para edição de variantes existentes
  preco: number; // 💡 NOVO: Preço agora é "preco"
  quantidade_em_stock: number; // 💡 NOVO: Quantidade em stock agora é "quantidade_em_stock"
  stock_ginasio: number;
  sku: string;
  weight_unit: string;
  weight_value: number;
  sabor_id?: number; // 💡 NOVO: Sabor agora é "sabor_id"
}

// Tipagem para as opções de categoria, sabor e marca
interface CategoryOption {
  id: number;
  name: string;
}

interface FlavorOption {
  id: number;
  name: string;
}

interface BrandOption {
  id: number;
  name: string;
}

// Tipagem para a resposta do backend ao criar um produto
interface CreatedProductResponse {
  product: { id: number; name: string; };
  variants: Array<{ id: number; sku: string; }>;
}

const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // 💡 CORRIGIDO: Substituir a importação do hook useAuth por uma implementação temporária
  const { getAuthToken } = useAuth();

  const isEditing = !!id;

  // 💡 NOVO: Separar o estado do produto e das variantes
  const [productData, setProductData] = useState<ProductFormData>({
    name: '',
    description: '',
    image_url: '',
    category_id: 0,
    brand_id: 0,
    is_active: true,
    rating: 0,
    reviewcount: 0,
  });

  const [variantsData, setVariantsData] = useState<VariantFormData[]>([
    {
      preco: 0,
      quantidade_em_stock: 0,
      sku: '',
      weight_unit: 'g',
      weight_value: 0,
      stock_ginasio: 0,
    }
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [flavors, setFlavors] = useState<FlavorOption[]>([]);
  // 💡 NOVO: Estado para as marcas
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // Variantes de animação
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

  // 💡 NOVO: Função para buscar opções de categorias, sabores e marcas
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

      const [categoriesResponse, flavorsResponse, brandsResponse] = await Promise.all([
        axios.get(`${VITE_BACKEND_URL}/api/categories/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${VITE_BACKEND_URL}/api/flavors/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${VITE_BACKEND_URL}/api/brands/listar`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setCategories(categoriesResponse.data);
      setFlavors(flavorsResponse.data);
      setBrands(brandsResponse.data);

    } catch (err: any) {
      console.error('Erro ao buscar opções:', err);
      setOptionsError('Erro ao carregar opções de categorias/sabores/marcas.');
    } finally {
      setLoadingOptions(false);
    }
  }, []);

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

      const response = await axios.get(`${VITE_BACKEND_URL}/api/products/listar/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const product = response.data.product;
      const variants = response.data.variants;

      setProductData({
        name: product.name,
        description: product.description,
        image_url: product.image_url,
        category_id: product.category_id,
        brand_id: product.brand_id,
        is_active: product.is_active,
        original_price: product.original_price ? Number(product.original_price) : undefined,
        rating: product.rating,
        reviewcount: product.reviewcount,
      });

      // 💡 NOVO: Preencher o array de variantes com os dados do backend
      const formattedVariants = variants.map((v: any) => ({
        id: v.id,
        preco: Number(v.preco),
        quantidade_em_stock: v.quantidade_em_stock,
        sku: v.sku,
        weight_unit: v.weight_unit,
        weight_value: Number(v.weight_value),
        stock_ginasio: v.stock_ginasio,
        sabor_id: v.sabor_id || undefined,
      }));
      setVariantsData(formattedVariants);

    } catch (err: any) {
      console.error('Erro ao carregar dados do produto:', err);
      setSubmitError(err.response?.data?.message || 'Erro ao carregar dados do produto.');
    } finally {
      setLoading(false);
    }
  }, [id, isEditing]);

  useEffect(() => {
    fetchOptions();
    fetchProductData();
  }, [fetchOptions, fetchProductData]);

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setProductData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value),
    }));
  };

  // 💡 NOVO: Handler para alterações em variantes específicas
  const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const newVariants = [...variantsData];
    newVariants[index] = {
      ...newVariants[index],
      [name]: type === 'number' ? Number(value) : value,
    };
    setVariantsData(newVariants);
  };
  
  // 💡 NOVO: Funções para adicionar e remover variantes
  const addVariant = () => {
    setVariantsData([...variantsData, {
      preco: 0,
      quantidade_em_stock: 0,
      sku: '',
      weight_unit: 'g',
      weight_value: 0,
      stock_ginasio: 0,
    }]);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variantsData];
    newVariants.splice(index, 1);
    setVariantsData(newVariants);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setSubmitError(null);
    } else {
      setSelectedFile(null);
    }
  };

  const uploadImage = async (file: File) => {
    const token = getAuthToken();
    const uploadUrl = `${VITE_BACKEND_URL}/api/images/upload`;

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

      // Validação básica do produto
      if (!productData.name || productData.category_id === 0 || productData.brand_id === 0) {
        setSubmitError('Por favor, preencha todos os campos obrigatórios do produto.');
        setLoading(false);
        return;
      }

      // Validação das variantes
      if (variantsData.length === 0) {
        setSubmitError('Pelo menos uma variante é necessária.');
        setLoading(false);
        return;
      }
      for (const variant of variantsData) {
        if (!variant.preco || !variant.sku || (variant.quantidade_em_stock <= 0 && variant.stock_ginasio <= 0)) {
          setSubmitError('Por favor, preencha todos os campos obrigatórios para cada variante (Preço, SKU, e pelo menos um stock).');
          setLoading(false);
          return;
        }
      }

      let finalImageUrl = productData.image_url;
      if (selectedFile) {
        setUploadingImage(true);
        setSubmitSuccess('A carregar imagem...');
        finalImageUrl = await uploadImage(selectedFile);
        setUploadingImage(false);
        setSubmitSuccess(null);
      } else if (!isEditing && !productData.image_url) {
        setSubmitError('Por favor, selecione um ficheiro de imagem ou insira uma URL.');
        setLoading(false);
        return;
      }
      
      // ✨ AQUI: Construímos o payload com a estrutura correta para o backend
      // Convertemos o array de variantes para o formato que o backend espera.
      const formattedVariants = variantsData.map(v => ({
        id: v.id, // Incluir o ID se estiver a editar
        preco: String(v.preco),
        quantidade_em_stock: v.quantidade_em_stock,
        stock_ginasio: v.stock_ginasio,
        sku: v.sku,
        weight_unit: v.weight_unit,
        weight_value: String(v.weight_value),
        sabor_id: v.sabor_id && v.sabor_id !== 0 ? v.sabor_id : null,
      }));

      const payload = {
        product: {
          name: productData.name,
          description: productData.description,
          image_url: finalImageUrl,
          category_id: productData.category_id,
          brand_id: productData.brand_id,
          is_active: productData.is_active,
          original_price: productData.original_price ? String(productData.original_price) : undefined,
          rating: productData.rating,
          reviewcount: productData.reviewcount,
        },
        // O backend agora espera um array de objetos 'variant'
        variants: formattedVariants,
      };

      let response;
      if (isEditing) {
        response = await axios.put(`${VITE_BACKEND_URL}/api/products/atualizar/${id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setSubmitSuccess('Produto atualizado com sucesso!');
        setTimeout(() => navigate('/admin/products'), 1500); 
      } else {
        response = await axios.post<CreatedProductResponse>(`${VITE_BACKEND_URL}/api/products/criar`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const newProductId = response.data.product.id;
        setSubmitSuccess('Produto adicionado com sucesso!');
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
        {isEditing ? `Editar Produto: ${productData.name || '...'}` : 'Adicionar Novo Produto'}
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
      {(loadingOptions || loading || uploadingImage) && (
        <div className="flex items-center justify-center min-h-[30vh] bg-gray-50 rounded-lg shadow-md">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="ml-4 text-md text-gray-700">
            {uploadingImage ? 'A carregar imagem...' : `A carregar ${isEditing ? 'dados do produto e' : 'opções de'} categoria, sabor e marca...`}
          </p>
        </div>
      )}

      {optionsError || submitError ? (
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
            <h2 className="col-span-full text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Dados do Produto</h2>
            
            {/* Nome do Produto */}
            <motion.div variants={itemVariants}>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={productData.name}
                onChange={handleProductChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>

            {/* Categoria */}
            <motion.div variants={itemVariants}>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">Categoria <span className="text-red-500">*</span></label>
              <select
                id="category_id"
                name="category_id"
                value={productData.category_id}
                onChange={handleProductChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200"
              >
                <option value={0}>Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </motion.div>

            {/* 💡 NOVO: Campo para a Marca */}
            <motion.div variants={itemVariants}>
              <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700 mb-1">Marca <span className="text-red-500">*</span></label>
              <select
                id="brand_id"
                name="brand_id"
                value={productData.brand_id}
                onChange={handleProductChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200"
              >
                <option value={0}>Selecione uma marca</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </motion.div>

            {/* Preço Original (Opcional) */}
            <motion.div variants={itemVariants}>
              <label htmlFor="original_price" className="block text-sm font-medium text-gray-700 mb-1">Preço Original (€) (Opcional)</label>
              <input
                type="number"
                id="original_price"
                name="original_price"
                value={productData.original_price === 0 ? '' : (productData.original_price || '')} 
                onChange={handleProductChange}
                min="0"
                step="0.01"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
              />
            </motion.div>
            
            {/* Imagem */}
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
              <p className="mt-2 text-sm text-gray-500">Ou, se preferir, insira uma URL da imagem existente:</p>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={productData.image_url}
                onChange={handleProductChange}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200 mt-2"
              />
            </motion.div>

            {/* Descrição */}
            <motion.div variants={itemVariants} className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                id="description"
                name="description"
                value={productData.description}
                onChange={handleProductChange}
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
                checked={productData.is_active}
                onChange={handleProductChange}
                className="h-5 w-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 transition-all duration-200"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Produto Ativo</label>
            </motion.div>
          </div>

          <div className="space-y-8 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Variantes</h2>
            {/* 💡 NOVO: Mapear e renderizar cada variante */}
            {variantsData.map((variant, index) => (
              <motion.div 
                key={index}
                className="p-6 border border-gray-300 rounded-lg shadow-md bg-white space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Variante #{index + 1}</h3>
                  {variantsData.length > 1 && (
                    <motion.button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Minus className="inline-block mr-1 h-5 w-5" /> Remover
                    </motion.button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Preço */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor={`preco-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Preço (€) <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      id={`preco-${index}`}
                      name="preco"
                      value={variant.preco === 0 ? '' : variant.preco} 
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
                    />
                  </motion.div>
                  
                  {/* SKU */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor={`sku-${index}`} className="block text-sm font-medium text-gray-700 mb-1">SKU <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id={`sku-${index}`}
                      name="sku"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, e)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
                    />
                  </motion.div>
                  
                  {/* Sabor */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor={`sabor_id-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Sabor</label>
                    <select
                      id={`sabor_id-${index}`}
                      name="sabor_id"
                      value={variant.sabor_id || ''}
                      onChange={(e) => handleVariantChange(index, e)}
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white transition-all duration-200"
                    >
                      <option value="">Nenhum Sabor (Opcional)</option>
                      {flavors.map(flavor => (
                        <option key={flavor.id} value={flavor.id}>{flavor.name}</option>
                      ))}
                    </select>
                  </motion.div>

                  {/* Stock Online */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor={`quantidade_em_stock-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Stock Online <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      id={`quantidade_em_stock-${index}`}
                      name="quantidade_em_stock"
                      value={variant.quantidade_em_stock === 0 ? '' : variant.quantidade_em_stock} 
                      onChange={(e) => handleVariantChange(index, e)}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
                    />
                  </motion.div>

                  {/* Stock Ginásio */}
                  <motion.div variants={itemVariants}>
                    <label htmlFor={`stock_ginasio-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Stock Ginásio <span className="text-red-500">*</span></label>
                    <input
                      type="number"
                      id={`stock_ginasio-${index}`}
                      name="stock_ginasio"
                      value={variant.stock_ginasio === 0 ? '' : variant.stock_ginasio} 
                      onChange={(e) => handleVariantChange(index, e)}
                      min="0"
                      className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
                    />
                  </motion.div>

                  {/* Peso e Unidade */}
                  <motion.div variants={itemVariants} className="flex gap-4">
                    <div className="flex-1">
                      <label htmlFor={`weight_value-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                      <input
                        type="number"
                        id={`weight_value-${index}`}
                        name="weight_value"
                        value={variant.weight_value === 0 ? '' : variant.weight_value} 
                        onChange={(e) => handleVariantChange(index, e)}
                        min="0"
                        step="0.01"
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-gray-900 transition-all duration-200"
                      />
                    </div>
                    <div className="flex-1">
                      <label htmlFor={`weight_unit-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Unidade Peso</label>
                      <select
                        id={`weight_unit-${index}`}
                        name="weight_unit"
                        value={variant.weight_unit}
                        onChange={(e) => handleVariantChange(index, e)}
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
                </div>
              </motion.div>
            ))}
            
            {/* 💡 NOVO: Botão para adicionar mais variantes */}
            <motion.button
              type="button"
              onClick={addVariant}
              className="w-full flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg shadow-md hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
              variants={buttonVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="inline-block mr-2 h-5 w-5" /> Adicionar Outra Variante
            </motion.button>
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
