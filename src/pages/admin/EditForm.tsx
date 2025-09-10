import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Edit, Save, PlusCircle, XCircle, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

// Mock do hook useAuth para simular a autenticação
// Numa aplicação real, este hook seria importado de um ficheiro separado


// Nova tipagem para uma variante do produto
interface ProductVariant {
  id: number;
  produto_id: number;
  sabor_id: number | null;
  weight_value: number;
  weight_unit: string;
  preco: number;
  quantidade_em_stock: number | null;
  stock_ginasio: number;
  sku: string;
  flavor_name: string | null;
}

// Tipagem para uma categoria, marca e sabor (da API)
interface ApiItem {
  id: number;
  name: string;
}

// Tipagem para um produto completo
interface FullProduct {
  id: number;
  name: string;
  description: string;
  image_url: string;
  category_id: number;
  is_active: boolean;
  brand_id: number;
  original_price: string;
  variants: ProductVariant[];
}

const EditForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();
  
  const [product, setProduct] = useState<FullProduct | null>(null);
  const [categories, setCategories] = useState<ApiItem[]>([]);
  const [brands, setBrands] = useState<ApiItem[]>([]);
  const [flavors, setFlavors] = useState<ApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Carrega os dados do produto, categorias, marcas e sabores em simultâneo
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      const token = getAuthToken();

      try {
        const [productResponse, categoriesResponse, brandsResponse, flavorsResponse] = await Promise.all([
          axios.get<FullProduct>(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get<ApiItem[]>(`${import.meta.env.VITE_BACKEND_URL}/api/categories/listar`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get<ApiItem[]>(`${import.meta.env.VITE_BACKEND_URL}/api/brands/listar`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get<ApiItem[]>(`${import.meta.env.VITE_BACKEND_URL}/api/flavors/listar`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);
        
        const productData = { ...productResponse.data, original_price: '59.99' };
        setProduct(productData);
        setCategories(categoriesResponse.data);
        setBrands(brandsResponse.data);
        setFlavors(flavorsResponse.data);
        setImagePreview(productData.image_url);
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err);
        setError(err.response?.data?.message || 'Erro ao carregar dados. Verifique a URL da API ou a sua ligação.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAllData();
    }
  }, [id, getAuthToken]);

  // Função para lidar com a seleção do ficheiro
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Função para lidar com a atualização do produto principal
  const handleUpdateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!product) return;

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const token = getAuthToken();

      const formData = new FormData();
      formData.append('name', product.name);
      formData.append('description', product.description);
      formData.append('is_active', String(product.is_active));
      formData.append('brand_id', String(product.brand_id));
      formData.append('category_id', String(product.category_id));
      // Correção: Converte o preço para número antes de enviar
      formData.append('original_price', parseFloat(product.original_price).toString());
      
      if (selectedImage) {
        formData.append('image', selectedImage);
      } else {
        // Se não houver nova imagem, enviar a URL existente
        formData.append('image_url', product.image_url);
      }

      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/atualizar/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setSaveStatus('Produto principal atualizado com sucesso!');
      setSelectedImage(null);
    } catch (err: any) {
      console.error('Erro ao atualizar produto:', err);
      setSaveStatus(err.response?.data?.message || 'Erro ao atualizar o produto. Tente novamente.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Função para lidar com a atualização de uma variante específica
  const handleUpdateVariant = async (variantId: number, updatedData: Partial<ProductVariant>) => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const token = getAuthToken();
      await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/products/atualizar/${id}/variantes/${variantId}`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSaveStatus('Variante atualizada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar variante:', err);
      setSaveStatus(err.response?.data?.message || 'Erro ao atualizar a variante. Tente novamente.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Função para lidar com a mudança nos campos do formulário do produto principal
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProduct(prev => {
      if (!prev) return null;
      if (type === 'checkbox') {
        return { ...prev, [name]: (e.target as HTMLInputElement).checked };
      }
      // Converte os IDs de marca e categoria para números
      if (name === 'brand_id' || name === 'category_id') {
        return { ...prev, [name]: Number(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  // Função para lidar com a mudança nos campos do formulário das variantes
  const handleVariantChange = (variantId: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProduct(prev => {
      if (!prev) return null;
      const updatedVariants = prev.variants.map(variant => {
        if (variant.id === variantId) {
          if (type === 'number' || name === 'sabor_id') {
            return { ...variant, [name]: Number(value) };
          }
          return { ...variant, [name]: value };
        }
        return variant;
      });
      return { ...prev, variants: updatedVariants };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-50 rounded-lg shadow-xl animate-pulse">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="ml-4 text-lg text-gray-700 font-semibold">A carregar dados do produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 border-2 border-red-300 rounded-lg shadow-md animate-fade-in">
        <p className="text-xl text-red-700 font-bold mb-4">Ocorreu um Erro:</p>
        <p className="text-gray-700 mb-6">{error}</p>
        <motion.button 
          onClick={() => navigate('/admin/products')}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Voltar para a Lista de Produtos
        </motion.button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg shadow-md">
        <p className="text-xl text-gray-700">Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="p-8 bg-white rounded-lg shadow-2xl border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors duration-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar
        </motion.button>
        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center flex-grow justify-center">
          <Edit className="h-9 w-9 mr-4 text-orange-500" />
          Editar Produto: {product.name}
        </h1>
      </div>
      <p className="text-lg text-gray-700 mb-8 text-center">Edite as informações do produto e suas variantes.</p>

      <AnimatePresence>
        {saveStatus && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-lg mb-6 flex items-center ${
              saveStatus.includes('sucesso') ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
            }`}
          >
            {saveStatus.includes('sucesso') ? <Save className="mr-2 h-5 w-5" /> : <XCircle className="mr-2 h-5 w-5" />}
            <p className="font-semibold">{saveStatus}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulário para o Produto Principal */}
      <motion.div 
        className="mb-8 p-6 bg-gray-50 rounded-lg shadow-inner border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.5 } }}
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Informações do Produto</h2>
        <form onSubmit={handleUpdateProduct} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              name="name"
              id="name"
              value={product.name}
              onChange={handleProductChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
              name="description"
              id="description"
              value={product.description}
              onChange={handleProductChange}
              rows={4}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="image_file" className="block text-sm font-medium text-gray-700">Carregar Imagem</label>
              <input
                type="file"
                name="image_file"
                id="image_file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
            {imagePreview && (
              <div className="flex justify-center items-center">
                <img 
                  src={imagePreview} 
                  alt="Pré-visualização da Imagem do Produto"
                  className="rounded-lg shadow-md max-w-full h-auto max-h-48 object-contain"
                />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="original_price" className="block text-sm font-medium text-gray-700">Preço Original</label>
            <input
              type="text"
              name="original_price"
              id="original_price"
              value={product.original_price}
              onChange={handleProductChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label htmlFor="brand_id" className="block text-sm font-medium text-gray-700">Marca</label>
            <select
              name="brand_id"
              id="brand_id"
              value={product.brand_id}
              onChange={handleProductChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Selecione a Marca</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.id}>{brand.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select
              name="category_id"
              id="category_id"
              value={product.category_id}
              onChange={handleProductChange}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Selecione a Categoria</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={product.is_active}
              onChange={handleProductChange}
              className="h-4 w-4 text-orange-600 border-gray-300 rounded-lg focus:ring-orange-500"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Ativo</label>
          </div>
          <motion.button
            type="submit"
            className={`flex items-center justify-center px-6 py-3 font-bold rounded-lg shadow-md transition-all duration-300 ${isSaving ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
            whileHover={{ scale: isSaving ? 1 : 1.05 }}
            whileTap={{ scale: isSaving ? 1 : 0.95 }}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                A Guardar...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Atualizar Produto
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Secção de Edição de Variantes */}
      <motion.div
        className="p-6 bg-gray-50 rounded-lg shadow-inner border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.5 } }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Variantes</h2>
          {/* Este botão pode ser usado para adicionar uma nova variante se necessário */}
          <motion.button
            onClick={() => navigate(`/admin/products/adicionar-variante/${id}`)}
            className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg shadow-md hover:bg-emerald-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Nova
          </motion.button>
        </div>
        
        {product.variants.length > 0 ? (
          <div className="space-y-6">
            {product.variants.map((variant) => (
              <div key={variant.id} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Variante: {variant.flavor_name} ({variant.weight_value} {variant.weight_unit})</h3>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateVariant(variant.id, variant);
                }}>
                  <div>
                    <label htmlFor={`sabor_id-${variant.id}`} className="block text-sm font-medium text-gray-700">Sabor</label>
                    <select
                      name="sabor_id"
                      id={`sabor_id-${variant.id}`}
                      value={variant.sabor_id || ''}
                      onChange={(e) => handleVariantChange(variant.id, e)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Selecione o Sabor</option>
                      {flavors.map(flavor => (
                        <option key={flavor.id} value={flavor.id}>{flavor.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`preco-${variant.id}`} className="block text-sm font-medium text-gray-700">Preço</label>
                    <input
                      type="number"
                      name="preco"
                      id={`preco-${variant.id}`}
                      value={variant.preco}
                      onChange={(e) => handleVariantChange(variant.id, e)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`stock_online-${variant.id}`} className="block text-sm font-medium text-gray-700">Stock Online</label>
                    <input
                      type="number"
                      name="quantidade_em_stock"
                      id={`stock_online-${variant.id}`}
                      value={variant.quantidade_em_stock || ''}
                      onChange={(e) => handleVariantChange(variant.id, e)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`stock_ginasio-${variant.id}`} className="block text-sm font-medium text-gray-700">Stock Ginásio</label>
                    <input
                      type="number"
                      name="stock_ginasio"
                      id={`stock_ginasio-${variant.id}`}
                      value={variant.stock_ginasio}
                      onChange={(e) => handleVariantChange(variant.id, e)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`sku-${variant.id}`} className="block text-sm font-medium text-gray-700">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      id={`sku-${variant.id}`}
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(variant.id, e)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`weight_value-${variant.id}`} className="block text-sm font-medium text-gray-700">Valor do Peso</label>
                    <input
                      type="number"
                      name="weight_value"
                      id={`weight_value-${variant.id}`}
                      value={variant.weight_value}
                      onChange={(e) => handleVariantChange(variant.id, e)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor={`weight_unit-${variant.id}`} className="block text-sm font-medium text-gray-700">Unidade do Peso</label>
                    <input
                      type="text"
                      name="weight_unit"
                      id={`weight_unit-${variant.id}`}
                      value={variant.weight_unit}
                      onChange={(e) => handleVariantChange(variant.id, e)}
                      className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <motion.button
                      type="submit"
                      className={`flex items-center justify-center px-4 py-2 font-bold rounded-lg shadow-md transition-all duration-300 ${isSaving ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
                      whileHover={{ scale: isSaving ? 1 : 1.05 }}
                      whileTap={{ scale: isSaving ? 1 : 0.95 }}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          A Guardar...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Atualizar Variante
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-600">
            Este produto não tem variantes.
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default EditForm;
