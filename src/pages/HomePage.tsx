import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Eye,
  ArrowRight,
  Play,
  Heart,
  ShoppingCart as ShoppingCartIcon,
  Twitter,
  Instagram,
  Facebook,
  MapPin,
  User,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth'; 
import toast from 'react-hot-toast'; 
import { useFavorites } from '../hooks/useFavorites';
import { Mail } from 'lucide-react';
import Footer from '../components/FooterPage';

// --- NOVA TIPAGEM para a nova estrutura de dados ---
interface Variant {
    id: number;
    preco: number;
    quantidade_em_stock: number;
    sku: string;
    weight_value: number;
    weight_unit: string;
    flavor_id: number;
    image_url: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    image_url: string;
    category_id: number;
    brand?: string;
    is_active: boolean;
    original_price?: number;
    rating?: number;
    reviewcount?: number;
    // NOVAS PROPRIEDADES DERIVADAS
    displayPrice: number;
    displayWeight: string;
    // E AQUI O ARRAY DE VARIANTES
    variants: Variant[];
}

// --- Funções de Busca de Dados Atualizadas ---
// Função de busca para produtos recentes
async function fetchLatestProducts() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
    
    if (!response.data || !Array.isArray(response.data)) {
        console.warn("API returned invalid or empty data for latest products.");
        return [];
    }

    return response.data.map((product) => {
      // 1. Verificação segura para `variants`
      const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;

      let cheapestVariant = null;
      let displayPriceValue = 0; // Preço padrão para 0
      let displayWeightValue = 'N/A'; // Peso padrão para N/A
      let productImage = product.image_url; // Imagem padrão do produto

      if (hasVariants) {
        // 2. Ordena as variantes para encontrar a mais barata
        // Certifica-se de que `preco` é um número para a comparação
        const sortedVariants = product.variants.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
        cheapestVariant = sortedVariants[0];

        // 3. Define displayPrice a partir da variante mais barata
        if (cheapestVariant && cheapestVariant.preco !== undefined) {
          displayPriceValue = parseFloat(cheapestVariant.preco);
        }

        // 4. Define displayWeight a partir da variante mais barata
        if (cheapestVariant && cheapestVariant.weight_value && cheapestVariant.weight_unit) {
          displayWeightValue = `${cheapestVariant.weight_value}${cheapestVariant.weight_unit}`;
        }
        
        // 5. Opcional: Usar a imagem da variante se disponível
        if (cheapestVariant && cheapestVariant.image_url) {
            productImage = cheapestVariant.image_url;
        }

      } else {
        // Se não houver variantes, usa o original_price como displayPrice
        if (product.original_price !== undefined) {
          displayPriceValue = parseFloat(product.original_price);
        }
      }

      return {
        ...product, // ESTA LINHA CONTINUA CRÍTICA PARA MANTER AS VARIANTES E OUTROS CAMPOS
        displayPrice: displayPriceValue,
        displayWeight: displayWeightValue,
        image_url: productImage, // Atribui a imagem final
      };
    });
  } catch (error) {
    console.error("Error fetching latest products:", error);
    throw error;
  }
}

