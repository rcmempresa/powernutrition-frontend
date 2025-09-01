import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Heart,
  Eye,
  ShoppingCart,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Share2,
  Play,
  Instagram,
  MapPin,
  User,
  ArrowRight,
  StepForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; // 👈 Importar para animações
import toast from 'react-hot-toast'; // 👈 Importar para notificações
import { jwtDecode } from 'jwt-decode';
import FAQItem from './FAQItem';
import Footer from '../components/FooterPage';

// --- Interface para o Produto ---
interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  rating: number; // Nota média
  reviewCount: number; // Contagem total
  stock: number;
  flavor_id: string;
  image_url: string;
  description?: string;
  weight_value: string;
  available_weight_values?: string[];
  original_price?: number;
}

interface MyTokenPayload {
  id: number;
}

// 👈 NOVA INTERFACE: Para as avaliações
interface Review {
  id: string;
  user_id: string; // Usar o ID do utilizador (pode ser o nome para simplificar)
  rating: number;
  comment: string;
  created_at: string;
  username: string;
}

// --- Interface para as Props do Componente ProductPage ---
interface ProductPageProps {
  onBack: () => void;
  onAddToCart: (product: {
    id: string;
    name: string;
    price: number;
    image: string;
    weight_value?: string;
    flavor?: string;
  }, quantity: number) => void;
}

