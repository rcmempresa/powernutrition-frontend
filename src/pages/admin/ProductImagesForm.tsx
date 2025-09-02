import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Plus, Trash2, CheckCircle, XCircle, Image as ImageIcon, Save, FileUp } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

// Tipagem para uma imagem no formulário
interface ImageFormItem {
  id: string; // Usado para key no React
  file?: File; // Agora armazena o ficheiro em si
  imageUrl?: string; // Para armazenar o URL após o upload
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

const ProductImagesForm: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { getAuthToken } = useAuth();

  const [images, setImages] = useState<ImageFormItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [overallSuccess, setOverallSuccess] = useState<string | null>(null);
  const [overallError, setOverallError] = useState<string | null>(null);
  const [productIdNum, setProductIdNum] = useState<number | null>(null);

  // Variantes de animação para Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: "0 8px 16px rgba(249, 115, 22, 0.4)" },
    tap: { scale: 0.95 }
  };

  useEffect(() => {
    if (productId) {
      setProductIdNum(Number(productId));
      // OPCIONAL: Carregar imagens secundárias existentes para este produto para edição, se necessário.
    } else {
      navigate('/admin/products');
      setOverallError('ID do produto não fornecido.');
    }
  }, [productId, navigate]);

  const handleRemoveImage = useCallback((id: string) => {
    setImages(prevImages => {
      const updatedImages = prevImages.filter(img => img.id !== id);
      return updatedImages;
    });
  }, []);

  // ✨ Handler para o input de múltiplos ficheiros ✨
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newImageItems = filesArray.map(file => ({
        id: crypto.randomUUID(),
        file: file,
        status: 'pending' as const,
        message: file.name
      }));
      
      setImages(prevImages => [...prevImages, ...newImageItems]);
    }
  }, []);

  // ✨ Função de upload para o backend, a mesma usada no ProductForm ✨
  const uploadImage = async (file: File) => {
    const token = getAuthToken();
    const uploadUrl = `${import.meta.env.VITE_BACKEND_URL}/api/images/upload`;

    if (!token) {
      throw new Error('Token de autenticação não encontrado.');
    }

    const data = new FormData();
    // O nome 'image' aqui DEVE corresponder ao nome que o Multer está à espera no backend
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

  const handleSubmitImages = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOverallSuccess(null);
    setOverallError(null);

    if (!productIdNum) {
      setOverallError('ID do produto inválido. Não é possível adicionar imagens.');
      setLoading(false);
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setOverallError('Token de autenticação não encontrado. Por favor, faça login.');
      setLoading(false);
      return;
    }

    // Filtra as imagens que têm um ficheiro e ainda não foram enviadas com sucesso
    const imagesToProcess = images.filter(img => img.file && img.status !== 'success');

    if (imagesToProcess.length === 0) {
      setOverallError('Nenhuma imagem válida para adicionar. Selecione ficheiros e tente novamente.');
      setLoading(false);
      return;
    }

    let allSuccessful = true;
    for (const img of imagesToProcess) {
      setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'uploading', message: 'A enviar...' } : i));
      try {
        const uploadedUrl = await uploadImage(img.file as File);

        const payload = {
          product_id: productIdNum,
          image_url: uploadedUrl,
          is_primary: false, // ✨ Sempre FALSE para imagens secundárias ✨
        };

        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/product_images/create`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'success', message: 'Enviada!', imageUrl: uploadedUrl } : i));
      } catch (err: any) {
        console.error(`Erro ao adicionar imagem:`, err);
        setImages(prev => prev.map(i => i.id === img.id ? { ...i, status: 'error', message: err.message || 'Erro ao enviar.' } : i));
        allSuccessful = false;
      }
    }

    setLoading(false);
    if (allSuccessful) {
      setOverallSuccess('Todas as imagens secundárias foram adicionadas com sucesso!');
      setTimeout(() => navigate('/admin/products'), 2000);
    } else {
      setOverallError('Algumas imagens não puderam ser adicionadas. Verifique os detalhes.');
    }
  };

  const isSubmitDisabled = loading || images.every(img => img.status === 'success' || !img.file);

  return (
    <motion.div 
      className="p-8 bg-white rounded-lg shadow-2xl border border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <h1 className="text-4xl font-extrabold text-gray-900 mb-6 flex items-center">
        <ImageIcon className="mr-3 h-9 w-9 text-orange-600" />
        Adicionar Imagens Secundárias ao Produto: <span className="text-orange-600 ml-2">{productId}</span>
      </h1>
      <p className="text-lg text-gray-700 mb-8">
        Selecione os ficheiros de imagem que servirão como imagens secundárias para o produto.
      </p>
      
      <motion.button 
        onClick={() => navigate('/admin/products')}
        className="mb-8 px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg shadow-md hover:bg-gray-300 transition-all duration-300 transform hover:scale-105"
        variants={buttonVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <XCircle className="inline-block mr-2 h-5 w-5" />
        Voltar para a Lista de Produtos
      </motion.button>

      {/* Mensagens de Feedback Geral */}
      {overallSuccess && (
        <motion.div 
          className="p-4 bg-green-100 text-green-700 border border-green-300 rounded-lg mb-6 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <CheckCircle className="mr-2 h-5 w-5" /> <p className="font-semibold">{overallSuccess}</p>
        </motion.div>
      )}
      {overallError && (
        <motion.div 
          className="p-4 bg-red-100 text-red-700 border border-red-300 rounded-lg mb-6 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <XCircle className="mr-2 h-5 w-5" /> <p className="font-semibold">Erro: {overallError}</p>
        </motion.div>
      )}

      {productIdNum === null ? (
        <div className="flex items-center justify-center min-h-[30vh] bg-gray-50 rounded-lg shadow-md">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="ml-4 text-md text-gray-700">A obter informações do produto...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmitImages} className="space-y-6">
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg shadow-inner border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Adicionar e Gerir Imagens</h2>
            
            {/* Input de Ficheiro */}
            <motion.div 
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="p-6 border-dashed border-2 border-gray-300 rounded-lg bg-white"
            >
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex flex-col items-center justify-center">
                  <FileUp className="h-10 w-10 text-orange-500 mb-2" />
                  <p className="text-sm text-gray-600 font-semibold">Clique ou arraste e solte para adicionar imagens</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF</p>
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </motion.div>

            {/* Exibição das imagens adicionadas */}
            {images.map((img, index) => (
              <motion.div 
                key={img.id} 
                className="flex flex-wrap items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                {/* Nome do Ficheiro */}
                <div className="flex-1 min-w-[250px] flex items-center gap-2">
                  <span className="truncate text-gray-700 font-medium">
                    {img.file?.name || img.imageUrl || 'Nova Imagem'}
                  </span>
                </div>

                {/* Status da Imagem */}
                <div className="flex items-center text-sm font-medium">
                  {img.status === 'uploading' && <Loader2 className="animate-spin mr-2 h-4 w-4 text-blue-500" />}
                  {img.status === 'success' && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                  {img.status === 'error' && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                  <span className={
                    img.status === 'uploading' ? 'text-blue-600' :
                    img.status === 'success' ? 'text-green-600' :
                    img.status === 'error' ? 'text-red-600' : 'text-gray-500'
                  }>
                    {img.message || (img.status === 'uploading' ? 'A enviar...' : (img.status === 'success' ? 'Enviada' : 'Pendente'))}
                  </span>
                </div>

                {/* Botão Remover */}
                <motion.button
                  type="button"
                  onClick={() => handleRemoveImage(img.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Remover Imagem"
                  disabled={img.status === 'success' || img.status === 'uploading'}
                >
                  <Trash2 className="h-5 w-5" />
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Botão de Submissão de Imagens */}
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center px-6 py-3 bg-orange-600 text-white font-bold rounded-lg shadow-md hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            disabled={isSubmitDisabled}
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2 h-5 w-5" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {loading ? 'A Enviar Imagens...' : 'Guardar Imagens Secundárias'}
          </motion.button>
        </form>
      )}
    </motion.div>
  );
};

export default ProductImagesForm;