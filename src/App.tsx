import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
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
import HomePage from './pages/HomePage';
import MyOrdersPages from './pages/MyOrdersPages.tsx';
import WhatsAppButton from './components/WhatsAppButton';
import OrderConfirmationPage from './components/OrderConfirmationPage';
import FavoriteProductsPage from './pages/FavoriteProductsPage.tsx';
import MyAccountPage from './pages/MyAccountPage';
import FaqPage from './pages/FaqPage.tsx';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage'
import FooterPage from './pages/FooterPage.tsx';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import ShippingMethodsPage from './pages/ShippingMethodsPage';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import CookieConsent from "react-cookie-consent";

// --- NOVAS IMPORTAÇÕES PARA LOGIN E REGISTRO ---
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
// --- FIM DAS NOVAS IMPORTAÇÕES ---

// --- NOVAS IMPORTAÇÕES PARA ADMIN ---
import AdminDashboard from './pages/admin/AdminDashboard';
import OrdersList from './pages/admin/OrdersList';
import ProductsList from './pages/admin/ProductsList';
import ProductForm from './pages/admin/ProductForm';
import ProductVariantForm from './pages/admin/ProductVariantForm';
import EditForm from '.pages/admin/EditForm';
import UserForm from './pages/admin/UserForm';
import UsersList from './pages/admin/UsersList';
import CouponsList from './pages/admin/CouponsList';
import CouponEdit from './pages/admin/CouponEdit';
import AdminPrivateRoute from './components/AdminPrivateRoutes';
import AdminLayout from './components/AdminLayout';
import OrderDetails from './pages/admin/OrderDetails';
import ProductImagesForm from './pages/admin/ProductImagesForm';
import { useAuth } from './hooks/useAuth';
// --- FIM DAS NOVAS IMPORTAÇÕES PARA ADMIN ---