// --- Componente Principal ProductPage ---
const ProductPage: React.FC<ProductPageProps> = ({ onBack, onAddToCart }) => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- Estados do Componente ---
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeightValue, setSelectedWeightValue] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [flavorName, setFlavorName] = useState<string | null>(null);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [secondaryImages, setSecondaryImages] = useState<any[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);

  // 👈 NOVOS ESTADOS PARA AVALIAÇÕES
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // --- Efeito para buscar Dados do Produto, Imagens, Sabor e Avaliações ---
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      setFlavorName(null);
      setSecondaryImages([]);
      setReviews([]);
      setAverageRating(0);
      setQuantity(1);

      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        // 1. Buscar dados do produto principal
        const productResponse = await fetch(`http://localhost:3000/api/products/listar/${productId}`);
        if (!productResponse.ok) {
          throw new Error(`Erro HTTP ao buscar produto! Status: ${productResponse.status}`);
        }
        const productData: any = await productResponse.json();
        setProduct(productData);
        setSelectedWeightValue(productData.weight_value);
        setMainImageUrl(productData.image_url);

        // 2. Buscar todas as imagens do produto
        const imagesResponse = await fetch(`http://localhost:3000/api/product_images/byProductId/${productId}`);
        if (!imagesResponse.ok) {
          throw new Error(`Erro HTTP ao buscar imagens! Status: ${imagesResponse.status}`);
        }
        const allImages = await imagesResponse.json();
        const primaryImage = allImages.find((img: any) => img.is_primary);
        const secondary = allImages.filter((img: any) => !img.is_primary);
        
        if (primaryImage && primaryImage.image_url !== productData.image_url) {
          setProduct({...productData, image_url: primaryImage.image_url});
          setMainImageUrl(primaryImage.image_url);
        }
        setSecondaryImages(secondary);

        // 3. Se houver flavor_id, buscar o nome do sabor
        if (productData.flavor_id) {
          const flavorResponse = await fetch(`http://localhost:3000/api/flavors/listar/${productData.flavor_id}`);
          if (!flavorResponse.ok) {
            console.warn(`Erro HTTP ao buscar sabor para ID ${productData.flavor_id}. Status: ${flavorResponse.status}`);
            setFlavorName('Desconhecido');
          } else {
            const flavorData = await flavorResponse.json();
            setFlavorName(flavorData.name);
          }
        } else {
          setFlavorName('N/A');
        }

        // 4. 👈 NOVO: Buscar avaliações do produto
        const reviewsResponse = await fetch(`http://localhost:3000/api/reviews/byProductId/${productId}`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          setReviews(reviewsData);
          if (reviewsData.length > 0) {
            const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
            setAverageRating(totalRating / reviewsData.length);
          }
        }

      } catch (err: any) {
        console.error("Erro ao buscar dados do produto:", err);
        setError(`Não foi possível carregar os detalhes do produto: ${err.message || 'Erro desconhecido'}`);
      } finally {
        setLoading(false);
      }
    };

    const fetchRandomProducts = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/products/listar');
        if (!response.ok) {
          throw new Error('Erro ao buscar a lista de produtos.');
        }
        const allProducts: Product[] = await response.json();

        const otherProducts = allProducts.filter(p => p.id !== productId);
        const shuffled = otherProducts.sort(() => 0.5 - Math.random());
        setRandomProducts(shuffled.slice(0, 4));

      } catch (err) {
        console.error("Erro ao buscar produtos aleatórios:", err);
      }
    };

    fetchProductData();
    fetchRandomProducts();
  }, [productId]);

  // 👈 NOVA FUNÇÃO: Submeter avaliação
 const handleSubmitReview = async () => {
  const token = localStorage.getItem('authToken'); 

  if (!token) {
    toast.error('É necessário fazer login para submeter uma avaliação.');
    navigate('/login');
    return;
  }

  let userId;
  try {
    // Decodifica o token usando a sua nova interface personalizada
    const decoded = jwtDecode<MyTokenPayload>(token);
    userId = decoded.id; // 👈 Use 'decoded.id' para aceder ao valor

    if (!userId) {
      throw new Error('ID do utilizador não encontrado no token.');
    }
  } catch (error) {
    console.error('Erro ao decodificar o token:', error);
    toast.error('Sessão inválida. Por favor, faça login novamente.');
    navigate('/login');
    return;
  }

  if (!userComment || userRating === 0) {
    toast.error('Por favor, preencha a avaliação e a nota.');
    return;
  }
  setIsSubmittingReview(true);

  try {
    const response = await fetch('http://localhost:3000/api/reviews/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        product_id: productId,
        user_id: userId,
        rating: userRating,
        comment: userComment,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha ao submeter a avaliação.');
    }

    toast.success('Avaliação submetida com sucesso!');
    setUserComment('');
    setUserRating(0);
    setShowReviewForm(false);
    // Re-fetch reviews para atualizar a lista
    const reviewsResponse = await fetch(`http://localhost:3000/api/reviews/byProductId/${productId}`);
    if (reviewsResponse.ok) {
      const reviewsData = await reviewsResponse.json();
      setReviews(reviewsData);
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(totalRating / reviewsData.length);
      }
    }
  } catch (err) {
    toast.error(err.message || 'Erro ao submeter a avaliação.');
  } finally {
    setIsSubmittingReview(false);
  }
};

  // --- Renderização Condicional de Estados de Carregamento/Erro/Ausência de Produto ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Carregando produto...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-lg">Erro: {error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Produto não encontrado.</p>
      </div>
    );
  }

  const weightsToDisplay = (product.available_weight_values && product.available_weight_values.length > 0)
    ? product.available_weight_values
    : [product.weight_value];

  // Função auxiliar para formatar o peso
  const formatWeight = (grams) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)} kg`;
    } else {
      return `${grams} g`;
    }
  };
  
  // 👈 Função para calcular a percentagem de estrelas para o resumo
  const calculateStarPercentage = (starCount) => {
    const count = reviews.filter(r => r.rating === starCount).length;
    return reviews.length > 0 ? (count / reviews.length) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white py-4 px-4 border-b">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
            <button onClick={onBack} className="hover:text-orange-500">Início</button>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
<div className="space-y-4">
  <div className="bg-white rounded-2xl p-8 border">
    {mainImageUrl ? (
      <img
        src={mainImageUrl}
        alt={product.name}
        className="w-full h-64 md:h-80 lg:h-96 object-contain rounded-lg"
      />
    ) : (
      <div className="w-full h-64 md:h-80 lg:h-96 flex items-center justify-center bg-gray-200 text-gray-500 rounded-lg">
        Imagem indisponível
      </div>
    )}
  </div>
  
  {/* Galeria de Imagens Secundárias */}
  {secondaryImages.length > 0 && (
    <div className="flex space-x-2 overflow-x-auto p-2 -m-2">
      {secondaryImages.map((image, index) => (
        <div
          key={index}
          className={`w-32 h-32 flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all ${
            mainImageUrl === image.image_url ? 'border-orange-500' : 'border-transparent hover:border-gray-300'
          }`}
          onClick={() => setMainImageUrl(image.image_url)}
        >
          <img
            src={image.image_url}
            alt={`Imagem secundária ${index + 1}`}
            className="w-full h-full object-contain"
          />
        </div>
      ))}
    </div>
  )}
</div>

          {/* Product Details */}
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              Ref: {product.sku}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex" role="img" aria-label={`${averageRating.toFixed(1)} de 5 estrelas`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-orange-500 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">({reviews.length})</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

            <div className="text-2xl md:text-3xl font-bold text-orange-500">
              € {(Number(product.price) || 0).toFixed(2)}
            </div>

            <div className="text-sm text-gray-600">
              Apenas {product.stock} itens em stock!
            </div>

            {/* Flavor */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-800">Sabor: {flavorName || 'Carregando...'}</div>
            </div>

            {/* Weight Value Selection */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-800">
                Peso: {formatWeight(selectedWeightValue)}
              </div>
              <div className="flex flex-wrap gap-2">
                {weightsToDisplay.map((value) => (
                  <button
                    key={value}
                    onClick={() => setSelectedWeightValue(value)}
                    className={`px-3 md:px-4 py-2 border rounded text-sm md:text-base ${
                      selectedWeightValue === value
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-800 border-gray-300 hover:border-orange-500'
                    }`}
                    aria-label={`Selecionar peso ${value} g`}
                  >
                    {formatWeight(value)}
                  </button>
                ))}
              </div>
            </div>

            {/* Botão Adicionar ao Carrinho */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  className="bg-orange-500 text-white px-6 md:px-8 py-3 rounded font-medium hover:bg-orange-600 transition-colors flex-1 text-sm md:text-base"
                  onClick={() => onAddToCart({
                    id: product.id,
                    name: product.name,
                    price: Number(product.price) || 0,
                    image: product.image_url || '',
                    weight_value: selectedWeightValue,
                    flavor: flavorName || product.flavor_id
                  }, quantity)}
                >
                  ADICIONAR AO CARRINHO
                </button>
              </div>
            </div>

            {/* Botão Comprar Agora */}
            <button
              className="w-full bg-orange-600 text-white py-3 rounded font-medium hover:bg-orange-700 transition-colors text-sm md:text-base"
              onClick={() => {
                onAddToCart({
                  id: product.id,
                  name: product.name,
                  price: Number(product.price) || 0,
                  image: product.image_url || '',
                  weight_value: selectedWeightValue,
                  flavor: flavorName || product.flavor_id
                }, quantity);
                navigate('/checkout');
              }}
            >
              COMPRAR AGORA
            </button>

            {/* Guaranteed Safe Checkout */}
            <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">Checkout seguro garantido</div>
            <div className="flex justify-center flex-wrap gap-2">
              {/* Substitua estas linhas pelas tags <img> com os seus URLs */}
              <img
                src="/cartao.png" 
                alt="Visa"
                className="w-10 h-6 object-contain"
              />
              <img
                src="/mbway.png"
                alt="Mastercard"
                className="w-10 h-6 object-contain"
              />
              <img
                src="/multibanco.png"
                alt="PayPal"
                className="w-10 h-6 object-contain"
              />
              {/* Adicione mais imagens aqui, se necessário */}
            </div>
          </div>

            {/* Product Description */}
            <div className="border-t pt-6">
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-medium text-gray-800">Descrição do Produto</span>
                {showDescription ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showDescription && (
                <div className="mt-4 text-gray-600 text-sm leading-relaxed">
                  {product.description ? (
                    <p>{product.description}</p>
                  ) : (
                    <p>A descrição deste produto não está disponível no momento.</p>
                  )}
                </div>
              )}
            </div>

            {/* Privacy Policy */}
            <div className="border-t pt-4">
              <button
                onClick={() => setShowPrivacy(!showPrivacy)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="font-medium text-gray-800">A Nossa Política de Privacidade</span>
                {showPrivacy ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {showPrivacy && (
                <div className="mt-4 text-gray-600 text-sm leading-relaxed">
                  <p>Estamos comprometidos em proteger a sua privacidade e garantir a segurança das suas informações pessoais. A nossa política de privacidade descreve como recolhemos, usamos e protegemos os seus dados.</p>
                </div>
              )}
            </div>

            {/* Social Share */}
            <div className="flex items-center space-x-4 pt-4 border-t">
              <Facebook className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-700" />
              <Twitter className="w-5 h-5 text-blue-400 cursor-pointer hover:text-blue-500" />
              <Share2 className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-700" />
              <span className="text-sm text-gray-600">Partilhar mais</span>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-8 lg:mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8">Avaliações de Clientes</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Review Summary */}
            <div className="bg-white rounded-lg p-6 border">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-2">{(averageRating).toFixed(1)}</div>
                <div className="flex justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(averageRating) ? 'text-orange-500 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <div className="text-sm text-gray-600">{reviews.length} Avaliações</div>
              </div>

              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => (
                  <div key={stars} className="flex items-center space-x-2">
                    <span className="text-sm">{stars}</span>
                    <Star className="w-3 h-3 text-orange-500 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${calculateStarPercentage(stars)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {reviews.filter(r => r.rating === stars).length}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="w-full mt-6 bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Escrever avaliação
              </button>
            </div>

            {/* Review Filters & List */}
            <div className="lg:col-span-2">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4 mb-6">
                <span className="text-sm font-medium">Avaliações com comentários</span>
                <div className="flex flex-wrap gap-2">
                  <button className="px-3 py-1 bg-gray-800 text-white rounded text-sm">Todas</button>
                </div>
                <div className="flex items-center space-x-2 md:ml-auto">
                  <span className="text-sm">Ordenar por</span>
                  <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option>Mais úteis</option>
                    <option>Mais recentes</option>
                    <option>Mais antigas</option>
                  </select>
                </div>
              </div>

              {/* 👈 NOVO: Formulário de avaliação */}
              <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-100 rounded-lg p-6 border mb-6"
                  >
                    <h3 className="text-lg font-bold mb-4">Escrever a sua Avaliação</h3>
                    <div className="space-y-4">
                      {/* Seletor de Estrelas */}
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-medium">Sua nota:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 cursor-pointer ${userRating >= star ? 'text-orange-500 fill-current' : 'text-gray-400'}`}
                            onClick={() => setUserRating(star)}
                          />
                        ))}
                      </div>
                      {/* Campo de Comentário */}
                      <textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Escreva o seu comentário aqui..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowReviewForm(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview}
                          className={`px-4 py-2 text-white rounded-lg transition-colors ${isSubmittingReview ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                          {isSubmittingReview ? 'A Submeter...' : 'Submeter Avaliação'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 👈 LISTA DINÂMICA DE AVALIAÇÕES */}
              {reviews.length > 0 ? (
  reviews.map(review => (
    <div key={review.id} className="bg-white rounded-lg p-6 border mb-4">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
          {/* Exibe a primeira letra do username */}
          {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
        </div>
        <div className="flex-1">
          <div className="font-medium text-gray-800">
            {/* Exibe o nome de utilizador */}
            {review.username}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-orange-500 fill-current' : 'text-gray-300'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {/* Formata a data de submissão */}
              {new Date(review.created_at).toLocaleDateString('pt-PT')}
            </span>
          </div>
          <div className="mt-2 text-gray-800 font-medium">{review.comment.substring(0, 50)}...</div>
          <div className="mt-1 text-gray-600">{review.comment}</div>
          <div className="flex items-center space-x-4 mt-4">
            <button className="text-sm text-gray-600 hover:text-gray-800">👍 (0)</button>
            <button className="text-sm text-gray-600 hover:text-gray-800">Reportar</button>
          </div>
        </div>
      </div>
    </div>
  ))
) : (
  <div className="bg-white rounded-lg p-6 border text-center text-gray-500">
    Ainda não há avaliações para este produto. Seja o primeiro a escrever uma!
  </div>
)}
            </div>
          </div>
        </div>
        {/* Why Choose Us Section */}
        <div className="mt-8 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
    <div className="flex justify-center relative bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl p-4 overflow-hidden">
      <video
        controls={false}
        loop
        autoPlay
        muted
        className="w-full h-80 lg:h-[400px] object-cover rounded-lg shadow-lg"
      >
        <source src="/Loja.mp4" type="video/mp4" />
        O teu navegador não suporta a tag de vídeo.
      </video>
    </div>
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Porquê Escolher-nos?</h2>
      <p className="text-gray-600 leading-relaxed">
        Acreditamos que se colhe o que se semeia — é por isso que os nossos produtos são feitos com os mais altos padrões de qualidade.
      </p>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Qualidade Premium</h3>
          <p className="text-gray-600">
            Apresentamos as nossas vitaminas e suplementos de alta qualidade com um design limpo e profissional que constrói confiança.
          </p>
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Confiança & Transparência</h3>
          <p className="text-gray-600">
            Destacamos ingredientes, benefícios e certificações claramente, garantindo confiança em cada compra.
          </p>
        </div>
      </div>
    </div>
</div>
        {/* You May Also Like (agora dinâmico com a API e navegação) */}
        {randomProducts.length > 0 && (
          <div className="mt-8 lg:mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-8 lg:mb-12">Pode Também Gostar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {randomProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/produto/${relatedProduct.id}`)}
                >
                  <div className="bg-white rounded-2xl p-8 mb-4 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all border border-gray-200">
                    <div className="relative w-full pb-[100%]"> {/* Esta div tem uma proporção de 1:1 (quadrada) */}
                      <img
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="absolute inset-0 w-full h-full object-contain rounded-lg mb-4"
                      />
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (relatedProduct.rating || 0) ? 'text-orange-500 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{relatedProduct.name}</h3>
                  <p className="text-orange-500 font-bold text-lg md:text-xl">
                    € {(Number(relatedProduct.price) || 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* --- Secção de Perguntas Frequentes (FAQ) --- */}
<div className="mt-8 lg:mt-16">
  <div className="max-w-7xl mx-auto px-4"> {/* Adicione este container */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Conteúdo da esquerda (Perguntas e Respostas) */}
      <div className="space-y-6">
        <div className="text-gray-600 uppercase font-semibold text-sm tracking-wide">
          Perguntas Frequentes
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
          Tem Alguma Questão?
        </h2>

        {/* Item de Acordeão para cada pergunta */}
        <FAQItem
          question="Como escolho as vitaminas certas para mim?"
          answer="Recomendamos consultar um profissional de saúde para determinar quais vitaminas ou suplementos melhor se adaptam às suas necessidades."
        />
        <FAQItem
          question="As suas vitaminas são certificadas e seguras para usar?"
          answer="Sim, os nossos produtos são submetidos a rigorosos testes de qualidade e certificação para garantir que são seguros e eficazes. A nossa prioridade é a sua saúde e bem-estar."
        />
        <FAQItem
          question="Quanto tempo leva para ver resultados?"
          answer="Os resultados podem variar dependendo do produto, da sua condição de saúde individual e do seu estilo de vida. A consistência é fundamental. Consulte a descrição do produto para obter informações mais detalhadas."
        />
      </div>

      {/* Conteúdo da direita (Imagem e CTA) */}
      <div className="relative p-6 rounded-2xl bg-blue-100 flex flex-col justify-end min-h-[300px] lg:min-h-[450px] overflow-hidden">
        <img
          src="/suplementos_1.jpg"
          alt="Vitamins and supplements"
          className="absolute inset-0 w-full h-full object-cover rounded-2xl"
          style={{ zIndex: 0 }}
        />
        <div className="absolute inset-0 bg-blue-400/20 rounded-2xl" style={{ zIndex: 1 }}></div>

        <div className="relative z-10 p-6 bg-white rounded-lg shadow-xl text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
            Ainda Tem Questões?
          </h3>
          <p className="text-gray-600 mb-4">
            Sinta-se à vontade para nos fazer qualquer pergunta!
          </p>
          <a
            href="/contacto"
            className="inline-block bg-orange-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            CLIQUE PARA AJUDA
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
      <Footer />
    </div>
  );
};

export default ProductPage;