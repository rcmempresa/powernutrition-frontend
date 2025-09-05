import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  ChevronDown,
  Mail
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { useFavorites } from '../hooks/useFavorites';
import Footer from '../components/FooterPage';

// --- NOVO: Tipagem completa para a nova arquitetura ---
interface Variant {
  id: number;
  produto_id: number;
  sabor_id: number;
  weight_value: number;
  weight_unit: string;
  preco: number;
  quantidade_em_stock: number;
  stock_ginasio: number;
  sku: string;
  flavor_name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  image_url: string;
  category_id: number;
  brand_id: number;
  original_price: number;
  is_active: boolean;
  rating?: number;
  reviewcount?: number;
  brand_name: string;
  category_name: string;
  variants: Variant[];
  // Novos campos para facilitar a exibição
  displayPrice: number;
  displayWeight: string;
}

// --- FUNÇÃO ATUALIZADA: Busca e formata os dados dos produtos ---
// --- FUNÇÃO ATUALIZADA: Busca e formata os dados dos produtos ---
async function fetchLatestProducts() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
    return response.data.map((product: any) => {
      // ✨ Verificação para garantir que o array de variantes existe e não está vazio ✨
      if (!product.variants || product.variants.length === 0) {
        console.warn(`Produto ${product.id} não tem variantes. Usando valores padrão.`);
        return {
          ...product,
          displayPrice: product.original_price || 0,
          displayWeight: 'N/A',
        };
      }

      // Encontra a variante com o menor preço para exibir
      const cheapestVariant = product.variants.sort((a, b) => a.preco - b.preco)[0];
      
      return {
        ...product,
        displayPrice: cheapestVariant.preco,
        displayWeight: `${cheapestVariant.weight_value}${cheapestVariant.weight_unit}`,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar produtos mais recentes:", error);
    throw error;
  }
}

const HomePage = ({ cart, handleQuickViewOpen }) => {
  const navigate = useNavigate();
  const { isAuthenticated, getAuthToken } = useAuth();
  const { checkIfFavorite, toggleFavorite, loadingFavorites } = useFavorites();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const categoriesPerPage = 4;
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  const videoSrc = "https://res.cloudinary.com/dheovknbt/video/upload/v1756742336/video_qz6xgi.mp4";
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);

  const [allLatestProducts, setAllLatestProducts] = useState<Product[]>([]);
  const [visibleLatestProducts, setVisibleLatestProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorProducts, setErrorProducts] = useState(null);
  const [currentProductStartIndex, setCurrentProductStartIndex] = useState(0);
  const productsPerPage = 4;

  const [favoriteProductIds, setFavoriteProductIds] = useState<Set<number>>(new Set());

  const slides = [
    { title: "Apoie a Sua Saúde & Vitalidade.", subtitle: "BEM-ESTAR DIÁRIO", image: "/suplementos.webp" },
    { title: "Recupere Mais Rápido, Treine Mais Forte.", subtitle: "SUPLEMENTOS DESPORTIVOS", image: "suplementos_2.webp" },
    { title: "Eleva o Teu Potencial, Quebra Limites.", subtitle: "PERFORMANCE DE ELITE", image: "/suplementos_3.avif" }
  ];

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

  const handleNextCategory = () => {
    setCurrentIndex(prevIndex => Math.min(prevIndex + categoriesPerPage, categories.length - categoriesPerPage));
  };

  const handlePrevCategory = () => {
    setCurrentIndex(prevIndex => Math.max(prevIndex - categoriesPerPage, 0));
  };

  const handleNextProduct = () => {
    const nextIndex = currentProductStartIndex + productsPerPage;
    if (nextIndex < allLatestProducts.length) {
      setCurrentProductStartIndex(nextIndex);
    } else {
    }
  };

  const handlePrevProduct = () => {
    const prevIndex = currentProductStartIndex - productsPerPage;
    if (prevIndex >= 0) {
      setCurrentProductStartIndex(prevIndex);
    } else {
    }
  };

  const fetchProductsByCategory = async (categoryId: number | null) => {
    setLoadingCategorizedProducts(true);
    setErrorCategorizedProducts(null);
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
        const allProducts = response.data.map((product: any) => {
            const cheapestVariant = product.variants.sort((a, b) => a.preco - b.preco)[0];
            return {
                ...product,
                displayPrice: cheapestVariant ? cheapestVariant.preco : 0,
                displayWeight: cheapestVariant ? `${cheapestVariant.weight_value} ${cheapestVariant.weight_unit}` : '',
            };
        });

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
  
  const fetchFavoriteProductIds = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteProductIds(new Set());
      return;
    }
    const token = getAuthToken();
    if (!token) return;

    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/listar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const ids = new Set(response.data.map((p: any) => p.id));
      setFavoriteProductIds(ids);
    } catch (error) {
      console.error('Erro ao buscar favoritos do utilizador:', error);
    }
  }, [isAuthenticated, getAuthToken]);

  const handleToggleFavorite = useCallback(async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

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

  useEffect(() => {
    const endIndex = currentProductStartIndex + productsPerPage;
    setVisibleLatestProducts(allLatestProducts.slice(currentProductStartIndex, endIndex));
  }, [currentProductStartIndex, allLatestProducts, productsPerPage]);

  useEffect(() => {
    fetchProductsByCategory(null);
  }, []);

  useEffect(() => {
    fetchFavoriteProductIds();
  }, [fetchFavoriteProductIds]);

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

      {/* Latest Products Section */}
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
                      {(!product.is_active || (product.variants.length > 0 && product.variants.every(v => v.quantidade_em_stock === 0 && v.stock_ginasio === 0))) && (
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
                              const firstVariant = product.variants[0];
                              if (firstVariant) {
                                cart.addItem({
                                  id: firstVariant.id, // ID da variante
                                  name: product.name,
                                  price: firstVariant.preco,
                                  image: product.image_url
                                });
                                toast.success(`${product.name} adicionado ao carrinho!`);
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
                            €{parseFloat(product.original_price).toFixed(2)}
                          </p>
                        )}
                        <p className="text-red-500 font-bold text-lg md:text-xl">
                          € {parseFloat(product.displayPrice).toFixed(2)}
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

      {/* NOVA SECTION: BCAA para Recuperação e Crescimento Muscular */}
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
                  onClick={() => navigate('/produtos')}
                >
                  EXPLORAR AMINOÁCIDOS
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button
                  className="bg-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  aria-label="Reproduzir vídeo sobre aminoácidos"
                  onClick={() => console.log('Reproduzir vídeo')} // Lógica para o vídeo
                >
                  <Play className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 h-[450px] md:h-[550px] lg:h-[650px] items-start"
            >
              <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg h-full mt-8 sm:mt-16 flex items-center justify-center">
                <img
                  src="/bcaa.png"
                  alt="Pote de BCAA"
                  className="w-full h-full object-cover"
                />
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