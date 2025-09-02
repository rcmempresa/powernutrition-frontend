import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ShoppingCart from './components/ShoppingCart';
import { useCart } from './hooks/useCart';
import ShopPage from './components/ShopPage';
import Header from './components/Header';
import ProductPage from './components/ProductPage';
import ContactPage from './components/ContactPage';
import TeamPage from './components/TeamPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import QuickViewModal from './components/QuickViewModal';
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// --- NOVO: Função para buscar os produtos mais recentes da sua API ---
// Substitua o corpo desta função pela sua chamada à API real.
// Assumindo que sua API retorna uma lista de produtos já ordenada pelos mais recentes.
async function fetchLatestProducts() {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/products/listar`)
    // Mapeia os dados para garantir que 'price' e 'original_price' são números
    return response.data.map(product => ({
      ...product,
      price: parseFloat(product.price), // Converte para número float
      original_price: product.original_price ? parseFloat(product.original_price) : null // Converte se existir
    }));
  } catch (error) {
    console.error("Erro ao buscar produtos mais recentes:", error);
    throw error;
  }
}

const useAuthToken = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Tente carregar o token do localStorage uma vez ao montar
    const storedToken = localStorage.getItem('authToken'); // ✨ Ajuste para onde você guarda o token ✨
    if (storedToken) {
      setToken(storedToken);
    }
  }, []); // Array de dependências vazio para executar apenas uma vez ao montar

  // ✨ Esta função getToken é o que você precisa passar para useCart ✨
  const getStoredToken = useCallback(() => {
    // Retorna o token do estado ou, para maior garantia de atualização, do localStorage
    return token || localStorage.getItem('authToken');
  }, [token]); // Depende do estado 'token'

  return { token, getStoredToken }; // Renomeei para evitar confusão se você tiver uma função 'getToken' interna
};

// --- FIM DA FUNÇÃO DE FETCH DE PRODUTOS ---

function App() {
  // --- ESTADOS E HOOKS NO TOPO DO COMPONENTE ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null); 
  const { getStoredToken } = useAuthToken();
  const cart = useCart(getStoredToken);;
  const [hoveredProduct, setHoveredProduct] = useState(null); // Estado para hover em produtos (existente)

  // Estados para categorias (existentes)
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true); // Renomeado para evitar conflito
  const [errorCategories, setErrorCategories] = useState(null); // Renomeado para evitar conflito
  const [currentIndex, setCurrentIndex] = useState(0); // Índice para o carrossel de categorias
  const categoriesPerPage = 4; // Alterado para 4 categorias por página, como discutido
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // ID da categoria selecionada

  const videoSrc = "/video.mp4";
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false); // Novo estado: controla a visibilidade do modal
  const [quickViewProduct, setQuickViewProduct] = useState(null); // Novo estado: armazena o produto para quick view
  const staticCategories = [ // Estas são as categorias FIXAS que você quer exibir
    { id: 1, name: "Proteínas" }, // Certifique-se que os IDs correspondem aos IDs das categorias nos seus produtos
    { id: 2, name: "Multivitamínico" },
    { id: 3, name: "Amino Ácidoss" },
  ];
  // Nova função para abrir a quick view
  const handleQuickViewOpen = (product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  // Nova função para fechar a quick view
  const handleQuickViewClose = () => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  };

  // --- NOVO: Estados para Produtos Mais Recentes ---
  const [allLatestProducts, setAllLatestProducts] = useState([]); // Lista COMPLETA de produtos recentes
  const [visibleLatestProducts, setVisibleLatestProducts] = useState([]); // Produtos recentes VISÍVEIS no carrossel
  const [loadingProducts, setLoadingProducts] = useState(true); // Estado de carregamento para produtos
  const [errorProducts, setErrorProducts] = useState(null); // Estado de erro para produtos
  const [currentProductStartIndex, setCurrentProductStartIndex] = useState(0); // Índice para o carrossel de produtos
  const productsPerPage = 4; // 4 produtos por página no carrossel de recentes
  



  // --- DADOS ESTÁTICOS (SLIDES) ---
  // A variável 'products' estática que você tinha antes deve ser removida
  // ou renomeada para evitar conflito com 'allLatestProducts' vindo da API.
  // Se 'products' era para outra seção, mantenha-o, mas ajuste seu uso.
  // Para a seção de 'Produtos Mais Recentes', usaremos 'allLatestProducts' e 'visibleLatestProducts'.
  const slides = [
    { title: "Apoie a Sua Saúde & Vitalidade.", subtitle: "BEM-ESTAR DIÁRIO", image: "/suplementos.webp" },
    { title: "Recupere Mais Rápido, Treine Mais Forte.", subtitle: "SUPLEMENTOS DESPORTIVOS", image: "suplementos_2.webp" },
    { title: "Eleva o Teu Potencial, Quebra Limites.", subtitle: "PERFORMANCE DE ELITE", image: "/suplementos_3.avif" }
  ];


  // --- FUNÇÕES AUXILIARES ---
  const getCategoryImageUrl = (categoryName) => {
    // ... (sua função existente) ...
    switch (categoryName.toLowerCase()) {
      case 'acessórios': return 'https://images.pexels.com/photos/163071/pexels-photo-163071.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'aminoácidos': return '/aminoacidos.webp';
      case 'articulações': return 'https://images.pexels.com/photos/4047074/pexels-photo-4047074.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'creatinas': return '/creatina.webp';
      case 'endurance': return 'https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'gainers e carbs': return 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'hormonal': return 'https://images.pexels.com/photos/4047074/pexels-photo-4047074.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'lifestyle': return 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'natural e essencial': return 'https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'proteínas': return '/proteina.webp';
      case 'pré-treinos': return '/pre_treino.webp';
      case 'saúde e bem-estar': return 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'snacks e barras': return 'https://images.pexels.com/photos/3683050/pexels-photo-3683050.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'termogénicos': return 'https://images.pexels.com/photos/3683081/pexels-photo-3683081.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
      case 'vitaminas e minerais': return '/vitaminas.avif';
      default: return '/images/default-category.png';
    }
  };

  // Funções de navegação do carrossel de CATEGORIAS
  const handleNextCategory = () => { // Renomeado para evitar conflito com handleNext de produtos
    setCurrentIndex(prevIndex => Math.min(prevIndex + categoriesPerPage, categories.length - categoriesPerPage));
  };

  const handlePrevCategory = () => { // Renomeado para evitar conflito com handlePrev de produtos
    setCurrentIndex(prevIndex => Math.max(prevIndex - categoriesPerPage, 0));
  };

  // --- NOVO: Funções de navegação do carrossel de PRODUTOS MAIS RECENTES ---
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

  // --- USE EFFECTS ---
  // Efeito para o slider automático da Hero Section (EXISTENTE)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Efeito para atualizar o título do documento (EXISTENTE)
  useEffect(() => {
    const titles = {
      home: 'RD Power Nutrition - Suplementos Premium para Saúde e Performance',
      shop: 'Loja de Suplementos - RD Power Nutrition',
      product: 'Detalhes do Produto - RD Power Nutrition',
      contact: 'Contacta-nos - Apoio RD Power Nutrition',
      team: 'A Nossa Equipa - Conhece os Especialistas da RD Power Nutrition',
      cart: 'Carrinho de Compras - RD Power Nutrition',
      checkout: 'Finalizar Compra - RD Power Nutrition'
    };
    document.title = titles[currentPage] || titles.home;
  }, [currentPage]);

  // Efeito para buscar as categorias do backend (EXISTENTE)
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

  // --- NOVO: Efeito para buscar os PRODUTOS MAIS RECENTES do backend ---
  useEffect(() => {
    const getLatestProducts = async () => {
      try {
        setLoadingProducts(true);
        const data = await fetchLatestProducts(); // Chama a função que busca da API
        setAllLatestProducts(data); // Armazena todos os produtos
        // Inicializa os produtos visíveis com os primeiros `productsPerPage`
        setVisibleLatestProducts(data.slice(0, productsPerPage));
      } catch (err) {
        setErrorProducts(err);
      } finally {
        setLoadingProducts(false);
      }
    };
    getLatestProducts();
  }, []); // Roda apenas uma vez na montagem do componente App

  // --- NOVO: Efeito para atualizar os PRODUTOS VISÍVEIS do carrossel ---
  useEffect(() => {
    const endIndex = currentProductStartIndex + productsPerPage;
    setVisibleLatestProducts(allLatestProducts.slice(currentProductStartIndex, endIndex));
  }, [currentProductStartIndex, allLatestProducts]); // Dependências

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories/listar`); // <--- CONFIRA SEU ENDPOINT AQUI
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

  
  const [categorizedProducts, setCategorizedProducts] = useState([]); // Produtos da categoria selecionada
  const [loadingCategorizedProducts, setLoadingCategorizedProducts] = useState(false);
  const [errorCategorizedProducts, setErrorCategorizedProducts] = useState(null);


  const fetchProductsByCategory = async (categoryId) => {
    setLoadingCategorizedProducts(true);
    setErrorCategorizedProducts(null);
    try {
        // Sempre busca TODOS os produtos do endpoint /listar
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
        
        // Mapeia os dados para garantir que 'price' e 'original_price' são números
        const allProducts = response.data.map(product => ({
            ...product,
            price: parseFloat(product.price),
            original_price: product.original_price ? parseFloat(product.original_price) : null
        }));

        let filteredProducts = [];

        if (categoryId !== null) { // Se uma categoria específica for selecionada
            // Filtra os produtos localmente com base no category_id
            filteredProducts = allProducts.filter(product => product.category_id === categoryId);
        } else { // Se "Todos" for selecionado (categoryId é null)
            filteredProducts = allProducts; // Mostra todos os produtos
        }
        
        setCategorizedProducts(filteredProducts);

    } catch (error) {
        console.error(`Erro ao buscar ou filtrar produtos para categoria ${categoryId}:`, error);
        setErrorCategorizedProducts(error);
    } finally {
        setLoadingCategorizedProducts(false);
    }
};
  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    // Dispara a busca por produtos da categoria selecionada
    fetchProductsByCategory(categoryId);
  };

  // --- NOVO: Efeito para buscar produtos da categoria padrão (ex: "Todos") ao carregar a página ---
  useEffect(() => {
    // Busca produtos quando o componente monta, inicialmente "Todos" (null)
    fetchProductsByCategory(null);
  }, []); // Rodar apenas uma vez na montagem

  // --- LÓGICA DE RENDERIZAÇÃO CONDICIONAL (EXISTENTE E NOVA) ---
  const visibleCategories = categories.slice(currentIndex, currentIndex + categoriesPerPage);
  const canGoNextCategory = currentIndex + categoriesPerPage < categories.length; // Renomeado
  const canGoPrevCategory = currentIndex > 0; // Renomeado

  // --- NOVO: Lógica para ativar/desativar botões do carrossel de produtos ---
  const canGoNextProduct = currentProductStartIndex + productsPerPage < allLatestProducts.length;
  const canGoPrevProduct = currentProductStartIndex > 0;

  // Renderização condicional para cada página específica
  // A página 'home' é o retorno padrão no final do componente.
  

  if (currentPage === 'checkout') {
    return (
      
      <div className="min-h-screen bg-gray-900">
        <CheckoutPage
          items={cart.items}
          onBack={() => setCurrentPage('cart')}
        />
        <ShoppingCart
          isOpen={cart.isOpen}
          onClose={cart.closeCart}
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onContinueShopping={() => {
            cart.closeCart();
            setCurrentPage('shop');
          }}
          onViewCart={() => {
            cart.closeCart();
            setCurrentPage('cart');
          }}
          onCheckout={() => {
            cart.closeCart();
            setCurrentPage('checkout');
          }}
        />
      </div>
    );
  }

  if (currentPage === 'contact') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cartItemCount={cart.itemCount}
          onCartClick={cart.openCart}
        />
        <ContactPage />
        <ShoppingCart
          isOpen={cart.isOpen}
          onClose={cart.closeCart}
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onContinueShopping={() => {
            cart.closeCart();
            setCurrentPage('shop');
          }}
          onViewCart={() => {
            cart.closeCart();
            setCurrentPage('cart');
          }}
          onCheckout={() => {
            cart.closeCart();
            setCurrentPage('checkout');
          }}
        />
      </div>
    );
  }

  if (currentPage === 'team') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cartItemCount={cart.itemCount}
          onCartClick={cart.openCart}
        />
        <TeamPage />
        <ShoppingCart
          isOpen={cart.isOpen}
          onClose={cart.closeCart}
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onContinueShopping={() => {
            cart.closeCart();
            setCurrentPage('shop');
          }}
          onViewCart={() => {
            cart.closeCart();
            setCurrentPage('cart');
          }}
          onCheckout={() => {
            cart.closeCart();
            setCurrentPage('checkout');
          }}
        />
      </div>
    );
  }

  if (currentPage === 'cart') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cartItemCount={cart.itemCount}
          onCartClick={cart.openCart}
        />
        <Toaster position="top-right" reverseOrder={false} />
        <CartPage
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onBack={() => setCurrentPage('home')}
        />
        <ShoppingCart
          isOpen={cart.isOpen}
          onClose={cart.closeCart}
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onContinueShopping={() => {
            cart.closeCart();
            setCurrentPage('shop');
          }}
          onCheckout={() => {
            cart.closeCart();
            setCurrentPage('checkout');
          }}
        />
      </div>
    );
  }

  if (currentPage === 'shop') {
    return (
        <div className="min-h-screen"
         style={{
          backgroundImage: 'url(/fundo-3.png)', // ✨ **Mude para o caminho real da sua imagem!** ✨
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed', // Opcional: faz a imagem de fundo permanecer fixa ao rolar
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}>
      <Header
        onNavigate={setCurrentPage}
        cartItemCount={cart.items.length}
        onCartClick={cart.openCart}
      />
      <Toaster position="top-right" reverseOrder={false} />
      <ShopPage
        // ESTA É A LINHA CRÍTICA!
        // O QUE VOCÊ ESTÁ A PASSAR AQUI PARA 'products'?
        products={categorizedProducts} // OU products={allLatestProducts} ou outro
        categoriesList={categories}
        onProductClick={(product) => {
          setSelectedProductId(product.id);
          setCurrentPage('product');
        }}
        onAddToCart={cart.addItem}
        onQuickViewOpen={handleQuickViewOpen}
        loading={loadingCategorizedProducts}
        error={errorCategorizedProducts}     
      />
      <ShoppingCart
        isOpen={cart.isOpen}
        onClose={cart.closeCart}
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onContinueShopping={() => {
          cart.closeCart();
          setCurrentPage('shop');
        }}
        onViewCart={() => {
          cart.closeCart();
          setCurrentPage('cart');
        }}
        onCheckout={() => {
          cart.closeCart();
          setCurrentPage('checkout');
        }}
      />
      {isQuickViewOpen && quickViewProduct && (
        <QuickViewModal
          isOpen={isQuickViewOpen}
          onClose={handleQuickViewClose}
          product={quickViewProduct}
          onAddToCart={cart.addItem}
        />
      )}
    </div>
    );
  }

  if (currentPage === 'product' && selectedProductId) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          cartItemCount={cart.itemCount}
          onCartClick={cart.openCart}
        />
        <ProductPage
          productId={selectedProductId}
          onBack={() => {
            setCurrentPage('shop');
            setSelectedProductId(null);
          }}
          onAddToCart={cart.addItem}
        />
        <ShoppingCart
          isOpen={cart.isOpen}
          onClose={cart.closeCart}
          items={cart.items}
          onUpdateQuantity={cart.updateQuantity}
          onRemoveItem={cart.removeItem}
          onContinueShopping={() => {
            cart.closeCart();
            setCurrentPage('shop');
          }}
          onViewCart={() => {
            cart.closeCart();
            setCurrentPage('cart');
          }}
          onCheckout={() => {
            cart.closeCart();
            setCurrentPage('checkout');
          }}
        />
      </div>
    );
  }

  // --- RENDERIZAÇÃO PADRÃO: PÁGINA HOME ---
  // Este bloco será renderizado se `currentPage` não corresponder a nenhuma das condições acima.
  // Ele contém todas as seções que compõem a página inicial.
  return (
   <div
    className="min-h-screen" // Remova bg-gray-900 para não sobrepor a imagem de fundo com uma cor sólida
    style={{
      backgroundImage: 'url(/fundo-3.png)', // Caminho para sua imagem
      backgroundSize: 'cover', // Cobre toda a área do div
      backgroundAttachment: 'fixed', // Opcional: faz a imagem de fundo permanecer fixa ao rolar
      backgroundPosition: 'center', // Centraliza a imagem
      backgroundRepeat: 'no-repeat', // Evita a repetição da imagem
    }}
  >
      <Header
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        cartItemCount={cart.itemCount}
        onCartClick={cart.openCart}
      />

      {/* Hero Section */}
      <section
  className="relative overflow-hidden bg-gradient-to-r from-orange-400 to-red-500"
  role="banner"
  style={{ height: "700px" }}
>
  {/* Video de Fundo com múltiplas fontes para compatibilidade */}
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
    // poster="/path/to/your/poster-image.jpg" // Opcional: imagem de fallback
  >
    <source src={videoSrc} type="video/mp4" />
    {/* Opcional: <source src="/video.webm" type="video/webm" /> */}
    O seu navegador não suporta a tag de vídeo.
  </motion.video>

  

  {/* Camada de sobreposição para melhorar a legibilidade do texto */}
  <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>

  <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 h-full flex items-center">
    <div className="w-full max-w-2xl text-white text-center lg:text-left">

      <motion.div
        key="hero-subtitle"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        // Ajuste de tamanho do subtítulo: de 'text-md lg:text-lg' para 'text-sm md:text-md'
        className="text-sm md:text-base font-semibold mb-4 tracking-widest uppercase text-orange-300"
      >
        {"ELEVE O SEU POTENCIAL"} {/* Use o novo subtítulo aqui */}
      </motion.div>

      <motion.h1
        key="hero-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        // Ajuste de tamanho do título: de 'text-4xl md:text-6xl lg:text-7xl' para 'text-3xl md:text-5xl lg:text-6xl'
        className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg"
      >
        {"Suplementos que Transformam a sua Performance."} {/* Use o novo título aqui */}
      </motion.h1>

      <button
        className="mt-10 bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-xl focus:outline-none focus:ring-4 focus:ring-orange-300 inline-flex items-center justify-center lg:justify-start mx-auto lg:mx-0"
        onClick={() => setCurrentPage('shop')}
        aria-label="Comprar agora"
      >
        COMPRAR AGORA
        <ArrowRight className="w-5 h-5 ml-3" />
      </button>
    </div>
  </div>
</section>

      {/* Categories Section */}
      {/* Mensagens de carregamento/erro para as categorias */}
      {loadingCategories ? (
        <p className="text-white text-center py-8 bg-gray-800">Carregando principais categorias...</p>
      ) : errorCategories ? (
        <p className="text-red-500 text-center py-8 bg-gray-800">Erro ao carregar categorias: {errorCategories.message}. Por favor, tente novamente.</p>
      ) : (
      <section
        className="py-8 md:py-16 px-4 text-white relative overflow-hidden" // Removido 'bg-gray-900', adicionado 'relative' e 'overflow-hidden'
      >
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

            {/* >>> ALTERAÇÃO AQUI: Ajuste do grid para 4 colunas em telas maiores e remoção de md/lg específicos <<< */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10"> {/* Alterado gap para maior espaçamento */}
              {visibleCategories.length > 0 ? (
                // Limita a exibição a no máximo 4 elementos
                visibleCategories.slice(0, 4).map((category) => (
                  <div
                    key={category.id}
                    className="text-center group cursor-pointer"
                    role="button"
                    tabIndex={0}
                    // Eventos para controlar o estado do hover
                    onMouseEnter={() => setHoveredCategoryId(category.id)}
                    onMouseLeave={() => setHoveredCategoryId(null)}
                  >
                    <div className="bg-gray-700 rounded-2xl p-6 mb-4 shadow-lg shadow-orange-500/10 transition-shadow border border-gray-600 overflow-hidden"> {/* Aumentado p- para maior padding interno */}
                      <img
                        src={getCategoryImageUrl(category.name)}
                        alt={category.name}
                        // Classes condicionais para o zoom e transição, aumentada a altura
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
      <section
        className="py-8 md:py-16 px-4 text-white relative overflow-hidden" // Removido 'bg-gray-900', adicionado 'relative' e 'overflow-hidden'
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Bloco das Imagens Lado a Lado - Animado */}
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 h-[450px] md:h-[550px] lg:h-[650px] items-start"
            >
              {/* Bloco Esquerdo (Azul/Cian) - Imagem de Fundo + Conteúdo */}
              <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg shadow-blue-500/20 h-full">
                <img
                  src="https://images.pexels.com/photos/10360340/pexels-photo-10360340.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop"
                  alt="Fundo abstrato azul"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="relative z-10 h-full flex flex-col items-center justify-start p-6 md:p-8">
                  <span className="text-white text-8xl md:text-9xl lg:text-[12rem] font-bold leading-none mt-4">D</span>
                  <span className="text-white text-xl md:text-2xl font-semibold -mt-4 mb-8">Vitamina</span>
                </div>
              </div>

              {/* Bloco Direito (Amarelo) - Imagem 'Um Pouco Menos Pequena' e Centralizada */}
              <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg  h-full mt-8 sm:mt-16  flex items-center justify-center"> {/* RESTAURADO: shadow-yellow-500/20 e bg-yellow-500 */}
                <img
                  src="/vitamina_c.jpg"
                  alt="Pote de cápsulas de suplemento amarelo"
                  className="w-9/10 h-9/10 object-contain rounded-xl" // ALTERADO AQUI: Adicionado rounded-xl
                />
              </div>
            </motion.div>

            {/* Bloco do Texto - Animado */}
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
                  onClick={() => setCurrentPage('shop')}
                >
                  COMPRAR AGORA
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <a
                  href="https://www.youtube.com/watch?v=9nBRRQy0LlM"  // <-- SUBSTITUA "YOUR_VIDEO_ID" pelo ID real do vídeo
                  target="_blank"                                     // <-- Opcional: abre o link numa nova aba
                  rel="noopener noreferrer"                           // <-- Opcional, mas recomendado para segurança
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
    {/* SECTION: Produtos Mais Recentes (Valores Corrigidos da API) */}
    <section
        className="py-8 md:py-16 px-4 text-white relative overflow-hidden" // Removido 'bg-gray-900', adicionado 'relative' e 'overflow-hidden'
      >
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

    {/* Lógica de Carregamento/Erro para Produtos */}
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
          >
            {/* CONTAINER PRINCIPAL DO CARD DO PRODUTO */}
            <div className="relative bg-gray-700 rounded-2xl shadow-lg group-hover:shadow-orange-500/20 transition-all border border-gray-600 overflow-hidden"> {/* Adicionado overflow-hidden */}

              {/* IMAGEM DO PRODUTO - AGORA OCUPA AS BORDAS SUPERIORES */}
              <div className="relative w-full h-48 md:h-56"> {/* Definindo uma altura para o container da imagem */}
                {!product.is_active || product.stock_quantity === 0 && (
                  <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm z-10">
                    Esgotado
                  </div>
                )}
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover" // Imagem preenche 100% da largura e altura do seu container
                />
              </div>

              {/* CONTEÚDO DO CARD (botões, rating, nome, preço) - AGORA COM PADDING SEPARADO */}
              <div className="p-4 md:p-6"> {/* Adicionado padding aqui para o conteúdo textual */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500" aria-label="Add to wishlist">
                    <Heart className="w-4 h-4 text-gray-200" />
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
                        cart.addItem({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image: product.image_url
                        });
                      } else {
                        console.warn("Cart context or addItem function not available.");
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
                <div className="flex items-baseline space-x-2">
                  {product.original_price && product.price < product.original_price && (
                    <p className="text-gray-500 line-through text-base md:text-lg">
                       €{product.original_price.toFixed(2)}
                    </p>
                  )}
                  <p className="text-red-500 font-bold text-lg md:text-xl">
                    € {product.price.toFixed(2)}
                  </p>
                </div>
              </div> {/* Fim do conteúdo com padding */}
            </div> {/* Fim do container principal do card */}
          </div>
        ))}
      </div>
    )}
  </div>
    </section>


    {/* NOVA SECTION: BCAA para Recuperação e Crescimento Muscular */}
    <section
        className="py-8 md:py-16 px-4 text-white relative overflow-hidden" // Removido 'bg-gray-900', adicionado 'relative' e 'overflow-hidden'
      >{/* Mantém o fundo escuro */}
          <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Bloco do Texto (para ficar à esquerda nesta nova seção) */}
                  <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8 }}
                  >
                      <div className="text-orange-500 font-medium mb-4 tracking-wider">MÁXIMO DESEMPENHO</div>
                      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100 mb-6">
                          Otimize a Sua Recuperação e Crescimento Muscular com BCAA.
                      </h2>
                      <p className="text-gray-400 mb-8 leading-relaxed">
                          Leve seus treinos ao próximo nível e acelere a recuperação com os aminoácidos de cadeia ramificada (BCAA). Essenciais para a síntese proteica, os BCAAs (leucina, isoleucina e valina) ajudam a reduzir a fadiga muscular, minimizar a dor pós-treino e promover o crescimento muscular magro. Nossas fórmulas de alta pureza garantem que você obtenha o máximo de cada dose, permitindo que você treine mais pesado e se recupere mais rápido. Descubra a chave para um desempenho consistente.
                      </p>
                      <div className="flex items-center space-x-4">
                          <button
                              className="bg-red-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-red-700 hover:shadow-lg hover:shadow-red-700/30 transition-all flex items-center"
                              onClick={() => setCurrentPage('shop')} 
                          >
                              EXPLORAR BCAAS
                              <ArrowRight className="w-4 h-4 ml-2" />
                          </button>
                          {/* Exemplo de um botão secundário como o da Vitamina C */}
                          <button className="bg-gray-800 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors" aria-label="Saiba mais sobre BCAA">
                              <ChevronRight className="w-5 h-5" /> {/* Usei ChevronRight como exemplo, ajuste conforme necessário */}
                          </button>
                      </div>
                  </motion.div>

                  {/* Bloco das Imagens/Visual (para ficar à direita) */}
                  <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="flex flex-col sm:flex-row gap-4 h-[450px] md:h-[550px] lg:h-[650px] items-center justify-center" // Centralizado para o exemplo
                  >
                      {/* Imagem principal, seguindo o estilo da Vitazen ou da Vitamina C */}
                      <div className="relative flex-1 rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20 h-full w-full flex items-center justify-center bg-purple-600">
                          <img
                              src="Beneficios_BCA.webp" // Imagem de exemplo de BCAA
                              alt="Suplemento BCAA"
                              className="w-full h-full object-cover rounded-2xl"
                          />
                          {/* Se quiser um círculo colorido no canto, como o da Vitamina C */}
                          <div className="absolute bottom-4 right-4 bg-purple-800 w-24 h-24 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              BCAA
                          </div>
                      </div>
                  </motion.div>
              </div>
          </div>
    </section>

  

    <section
        className="py-8 md:py-16 px-4 text-white relative overflow-hidden" // Removido 'bg-gray-900', adicionado 'relative' e 'overflow-hidden'
      >
              <div className="max-w-7xl mx-auto">
                {/* Cabeçalho da Seção */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <p className="text-gray-400 text-sm uppercase font-semibold mb-1">
                      COMPRE UM, GANHE UM, 50% DE DESCONTO
                    </p>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-100">
                      Produtos Populares
                    </h2>
                  </div>
                  {/* Botões de Categoria (Multivitamins, Protein Powder, Amino Acids) */}
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

                {/* Lógica de Carregamento/Erro para Produtos Filtrados */}
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
                      >
                        <div className="relative bg-gray-700 rounded-2xl shadow-lg group-hover:shadow-orange-500/20 transition-all border border-gray-600 overflow-hidden">
                          <div className="relative w-full h-40 md:h-48">
                            {!product.is_active || product.stock_quantity === 0 && (
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
                              <button className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500" aria-label="Add to wishlist">
                                <Heart className="w-4 h-4 text-gray-200" />
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
                                    cart.addItem({
                                      id: product.id,
                                      name: product.name,
                                      price: product.price,
                                      image: product.image_url
                                    });
                                  } else {
                                    console.warn("Cart context or addItem function not available.");
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
                            <div className="flex items-baseline space-x-2">
                              {product.original_price && product.price < product.original_price && (
                                <p className="text-gray-500 line-through text-base md:text-lg">
                                   €{product.original_price.toFixed(2)}
                                </p>
                              )}
                              <p className="text-red-500 font-bold text-lg md:text-xl">
                                € {product.price.toFixed(2)}
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
            {/* Fim da NOVA SECTION: POPULAR PRODUCTS */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white" role="contentinfo"> {/* Alterado de orange-500 para gray-900 para consistência com o tema escuro do site */}
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16 lg:py-20"> {/* Aumentado o padding vertical para mais espaço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Coluna 1: Logo e Descrição */}
            <div className="space-y-6">
              <div className="flex items-center">
                <img
                  src="/rd_power.png" // Assumindo que você terá uma versão branca do logo para fundos escuros
                  alt="RD Power Nutrition Logo" // Nome mais descritivo para acessibilidade
                  className="h-10 w-auto" // Aumentado um pouco o tamanho do logo
                />
              </div>
              <p className="text-gray-300 leading-relaxed text-sm"> {/* Cor do texto ajustada e tamanho da fonte ligeiramente menor */}
                RD Power® was founded on the belief that wellness is more than just a necessity—it's a powerful expression of self-care and vitality. {/* Melhoria na descrição, se aplicável */}
              </p>
              <div className="flex space-x-4 mt-6"> {/* Espaçamento maior entre os ícones sociais */}
                {/* Botões de Ícones Sociais - Melhorados com links reais e labels */}
                <a
                  href="https://twitter.com/yourprofile" // Adicione o link real
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Twitter"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300 transform hover:scale-105 shadow-md" // Novas cores e efeito de hover
                >
                  <Twitter className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a
                  href="https://instagram.com/yourprofile" // Adicione o link real
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Instagram"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
                >
                  <Instagram className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a
                  href="https://facebook.com/yourprofile" // Adicione o link real
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow us on Facebook"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
                >
                  <Facebook className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                {/* Se MapPin e User são links, transforme-os em <a>. Se são apenas ícones informativos, mantenha-os como <div>, mas considere remover o `cursor-pointer` se não são clicáveis. */}
                {/* Exemplo de como seriam se fossem links: */}
                <a
                  href="/contact" // Exemplo: link para a página de contato
                  aria-label="Our Location"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
                >
                  <MapPin className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
                <a
                  href="/my-account" // Exemplo: link para a página da conta do usuário
                  aria-label="My Account"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300 transform hover:scale-105 shadow-md"
                >
                  <User className="w-5 h-5 text-gray-300 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Coluna 2: Useful Links */}
            <div>
              <h3 className="text-xl font-bold text-orange-500 mb-6 border-b border-orange-500 pb-2 inline-block">Links Úteis</h3> {/* Título com cor de destaque e underline sutil */}
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">A Minha Conta</a></li> {/* Removido o traço, cor do texto e hover ajustados */}
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Carrinho de Compras</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Lista de Desejos</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Link Personalizado</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Ajuda</a></li>
              </ul>
            </div>

            {/* Coluna 3: Information */}
            <div>
              <h3 className="text-xl font-bold text-orange-500 mb-6 border-b border-orange-500 pb-2 inline-block">Informações</h3>
              <ul className="space-y-4">
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Envios & Devoluções</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Compras Seguras</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Afiliados</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Envios Internacionais</a></li>
                <li><a href="#" className="text-gray-300 hover:text-orange-500 transition-colors text-sm">Contacto</a></li>
              </ul>
            </div>

            {/* Coluna 4: Newsletter */}
            <div>
              <h3 className="text-xl font-bold text-orange-500 mb-6 border-b border-orange-500 pb-2 inline-block">Boletim Informativo</h3>
              <p className="text-gray-300 mb-6 leading-relaxed text-sm">
                Subscreva o nosso boletim informativo para receber notícias e atualizações.
              </p>
              <div className="flex flex-col sm:flex-row rounded-lg overflow-hidden border border-gray-700"> {/* Borda sutil e overflow hidden para cantos arredondados */}
                <input
                  type="email"
                  placeholder="Insira o seu email"
                  className="flex-1 px-4 py-3 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all" // Cor do background e placeholder ajustados, foco melhorado
                  aria-label="Email address for newsletter subscription" // Acessibilidade melhorada
                />
                <button
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 transition-colors duration-300 text-white flex items-center justify-center" // Botão com cor de destaque e hover
                  aria-label="Subscribe to newsletter"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Direitos Autorais e Créditos */}
        <div className="text-center py-6 bg-gray-800 text-gray-500 text-xs border-t border-gray-700"> {/* Cor de fundo mais escura, texto menor e borda superior */}
          &copy; {new Date().getFullYear()} RD Power Nutrition. Todos os direitos reservados.
        </div>
      </footer>

       {/* NOVO: Quick View Modal */}
      {isQuickViewOpen && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={handleQuickViewClose}
          cart={cart}
        />
      )}

      {/* ShoppingCart é um modal, renderizado sempre no final do App */}
      <ShoppingCart
        isOpen={cart.isOpen}
        onClose={cart.closeCart}
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onContinueShopping={() => {
          cart.closeCart();
          setCurrentPage('shop'); // Redireciona para a página da loja ao continuar comprando
        }}
        onViewCart={() => {
          cart.closeCart();
          setCurrentPage('cart'); // Redireciona para a página do carrinho
        }}
        onCheckout={() => {
          cart.closeCart();
          setCurrentPage('checkout'); // Redireciona para a página de checkout
        }}
      />
    </div>
  );
}

export default App;