// ✨ Importa os provedores de contexto necessários ✨
import { AuthProvider } from './contexts/AuthContext.js';
import { FavoritesProvider } from './hooks/useFavorites';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { getAuthToken } = useAuth();
  const cart = useCart(getAuthToken);

  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  const handleQuickViewOpen = useCallback((product: any) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  }, []);

  const handleQuickViewClose = useCallback(() => {
    setIsQuickViewOpen(false);
    setQuickViewProduct(null);
  }, []);

  const [categorizedProducts, setCategorizedProducts] = useState([]);
  const [loadingCategorizedProducts, setLoadingCategorizedProducts] = useState(false);
  const [errorCategorizedProducts, setErrorCategorizedProducts] = useState<string | null>(null);
  const [categories, setCategories] = useState([]);

  const [flavors, setFlavors] = useState([]);
  const [loadingFlavors, setLoadingFlavors] = useState(false);
  const [errorFlavors, setErrorFlavors] = useState<string | null>(null);

  const fetchFlavors = useCallback(async () => {
    setLoadingFlavors(true);
    setErrorFlavors(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/flavors/listar`);
      const sortedFlavors = response.data.sort((a: any, b: any) => a.id - b.id);
      setFlavors(sortedFlavors);
    } catch (err: any) {
      console.error("Failed to fetch flavors:", err);
      setErrorFlavors(err.message || 'Erro ao carregar sabores.');
    } finally {
      setLoadingFlavors(false);
    }
  }, []);

  useEffect(() => {
    const getPageTitle = (pathname: string) => {
      switch (pathname) {
        case '/': return 'RD Power Nutrition - Suplementos Premium para Saúde e Performance';
        case '/produtos': return 'Loja de Suplementos - RD Power Nutrition';
        case '/carrinho': return 'Carrinho de Compras - RD Power Nutrition';
        case '/checkout': return 'Finalizar Compra - RD Power Nutrition';
        case '/contacto': return 'Contacta-nos - Apoio RD Power Nutrition';
        case '/sobre-nos': return 'A Nossa Equipa - Conhece os Especialistas da RD Power Nutrition';
        case '/login': return 'Login - RD Power Nutrition';
        case '/register': return 'Registro - RD Power Nutrition';
        case '/admin': return 'Painel de Administração - RD Power Nutrition';
        case '/admin/orders': return 'Gestão de Encomendas - Admin';
        case '/admin/products': return 'Gestão de Produtos - Admin';
        case '/admin/products/new': return 'Adicionar Produto - Admin';
        case '/admin/users': return 'Gestão de Utilizadores - Admin';
        case '/admin/coupons': return 'Gestão de Cupões - Admin';
        case '/minha-conta/:id': return 'Minha Conta - RD Power Nutrition';
        default:
          if (pathname.startsWith('/produto/')) return 'Detalhes do Produto - RD Power Nutrition';
          if (pathname.startsWith('/admin/products/edit/')) return 'Editar Produto - Admin';
          if (pathname.startsWith('/admin/products/add-images/')) return 'Adicionar Imagens ao Produto - Admin';
          if (pathname.startsWith('/admin/orders/')) return 'Detalhes da Encomenda - Admin';
          if (pathname.startsWith('/admin/products/add-variant/')) return 'Adicionar Variante ao Produto - Admin';
          return 'RD Power Nutrition';
      }
    };
    document.title = getPageTitle(location.pathname);
  }, [location.pathname]);

  const fetchProductsByCategory = useCallback(async (categoryId: number | null) => {
    setLoadingCategorizedProducts(true);
    setErrorCategorizedProducts(null);
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
        const allProducts = response.data; // Use os dados brutos

        // Adicione a lógica de processamento aqui
        const processedProducts = allProducts.map((product: any) => {
            let displayPrice = 0; // Preço padrão para evitar NaN
            if (product.variants && product.variants.length > 0) {
                const prices = product.variants.map((v: any) => parseFloat(v.preco));
                const validPrices = prices.filter((p: any) => !isNaN(p));
                if (validPrices.length > 0) {
                    displayPrice = Math.min(...validPrices);
                }
            }
            // Define o preço original
            const originalPrice = product.original_price ? parseFloat(String(product.original_price)) : null;

            return {
                ...product,
                displayPrice, // Use a propriedade calculada
                original_price: originalPrice,
            };
        });

        let filteredProducts = [];
        if (categoryId !== null) {
            filteredProducts = processedProducts.filter((product: any) => product.category_id === categoryId);
        } else {
            filteredProducts = processedProducts;
        }
        setCategorizedProducts(filteredProducts);
    } catch (error: any) {
        console.error(`Erro ao buscar ou filtrar produtos para categoria ${categoryId}:`, error);
        setErrorCategorizedProducts(error.message || 'Erro ao carregar produtos.');
    } finally {
        setLoadingCategorizedProducts(false);
    }
}, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories/listar`);
        const sortedCategories = response.data.sort((a: any, b: any) => a.id - b.id);
        setCategories(sortedCategories);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
    fetchFlavors();
  }, [fetchFlavors]);

  useEffect(() => {
    fetchProductsByCategory(null);
  }, [fetchProductsByCategory]);

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
      <ScrollToTop />
      <Toaster position="top-right" reverseOrder={false} />

      <Header
        onNavigate={navigate}
        cartItemCount={cart.itemCount}
        onCartClick={cart.openCart}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              cart={cart}
              handleQuickViewOpen={handleQuickViewOpen}
            />
          }
        />
        <Route
            path="/produtos"
            element={
                <ShopPage
                    products={categorizedProducts}
                    categoriesList={categories}
                    flavorsList={flavors} 
                    onProductClick={(product) => {
                        navigate(`/produto/${product.id}`);
                    }}
                    // 💡 Pass the full cart object here
                    cart={cart}
                    onAddToCart={cart.addItem}
                    onQuickViewOpen={handleQuickViewOpen}
                    loading={loadingCategorizedProducts || loadingFlavors} 
                    error={errorCategorizedProducts || errorFlavors}
                    fetchProductsByCategory={fetchProductsByCategory}
                />
            }
        />
        <Route
          path="/produto/:id"
          element={
            <ProductPage
              onBack={() => navigate(-1)}
              onAddToCart={cart.addItem}
            />
          }
        />
        <Route
          path="/carrinho"
          element={
            <CartPage
              items={cart.items}
              onUpdateQuantity={cart.updateQuantity}
              onRemoveItem={cart.removeItem}
              onBack={() => navigate('/produtos')}
              onCheckout={() => navigate('/checkout')}
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <CheckoutPage
              items={cart.items}
              onBack={() => navigate('/carrinho')}
            />
          }
        />
        <Route path="/favoritos" element={<FavoriteProductsPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/sobre-nos" element={<TeamPage />} />
        <Route path="/minha-conta/:id" element={<MyAccountPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/perguntas-frequentes" element={<FaqPage />} />
        <Route path="/termos-de-servico" element={<TermsOfServicePage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/politica-de-devolucao" element={<ReturnPolicyPage />} />
        <Route path="/metodos-de-envio" element={<ShippingMethodsPage />} />
        <Route path="/minhas-encomendas" element={<MyOrdersPages />}/>

        <Route path="/admin" element={<AdminPrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<EditForm />} />
            <Route path="users/new" element={<UserForm />} />
            <Route path="users/edit/:id" element={<UserForm />} />
            <Route path="products/add-images/:productId" element={<ProductImagesForm />} />
            <Route path="products/adicionar-variante/:productId" element={<ProductVariantForm />} />
            <Route path="users" element={<UsersList />} />
            <Route path="coupons" element={<CouponsList />} />
            <Route path="/admin/cupoes/editar/:id" element={<CouponEdit />} />
          </Route>
        </Route>
      </Routes>

      <ShoppingCart
        isOpen={cart.isOpen}
        onClose={cart.closeCart}
        items={cart.items}
        onUpdateQuantity={cart.updateQuantity}
        onRemoveItem={cart.removeItem}
        onContinueShopping={() => {
          cart.closeCart();
          navigate('/produtos');
        }}
        onViewCart={() => {
          cart.closeCart();
          navigate('/carrinho');
        }}
        onCheckout={() => {
          cart.closeCart();
          navigate('/checkout');
        }}
      />

      <AnimatePresence>
        {isQuickViewOpen && quickViewProduct && (
          <QuickViewModal
            isOpen={isQuickViewOpen}
            onClose={handleQuickViewClose}
            product={quickViewProduct}
            cart={cart}
          />
        )}
      </AnimatePresence>

      <WhatsAppButton phoneNumber="351912345678" />

      <CookieConsent
        location="bottom"
        buttonText="Aceitar Cookies"
        cookieName="powerNutritionCookieConsent"
        style={{ background: "#2B373B", fontFamily: "sans-serif" }}
        buttonStyle={{ color: "#fff", fontSize: "16px", background: "#f05523", padding: "10px 20px", borderRadius: "8px" }}
        expires={150} // O banner só volta a aparecer em 150 dias
      >
        Este website utiliza cookies para melhorar a sua experiência. Ao continuar a navegar no site, está a concordar com a nossa <a href="/politica-de-privacidade" className="underline hover:text-orange-400">política de privacidade</a>.
      </CookieConsent>
    </div>
  );
}

const AppWrapper = () => (
  <Router>
    <AuthProvider>
      <FavoritesProvider>
        <App />
      </FavoritesProvider>
    </AuthProvider>
  </Router>
);

export default AppWrapper;