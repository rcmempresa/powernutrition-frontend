import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronDown,
  Grid,
  List,
  Grid3X3,
  Star,
  Heart,
  Eye,
  ShoppingCart,
  Minus,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Twitter,
  Instagram,
  Facebook,
  MapPin,
  User
} from 'lucide-react';
import Footer from '../components/FooterPage';
import { useFavorites } from '../hooks/useFavorites';

// --- Interfaces ---
interface Variant {
  id: number;
  preco: string;
  quantidade_em_stock: number;
  stock_ginasio: number;
  sku: string;
  weight_value: string;
  weight_unit: string;
  flavor_id?: number;
  flavor_name?: string;
  image_url?: string;
}

// --- Produto principal ---
interface Product {
  id: number | string;
  name: string;
  description?: string;
  image_url?: string;
  hoverImage?: string;
  category_id?: string | number;
  category_name?: string;
  brand_id?: string;
  brand_name?: string;
  is_active?: boolean;
  original_price?: number | string;
  rating?: number | string;
  reviewcount?: number;
  variants: Variant[];

  // --- Propriedades derivadas para frontend ---
  displayPrice: number;           // Preço da variante mais barata
  displayWeight: string;          // Peso da variante mais barata (ex: "1kg")
  displayVariantId: number | null;// Id da variante mais barata
  totalStock?: number;            // Soma de todas as variantes
  soldOut?: boolean;              // true se totalStock === 0
}

interface Category {
  id: string;
  name: string;
  items: number;
  image: string;
}

interface FilterOption {
  name: string;
  count: number;
  id?: string;
}

interface ShopPageProps {
  products: Product[];
  categoriesList: Category[];
  flavorsList?: FilterOption[];
  brandsList?: FilterOption[];
  loading: boolean;
  error: Error | null;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onQuickViewOpen: (product: Product) => void;
}

