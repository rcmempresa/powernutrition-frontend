import React, { useState, useMemo, useEffect, useCallback} from 'react';
import toast from 'react-hot-toast'; 
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
  created_at?: string;
  rating?: number | string;
  reviewcount?: number;
  variants: Variant[];

  // --- Propriedades derivadas para frontend ---
  displayPrice: number;           // Preço da variante mais barata
  displayWeight: string;          // Peso da variante mais barata (ex: "1kg")
  displayVariantId: number | null;// Id da variante mais barata
  totalStock?: number;            // Soma de todas as variantes
  soldOut?: boolean;              // true se totalStock === 0
  isOutOfStock?: boolean;
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
  cart,
  onProductClick,
  onAddToCart,
  onQuickViewOpen
}) => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('Alfabeticamente, A-Z');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const { checkIfFavorite, toggleFavorite } = useFavorites();
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
    // 1. ANTES DE FILTRAR, CALCULAR AS PROPRIEDADES DERIVADAS
    let currentProducts = products.map(product => {
      // Encontra a variante com o preço mais baixo
      const cheapestVariant = product.variants.length > 0
        ? product.variants.reduce((prev, curr) => 
            parseFloat(prev.preco) < parseFloat(curr.preco) ? prev : curr
          )
        : null;

      // Soma o stock total
      const totalStock = product.variants.reduce((sum, v) => 
        sum + v.quantidade_em_stock + v.stock_ginasio, 0
      );
      
      return {
        ...product,
        displayPrice: cheapestVariant ? parseFloat(cheapestVariant.preco) : 0,
        displayWeight: cheapestVariant ? `${cheapestVariant.weight_value}${cheapestVariant.weight_unit}` : '',
        displayVariantId: cheapestVariant ? cheapestVariant.id : null,
        totalStock,
        soldOut: totalStock === 0,
        isOutOfStock: totalStock === 0,
      };
    }).filter(product => product != null);


    // 2. Filtrar por Disponibilidade
    // 1. Filtrar por Disponibilidade (Versão Corrigida e mais Clara)
    if (selectedAvailability.includes('Em stock')) {
        currentProducts = currentProducts.filter(product =>
            product.variants.some(v => v.quantidade_em_stock > 0 || v.stock_ginasio > 0)
        );
    } else if (selectedAvailability.includes('Fora de stock')) {
        currentProducts = currentProducts.filter(product =>
            !product.variants.some(v => v.quantidade_em_stock > 0 || v.stock_ginasio > 0)
        );
    }

    // 2. Filtrar por Preço
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    currentProducts = currentProducts.filter(product => {
      const price = product.displayPrice;
      const isMinPriceValid = !isNaN(min);
      const isMaxPriceValid = !isNaN(max);

      if (isMinPriceValid && isMaxPriceValid) {
        return price >= min && price <= max;
      }
      if (isMinPriceValid) {
        return price >= min;
      }
      if (isMaxPriceValid) {
        return price <= max;
      }
      return true; 
    });

    // 3. Filtrar por Categoria
    if (selectedCategories.length > 0) {
      currentProducts = currentProducts.filter(product =>
        product.category_id && selectedCategories.includes(String(product.category_id))
      );
    }


    // 5. Filtrar por Peso
    if (selectedWeights.length > 0) {
      currentProducts = currentProducts.filter(product => {
        return product.variants.some(variant => {
          const variantWeight = `${variant.weight_value}${variant.weight_unit}`;
          return selectedWeights.includes(variantWeight);
        });
      });
    }

    // 6. Filtrar por Marca
    if (selectedBrands.length > 0) {
      currentProducts = currentProducts.filter(product =>
        product.brand_id && selectedBrands.includes(String(product.brand_id))
      );
    }

    // 7. Ordenar
    currentProducts.sort((a, b) => {
      switch (sortBy) {
        case 'Alfabeticamente, A-Z':
          return a.name.localeCompare(b.name);
        case 'Alfabeticamente, Z-A':
          return b.name.localeCompare(a.name);
        case 'Preço, menor para maior':
          return a.displayPrice - b.displayPrice;
        case 'Preço, maior para menor':
          return b.displayPrice - a.displayPrice;
        case 'Data, mais recente':
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        case 'Data, mais antiga':
          const dateA_ = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB_ = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateA_ - dateB_;
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
  
  // Agrupa as variantes por produto para evitar contagens duplicadas
  const processedProducts = products.map(product => {
  let displayPrice = 0; // Preço padrão caso não haja variantes
  
  if (product.variants && product.variants.length > 0) {
    // Extrai e converte todos os preços das variantes para números
    const prices = product.variants.map(v => parseFloat(v.preco));
    // Filtra para garantir que apenas números válidos sejam considerados
    const validPrices = prices.filter(p => !isNaN(p));
    
    if (validPrices.length > 0) {
      // Encontra o preço mais baixo
      displayPrice = Math.min(...validPrices);
    }
  }

  const isOutOfStock = product.variants.every(
    (variant: any) => (variant.quantidade_em_stock || 0) === 0
  );
  

  // Define o preço original
  // Esta linha está correta e usa o `original_price`
  const originalPrice = product.original_price ? parseFloat(String(product.original_price)) : undefined;


  // Retorna um novo objeto de produto com as propriedades calculadas
  return {
    ...product,
    displayPrice: displayPrice,
    original_price: originalPrice,
    isOutOfStock,
    isAvailable: product.variants.some(v => v.quantidade_em_stock > 0 || v.stock_ginasio > 0),
    category_id: product.category_id,
    brands: [product.brand_id],
    flavors: Array.from(new Set(product.variants.map(v => v.flavor_id).filter(Boolean))),
    weights: Array.from(new Set(product.variants.map(v => `${v.weight_value}${v.weight_unit}`).filter(Boolean))),
  };
});

  processedProducts.forEach(product => {
    if (filterType === 'availability') {
      const key = product.isAvailable ? 'Em stock' : 'Fora de stock';
      counts[key] = (counts[key] || 0) + 1;
    } else if (filterType === 'category' && product.category_id) {
      counts[product.category_id] = (counts[product.category_id] || 0) + 1;
    } else if (filterType === 'flavor' && product.flavors.length > 0) {
      product.flavors.forEach(flavorId => {
        const key = String(flavorId);
        counts[key] = (counts[key] || 0) + 1;
      });
    } else if (filterType === 'weight' && product.weights.length > 0) {
      product.weights.forEach(weight => {
        counts[weight] = (counts[weight] || 0) + 1;
      });
    } else if (filterType === 'brand' && product.brands.length > 0) {
      product.brands.forEach(brandId => {
        const key = String(brandId);
        counts[key] = (counts[key] || 0) + 1;
      });
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
    

    {/*<pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: 'red' }}>
        {JSON.stringify(currentProducts[0]?.displayPrice, null, 2)}
      </pre>*/}
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
              {categoriesList.map((category, index) => (
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
              {/* Toggle para mais/menos categorias */}
              {categoriesList.length > 5 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="mt-2 text-sm text-orange-500 hover:underline"
                >
                  {showAllCategories ? 'Mostrar menos' : 'Mostrar mais'}
                </button>
              )}
            </div>

            {/* Filtro de Peso Desktop (se houver) */}
            {products.some(p => p.variants?.some(v => v.weight_value && v.weight_unit)) && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Peso</h3>
                {Array.from(new Set(products.flatMap(p => p.variants.map(v => `${v.weight_value}${v.weight_unit}`).filter(Boolean))))
                  .slice(0, showAllWeights ? undefined : 5)
                  .map((weightOption, index) => (
                    <div key={index} className="flex items-center justify-between mb-2">
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
                {Array.from(new Set(products.flatMap(p => p.variants.map(v => `${v.weight_value}${v.weight_unit}`)))).length > 5 && (
                  <button
                    onClick={() => setShowAllWeights(!showAllWeights)}
                    className="mt-2 text-sm text-orange-500 hover:underline"
                  >
                    {showAllWeights ? 'Mostrar menos' : 'Mostrar mais'}
                  </button>
                )}
              </div>
            )}

            {/* Filtro de Marca Desktop (se houver) */}
            {brandsList && brandsList.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">Marca</h3>
                {brandsList
                  .slice(0, showAllBrands ? undefined : 5)
                  .map((brand, index) => (
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
                {brandsList.length > 5 && (
                  <button
                    onClick={() => setShowAllBrands(!showAllBrands)}
                    className="mt-2 text-sm text-orange-500 hover:underline"
                  >
                    {showAllBrands ? 'Mostrar menos' : 'Mostrar mais'}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Seção Principal de Produtos */}
          <div className="flex-1">
            {/* Barra de Ordenação e Contagem Desktop */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <span className="font-bold text-lg text-white">{filteredAndSortedProducts.length} produtos</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-300">Ordenar por:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-gray-700 text-gray-300 border border-gray-600 rounded-lg px-4 py-2 pr-8 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option>Alfabeticamente, A-Z</option>
                    <option>Alfabeticamente, Z-A</option>
                    <option>Preço, menor para maior</option>
                    <option>Preço, maior para menor</option>
                    <option>Data, mais recente</option>
                    <option>Data, mais antiga</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Listagem de Produtos */}
            <div
              className={`grid gap-8 ${
                viewMode === 'list'
                  ? 'grid-cols-1'
                  : viewMode === 'grid2'
                  ? 'grid-cols-1 md:grid-cols-2'
                  : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}
            >
              {currentProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden relative group"
                  onMouseEnter={() => setHoveredProduct(String(product.id))}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Etiqueta de Fora de Stock */}
                  {product.isOutOfStock && (
                    <span className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                      FORA DE STOCK
                    </span>
                  )}

                  {/* Imagem do Produto */}
                  <div
                    className="relative cursor-pointer"
                    onClick={() => onProductClick(product)}
                  >
                    <img
                      src={
                        hoveredProduct === String(product.id) && product.hoverImage
                          ? product.hoverImage
                          : product.image_url
                      }
                      alt={product.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Botões de Ação */}
                    <div className="absolute inset-0 flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {/* Botão de Favorito */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (product.displayVariantId !== null) {
                            toggleFavorite(product.displayVariantId, e);
                          } else {
                            toast.error("Não foi possível adicionar aos favoritos. ID da variante não encontrado.");
                          }
                        }}
                        className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-colors
                          ${checkIfFavorite(product.displayVariantId) ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:text-orange-500'}`}
                        aria-label="Adicionar aos favoritos"
                      >
                        <Heart
                          size={20}
                          fill={checkIfFavorite(product.displayVariantId) ? 'currentColor' : 'none'}
                        />
                      </button>
                      
                      {/* Botão de Vista Rápida */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickViewOpen(product);
                        }}
                        className="bg-white text-gray-800 p-3 rounded-full hover:bg-orange-500 hover:text-white transition-colors"
                        aria-label="Vista Rápida"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Informações do Produto */}
                  <div className="p-4 flex flex-col items-center text-center">
                    {/* Preço e Avaliação */}
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-gray-400 font-semibold text-sm">{product.brand_name}</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-orange-500" fill="currentColor" />
                        <span className="text-xs text-gray-400 ml-1">
                          {product.rating || 'N/A'} ({product.reviewcount || 0})
                        </span>
                      </div>
                    </div>
                    
                    {/* Nome do Produto */}
                    <h3 className="text-lg font-semibold text-white mb-2 truncate w-full">
                      {product.name}
                    </h3>
                    
                    {/* Preço de Venda */}
                    <span className="text-xl font-bold text-white">
                      €{product.displayPrice.toFixed(2)}
                    </span>
                    
                    {/* Botão de Adicionar ao Carrinho */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="mt-4 w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors"
                      disabled={product.isOutOfStock}
                    >
                      <ShoppingCart className="inline-block w-5 h-5 mr-2" />
                      {product.isOutOfStock ? 'Fora de Stock' : 'Adicionar ao Carrinho'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-600 rounded-full text-white disabled:opacity-50"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-4 py-2 rounded-full ${
                      currentPage === page ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-600 rounded-full text-white disabled:opacity-50"
                  aria-label="Próxima página"
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
