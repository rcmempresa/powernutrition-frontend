import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  Heart,
  ShoppingCart,
  User,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User2,
  LayoutDashboard,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { useFavorites } from '../hooks/useFavorites';

// Tipos
interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  image_url: string;
  price: number;
}

interface HeaderProps {
  onNavigate: (path: string) => void;
  cartItemCount: number;
  onCartClick: () => void;
}

interface GroupedCategories {
  [key: string]: Category[];
}

const groupCategories = (categories: Category[]): GroupedCategories => {
  return categories.reduce((acc, category) => {
    let groupName = "Outros";
    if ([1, 2, 15].includes(category.id)) groupName = "Suplementos Essenciais";
    else if ([14, 4, 6, 11, 5].includes(category.id)) groupName = "Performance & Energia";
    else if ([7, 3, 9].includes(category.id)) groupName = "Saúde & Bem-Estar";
    else if ([8, 10, 13, 12 ].includes(category.id)) groupName = "Lifestyle";

    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(category);
    return acc;
  }, {} as GroupedCategories);
};

// Componente do menu suspenso reutilizável
const DropdownMenu: React.FC<{ children: React.ReactNode, onMouseEnter: () => void, onMouseLeave: () => void, position: string, width?: string }> = ({ children, onMouseEnter, onMouseLeave, position, width }) => (
  <div
    className={`absolute top-full ${position} mt-2 p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 ${width}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    {children}
  </div>
);

const Header: React.FC<HeaderProps> = ({ onNavigate, cartItemCount, onCartClick }) => {
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [showPagesDropdown, setShowPagesDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const { favoriteItemCount } = useFavorites();
  const { isAuthenticated, user, logout } = useAuthContext();

  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryIdFromUrl = searchParams.get('categoria');

  const dropdownTimeouts = useRef<Record<string, NodeJS.Timeout | null>>({
    categories: null,
    pages: null,
    user: null,
  });

  const handleMouseEnter = (dropdownType: 'categories' | 'pages' | 'user') => {
    if (dropdownTimeouts.current[dropdownType]) clearTimeout(dropdownTimeouts.current[dropdownType]!);
    if (dropdownType === 'categories') setShowCategoriesDropdown(true);
    if (dropdownType === 'pages') setShowPagesDropdown(true);
    if (dropdownType === 'user') setShowUserDropdown(true);
  };

  const handleMouseLeave = (dropdownType: 'categories' | 'pages' | 'user') => {
    dropdownTimeouts.current[dropdownType] = setTimeout(() => {
      if (dropdownType === 'categories') setShowCategoriesDropdown(false);
      if (dropdownType === 'pages') setShowPagesDropdown(false);
      if (dropdownType === 'user') setShowUserDropdown(false);
    }, 200);
  };

  const handleNavLinkClick = useCallback(() => {
    setShowMobileMenu(false);
    setShowCategoriesDropdown(false);
    setShowPagesDropdown(false);
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/categories/listar`);
      const sortedCategories = response.data.sort((a: Category, b: Category) => a.id - b.id);
      setCategories(sortedCategories);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setErrorCategories("Não foi possível carregar as categorias.");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchAllProducts = async () => {
    setSearchLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
      
      // ALTERAÇÃO CRÍTICA AQUI:
      // Agora, a sua aplicação irá usar o array diretamente de `response.data`
      // em vez de tentar aceder a `response.data.products`
      if (Array.isArray(response.data)) {
        const productsData = response.data.map((product: any) => ({
          ...product,
          price: parseFloat(product.price)
        }));
        setAllProducts(productsData);
      } else {
        // Log para depuração, caso o formato da API mude no futuro
        console.error("Formato de dados inesperado da API.", response.data);
        setAllProducts([]);
      }
    } catch (err) {
      console.error("Erro ao buscar todos os produtos:", err);
      setAllProducts([]);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const cleanedSearchTerm = searchTerm.trim();
    if (cleanedSearchTerm.length < 1) {
      setSearchResults([]);
      return;
    }

    const filteredProducts = allProducts.filter(product =>
      product.name.toLowerCase().includes(cleanedSearchTerm.toLowerCase())
    );

    setSearchResults(filteredProducts);
  }, [searchTerm, allProducts]);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchBar(false);
        setSearchTerm('');
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);
  
  useEffect(() => {
    fetchCategories();
    return () => {
      Object.values(dropdownTimeouts.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  const groupedCategories = groupCategories(categories);

  const isLinkActive = useCallback((path: string, searchParam?: string) => {
    if (searchParam) {
      return searchParam === categoryIdFromUrl;
    }
    return location.pathname.startsWith(path) || (path === '/' && location.pathname === '/');
  }, [location.pathname, categoryIdFromUrl]);

  return (
    <>
      <motion.header
        className="bg-gray-900 shadow-lg border-b border-gray-700"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => onNavigate('/')}
            >
              <img
                src="/rd_power.png"
                alt="RD Power Logo"
                className="h-16 md:h-20 w-auto brightness-0 invert"
              />
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                to="/produtos"
                className={`font-medium transition-colors cursor-pointer ${
                  isLinkActive('/produtos')
                    ? 'text-orange-500'
                    : 'text-gray-200 hover:text-orange-500'
                }`}
                onClick={handleNavLinkClick}
              >
                LOJA
              </Link>
              
              <div
                className="relative flex items-center space-x-1 cursor-pointer"
                onMouseEnter={() => handleMouseEnter('categories')}
                onMouseLeave={() => handleMouseLeave('categories')}
              >
                <span className={`font-medium transition-colors ${
                  isLinkActive('/produtos', categoryIdFromUrl || '')
                    ? 'text-orange-500'
                    : 'text-gray-200 hover:text-orange-500'
                }`}>
                  CATEGORIAS
                </span>
                <ChevronDown className="w-4 h-4 text-gray-200" />
                
                {showCategoriesDropdown && (
                  <DropdownMenu onMouseEnter={() => handleMouseEnter('categories')} onMouseLeave={() => handleMouseLeave('categories')} position="left-1/2 -translate-x-1/2" width="w-max min-w-[700px]">
                    {loadingCategories ? (
                        <p className="px-4 py-2 text-sm text-gray-400">A carregar...</p>
                    ) : errorCategories ? (
                        <p className="px-4 py-2 text-sm text-red-400">Erro!</p>
                    ) : (
                        <div className="grid grid-cols-4 gap-8">
                            {Object.keys(groupedCategories).map(groupName => (
                                <div key={groupName}>
                                    <h4 className="font-semibold text-orange-500 mb-3">{groupName}</h4>
                                    <ul className="space-y-2">
                                        {groupedCategories[groupName].map((category: Category) => (
                                            <li key={category.id}>
                                                <Link
                                                    to={`/produtos?categoria=${category.id}`}
                                                    onClick={() => { setShowCategoriesDropdown(false); handleNavLinkClick(); }}
                                                    className={`w-full block text-left text-sm transition-colors ${
                                                        isLinkActive('/produtos', String(category.id))
                                                            ? 'text-orange-500'
                                                            : 'text-gray-200 hover:text-orange-500'
                                                        }`
                                                    }
                                                >
                                                    {category.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                  </DropdownMenu>
                )}
              </div>

              <div
                className="relative flex items-center space-x-1 cursor-pointer"
                onMouseEnter={() => handleMouseEnter('pages')}
                onMouseLeave={() => handleMouseLeave('pages')}
              >
                <span className={`font-medium transition-colors ${
                  isLinkActive('/equipa') || isLinkActive('/contacto')
                    ? 'text-orange-500'
                    : 'text-gray-200 hover:text-orange-500'
                }`}>
                  PÁGINAS
                </span>
                <ChevronDown className="w-4 h-4 text-gray-200" />

                {showPagesDropdown && (
                  <DropdownMenu onMouseEnter={() => handleMouseEnter('pages')} onMouseLeave={() => handleMouseLeave('pages')} position="left-0" width="w-48">
                    <div className="py-2">
                      <Link
                        to="/sobre-nos"
                        onClick={handleNavLinkClick}
                        className={`w-full block text-left px-4 py-2 text-sm transition-colors ${
                          isLinkActive('/equipa')
                            ? 'text-orange-500 bg-orange-900'
                            : 'text-gray-200 hover:text-orange-500 hover:bg-gray-700'
                        }`}
                      >
                        Sobre Nós
                      </Link>
                      <Link
                        to="/contacto"
                        onClick={handleNavLinkClick}
                        className={`w-full block text-left px-4 py-2 text-sm transition-colors ${
                          isLinkActive('/contacto')
                            ? 'text-orange-500 bg-orange-900'
                            : 'text-gray-200 hover:text-orange-500 hover:bg-gray-700'
                        }`}
                      >
                        Contacte-nos
                      </Link>
                    </div>
                  </DropdownMenu>
                )}
              </div>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div ref={searchContainerRef} className="relative hidden lg:block">
                  <AnimatePresence>
                    {!showSearchBar ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Search 
                          className="w-5 h-5 cursor-pointer text-gray-200 hover:text-orange-500 transition-colors"
                          onClick={() => setShowSearchBar(true)} 
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 250, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                      >
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Pesquisar produtos..."
                          className="w-full pl-3 pr-10 py-2 text-sm text-gray-200 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-300"
                        />
                        <X 
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 cursor-pointer text-gray-400 hover:text-gray-200"
                          onClick={() => {
                            setShowSearchBar(false);
                            setSearchTerm('');
                            setSearchResults([]);
                          }} 
                        />

                        {searchTerm.trim().length > 0 && (
                          <div className="absolute top-full left-0 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                            {searchLoading ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                              </div>
                            ) : searchResults.length > 0 ? (
                              <ul className="max-h-60 overflow-y-auto">
                                {searchResults.map((product) => (
                                  <li key={product.id}>
                                    <Link
                                      to={`/produto/${product.id}`}
                                      onClick={() => {
                                        setShowSearchBar(false);
                                        setSearchTerm('');
                                        setSearchResults([]);
                                      }}
                                      className="flex items-center p-3 hover:bg-gray-700 transition-colors"
                                    >
                                      <img src={product.image_url || 'https://placehold.co/50x50/FDBA74/FFFFFF?text=Sem+Imagem'} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-200 line-clamp-1">{product.name}</span>
                                        <span className="text-xs text-orange-500 font-bold">€{product.price.toFixed(2)}</span>
                                      </div>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="p-4 text-sm text-gray-400 text-center">Nenhum produto encontrado.</p>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div
                  className="relative cursor-pointer"
                  onClick={() => navigate('/favoritos')}
                  whileTap={{ scale: 0.9 }}
                >
                  <Heart className="w-5 h-5 text-gray-200 hover:text-orange-500 transition-colors" />
                  {favoriteItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {favoriteItemCount}
                    </span>
                  )}
                </motion.div>

                <div className="relative">
                  <ShoppingCart
                    className="w-5 h-5 cursor-pointer text-gray-200 hover:text-orange-500 transition-colors"
                    onClick={onCartClick}
                  />
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                </div>

                <div
                  className="relative flex items-center space-x-1 cursor-pointer"
                  onMouseEnter={() => handleMouseEnter('user')}
                  onMouseLeave={() => handleMouseLeave('user')}
                >
                  <User className="w-5 h-5 text-gray-200 hover:text-orange-500 transition-colors" />

                  {showUserDropdown && (
                    <DropdownMenu onMouseEnter={() => handleMouseEnter('user')} onMouseLeave={() => handleMouseLeave('user')} position="right-0" width="w-48">
                      <div className="py-2">
                        {isAuthenticated ? (
                          <>
                            <div className="w-full text-left px-4 py-2 text-sm text-gray-400 border-b border-gray-700">
                              Olá, {user?.username || 'Utilizador'}
                            </div>
                            <Link
                              to={`/minha-conta/${user?.id}`}
                              onClick={handleNavLinkClick}
                              className="w-full block text-left px-4 py-2 text-sm transition-colors text-gray-200 hover:text-orange-500 hover:bg-gray-700"
                            >
                              <div className="flex items-center space-x-2">
                                <User2 className="w-4 h-4" />
                                <span>Minha Conta</span>
                              </div>
                            </Link>
                            <Link
                              to="/minhas-encomendas"
                              onClick={handleNavLinkClick}
                              className="w-full block text-left px-4 py-2 text-sm transition-colors text-gray-200 hover:text-orange-500 hover:bg-gray-700"
                            >
                              <div className="flex items-center space-x-2">
                                <ShoppingCart className="w-4 h-4" />
                                <span>Minhas Encomendas</span>
                              </div>
                            </Link>

                            {user?.is_admin && (
                              <Link
                                to="/admin"
                                onClick={handleNavLinkClick}
                                className="w-full block text-left px-4 py-2 text-sm transition-colors text-gray-200 hover:text-orange-500 hover:bg-gray-700"
                              >
                                <div className="flex items-center space-x-2">
                                  <LayoutDashboard className="w-4 h-4" />
                                  <span>Painel Admin</span>
                                </div>
                              </Link>
                            )}

                            <button
                              onClick={() => { logout(); handleNavLinkClick(); }}
                              className="w-full text-left px-4 py-2 text-sm transition-colors text-gray-200 hover:text-orange-500 hover:bg-gray-700"
                            >
                              <div className="flex items-center space-x-2">
                                <LogOut className="w-4 h-4" />
                                <span>Sair</span>
                              </div>
                            </button>
                          </>
                        ) : (
                          <Link
                            to="/login"
                            onClick={handleNavLinkClick}
                            className="w-full block text-left px-4 py-2 text-sm font-medium text-gray-200 hover:text-orange-500 hover:bg-gray-700 transition-colors"
                          >
                            Login
                          </Link>
                        )}
                      </div>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              <button
                className="lg:hidden p-2 text-gray-200 hover:text-orange-500 transition-colors"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {showMobileMenu && (
            <div className="lg:hidden mt-4 border-t border-gray-700">
              <nav className="flex flex-col">
                <Link
                  to="/produtos"
                  className={`block px-4 py-4 font-medium transition-colors cursor-pointer ${
                    isLinkActive('/produtos') ? 'text-orange-500' : 'text-gray-200 hover:text-orange-500'
                  }`}
                  onClick={handleNavLinkClick}
                >
                  LOJA
                </Link>

                <div className="px-4 py-4 border-t border-gray-700">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Pesquisar produtos..."
                      className="w-full pl-3 pr-10 py-2 text-sm text-gray-200 bg-gray-700 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    {searchTerm.trim().length > 0 && (
                      <div className="absolute top-full left-0 w-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                        {searchLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                          </div>
                        ) : searchResults.length > 0 ? (
                          <ul className="max-h-60 overflow-y-auto">
                            {searchResults.map((product) => (
                              <li key={product.id}>
                                <Link
                                  to={`/produto/${product.id}`}
                                  onClick={() => {
                                    setShowMobileMenu(false);
                                    setSearchTerm('');
                                    setSearchResults([]);
                                  }}
                                  className="flex items-center p-3 hover:bg-gray-700 transition-colors"
                                >
                                  <img src={product.image_url || 'https://placehold.co/50x50/FDBA74/FFFFFF?text=Sem+Imagem'} alt={product.name} className="w-10 h-10 object-cover rounded-md mr-3" />
                                  <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-gray-200 line-clamp-1">{product.name}</span>
                                    <span className="text-xs text-orange-500 font-bold">€{product.price.toFixed(2)}</span>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="p-4 text-sm text-gray-400 text-center">Nenhum produto encontrado.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-700">
                  <div
                    className="flex items-center justify-between px-4 py-4 cursor-pointer"
                    onClick={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
                  >
                    <span className={`font-medium transition-colors ${
                          isLinkActive('/produtos', categoryIdFromUrl || '')
                            ? 'text-orange-500'
                            : 'text-gray-200 hover:text-orange-500'
                        }`}>CATEGORIAS</span>
                    {showCategoriesDropdown ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {showCategoriesDropdown && (
                    <div className="mt-2 pl-6 space-y-3">
                      {loadingCategories ? (
                          <p className="text-sm text-gray-400">A carregar...</p>
                      ) : errorCategories ? (
                          <p className="text-sm text-red-400">Erro!</p>
                      ) : (
                          categories.map((category: Category) => (
                              <Link
                                  key={category.id}
                                  to={`/produtos?categoria=${category.id}`}
                                  onClick={handleNavLinkClick}
                                  className={`block w-full text-left font-medium text-sm transition-colors ${
                                      isLinkActive('/produtos', String(category.id))
                                          ? 'text-orange-500'
                                          : 'text-gray-200 hover:text-orange-500'
                                      }`
                                  }
                              >
                                  {category.name}
                              </Link>
                          ))
                      )}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-700">
                  <div
                    className="flex items-center justify-between px-4 py-4 cursor-pointer"
                    onClick={() => setShowPagesDropdown(!showPagesDropdown)}
                  >
                    <span className={`font-medium transition-colors ${
                          isLinkActive('/equipa') || isLinkActive('/contacto')
                            ? 'text-orange-500'
                            : 'text-gray-200 hover:text-orange-500'
                        }`}>PÁGINAS</span>
                    {showPagesDropdown ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  {showPagesDropdown && (
                    <div className="mt-2 pl-6 space-y-2">
                      <Link
                        to="/sobre-nos"
                        onClick={handleNavLinkClick}
                        className={`block w-full text-left font-medium text-sm transition-colors ${
                          isLinkActive('/equipa') ? 'text-orange-500' : 'text-gray-200 hover:text-orange-500'
                        }`}
                      >
                        Sobre Nós
                      </Link>
                      <Link
                        to="/contacto"
                        onClick={handleNavLinkClick}
                        className={`block w-full text-left font-medium text-sm transition-colors ${
                          isLinkActive('/contacto') ? 'text-orange-500' : 'text-gray-200 hover:text-orange-500'
                        }`}
                      >
                        Contacte-nos
                      </Link>
                    </div>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </motion.header>
    </>
  );
};

export default Header;