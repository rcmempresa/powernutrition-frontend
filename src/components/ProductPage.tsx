import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  ChevronDown,
  ChevronUp,
  Facebook,
  Twitter,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';
import FAQItem from './FAQItem';
import Footer from '../components/FooterPage';
import axios from 'axios';

// --- Interfaces Corrigidas e mais detalhadas para as Variantes ---
interface Variant {
  id: number;
  produto_id: number;
  sabor_id?: number;
  weight_value: string;
  weight_unit: string;
  preco: string;
  quantidade_em_stock: number;
  stock_ginasio: number;
  sku: string;
  flavor_name?: string;
  image_url?: string;
}

// --- Produto Principal com Variantes ---
interface Product {
  id: number;
  name: string;
  description?: string;
  image_url: string;
  rating: string;
  reviewcount: number;
  variants: Variant[];
}

interface MyTokenPayload {
  id: number;
}

// --- Interface para as Avaliações ---
interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  username: string;
}

// --- Interface para as Props do Componente ProductPage ---
interface ProductPageProps {
  onBack: () => void;
  onAddToCart: (product: {
    variant_id: number;
    name: string;
    price: number;
    image_url: string;
    weight_value?: string;
    flavor?: string;
  }) => void;
}

// --- Componente Principal ProductPage ---
const ProductPage: React.FC<ProductPageProps> = ({ onBack, onAddToCart }) => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // --- Estados do Componente ---
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showDescription, setShowDescription] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [randomProducts, setRandomProducts] = useState<Product[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
  const [secondaryImages, setSecondaryImages] = useState<any[]>([]);

  // 💡 NOVOS ESTADOS PARA VARIANTE SELECIONADA
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  // --- Efeito para buscar Dados do Produto ---
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);
      setProduct(null);
      setSecondaryImages([]);
      setReviews([]);
      setAverageRating(0);
      setQuantity(1);

      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        const productResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar/${productId}`);
        const productData: Product = productResponse.data;

        const productWithVariants = { ...productData, variants: productData.variants || [] };
        setProduct(productWithVariants);

        if (productWithVariants.variants.length > 0) {
          const defaultVariant = productWithVariants.variants[0];
          setSelectedVariant(defaultVariant);
          
          const imagesResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product_images/byProductId/${productId}`);
          const allImages = imagesResponse.data;
          const primaryImage = allImages.find((img: any) => img.is_primary);
          const secondary = allImages.filter((img: any) => !img.is_primary);
          setSecondaryImages(secondary);
          
          setMainImageUrl(defaultVariant.image_url || primaryImage?.image_url || productData.image_url);
        } else {
          setMainImageUrl(productData.image_url);
        }

        const reviewsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/byProductId/${productId}`);
        const reviewsData = reviewsResponse.data;
        setReviews(reviewsData);
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
          setAverageRating(totalRating / reviewsData.length);
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
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/listar`);
        const allProducts: Product[] = response.data;

        const otherProducts = allProducts.filter(p => p.id !== Number(productId));
        const shuffled = otherProducts.sort(() => 0.5 - Math.random());
        setRandomProducts(shuffled.slice(0, 4));

      } catch (err) {
        console.error("Erro ao buscar produtos aleatórios:", err);
      }
    };

    fetchProductData();
    fetchRandomProducts();
  }, [productId]);

  // ✨ FUNÇÃO DE SELEÇÃO CORRIGIDA E SIMPLIFICADA ✨
  const handleSelectVariant = useCallback((variant: Variant) => {
    setSelectedVariant(variant);
    setMainImageUrl(variant.image_url || product?.image_url || null);
  }, [product]);

  const handleAddToCart = useCallback(() => {
    if (selectedVariant && product) {
      const productData = {
        variant_id: selectedVariant.id,
        name: product.name,
        price: Number(selectedVariant.preco),
        image_url: mainImageUrl || '',
        weight_value: selectedVariant.weight_value,
        flavor: selectedVariant.flavor_name,
      };
      onAddToCart(productData);
    } else {
      toast.error('Por favor, selecione uma variante do produto.');
    }
  }, [onAddToCart, selectedVariant, product, mainImageUrl]);

  const handleSubmitReview = async () => {
    const token = localStorage.getItem('authToken'); 

    if (!token) {
      toast.error('É necessário fazer login para submeter uma avaliação.');
      navigate('/login');
      return;
    }

    let userId;
    try {
      const decoded = jwtDecode<MyTokenPayload>(token);
      userId = decoded.id; 

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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/add`, {
        product_id: productId,
        user_id: userId,
        rating: userRating,
        comment: userComment,
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status !== 201) {
        throw new Error('Falha ao submeter a avaliação.');
      }

      toast.success('Avaliação submetida com sucesso!');
      setUserComment('');
      setUserRating(0);
      setShowReviewForm(false);
      const reviewsResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/byProductId/${productId}`);
      const reviewsData = reviewsResponse.data;
      setReviews(reviewsData);
      if (reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(totalRating / reviewsData.length);
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao submeter a avaliação.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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

  if (!product || !selectedVariant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Produto não encontrado ou sem variantes disponíveis.</p>
      </div>
    );
  }

  const allFlavors = [...new Map(product.variants.map(v => [v.sabor_id, v])).values()];
  const allWeights = [...new Map(product.variants.map(v => [v.weight_value, v])).values()];

  const formatWeight = (grams: string, unit: string) => {
    if (unit === 'g' && Number(grams) >= 1000) {
      return `${(Number(grams) / 1000).toFixed(1)} kg`;
    }
    return `${grams} ${unit}`;
  };

  const calculateStarPercentage = (starCount: number) => {
    const count = reviews.filter(r => r.rating === starCount).length;
    return reviews.length > 0 ? (count / reviews.length) * 100 : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              Ref: {selectedVariant.sku}
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
              € {Number(selectedVariant.preco).toFixed(2)}
            </div>

            <div className="text-sm text-gray-600">
              Apenas {selectedVariant.quantidade_em_stock + selectedVariant.stock_ginasio} itens em stock!
            </div>
            
            {allFlavors.length > 1 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-800">Sabor: {selectedVariant.flavor_name || 'N/A'}</div>
                <div className="flex flex-wrap gap-2">
                  {allFlavors.map(variant => (
                    <button
                      key={variant.sabor_id}
                      onClick={() => handleSelectVariant(variant)}
                      className={`px-3 md:px-4 py-2 border rounded text-sm md:text-base ${
                        selectedVariant.sabor_id === variant.sabor_id
                          ? 'bg-gray-800 text-white border-gray-800'
                          : 'bg-white text-gray-800 border-gray-300 hover:border-orange-500'
                      }`}
                      aria-label={`Selecionar sabor ${variant.flavor_name}`}
                    >
                      {variant.flavor_name || 'N/A'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {allWeights.length > 1 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-800">
                  Peso: {formatWeight(selectedVariant.weight_value, selectedVariant.weight_unit)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allWeights.map(variant => (
                    <button
                      key={variant.weight_value}
                      onClick={() => handleSelectVariant(variant)}
                      className={`px-3 md:px-4 py-2 border rounded text-sm md:text-base ${
                        selectedVariant.weight_value === variant.weight_value
                          ? 'bg-gray-800 text-white border-gray-800'
                          : 'bg-white text-gray-800 border-gray-300 hover:border-orange-500'
                      }`}
                      aria-label={`Selecionar peso ${variant.weight_value} ${variant.weight_unit}`}
                    >
                      {formatWeight(variant.weight_value, variant.weight_unit)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  className="bg-orange-500 text-white px-6 md:px-8 py-3 rounded font-medium hover:bg-orange-600 transition-colors flex-1 text-sm md:text-base"
                  onClick={handleAddToCart}
                >
                  ADICIONAR AO CARRINHO
                </button>
              </div>
            </div>

            <button
              className="w-full bg-orange-600 text-white py-3 rounded font-medium hover:bg-orange-700 transition-colors text-sm md:text-base"
              onClick={() => {
                handleAddToCart();
                navigate('/checkout');
              }}
            >
              COMPRAR AGORA
            </button>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Checkout seguro garantido</div>
              <div className="flex justify-center flex-wrap gap-2">
                <img src="/cartao.png" alt="Visa" className="w-10 h-6 object-contain" />
                <img src="/mbway.png" alt="Mastercard" className="w-10 h-6 object-contain" />
                <img src="/multibanco.png" alt="PayPal" className="w-10 h-6 object-contain" />
              </div>
            </div>

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

            <div className="flex items-center space-x-4 pt-4 border-t">
              <Facebook className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-700" />
              <Twitter className="w-5 h-5 text-blue-400 cursor-pointer hover:text-blue-500" />
              <Share2 className="w-5 h-5 text-gray-600 cursor-pointer hover:text-gray-700" />
              <span className="text-sm text-gray-600">Partilhar mais</span>
            </div>
          </div>
        </div>

        <div className="mt-8 lg:mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-8">Avaliações de Clientes</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
              {reviews.length > 0 ? (
                reviews.map(review => (
                  <div key={review.id} className="bg-white rounded-lg p-6 border mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold">
                        {review.username ? review.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {review.username}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-orange-500 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
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

        <div className="mt-8 lg:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex justify-center relative bg-gradient-to-r from-orange-400 to-yellow-400 rounded-2xl p-4 overflow-hidden">
            <video
              controls={false}
              loop
              autoPlay
              muted
              className="w-full h-80 lg:h-[400px] object-cover rounded-lg shadow-lg"
            >
              <source src="https://res.cloudinary.com/dheovknbt/video/upload/v1756742429/Loja_kcg9uj.mp4" type="video/mp4" />
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
                    <div className="relative w-full pb-[100%]">
                      <img
                        src={relatedProduct.variants[0]?.image_url || relatedProduct.image_url}
                        alt={relatedProduct.name}
                        className="absolute inset-0 w-full h-full object-contain rounded-lg mb-4"
                      />
                    </div>
                  </div>
                  <div className="flex mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(Number(relatedProduct.rating) || 0) ? 'text-orange-500 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{relatedProduct.name}</h3>
                  <p className="text-orange-500 font-bold text-lg md:text-xl">
                    € {Number(relatedProduct.variants[0]?.preco).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 lg:mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6">
              <div className="text-gray-600 uppercase font-semibold text-sm tracking-wide">
                Perguntas Frequentes
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Tem Alguma Questão?
              </h2>
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
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductPage;