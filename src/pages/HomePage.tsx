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
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth'; 
import toast from 'react-hot-toast'; 
import { useFavorites } from '../hooks/useFavorites';
import { Mail } from 'lucide-react';
import Footer from '../components/FooterPage';

// --- TIPAGEM CORRIGIDA para a nova estrutura de dados ---
interface Variant {
    id: number;
    preco: string;
    quantidade_em_stock: number;
    sku: string;
    weight_value: string;
    weight_unit: string;
    flavor_id?: number;
    flavor_name?: string;
    image_url?: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    image_url?: string;
    category_id: number;
    brand_name?: string;
    is_active: boolean;
    original_price?: string;
    rating?: string;
    reviewcount?: number;
    variants: Variant[];
    // NOVAS PROPRIEDADES DERIVADAS
    displayPrice: number;
    displayWeight: string;
    displayVariantId: number | null; // ID da variante mais barata para o frontend
    totalStock?: number;
}

interface Campaign {
  id: number;
  name: string;
  is_active: boolean;
  products: Product[]; // A lista de produtos associados a esta campanha
}

// --- Função de busca de dados atualizada para a nova estrutura ---

// --- Função de busca de dados atualizada para a nova estrutura ---
async function fetchLatestProducts() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
    
    if (!response.data || !Array.isArray(response.data)) {
        console.warn("API returned invalid or empty data for latest products.");
        return [];
    }

    return response.data.map((product) => {
      const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
      let displayPriceValue = 0;
      let displayWeightValue = 'N/A';
      let productImage = product.image_url;
      let totalStock = 0;
      let displayVariantId = null;

      if (hasVariants) {
        totalStock = product.variants.reduce((sum, v) => sum + v.quantidade_em_stock, 0);
        const sortedVariants = product.variants.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
        const cheapestVariant = sortedVariants[0];

        if (cheapestVariant) {
          displayPriceValue = parseFloat(cheapestVariant.preco);
          displayWeightValue = `${cheapestVariant.weight_value}${cheapestVariant.weight_unit}`;
          displayVariantId = cheapestVariant.id; // ✨ CAPTURA O ID DA VARIANTE
          if (cheapestVariant.image_url) {
              productImage = cheapestVariant.image_url;
          }
        }
      } else {
        if (product.original_price !== undefined && product.original_price !== null) {
          displayPriceValue = parseFloat(product.original_price);
        }
      }

      if (isNaN(displayPriceValue)) {
          displayPriceValue = 0;
      }

      return {
        ...product,
        displayPrice: displayPriceValue,
        displayWeight: displayWeightValue,
        displayVariantId: displayVariantId,
        image_url: productImage,
        totalStock,
      };
    });
  } catch (error) {
    console.error("Error fetching latest products:", error);
    throw error;
  }
}
const HomePage = ({ cart, handleQuickViewOpen }) => {
  const navigate = useNavigate();
  // Usa o hook de favoritos
  const { checkIfFavorite, toggleFavorite } = useFavorites();
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCampaigns, setErrorCampaigns] = useState(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
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
    }
  };

  const handlePrevProduct = () => {
    const prevIndex = currentProductStartIndex - productsPerPage;
    if (prevIndex >= 0) {
      setCurrentProductStartIndex(prevIndex);
    }
  };

  // --- FUNÇÃO CORRIGIDA PARA PRODUTOS POR CATEGORIA ---
  const fetchProductsByCategory = async (categoryId: number | null) => {
      setLoadingCategorizedProducts(true);
      setErrorCategorizedProducts(null);
      try {
          const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
          if (!response.data || !Array.isArray(response.data)) {
              console.warn("API returned invalid or empty data for categories.");
              setCategorizedProducts([]);
              return;
          }

          const processedProducts = response.data.map((product) => {
              const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
              let displayPriceValue = 0;
              let displayWeightValue = 'N/A';
              let productImage = product.image_url;
              let totalStock = 0;

              if (hasVariants) {
                  totalStock = product.variants.reduce((sum, v) => sum + v.quantidade_em_stock, 0);
                  const sortedVariants = product.variants.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
                  const cheapestVariant = sortedVariants[0];
                  if (cheapestVariant) {
                      displayPriceValue = parseFloat(cheapestVariant.preco);
                      displayWeightValue = `${cheapestVariant.weight_value}${cheapestVariant.weight_unit}`;
                      if (cheapestVariant.image_url) {
                          productImage = cheapestVariant.image_url;
                      }
                  }
              }

              return {
                  ...product,
                  displayPrice: displayPriceValue,
                  displayWeight: displayWeightValue,
                  image_url: productImage,
                  totalStock,
              };
          });

          // Filtra os produtos processados
          let filteredProducts = [];
          if (categoryId !== null) {
              filteredProducts = processedProducts.filter((p) => p.category_id === categoryId);
          } else {
              filteredProducts = processedProducts;
          }

          setCategorizedProducts(filteredProducts);
      } catch (error) {
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

  const handleAddToCart = useCallback((e, product) => {
    e.stopPropagation();
    if (cart && cart.addItem) {
        const cheapestVariant = product.variants?.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco))[0];

        if (cheapestVariant) {
          console.log("➡️ O ID da variante a ser enviado é:", cheapestVariant.id);
            cart.addItem({
                variant_id: cheapestVariant.id,
                name: product.name,
                price: parseFloat(cheapestVariant.preco),
                image_url: product.image_url
            });
            toast.success(`${product.name} adicionado ao carrinho!`);
        } else {
            toast.error("Produto sem variantes disponíveis para adicionar ao carrinho.");
        }
    } else {
        console.warn("Cart context or addItem function not available.");
        toast.error("Não foi possível adicionar ao carrinho.");
    }
}, [cart]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const response = await axios.get<Campaign[]>(`${import.meta.env.VITE_BACKEND_URL}/api/campaigns/active`);
        if (response.data && response.data.length > 0) {
          // Processar os produtos dentro de cada campanha
          const processedCampaigns = response.data.map(campaign => ({
            ...campaign,
            products: campaign.products.map(product => {
              const hasVariants = product.variants && Array.isArray(product.variants) && product.variants.length > 0;
              let displayPriceValue = 0;
              let displayWeightValue = 'N/A';
              let productImage = product.image_url;
              let totalStock = 0;
              let displayVariantId = null;

              if (hasVariants) {
                totalStock = product.variants.reduce((sum, v) => sum + v.quantidade_em_stock, 0);
                const sortedVariants = product.variants.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
                const cheapestVariant = sortedVariants[0];
                if (cheapestVariant) {
                  displayPriceValue = parseFloat(cheapestVariant.preco);
                  displayWeightValue = `${cheapestVariant.weight_value}${cheapestVariant.weight_unit}`;
                  displayVariantId = cheapestVariant.id;
                  if (cheapestVariant.image_url) {
                    productImage = cheapestVariant.image_url;
                  }
                }
              }

              return {
                ...product,
                displayPrice: displayPriceValue,
                displayWeight: displayWeightValue,
                displayVariantId,
                image_url: productImage,
                totalStock,
              };
            })
          }));
          setCampaigns(processedCampaigns);
        } else {
          setCampaigns([]);
        }
      } catch (err: any) {
        console.error("Erro ao buscar campanhas:", err);
        setErrorCampaigns(err);
      } finally {
        setLoadingCampaigns(false);
      }
    };
    fetchCampaigns();
  }, []);
  
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
        const sortedCategories = response.data.sort((a, b) => a.id - b.id);
        setCategories(sortedCategories);
      } catch (err) {
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
      } catch (err) {
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

  // Carrega produtos da primeira categoria popular (Proteínas) ao carregar a página
  useEffect(() => {
    if (staticCategories.length > 0) {
      const defaultCategoryId = staticCategories[0].id;
      setSelectedCategoryId(defaultCategoryId);
      fetchProductsByCategory(defaultCategoryId);
    }
  }, []);

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

      {loadingCampaigns ? (
  <p className="text-white text-center py-8 bg-gray-800">Carregando campanhas ativas...</p>
) : errorCampaigns ? (
  <p className="text-red-500 text-center py-8 bg-gray-800">Erro ao carregar campanhas: {errorCampaigns.message}. Por favor, tente novamente.</p>
) : (
  campaigns.length > 0 && campaigns.map(campaign => (
    <section key={campaign.id} className="py-8 md:py-16 px-4 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-orange-500 font-medium tracking-wider mb-2 block">🎉 EM DESTAQUE</span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100">{campaign.name}</h2>
          </div>
        </div>

        {/* --- NOVO: GRELHA PRINCIPAL com 2 colunas em ecrãs grandes --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* 1. IMAGEM DA CAMPANHA (à esquerda, ocupa 1 coluna) */}
            {campaign.image_url && (
                <div className="col-span-1 hidden lg:block">
                    <img
                        src={campaign.image_url}
                        alt={`Campanha ${campaign.name}`}
                        className="w-full h-auto object-cover rounded-2xl shadow-xl border border-gray-600"
                    />
                </div>
            )}
            
            {/* 2. LISTA DE PRODUTOS (à direita, ocupa 1 coluna) */}
            <div className="col-span-1">
                {campaign.products.length === 0 ? (
                    <p className="text-center text-gray-400">Nenhum produto nesta campanha.</p>
                ) : (
                    // --- GRELHA ANINHADA: 1 coluna para produtos "um em cima do outro" ---
                    <div className="grid grid-cols-1 gap-6 md:gap-8">
                        {campaign.products.map((product) => {
                            const displayVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                            if (!displayVariant) return null;

                            return (
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
                                                        onClick={(e) => toggleFavorite(displayVariant.id, e)}
                                                      >
                                                        <Heart 
                                                          className={`w-4 h-4 transition-colors ${
                                                              checkIfFavorite(displayVariant.id) ? 'text-red-500 fill-current' : 'text-gray-200'
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
                                                      onClick={(e) => handleAddToCart(e, product)}
                                                    >
                                                      <ShoppingCartIcon className="w-4 h-4 text-gray-200" />
                                                  </button>
                                                </div>
                                                <div className="flex mb-2">
                                                    {parseFloat(product.rating || '0') > 0 ? (
                                                        Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < Math.floor(parseFloat(product.rating)) ? 'text-orange-500 fill-current' : 'text-gray-500'}`}
                                                            />
                                                        ))
                                                    ) : (
                                                        <div className="h-4"></div>
                                                    )}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-100 mb-2">{product.name}</h3>
                                                <p className="text-gray-400 text-sm mb-2">
                                                    {displayVariant.weight_value} {displayVariant.weight_unit}
                                                </p>
                                                <div className="flex items-baseline space-x-2">
                                                    {product.original_price && parseFloat(displayVariant.preco) < parseFloat(product.original_price) && (
                                                        <p className="text-gray-500 line-through text-base md:text-lg">
                                                            €{parseFloat(product.original_price).toFixed(2)}
                                                        </p>
                                                    )}
                                                    <p className="text-red-500 font-bold text-lg md:text-xl">
                                                        € {parseFloat(displayVariant.preco).toFixed(2)}
                                                    </p>
                                                </div>
                                      </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </div>
    </section>
  ))
)}
 

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
                visibleCategories.slice(0, 4).map((category) => (
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


      {/* Vitamin C Section */}
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
                                    {(!product.is_active || product.totalStock === 0) && (
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
                                            onClick={(e) => toggleFavorite(product.displayVariantId, e)}
                                          >
                                            <Heart 
                                              className={`w-4 h-4 transition-colors ${
                                                  checkIfFavorite(product.displayVariantId) ? 'text-red-500 fill-current' : 'text-gray-200'
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
                                          onClick={(e) => handleAddToCart(e, product)}
                                        >
                                          <ShoppingCartIcon className="w-4 h-4 text-gray-200" />
                                      </button>
                                    </div>

                                    <div className="flex mb-2">
                                        {parseFloat(product.rating || '0') > 0 ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(parseFloat(product.rating)) ? 'text-orange-500 fill-current' : 'text-gray-500'}`}
                                                />
                                            ))
                                        ) : (
                                            <div className="h-4"></div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-100 mb-2">{product.name}</h3>
                                    <p className="text-gray-400 text-sm mb-2">{product.displayWeight}</p>
                                    
                                    <div className="flex items-baseline space-x-2">
                                        {product.original_price && parseFloat(product.displayPrice) < parseFloat(product.original_price) && (
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
        <div className="md:hidden flex justify-center mt-8 space-x-2">
            <button
                onClick={handlePrevProduct}
                disabled={!canGoPrevProduct}
                className={`bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    !canGoPrevProduct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                }`}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button
                onClick={handleNextProduct}
                disabled={!canGoNextProduct}
                className={`bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    !canGoNextProduct ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                }`}
            >
                <ChevronRight className="w-5 h-5" />
            </button>
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

      {/* --- SEÇÃO CORRIGIDA: PRODUTOS POPULARES --- */}
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
                  <div className="flex space-x-4 flex-wrap justify-center md:justify-start">
                      {staticCategories.map((category) => (
                          <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category.id)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 mb-2 md:mb-0 ${
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
                                      {(!product.is_active || product.totalStock === 0) && (
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
                                            onClick={(e) => toggleFavorite(product.displayVariantId, e)}
                                          >
                                            <Heart 
                                              className={`w-4 h-4 transition-colors ${
                                                  checkIfFavorite(product.displayVariantId) ? 'text-red-500 fill-current' : 'text-gray-200'
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
                                              onClick={(e) => handleAddToCart(e, product)}
                                          >
                                              <ShoppingCartIcon className="w-4 h-4 text-gray-200" />
                                          </button>
                                      </div>
      
                                      <div className="flex mb-2">
                                        {parseFloat(product.rating || '0') > 0 ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(parseFloat(product.rating)) ? 'text-orange-500 fill-current' : 'text-gray-500'}`}
                                                />
                                            ))
                                        ) : (
                                            <div className="h-4"></div>
                                        )}
                                      </div>
      
                                      <h3 className="text-lg font-bold text-gray-100 mb-2">{product.name}</h3>
                                      <p className="text-gray-400 text-sm mb-2">{product.displayWeight}</p>
                                      <div className="flex items-baseline space-x-2">
                                          {product.original_price && parseFloat(product.displayPrice.toFixed(2)) < parseFloat(product.original_price) && (
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

      {/* NEW SECTION: BCAA for Recovery and Muscle Growth */}


      {/* Testimonials Section */}
      <section className="py-8 md:py-16 px-4 bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-orange-500 font-medium mb-4 tracking-wider">O QUE OS NOSSOS CLIENTES DIZEM</div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100 mb-12">Avaliações Verificadas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 transition-transform transform hover:scale-105">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />)}
              </div>
              <p className="text-gray-400 text-lg italic mb-4">"A qualidade dos produtos superou as minhas expectativas. A entrega foi rápida e o atendimento ao cliente é excelente. Recomendo!"</p>
              <p className="font-bold text-gray-200">- Ana Costa</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 transition-transform transform hover:scale-105">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />)}
              </div>
              <p className="text-gray-400 text-lg italic mb-4">"Encontrei exatamente o que precisava para a minha dieta. A variedade de produtos é enorme e os preços são justos. Grande loja!"</p>
              <p className="font-bold text-gray-200">- João Santos</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700 transition-transform transform hover:scale-105">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-orange-400 fill-current" />)}
              </div>
              <p className="text-gray-400 text-lg italic mb-4">"Já sou cliente há meses e nunca tive qualquer problema. Os suplementos são de alta qualidade e realmente me ajudam nos treinos."</p>
              <p className="font-bold text-gray-200">- Ricardo Gomes</p>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default HomePage;