const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categoriesList,
  flavorsList,
  brandsList,
  loading,
  error,
  onProductClick,
  onAddToCart,
  onQuickViewOpen
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Alfabeticamente, A-Z');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [showAllFlavors, setShowAllFlavors] = useState(false);
  // 👉 NOVO ESTADO: controla a exibição de mais pesos
  const [showAllWeights, setShowAllWeights] = useState(false);
  // 👉 NOVO ESTADO: controla a exibição de mais categorias
  const [showAllCategories, setShowAllCategories] = useState(false);


  const [searchParams, setSearchParams] = useSearchParams();

  // --- Estados para os Filtros ---
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  const productsPerPage = 9;

  // --- Efeito para ler filtros do URL ---
  useEffect(() => {
    const categoriesFromUrl = searchParams.get('categoria')?.split(',').filter(Boolean) || [];
    const availabilityFromUrl = searchParams.get('disponibilidade')?.split(',').filter(Boolean) || [];
    const minPriceFromUrl = searchParams.get('min_price') || '';
    const maxPriceFromUrl = searchParams.get('max_price') || '';
    const flavorsFromUrl = searchParams.get('sabor')?.split(',').filter(Boolean) || [];
    const weightsFromUrl = searchParams.get('peso')?.split(',').filter(Boolean) || [];
    const brandsFromUrl = searchParams.get('marca')?.split(',').filter(Boolean) || [];

    setSelectedCategories(categoriesFromUrl);
    setSelectedAvailability(availabilityFromUrl);
    setMinPrice(minPriceFromUrl);
    setMaxPrice(maxPriceFromUrl);
    setSelectedFlavors(flavorsFromUrl);
    setSelectedWeights(weightsFromUrl);
    setSelectedBrands(brandsFromUrl);
  }, [searchParams]);

  // --- Lógica de Filtragem e Ordenação ---
  const filteredAndSortedProducts = useMemo(() => {
    let currentProducts = [...products];

    // 1. Filtrar por Disponibilidade
    if (selectedAvailability.length > 0) {
      currentProducts = currentProducts.filter(product => {
        const hasStock = product.variants.some(v => v.quantidade_em_stock > 0 || v.stock_ginasio > 0);
        if (selectedAvailability.includes('Em stock') && hasStock) return true;
        if (selectedAvailability.includes('Fora de stock') && !hasStock) return true;
        return false;
      });
    }

    // 2. Filtrar por Preço (Usa o preço da variante mais barata do produto)
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) {
      currentProducts = currentProducts.filter(product => {
        const lowestPrice = Math.min(...product.variants.map(v => parseFloat(v.preco)));
        return lowestPrice >= min;
      });
    }
    if (!isNaN(max)) {
      currentProducts = currentProducts.filter(product => {
        const lowestPrice = Math.min(...product.variants.map(v => parseFloat(v.preco)));
        return lowestPrice <= max;
      });
    }

    // 3. Filtrar por Categoria (Esta já estava correta, pois a categoria está no produto)
    if (selectedCategories.length > 0) {
      currentProducts = currentProducts.filter(product =>
        product.category_id && selectedCategories.includes(String(product.category_id))
      );
    }

    // 4. Filtrar por Sabor (CORRIGIDO)
    if (selectedFlavors.length > 0) {
      currentProducts = currentProducts.filter(product =>
        product.variants.some(variant => variant.flavor_id && selectedFlavors.includes(String(variant.flavor_id)))
      );
    }

    // 5. Filtrar por Peso (CORRIGIDO)
    if (selectedWeights.length > 0) {
      currentProducts = currentProducts.filter(product => {
        return product.variants.some(variant => {
          const variantWeight = `${variant.weight_value}${variant.weight_unit}`;
          return selectedWeights.includes(variantWeight);
        });
      });
    }

    // 6. Filtrar por Marca (CORRIGIDO)
    if (selectedBrands.length > 0) {
      currentProducts = currentProducts.filter(product =>
        product.brand_id && selectedBrands.includes(String(product.brand_id))
      );
    }
    
    // 7. Ordenar (Usa o preço da variante mais barata para ordenar por preço)
    currentProducts.sort((a, b) => {
      switch (sortBy) {
        case 'Alfabeticamente, A-Z':
          return a.name.localeCompare(b.name);
        case 'Alfabeticamente, Z-A':
          return b.name.localeCompare(a.name);
        case 'Preço, menor para maior':
          const aPrice = Math.min(...a.variants.map(v => parseFloat(v.preco)));
          const bPrice = Math.min(...b.variants.map(v => parseFloat(v.preco)));
          return aPrice - bPrice;
        case 'Preço, maior para menor':
          const aPriceDesc = Math.min(...a.variants.map(v => parseFloat(v.preco)));
          const bPriceDesc = Math.min(...b.variants.map(v => parseFloat(v.preco)));
          return bPriceDesc - aPriceDesc;
        default:
          return 0;
      }
    });

    return currentProducts;
}, [
    products,
    selectedAvailability,
    minPrice,
    maxPrice,
    selectedCategories,
    selectedFlavors,
    selectedWeights,
    selectedBrands,
    sortBy
]);

  // Lógica de Paginação
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const { checkIfFavorite, toggleFavorite, loadingFavorites } = useFavorites();

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredAndSortedProducts]);

  // --- Handlers de Filtros ---
  const handleAvailabilityChange = (name: string) => {
    const currentAvailability = searchParams.get('disponibilidade')?.split(',').filter(Boolean) || [];
    const newAvailability = currentAvailability.includes(name)
        ? currentAvailability.filter(item => item !== name)
        : [...currentAvailability, name];
    
    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    if (newAvailability.length > 0) {
        newParams.disponibilidade = newAvailability.join(',');
    } else {
        delete newParams.disponibilidade;
    }
    setSearchParams(newParams);
  };


  const handleCategoryChange = (id: string) => {
    const currentCategories = new Set(searchParams.get('categoria')?.split(',').filter(Boolean) || []);

    if (currentCategories.has(id)) {
        currentCategories.delete(id);
    } else {
        currentCategories.add(id);
    }

    const newCategoriesArray = Array.from(currentCategories);

    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    if (newCategoriesArray.length > 0) {
        newParams.categoria = newCategoriesArray.join(',');
    } else {
        delete newParams.categoria;
    }
    setSearchParams(newParams);
};

  const handleFlavorChange = (id: string) => {
    const currentFlavors = new Set(searchParams.get('sabor')?.split(',').filter(Boolean) || []);

    if (currentFlavors.has(id)) {
        currentFlavors.delete(id);
    } else {
        currentFlavors.add(id);
    }

    const newFlavorsArray = Array.from(currentFlavors);

    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    if (newFlavorsArray.length > 0) {
        newParams.sabor = newFlavorsArray.join(',');
    } else {
        delete newParams.sabor;
    }
    setSearchParams(newParams);
};

  const handleWeightChange = (name: string) => {
    const currentWeights = new Set(searchParams.get('peso')?.split(',').filter(Boolean) || []);

    if (currentWeights.has(name)) {
        currentWeights.delete(name);
    } else {
        currentWeights.add(name);
    }

    const newWeightsArray = Array.from(currentWeights);

    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    if (newWeightsArray.length > 0) {
        newParams.peso = newWeightsArray.join(',');
    } else {
        delete newParams.peso;
    }
    setSearchParams(newParams);
};
  const handleBrandChange = (id: string) => {
    const currentBrands = searchParams.get('marca')?.split(',').filter(Boolean) || [];
    const newBrands = currentBrands.includes(id)
        ? currentBrands.filter(item => item !== id)
        : [...currentBrands, id];
    
    const newParams = { ...Object.fromEntries(searchParams.entries()) };
    if (newBrands.length > 0) {
        newParams.marca = newBrands.join(',');
    } else {
        delete newParams.marca;
    }
    setSearchParams(newParams);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = { ...Object.fromEntries(searchParams.entries()), min_price: e.target.value };
    if (e.target.value === '') {
        delete newParams.min_price;
    }
    setSearchParams(newParams);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newParams = { ...Object.fromEntries(searchParams.entries()), max_price: e.target.value };
    if (e.target.value === '') {
        delete newParams.max_price;
    }
    setSearchParams(newParams);
  };

  const handleClearAllFilters = () => {
    setSearchParams({});
  };

  const getFilterCounts = (filterType: 'category' | 'flavor' | 'weight' | 'brand' | 'availability') => {
    const counts: { [key: string]: number } = {};
    products.forEach(product => {
      let key: string | undefined;
      if (filterType === 'availability') {
        key = (product.stock_quantity > 0 || product.stock_ginasio > 0) ? 'Em stock' : 'Fora de stock';
      } else if (filterType === 'category' && product.category_id) {
        key = product.category_id;
      } else if (filterType === 'flavor' && product.flavor_id) {
        key = product.flavor_id;
      } else if (filterType === 'weight' && product.weight_value && product.weight_unit) {
        key = `${(product.weight_value || '').toString().replace(/\.0+$/, '')}${product.weight_unit}`;
      } else if (filterType === 'brand' && product.brand) {
        key = product.brand;
      }

      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return counts;
  };

  const availabilityCounts = getFilterCounts('availability');
  const categoryCounts = getFilterCounts('category');
  const flavorCounts = getFilterCounts('flavor');
  const weightCounts = getFilterCounts('weight');
  const brandCounts = getFilterCounts('brand');


  const getCategoryName = (id: string) => categoriesList.find(c => c.id === id)?.name || id;
  const getFlavorName = (id: string) => flavorsList?.find(f => f.id === id)?.name || id;
  const getBrandName = (id: string) => brandsList?.find(b => b.id === id)?.name || id;


  if (loading) return <p className="text-center text-white py-20">A carregar produtos...</p>;
  if (error) return <p className="text-center text-red-500 py-20">Erro ao carregar produtos: {error.message}</p>;

  return (
    <>
      {/* Breadcrumb */}
      <div className="py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-300" aria-label="Breadcrumb">
            <span>Início</span>
            <span className="mx-2">/</span>
            <span className="text-white">Produtos</span>
          </nav>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8 text-white">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Botão de Filtro Mobile */}
          <div className="lg:hidden mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center space-x-2 bg-gray-700 px-4 py-3 rounded-lg font-medium text-white"
              >
                <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                  <div className="w-full h-0.5 bg-gray-300"></div>
                  <div className="w-full h-0.5 bg-gray-300"></div>
                  <div className="w-full h-0.5 bg-gray-300"></div>
                </div>
                <span>Filtrar e ordenar</span>
              </button>
              <span className="font-bold text-white">{filteredAndSortedProducts.length} produtos</span>
            </div>
          </div>

          {/* Modal de Filtro Mobile */}
          {showMobileFilters && (
            <div className="fixed inset-0 z-50 lg:hidden bg-gray-900 flex flex-col">
              <div className="h-full flex flex-col">
                {/* Cabeçalho */}
                <div className="px-6 py-4 border-b border-gray-700 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">Filtrar e ordenar</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-1 text-gray-300"
                    >
                      <X className="w-6 h-6 text-gray-300" />
                    </button>
                  </div>
                  <div className="text-center text-gray-400 text-sm font-normal">{filteredAndSortedProducts.length} produtos</div>
                </div>

                {/* Conteúdo do Filtro */}
                <div className="flex-1 px-6 py-0 overflow-y-auto">
                  <div className="space-y-0 divide-y divide-gray-800">
                    {/* Disponibilidade Mobile */}
                    <div className="py-6">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => { /* Toggle expand/collapse */ }}>
                        <span className="text-lg text-white font-normal">Disponibilidade</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="mt-4 space-y-2">
                        {['Em stock', 'Fora de stock'].map((option, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedAvailability.includes(option)}
                                onChange={() => handleAvailabilityChange(option)}
                              />
                              <span className="text-gray-300">{option}</span>
                            </label>
                            <span className="text-gray-500">({availabilityCounts[option] || 0})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preço Mobile */}
                    <div className="py-6">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => { /* Toggle expand/collapse */ }}>
                        <span className="text-lg text-white font-normal">Preço</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                        <div>
                          <label className="text-sm text-gray-300">De</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            className="w-full border border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                            value={minPrice}
                            onChange={(e) => handleMinPriceChange(e)}
                            aria-label="Preço mínimo"
                          />
                        </div>
                        <span className="text-gray-400 hidden sm:block">—</span>
                        <div>
                          <label className="text-sm text-gray-300">Até</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            className="w-full border border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                            value={maxPrice}
                            onChange={(e) => handleMaxPriceChange(e)}
                            aria-label="Preço máximo"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Categoria Mobile */}
                    <div className="py-6">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => { /* Toggle expand/collapse */ }}>
                        <span className="text-lg text-white font-normal">Categoria</span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="mt-4 space-y-2">
                        {categoriesList.map((category, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                className="mr-2"
                                checked={selectedCategories.includes(String(category.id))}
                                onChange={() => handleCategoryChange(String(category.id))}
                              />
                              <span className="text-gray-300">{category.name}</span>
                            </label>
                            <span className="text-gray-500">({categoryCounts[category.id] || 0})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sabor Mobile (se houver) */}
                    {flavorsList && flavorsList.length > 0 && (
                      <div className="py-6">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => { /* Toggle expand/collapse */ }}>
                          <span className="text-lg text-white font-normal">Sabor</span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mt-4 space-y-2">
                          {flavorsList.map((flavor, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={selectedFlavors.includes(String(flavor.id || ''))}
                                  onChange={() => handleFlavorChange(String(flavor.id || ''))}
                                />
                                <span className="text-gray-300">{flavor.name}</span>
                              </label>
                              <span className="text-gray-500">({flavorCounts[flavor.id || ''] || 0})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Peso Mobile (se houver) */}
                    {products.some(p => p.weight_value && p.weight_unit) && (
                      <div className="py-6">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => { /* Toggle expand/collapse */ }}>
                          <span className="text-lg text-white font-normal">Peso</span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mt-4 space-y-2">
                          {Array.from(new Set(products.map(p => p.weight_value && p.weight_unit ? `${p.weight_value}${p.weight_unit}` : '').filter(Boolean))).map((weightOption, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={selectedWeights.includes(weightOption)}
                                  onChange={() => handleWeightChange(weightOption)}
                                />
                                <span className="text-gray-300">{weightOption}</span>
                              </label>
                              <span className="text-gray-500">({weightCounts[weightOption] || 0})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Marca Mobile (se houver) */}
                    {brandsList && brandsList.length > 0 && (
                      <div className="py-6">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => { /* Toggle expand/collapse */ }}>
                          <span className="text-lg text-white font-normal">Marca</span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="mt-4 space-y-2">
                          {brandsList.map((brand, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="mr-2"
                                  checked={selectedBrands.includes(brand.id || '')}
                                  onChange={() => handleBrandChange(brand.id || '')}
                                />
                                <span className="text-gray-300">{brand.name}</span>
                              </label>
                              <span className="text-gray-500">({brandCounts[brand.id || ''] || 0})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seção de Ordenação Mobile */}
                  <div className="mt-0 pt-6 border-t border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-lg text-white font-normal">Ordenar por:</span>
                      <div className="flex items-center justify-between">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="text-gray-300 mr-2 font-normal bg-gray-700 border border-gray-600 rounded px-2 py-1"
                        >
                          <option>Alfabeticamente, A-Z</option>
                          <option>Alfabeticamente, Z-A</option>
                          <option>Preço, menor para maior</option>
                          <option>Preço, maior para menor</option>
                          <option>Data, mais recente</option>
                          <option>Data, mais antiga</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões Inferiores Mobile */}
                <div className="px-6 py-6 border-t border-gray-700 bg-gray-900 flex-shrink-0">
                  <div className="flex space-x-4">
                    <button
                      onClick={handleClearAllFilters}
                      className="flex-1 py-4 text-gray-300 font-normal bg-transparent border-b border-gray-300"
                    >
                      Remover tudo
                    </button>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="flex-1 bg-orange-500 text-white py-4 rounded-lg font-semibold text-base uppercase"
                    >
                      APLICAR
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filtros da Barra Lateral Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            {/* Modo de Visualização */}
            <div className="mb-8">
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 border ${viewMode === 'list' ? 'border-orange-500 text-orange-500' : 'border-gray-600 text-white'}`}
                  aria-label="Visualização em lista"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid2')}
                  className={`p-2 border ${viewMode === 'grid2' ? 'border-orange-500 text-orange-500' : 'border-gray-600 text-white'}`}
                  aria-label="Visualização em grade 2 colunas"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 border ${viewMode === 'grid' ? 'border-orange-500 text-orange-500' : 'border-gray-600 text-white'}`}
                  aria-label="Visualização em grade 3 colunas"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filtro de Disponibilidade Desktop */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Disponibilidade</h3>
              {['Em stock', 'Fora de stock'].map((option, index) => (
                <div key={index} className="flex items-center justify-between mb-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedAvailability.includes(option)}
                      onChange={() => handleAvailabilityChange(option)}
                    />
                    <span className="text-gray-300">{option}</span>
                  </label>
                  <span className="text-gray-500">({availabilityCounts[option] || 0})</span>
                </div>
              ))}
            </div>

            {/* Filtro de Preço Desktop */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Preço</h3>
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div>
                  <label className="text-sm text-gray-300">De</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full border border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                    value={minPrice}
                    onChange={(e) => handleMinPriceChange(e)}
                    aria-label="Preço mínimo"
                  />
                </div>
                <span className="text-gray-400 hidden sm:block">—</span>
                <div>
                  <label className="text-sm text-gray-300">Até</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full border border-gray-600 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-700 text-white"
                    value={maxPrice}
                    onChange={(e) => handleMaxPriceChange(e)}
                    aria-label="Preço máximo"
                  />
                </div>
              </div>
            </div>

            {/* Filtro de Categoria Desktop */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Categoria</h3>
              <div className="space-y-2">
                {(showAllCategories ? categoriesList : categoriesList.slice(0, 5)).map((category, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedCategories.includes(String(category.id))}
                        onChange={() => handleCategoryChange(String(category.id))}
                      />
                      <span className="text-gray-300">{category.name}</span>
                    </label>
                    <span className="text-gray-500">({categoryCounts[category.id] || 0})</span>
                  </div>
                ))}
                {categoriesList.length > 5 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full text-left text-orange-500 mt-2 font-medium hover:underline"
                  >
                    {showAllCategories ? 'Ver menos' : `Ver todas as categorias (+${categoriesList.length - 5})`}
                  </button>
                )}
              </div>
            </div>

            {/* Filtro de Sabor Desktop (com "Ver Mais") */}
            {flavorsList && flavorsList.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Sabor</h3>
                <div className="space-y-2">
                  {(showAllFlavors ? flavorsList : flavorsList.slice(0, 5)).map((flavor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={selectedFlavors.includes(String(flavor.id || ''))}
                          onChange={() => handleFlavorChange(String(flavor.id || ''))}
                        />
                        <span className="text-gray-300">{flavor.name}</span>
                      </label>
                      <span className="text-gray-500">({flavorCounts[flavor.id || ''] || 0})</span>
                    </div>
                  ))}
                  {flavorsList.length > 5 && (
                    <button
                      onClick={() => setShowAllFlavors(!showAllFlavors)}
                      className="w-full text-left text-orange-500 mt-2 font-medium hover:underline"
                    >
                      {showAllFlavors ? 'Ver menos' : `Ver todos os sabores (+${flavorsList.length - 5})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Filtro de Peso Desktop */}
            {products.some(p => p.weight_value && p.weight_unit) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Peso</h3>
                <div className="space-y-2">
                  {/* Formata o peso para não mostrar os decimais. */}
                  {
                    (showAllWeights ? Array.from(new Set(products.map(p => p.weight_value && p.weight_unit ? `${(p.weight_value || '').toString().replace(/\.0+$/, '')}${p.weight_unit}` : '').filter(Boolean))) : Array.from(new Set(products.map(p => p.weight_value && p.weight_unit ? `${(p.weight_value || '').toString().replace(/\.0+$/, '')}${p.weight_unit}` : '').filter(Boolean))).slice(0, 5))
                    .map((weightOption, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={selectedWeights.includes(weightOption)}
                            onChange={() => handleWeightChange(weightOption)}
                          />
                          <span className="text-gray-300">{weightOption}</span>
                        </label>
                        <span className="text-gray-500">({weightCounts[weightOption] || 0})</span>
                      </div>
                    ))
                  }
                  {Array.from(new Set(products.map(p => p.weight_value && p.weight_unit ? `${(p.weight_value || '').toString().replace(/\.0+$/, '')}${p.weight_unit}` : '').filter(Boolean))).length > 5 && (
                    <button
                      onClick={() => setShowAllWeights(!showAllWeights)}
                      className="w-full text-left text-orange-500 mt-2 font-medium hover:underline"
                    >
                      {showAllWeights ? 'Ver menos' : `Ver todos os pesos (+${Array.from(new Set(products.map(p => p.weight_value && p.weight_unit ? `${(p.weight_value || '').toString().replace(/\.0+$/, '')}${p.weight_unit}` : '').filter(Boolean))).length - 5})`}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Filtro de Marca Desktop */}
            {brandsList && brandsList.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Marca</h3>
                {brandsList.map((brand, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedBrands.includes(brand.id || '')}
                        onChange={() => handleBrandChange(brand.id || '')}
                      />
                      <span className="text-gray-300">{brand.name}</span>
                    </label>
                    <span className="text-gray-500">({brandCounts[brand.id || ''] || 0})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Conteúdo Principal (Produtos e Paginação) */}
          <div className="flex-1">
            {/* Cabeçalho da Lista de Produtos */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-white hidden lg:block">Produtos</h1>
              <div className="flex-1 text-right hidden lg:block">
                <span className="text-gray-300 mr-4 font-normal">{filteredAndSortedProducts.length} produtos</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-gray-300 rounded-md px-4 py-2"
                >
                  <option>Alfabeticamente, A-Z</option>
                  <option>Alfabeticamente, Z-A</option>
                  <option>Preço, menor para maior</option>
                  <option>Preço, maior para menor</option>
                  <option>Data, mais recente</option>
                  <option>Data, mais antiga</option>
                </select>
              </div>
            </div>
            {/* Div dos produtos atualizada conforme a sua solicitação */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
              viewMode === 'grid2' ? 'grid-cols-1 md:grid-cols-2' :
              'grid-cols-1'
            }`}>
              {currentProducts.map((product) => (
                <div key={product.id} className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
                  <div
                    className="relative overflow-hidden cursor-pointer"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                    onClick={() => onProductClick(product)}
                  >
                    {/* Contêiner para garantir proporção e alinhar as imagens */}
                    <div className="relative w-full h-48">
                      {/* Imagem do Produto Principal */}
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                          hoveredProduct === product.id && product.hoverImage ? 'opacity-0' : 'opacity-100'
                        }`}
                      />
                      {product.hoverImage && (
                        <img
                          src={product.hoverImage}
                          alt={`${product.name} (hover)`}
                          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                            hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      )}
                    </div>

                    {product.stock_quantity === 0 && product.stock_ginasio === 0 && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Esgotado
                      </div>
                    )}

                    {/* Overlay de Ações (aparece no hover) */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        className="p-3 bg-gray-700 text-white rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-200"
                        aria-label="Adicionar ao carrinho"
                        disabled={product.stock_quantity === 0}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                      <button 
                        className="bg-gray-600 p-2 rounded-full shadow-lg hover:bg-gray-500 border border-gray-500" 
                        aria-label="Toggle favorite"
                        onClick={(e) => toggleFavorite(product.displayVariantId, e)}
                      >
                      <Heart 
                        lassName={`w-4 h-4 transition-colors ${
                        checkIfFavorite(product.displayVariantId) ? 'text-red-500 fill-current' : 'text-gray-200'
                        }`} 
                       />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onQuickViewOpen(product); }}
                        className="p-3 bg-gray-700 text-white rounded-full hover:bg-orange-500 hover:text-white transition-colors duration-200"
                        aria-label="Visualização rápida"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Detalhes do Produto */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{product.name}</h3>
                    {product.category_name && (
                        <p className="text-sm text-gray-300 mb-1">{product.category_name}</p> 
                    )}
                    {product.brand_name && (
                        <p className="text-xs text-gray-400 mb-2">{product.brand_name}</p> 
                    )}
                    <div className="flex items-baseline mb-2">
                      <span className="text-xl font-bold text-orange-500 mr-2">€{product.price.toFixed(2)}</span>
                      {product.original_price && product.original_price > product.price && (
                          <span className="text-gray-500 line-through">€{product.original_price.toFixed(2)}</span>
                      )}
                    </div>
                    {product.rating !== undefined && (
                      <div className="flex items-center text-yellow-500">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < product.rating! ? 'fill-current' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-4 py-2 border rounded-full font-medium ${currentPage === page ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-600 text-white'}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ShopPage;