// O HomePage agora recebe o objeto 'cart' e a função 'handleQuickViewOpen' como props do App.jsx
const HomePage = ({ cart, handleQuickViewOpen }) => {
  const navigate = useNavigate();
  const { isAuthenticated, getAuthToken } = useAuth(); 
  const { checkIfFavorite, toggleFavorite, loadingFavorites } = useFavorites();
  

  // --- ESTADOS E HOOKS ESPECÍFICOS DA HOMEPAGE ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  // Estados para categorias
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const categoriesPerPage = 4;
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const videoSrc = "https://res.cloudinary.com/dheovknbt/video/upload/v1756742336/video_qz6xgi.mp4"; // Certifique-se de que este caminho está correto
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);

  // Estados para Produtos Mais Recentes
  const [allLatestProducts, setAllLatestProducts] = useState<Product[]>([]);
  const [visibleLatestProducts, setVisibleLatestProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const [currentProductStartIndex, setCurrentProductStartIndex] = useState(0);
  const productsPerPage = 4;

  // ✨ NOVO ESTADO: Para rastrear os IDs dos produtos favoritos do utilizador ✨
  // ESTE ESTADO FOI SUBSTITUIDO PELO USEFAVORITES, MAS MANTIDO PARA COMPARAÇÃO
  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<number>>(new Set());

  // Dados estáticos para os slides da Hero Section
  const slides = [
    { title: "Apoie a Sua Saúde & Vitalidade.", subtitle: "BEM-ESTAR DIÁRIO", image: "/suplementos.webp" },
    { title: "Recupere Mais Rápido, Treine Mais Forte.", subtitle: "SUPLEMENTOS DESPORTIVOS", image: "suplementos_2.webp" },
    { title: "Eleva o Teu Potencial, Quebra Limites.", subtitle: "PERFORMANCE DE ELITE", image: "/suplementos_3.avif" }
  ];

  // Categorias fixas para a seção de Produtos Populares
  const staticCategories = [
    { id: 1, name: "Proteínas" },
    { id: 2, name: "Creatinas" },
    { id: 3, name: "Amino Ácidoss" },
    { id: 4, name: "Vitaminas e Minerais" },
    { id: 5, name: "Multivitamínico" },
    { id: 12, name: "Gainers e Carbs" },
  ];

  const [categorizedProducts, setCategorizedProducts] = useState<Product[]>([]);
  const [loadingCategorizedProducts, setLoadingCategorizedProducts] = useState(false);
  const [errorCategorizedProducts, setErrorCategorizedProducts] = useState(null);

  // --- FUNÇÕES AUXILIARES ---
  const getCategoryImageUrl = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'proteínas': return '/proteina.webp';
      case 'acessórios': return '/acessorios.WEBP';
      case 'aminoácidos': return '/aminoacidos.webp';
      case 'articulações': return '/articulacoes_1.png';
      case 'creatinas': return '/creatina.webp';
      case 'endurance': return '/endurance.webp';
      case 'gainers e carbs': return '/Gainer.webp';
      case 'hormonal': return '/hormonal.png';
      case 'lifestyle': return '/lifestyle.webp';
      case 'natural e essencial': return '/natural.png';
      case 'pré-treinos': return '/pre_treino.webp';
      case 'saúde e bem-estar': return '/saude.png';
      case 'snacks e barras': return '/barras.webp';
      case 'termogénicos': return '/termogenico.webp';
      case 'vitaminas e minerais': return '/vitaminas.avif';
      default: return '/images/default-category.png';
    }
  };

  // Funções de navegação do carrossel de CATEGORIAS
  const handleNextCategory = () => {
    setCurrentIndex(prevIndex => Math.min(prevIndex + categoriesPerPage, categories.length - categoriesPerPage));
  };

  const handlePrevCategory = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - categoriesPerPage, 0));
  };
  

  // Funções de navegação do carrossel de PRODUTOS MAIS RECENTES
  const handleNextProduct = () => {
    const nextIndex = currentProductStartIndex + productsPerPage;
    if (nextIndex < allLatestProducts.length) {
      setCurrentProductStartIndex(nextIndex);
    } else {
      // Opcional: Voltar para o início se chegar ao fim
      // setCurrentProductStartIndex(0);
    }
  };

  const handlePrevProduct = () => {
    const prevIndex = currentProductStartIndex - productsPerPage;
    if (prevIndex >= 0) {
      setCurrentProductStartIndex(prevIndex);
    } else {
      // Opcional: Ir para o fim se voltar do início
      // setCurrentProductStartIndex(Math.max(0, allLatestProducts.length - productsPerPage));
    }
  };

  const fetchProductsByCategory = async (categoryId: number | null) => {
    setLoadingCategorizedProducts(true);
    setErrorCategorizedProducts(null);
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
        const allProducts = response.data.map((product: any) => ({
            ...product,
            price: parseFloat(product.price),
            original_price: product.original_price ? parseFloat(product.original_price) : null
        }));

        let filteredProducts = [];
        if (categoryId !== null) {
            filteredProducts = allProducts.filter((product: any) => product.category_id === categoryId);
        } else {
            filteredProducts = allProducts;
        }
        setCategorizedProducts(filteredProducts);
    } catch (error: any) {
        console.error(`Erro ao buscar ou filtrar produtos para categoria ${categoryId}:`, error);
        setErrorCategorizedProducts(error);
    } finally {
        setLoadingCategorizedProducts(false);
    }
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    fetchProductsByCategory(categoryId);
  };

  const handleCategoryClickCategories = (categoryId: number) => {
    navigate(`/produtos?categoria=${categoryId}`);
  };
  
  // ✨ NOVA FUNÇÃO: Buscar IDs de produtos favoritos para o utilizador atual ✨
  const fetchFavoriteProductIds = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteProductIds(new Set()); // Limpa se não estiver autenticado
      return;
    }
    const token = getAuthToken();
    if (!token) return; // Não há token, não busca favoritos

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/listar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ids = new Set(response.data.map((p: any) => p.id));
      setFavoriteProductIds(ids);
    } catch (error) {
      console.error('Erro ao buscar favoritos do utilizador:', error);
      // Não define erro na UI, apenas loga, pois é um recurso secundário
    }
  }, [isAuthenticated, getAuthToken]);

  // ✨ NOVA FUNÇÃO: Alternar o estado de favorito de um produto ✨
  const handleToggleFavorite = useCallback(async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Previne que o clique no coração navegue para a página do produto

    if (!isAuthenticated) {
      toast.error('Precisa de estar autenticado para gerir favoritos.');
      return;
    }

    const token = getAuthToken();
    if (!token) {
      toast.error('Token de autenticação não encontrado. Por favor, faça login.');
      return;
    }

    const isCurrentlyFavorite = favoriteProductIds.has(productId);

    try {
      if (isCurrentlyFavorite) {
        // Remover dos favoritos
        await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/remove/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success('Produto removido dos favoritos!');
      } else {
        // Adicionar aos favoritos
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/add`, { productId }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setFavoriteProductIds(prev => new Set(prev).add(productId));
        toast.success('Produto adicionado aos favoritos!');
      }
    } catch (error: any) {
      console.error('Erro ao alternar favorito:', error);
      toast.error(error.response?.data?.message || 'Erro ao gerir favorito.');
    }
  }, [isAuthenticated, getAuthToken, favoriteProductIds]);

  // --- USE EFFECTS ---
  // Efeito para o slider automático da Hero Section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Efeito para buscar as categorias do backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories/listar`);
        const sortedCategories = response.data.sort((a: any, b: any) => a.id - b.id);
        setCategories(sortedCategories);
      } catch (err: any) {
        console.error("Failed to fetch categories:", err);
        setErrorCategories(err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Efeito para buscar os PRODUTOS MAIS RECENTES do backend
  useEffect(() => {
    const getLatestProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await fetchLatestProducts();
        setAllLatestProducts(data);
        setVisibleLatestProducts(data.slice(0, productsPerPage));
      } catch (err: any) {
        setErrorProducts(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    getLatestProducts();
  }, []);

  // Efeito para atualizar os PRODUTOS VISÍVEIS do carrossel
  useEffect(() => {
    const endIndex = currentProductStartIndex + productsPerPage;
    setVisibleLatestProducts(allLatestProducts.slice(currentProductStartIndex, endIndex));
  }, [currentProductStartIndex, allLatestProducts, productsPerPage]);

  // Efeito para buscar produtos da categoria padrão (ex: "Todos") ao carregar a página
  useEffect(() => {
    fetchProductsByCategory(null);
  }, []);

  // ✨ Efeito para buscar favoritos quando o componente monta ou o estado de autenticação muda ✨
  useEffect(() => {
    fetchFavoriteProductIds();
  }, [fetchFavoriteProductIds]);


  // --- LÓGICA PARA BOTÕES DO CARROSSEL ---
  const visibleCategories = categories.slice(currentIndex, currentIndex + categoriesPerPage);
  const canGoNextCategory = currentIndex + categoriesPerPage < categories.length;
  const canGoPrevCategory = currentIndex > 0;
  const canGoNextProduct = currentProductStartIndex + productsPerPage < allLatestProducts.length;
  const canGoPrevProduct = currentProductStartIndex > 0;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/fundo-3.png)',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Hero Section */}
      <section
        className="relative overflow-hidden bg-gradient-to-r from-orange-400 to-red-500"
        role="banner"
        style={{ height: "700px" }}
      >
        <motion.video
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={videoSrc} type="video/mp4" />
          O seu navegador não suporta a tag de vídeo.
        </motion.video>

        <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 h-full flex items-center">
          <div className="w-full max-w-2xl text-white text-center lg:text-left">
            <motion.div
              key="hero-subtitle"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-sm md:text-base font-semibold mb-4 tracking-widest uppercase text-orange-300"
            >
              {"ELEVE O SEU POTENCIAL"}
            </motion.div>

            <motion.h1
              key="hero-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg"
            >
              {"Suplementos que Transformam a sua Performance."}
            </motion.h1>

            <button
              className="mt-10 bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 inline-flex items-center justify-center lg:justify-start mx-auto lg:mx-0"
              onClick={() => navigate('/produtos')}
              aria-label="Comprar agora"
            >
              COMPRAR AGORA
              <ArrowRight className="w-5 h-5 ml-3" />
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {loadingCategories ? (
        <p className="text-white text-center py-8 bg-gray-800">Carregando principais categorias...</p>
      ) : errorCategories ? (
        <p className="text-red-500 text-center py-8 bg-gray-800">Erro ao carregar categorias: {errorCategories.message}. Por favor, tente novamente.</p>
      ) : (
        <section className="py-8 md:py-16 px-4 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100">Categorias Principais</h2>
              <div className="flex space-x-4">
                <button
                  onClick={handlePrevCategory}
                  disabled={!canGoPrevCategory}
                  className={`p-2 rounded-full bg-gray-700 text-white transition-colors duration-200 ${
                    !canGoPrevCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
                  }`}
                >
                  &larr;
                </button>
                <button
                  onClick={handleNextCategory}
                  disabled={!canGoNextCategory}
                  className={`p-2 rounded-full bg-gray-700 text-white transition-colors duration-200 ${
                    !canGoNextCategory ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
                  }`}
                >
                  &rarr;
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
              {visibleCategories.length > 0 ? (
                visibleCategories.slice(0, 4).map((category: any) => (
                  <div
                    key={category.id}
                    className="text-center group cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setHoveredCategoryId(category.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                    onClick={() => handleCategoryClickCategories(category.id)} 
                  >
                    <div className="bg-gray-700 rounded-2xl p-6 mb-4 shadow-lg shadow-orange-500/10 transition-shadow border border-gray-600 overflow-hidden">
                      <img
                        src={getCategoryImageUrl(category.name)}
                        alt={category.name}
                        className={`w-full h-32 md:h-40 object-contain rounded-lg transition-transform duration-300 ease-in-out ${
                          hoveredCategoryId === category.id ? 'scale-110' : ''
                        }`}
                      />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-100 mb-2">{category.name}</h3>
                    <p className="text-sm md:text-base text-gray-400">({category.items} Itens)</p>
                  </div>
                ))
              ) : (
                <p className="col-span-full text-center text-gray-400">Nenhuma categoria encontrada.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Vitamin C Section - Adaptada para Desalinhamento Vertical */}
      <section className="py-8 md:py-16 px-4 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 h-[450px] md:h-[550px] lg:h-[650px] items-start"
            >

              <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg  h-full mt-8 sm:mt-16  flex items-center justify-center">
                <img
                  src="/vitamina_c.jpg"
                  alt="Pote de cápsulas de suplemento amarelo"
                  className="w-9/10 h-9/10 object-contain rounded-xl"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-orange-500 font-medium mb-4 tracking-wider">MELHORE A SUA SAÚDE</div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100 mb-6">
                A Sua Dose Diária de Imunidade Natural.
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Dê um impulso à sua saúde com a combinação poderosa de Vitamina C e Vitamina D. Essenciais para um sistema imunitário forte, estes nutrientes vitais protegem o seu corpo e promovem bem-estar. Sinta a diferença de uma imunidade reforçada e mais vitalidade no seu dia a dia.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 hover:shadow-lg hover:shadow-red-700/30 transition-all flex items-center"
                  onClick={() => navigate('/produtos')}
                >
                  COMPRAR AGORA
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <a
                  href="https://www.youtube.com/watch?v=9nBRRQy0LlM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label="Reproduzir vídeo sobre vitamina C"
                >
                  <Play className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Latest Products Section (Corrigido) */}
      <section className="py-8 md:py-16 px-4 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
                <div>
                    <div className="flex items-center mb-2">
                        <span className="text-orange-500 mr-2">🔥</span>
                        <span className="text-red-500 font-medium">PROMOÇÕES DA SEMANA</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100">Produtos Mais Recentes</h2>
                </div>
                <div className="hidden md:flex space-x-2">
                    <button
                        onClick={handlePrevProduct}
                        disabled={!canGoPrevProduct}
                        className={`bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            !canGoPrevProduct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                        }`}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNextProduct}
                        disabled={!canGoNextProduct}
                        className={`bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                            !canGoNextProduct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                        }`}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {loadingProducts ? (
                <p className="text-center text-gray-400">Carregando produtos recentes...</p>
            ) : errorProducts ? (
                <p className="text-center text-red-500">Erro ao carregar produtos: {errorProducts.message}</p>
            ) : visibleLatestProducts.length === 0 ? (
                <p className="text-center text-gray-400">Nenhum produto recente encontrado.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {visibleLatestProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onMouseEnter={() => setHoveredProduct(product.id)}
                            onMouseLeave={() => setHoveredProduct(null)}
                            onClick={() => navigate(`/produto/${product.id}`)} 
                        >
                            <div className="relative bg-gray-700 rounded-2xl shadow-lg group-hover:shadow-orange-500/20 transition-all border border-gray-600 overflow-hidden">
                                <div className="relative w-full h-48 md:h-56">
                                    {/* LÓGICA DE STOCK CORRIGIDA */}
                                    {(!product.is_active || (product.variants && product.variants.length > 0 && product.variants.every(v => v.quantidade_em_stock === 0 && v.stock_ginasio === 0))) && (
                                        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm z-10">
                                            Esgotado
                                        </div>
                                    )}
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="p-4 md:p-6">
                                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500" 
                                            aria-label="Toggle favorite"
                                            onClick={(e) => toggleFavorite(product.id, e)}
                                        >
                                            <Heart 
                                                className={`w-4 h-4 transition-colors ${
                                                    checkIfFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-200'
                                                }`} 
                                            />
                                        </button>
                                        <button
                                            className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500"
                                            aria-label="Quick view"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickViewOpen(product);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 text-gray-200" />
                                        </button>
                                        <button
                                          className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500"
                                          aria-label="Add to cart"
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              if (cart && cart.addItem) {
                                                  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

                                                  if (firstVariant) {
                                                      cart.addItem({
                                                          id: firstVariant.id,
                                                          name: product.name,
                                                          price: firstVariant.preco,
                                                          image: product.image_url
                                                      });
                                                      toast.success(`${product.name} adicionado ao carrinho!`);
                                                  } else {
                                                      toast.error("Produto sem variantes disponíveis para adicionar ao carrinho.");
                                                  }
                                              } else {
                                                  console.warn("Cart context or addItem function not available.");
                                                  toast.error("Não foi possível adicionar ao carrinho.");
                                              }
                                          }}
                                      >
                                          <ShoppingCartIcon className="w-4 h-4 text-gray-200" />
                                      </button>
                                    </div>

                                    <div className="flex mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-orange-500 fill-current" />
                                        ))}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-100 mb-2">{product.name}</h3>
                                    <p className="text-gray-400 text-sm">{product.displayWeight}</p>
                                    <div className="flex items-baseline space-x-2">
                                      {product.original_price && product.displayPrice < parseFloat(product.original_price) && (
                                          <p className="text-gray-500 line-through text-base md:text-lg">
                                              €{parseFloat(product.original_price).toFixed(2)}
                                          </p>
                                      )}
                                      <p className="text-red-500 font-bold text-lg md:text-xl">
                                          € {product.displayPrice.toFixed(2)}
                                      </p>
                                  </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </section>

      <section className="py-8 md:py-16 px-4 text-white relative overflow-hidden">
                    <div className="max-w-7xl mx-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <motion.div
                          initial={{ x: -100, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.8 }}
                        >
                          <div className="text-orange-500 font-medium mb-4 tracking-wider">MÁXIMO DESEMPENHO</div>
                          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100 mb-6">
                            Otimize a Sua Recuperação e Crescimento Muscular com Aminoácidos.
                          </h2>
                          <p className="text-gray-400 mb-8 leading-relaxed">
                            Leve seus treinos ao próximo nível e acelere a recuperação com a força dos aminoácidos. Essenciais para a construção de proteínas, os **aminoácidos** são os blocos de construção dos músculos, ajudando a **reduzir a fadiga**, **minimizar a dor pós-treino** e promover o **crescimento muscular magro**. Desde os **aminoácidos de cadeia ramificada (BCAA)** até a **glutamina** e a **creatina**, nossas fórmulas de alta pureza garantem que você obtenha o máximo de cada dose, permitindo que você treine mais pesado e se recupere mais rápido. Descubra a chave para um desempenho consistente.
                          </p>
                          <div className="flex items-center space-x-4">
                            <button
                              className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 hover:shadow-lg hover:shadow-red-700/30 transition-all flex items-center"
                              onClick={() => navigate('/produtos')} // Usar navigate
                            >
                              EXPLORAR AMINOÁCIDOS
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                            <button className="bg-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors" aria-label="Saiba mais sobre Aminoácidos">
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
            
                        <motion.div
                          initial={{ x: 100, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true, amount: 0.3 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="flex flex-col sm:flex-row gap-4 h-[450px] md:h-[550px] lg:h-[650px] items-center justify-center"
                        >
                          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20 h-full w-full flex items-center justify-center bg-purple-600">
                            <img
                              src="savior.png"
                              alt="Suplemento Aminoácidos"
                              className="w-full h-full object-cover rounded-2xl"
                            />
                            <div className="absolute bottom-4 right-4 bg-purple-800 w-24 h-24 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              AMINO
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
            </section>

      {/* Popular Products Section (Corrigido) */}
      <section className="py-8 md:py-16 px-4 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                <div className="text-center md:text-left mb-6 md:mb-0">
                    <p className="text-gray-400 text-sm uppercase font-semibold mb-1">
                        MELHORE A SUA SAÚDE E A SUA PERFORMANCE!
                    </p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-100">
                        Produtos Populares
                    </h2>
                </div>
                <div className="flex space-x-4">
                    {staticCategories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${
                                selectedCategoryId === category.id
                                    ? 'bg-orange-600 text-white shadow-lg'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
    
            {loadingCategorizedProducts ? (
                <p className="text-center text-gray-400">Carregando produtos...</p>
            ) : errorCategorizedProducts ? (
                <p className="text-center text-red-500">Erro ao carregar produtos: {errorCategorizedProducts.message}</p>
            ) : categorizedProducts.length === 0 ? (
                <p className="text-center text-gray-400">Nenhum produto encontrado para esta categoria.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {categorizedProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/produto/${product.id}`)}
                        >
                            <div className="relative bg-gray-700 rounded-2xl shadow-lg group-hover:shadow-orange-500/20 transition-all border border-gray-600 overflow-hidden">
                                <div className="relative w-full h-40 md:h-48">
                                    {/* LÓGICA DE STOCK CORRIGIDA */}
                                    {(!product.is_active || (product.variants && product.variants.length > 0 && product.variants.every(v => v.quantidade_em_stock === 0 && v.stock_ginasio === 0))) && (
                                        <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm z-10">
                                            Esgotado
                                        </div>
                                    )}
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
    
                                <div className="p-4 md:p-6">
                                    <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500" 
                                            aria-label="Toggle favorite"
                                            onClick={(e) => toggleFavorite(product.id, e)}
                                        >
                                            <Heart 
                                                className={`w-4 h-4 transition-colors ${
                                                    checkIfFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-200'
                                                }`} 
                                            />
                                        </button>
                                        <button
                                            className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500"
                                            aria-label="Quick view"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleQuickViewOpen(product);
                                            }}
                                        >
                                            <Eye className="w-4 h-4 text-gray-200" />
                                        </button>
                                        <button
                                          className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500"
                                          aria-label="Add to cart"
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              if (cart && cart.addItem) {
                                                  const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

                                                  if (firstVariant) {
                                                      cart.addItem({
                                                          id: product.id,
                                                          name: product.name,
                                                          price: firstVariant.preco, 
                                                          image: product.image_url
                                                      });
                                                      toast.success(`${product.name} adicionado ao carrinho!`);
                                                  } else {
                                                      toast.error("Este produto não tem variantes para adicionar ao carrinho.");
                                                  }
                                              } else {
                                                  console.warn("Cart context or addItem function not available.");
                                                  toast.error("Não foi possível adicionar ao carrinho.");
                                              }
                                          }}
                                      >
                                          <ShoppingCartIcon className="w-4 h-4 text-gray-200" />
                                      </button>
                                    </div>
    
                                    <div className="flex mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-orange-500 fill-current" />
                                        ))}
                                    </div>
    
                                    <h3 className="text-lg font-bold text-gray-100 mb-2">{product.name}</h3>
                                    <p className="text-gray-400 text-sm">{product.displayWeight}</p>
                                    <div className="flex items-baseline space-x-2">
                                        {product.original_price && product.displayPrice < product.original_price && (
                                            <p className="text-gray-500 line-through text-base md:text-lg">
                                                €{product.original_price.toFixed(2)}
                                            </p>
                                        )}
                                        <p className="text-red-500 font-bold text-lg md:text-xl">
                                            € {product.displayPrice.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 md:py-16 px-4 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100 mb-4">
            O Que os Nossos Clientes Dizem
          </h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            A satisfação dos nossos clientes é a nossa prioridade. Conheça as suas histórias de sucesso com os nossos produtos.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gray-700 rounded-xl p-6 shadow-xl border border-gray-600"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gray-600 rounded-full p-3 mr-4">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-100">João P.</h4>
                  <p className="text-sm text-gray-400">Atleta Amador</p>
                </div>
              </div>
              <p className="text-gray-300 italic mb-4">
                "Desde que comecei a usar os vossos produtos, a minha recuperação é muito mais rápida e sinto uma melhoria significativa no meu desempenho. Recomendo a todos!"
              </p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gray-700 rounded-xl p-6 shadow-xl border border-gray-600"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gray-600 rounded-full p-3 mr-4">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-100">Maria S.</h4>
                  <p className="text-sm text-gray-400">Entusiasta de Fitness</p>
                </div>
              </div>
              <p className="text-gray-300 italic mb-4">
                "Adoro a variedade e a qualidade dos suplementos. A página de favoritos é super prática e o processo de compra é muito simples e rápido. Excelente loja!"
              </p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gray-700 rounded-xl p-6 shadow-xl border border-gray-600"
            >
              <div className="flex items-center mb-4">
                <div className="bg-gray-600 rounded-full p-3 mr-4">
                  <User className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-gray-100">Pedro R.</h4>
                  <p className="text-sm text-gray-400">Personal Trainer</p>
                </div>
              </div>
              <p className="text-gray-300 italic mb-4">
                "Recomendo os produtos aos meus clientes e eles notam a diferença. A qualidade é top e os resultados são visíveis. A loja tem tudo o que preciso."
              </p>
              <div className="flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;