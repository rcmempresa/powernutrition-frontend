import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  CreditCard,
  Truck,
  ArrowRight,
  Twitter,
  Instagram,
  Facebook,
  MapPin,
  User
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/FooterPage';

interface CheckoutPageProps {
  items: Array<{
    id: string;
    product_name: string;
    price: number;
    quantity: number;
    image_url: string;
    weight_value: string;
    color?: string;
    original_price?: number;
    product_id: number; // Adicione esta propriedade
  }>;
  onBack: () => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ items, onBack }) => {

  console.log('Dados de items recebidos no CheckoutPage:', items);
  
  const STORE_ADDRESS_ID = 1; 
  const BEFIT_ADDRESS_ID = 2; 

  const defaultStoreAddress = {
    address: 'Caminho do Poço Barral Nº28',
    apartment: '28',
    postalCode: '9000-222',
    city: 'Funchal',
    region: 'Madeira',
    country: 'Portugal',
  };

  const defaultBefitAddress = {
    address: 'Avenida BEFIT, 456',
    apartment: 'Escritório 10',
    postalCode: '9020-123',
    city: 'Santa Cruz',
    region: 'Madeira',
    country: 'Portugal',
  };

  const subtotal = items.reduce((sum, item) => {
    const priceToUse = item.original_price != null && item.original_price > item.price
        ? item.original_price
        : item.price;
    return sum + (priceToUse * item.quantity);
  }, 0);    
  
  const shipping = 0; 

  const [formData, setFormData] = useState({
    email: '',
    phone:'',
    emailOffers: false,
    country: 'Portugal',
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    postalCode: '',
    city: '',
    region: 'Madeira',
    saveInfo: false,
    paymentMethod: 'credit',
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    nameOnCard: '',
    useShippingAddress: true,
    cashOnDelivery: false
  });

  const [selectedAddressOption, setSelectedAddressOption] = useState<'custom' | 'store' | 'befit'>('custom');
  const [paymentMethod, setPaymentMethod] = useState<'mbway' | 'multibanco' | 'cc' | 'cod'>('cc');
  
  // NOVOS ESTADOS PARA MÚLTIPLOS CUPÕES
  const [couponCodes, setCouponCodes] = useState([]);
  const [currentCouponCode, setCurrentCouponCode] = useState('');

  const [isProcessing, setIsProcessing] = useState(false); 
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [discountApplied, setDiscountApplied] = useState(0);
  const [finalTotal, setFinalTotal] = useState(subtotal + shipping);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue = value;

    if (name === 'phone') {
      newValue = value.replace(/[^0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : newValue
    }));
  };

  const handleAddCoupon = () => {
    if (currentCouponCode && !couponCodes.includes(currentCouponCode)) {
      setCouponCodes([...couponCodes, currentCouponCode]);
      setCurrentCouponCode(''); 
      toast.success(`Cupão "${currentCouponCode}" adicionado. Clique em 'Aplicar Cupões' para calcular o desconto.`);
    } else if (couponCodes.includes(currentCouponCode)) {
      toast.warn('Este cupão já foi adicionado.');
    } else {
      toast.warn('Por favor, insira um código de cupão.');
    }
  };

  // NOVA FUNÇÃO handleApplyCoupon
  const handleApplyCoupon = async () => {
    if (couponCodes.length === 0) {
      toast.warn('Por favor, adicione pelo menos um cupão para aplicar.');
      return;
    }
    setIsApplyingCoupon(true);

    try {
      const applyCouponPayload = {
        couponCodes: couponCodes,
        items: items.map(item => ({
          price: item.price,
          quantity: item.quantity,
          original_price: item.original_price, 
          product_id: item.product_id, 
        })),
      };

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cupoes/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(applyCouponPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao aplicar o(s) cupão(ões).');
      }

      const result = await response.json();
      
      setDiscountApplied(result.discount);
      setFinalTotal(result.newTotal);

      toast.success(`Cupões aplicados com sucesso! Desconto total de €${result.discount.toFixed(2)}.`);
    } catch (error) {
      console.error('Erro ao aplicar cupão:', error);
      
      setDiscountApplied(0);
      setFinalTotal(subtotal + shipping);
      setCouponCodes([]); // Limpa a lista de cupões se der erro
      setCurrentCouponCode('');
      
      toast.error(error.message || 'Erro ao aplicar o(s) cupão(ões).');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleAddressOptionChange = (option: 'custom' | 'store' | 'befit') => {
    setSelectedAddressOption(option);
    if (option === 'store') {
      setFormData(prev => ({
        ...prev,
        ...defaultStoreAddress
      }));
    } else if (option === 'befit') {
      setFormData(prev => ({
        ...prev,
        ...defaultBefitAddress
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        address: '',
        apartment: '',
        postalCode: '',
        city: '',
        region: 'Madeira',
        country: 'Portugal',
      }));
    }
  };

  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    let finalAddressId = null;
    let finalShippingAddress = null; 

    const yourAuthToken = localStorage.getItem('authToken');

    if (!yourAuthToken) {
        toast.error(
            <div>
                Erro: Token de autenticação não encontrado.
                <br />
                <button onClick={handleLogin}>Fazer login</button>
            </div>
        );
        setIsProcessing(false);
        return;
    }

    try {
        if (selectedAddressOption === 'custom') {
            finalShippingAddress = {
                address_line1: formData.address,
                address_line2: formData.apartment,
                city: formData.city,
                state_province: formData.region,
                postal_code: formData.postalCode,
                country: formData.country,
                address_type: "residencial"
            };
        } else if (selectedAddressOption === 'store') {
            finalShippingAddress = {
                address_line1: 'Caminho do Poço Barral Nº28',
                address_line2: 'Caminho do Poço Barral Nº28',
                city: 'Funchal',
                state_province: 'Madeira',
                postal_code: '9020-222',
                country: 'Portugal',
                address_type: "store"
            };
        } else if (selectedAddressOption === 'befit') {
            finalShippingAddress = {
                address_line1: 'Avenida BEFIT, 456',
                address_line2: 'Escritório 10',
                city: 'Santa Cruz',
                state_province: 'Madeira',
                postal_code: '9020-123',
                country: 'Portugal',
                address_type: "befit"
            };
        }

        const addressResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/addresses/morada`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${yourAuthToken}`
            },
            body: JSON.stringify(finalShippingAddress), 
        });

        if (!addressResponse.ok) {
            const errorData = await addressResponse.json();
            throw new Error(`${errorData.message || 'Erro ao criar morada de envio.'}`);
        }

        const newAddress = await addressResponse.json();
        finalAddressId = newAddress.id;

        if (!finalAddressId) {
            throw new Error('Não foi possível determinar o ID da morada para o checkout.');
        }

        let paymentDetails = null;
        
        if (paymentMethod === 'mbway') {
            const paymentPayload = {
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    phone_indicative: '+351',
                    key: 'POWERNUTRITION',
                },
                key: `order_${Date.now()}`,
                value: finalTotal,
                capture: {
                    descriptive: 'Pagamento da encomenda MBWay RD Power Nutrition',
                    transaction_key: `transaction_${Date.now()}`,
                },
            };

            const paymentResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/referencia/mbway/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify(paymentPayload),
            });

            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                throw new Error(`Erro ao gerar referência MBWay: ${errorData.error || paymentResponse.statusText}`);
            }

            const paymentConfirmation = await paymentResponse.json();
            
            paymentDetails = {
                method: 'mbway',
                payment_id: paymentConfirmation.id,
            };
            
            toast.success(`Pagamento MBWay iniciado com sucesso! Por favor, confirme na app.`);
            
        } 
        
        else if (paymentMethod === 'multibanco') {
            const paymentPayload = {
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phone: formData.phone,
                    phone_indicative: '+351',
                    key: 'POWERNUTRITION',
                },
                key: `order_${Date.now()}`,
                value: finalTotal,
                capture: {
                    descriptive: 'Pagamento da encomenda Multibanco RD Power Nutrition',
                    transaction_key: `transaction_${Date.now()}`,
                },
            };

            const paymentResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/referencia/multibanco/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify(paymentPayload),
            });

            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                throw new Error(`Erro ao gerar referência Multibanco: ${errorData.error || paymentResponse.statusText}`);
            }

            const paymentConfirmation = await paymentResponse.json();
            
            paymentDetails = {
                method: 'multibanco',
                payment_id: paymentConfirmation.id, 
                entity: paymentConfirmation.method.entity,
                reference: paymentConfirmation.method.reference,
            };

            toast.success(`Pagamento Multibanco gerado com sucesso! Entidade: ${paymentDetails.entity}, Referência: ${paymentDetails.reference}`);
        }
        
        else if (paymentMethod === 'cc') {
            const paymentPayload = {
                customer: {
                      name: `${formData.firstName} ${formData.lastName}`,
                      email: formData.email,
                      phone: formData.phone,
                      phone_indicative: '+351', 
                      key: "POWERNUTRITION", 
                  },
                  key: `order_${Date.now()}`,
                  value: finalTotal, 
                  capture: {
                      descriptive: 'Pagamento da encomenda com Cartão de Crédito',
                      transaction_key: `transaction_${Date.now()}`,
                  }
              };


            const paymentResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/referencia/cc/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${yourAuthToken}`
                },
                body: JSON.stringify(paymentPayload),
            });

            if (!paymentResponse.ok) {
                const errorData = await paymentResponse.json();
                throw new Error(`Erro ao processar pagamento com cartão: ${errorData.error || paymentResponse.statusText}`);
            }

            const paymentConfirmation = await paymentResponse.json();
            
            paymentDetails = {
                method: 'credit_card',
                payment_id: paymentConfirmation.id, 
                url: paymentConfirmation.method.url, 
            };

            toast.success(`Pagamento CC gerado com sucesso! Entidade: ${paymentDetails.url}`);
        }

        const checkoutPayload = {
            addressId: finalAddressId,
            couponCode: couponCodes, // Alterado para enviar a array de códigos
            email: formData.email,
            paymentMethod: paymentMethod, 
            paymentDetails: paymentDetails, 
        };
        console.log("Payload de Checkout a ser enviado:", checkoutPayload);

        const checkoutResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${yourAuthToken}`
            },
            body: JSON.stringify(checkoutPayload),
        });

        if (!checkoutResponse.ok) {
            const errorData = await checkoutResponse.json();
            console.error("Erro na resposta do Checkout:", errorData);
            throw new Error(`Erro ao finalizar encomenda: ${errorData.message || checkoutResponse.statusText}`);
        }
        console.log("Resposta do servidor de Checkout recebida com sucesso.");

        const orderConfirmation = await checkoutResponse.json();
        console.log("Confirmação da Encomenda:", orderConfirmation);

        toast.success(`Encomenda realizada com sucesso! ID da Encomenda: ${orderConfirmation.orderId}.`);
        
        navigate('/order-confirmation', {
            state: {
                orderId: orderConfirmation.orderId,
                paymentMethod: paymentMethod,
                paymentDetails: paymentDetails, 
                total_price: finalTotal,
                shipping_address: finalShippingAddress
            }
        });

    } catch (error) {
        console.error('Erro no checkout:', error);
        toast.error(error.message || 'Ocorreu um erro inesperado.');
    } finally {
        setIsProcessing(false);
    }
};
  
  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Forms */}
          <div className="space-y-8">
            {/* Contact Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Contacto</h2>
              <div className="space-y-4">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Número de telefone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                  <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailOffers"
                    checked={formData.emailOffers}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Enviem-me notícias e ofertas por email</span>
                </label>
              </div>
            </div>

            {/* Delivery Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Entrega</h2>
              <div className="space-y-4">
                {/* Address Options */}
                <div className="flex items-center space-x-6 mb-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="addressOption"
                      value="store"
                      checked={selectedAddressOption === 'store'}
                      onChange={() => handleAddressOptionChange('store')}
                      className="mr-2 w-4 h-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-700 font-medium">Morada da Loja</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="addressOption"
                      value="befit"
                      checked={selectedAddressOption === 'befit'}
                      onChange={() => handleAddressOptionChange('befit')}
                      className="mr-2 w-4 h-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-700 font-medium">Morada BEFIT</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="addressOption"
                      value="custom"
                      checked={selectedAddressOption === 'custom'}
                      onChange={() => handleAddressOptionChange('custom')}
                      className="mr-2 w-4 h-4 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-gray-700 font-medium">Outra Morada</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País/Região
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={selectedAddressOption !== 'custom'}
                  >
                    <option value="Portugal">Portugal</option>
                    <option value="Spain">Espanha</option>
                    <option value="France">França</option>
                    <option value="Germany">Alemanha</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Primeiro nome (opcional)"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Último nome"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Morada"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={selectedAddressOption !== 'custom'}
                />

                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  placeholder="Apartamento, andar, etc. (opcional)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  disabled={selectedAddressOption !== 'custom'}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Código postal"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={selectedAddressOption !== 'custom'}
                  />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Cidade"
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={selectedAddressOption !== 'custom'}
                  />
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    disabled={selectedAddressOption !== 'custom'}
                  >
                    <option value="Madeira">Madeira</option>
                    <option value="Azores">Açores</option>
                    <option value="Lisbon">Lisboa</option>
                    <option value="Porto">Porto</option>
                  </select>
                </div>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="saveInfo"
                    checked={formData.saveInfo}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Guardar esta informação para a próxima vez</span>
                </label>
              </div>
            </div>

            {/* Payment Section - Atualizado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Pagamento</h2>
        <p className="text-gray-600 mb-6">Todas as transações são seguras e encriptadas.</p>

        <div className="space-y-4">
          {/* MBWay Option */}
          <div className="border border-gray-300 rounded-lg">
            <label className="flex items-center p-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="mbway"
                checked={paymentMethod === 'mbway'}
                onChange={() => setPaymentMethod('mbway')}
                className="mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <img src="/mbway.png" alt="MBWay" className="h-6 w-auto mr-2" />
              <span className="font-medium text-gray-800">MBWay</span>
            </label>
          </div>

          {/* Multibanco Option */}
          <div className="border border-gray-300 rounded-lg">
            <label className="flex items-center p-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="multibanco"
                checked={paymentMethod === 'multibanco'}
                onChange={() => setPaymentMethod('multibanco')}
                className="mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <img src="/multibanco.png" alt="Multibanco" className="h-6 w-auto mr-2" />
              <span className="font-medium text-gray-800">Multibanco</span>
            </label>
          </div>

          {/* Cartão de Crédito Option */}
          <div className="border border-gray-300 rounded-lg">
            <label className="flex items-center p-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="cc"
                checked={paymentMethod === 'cc'}
                onChange={() => setPaymentMethod('cc')}
                className="mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <img src="/cartao.png" alt="CartaoCredito" className="h-6 w-auto mr-2" />
              <span className="font-medium text-gray-800">Cartão de Crédito</span>
            </label>
          </div>

          {/* Pagamento à Cobrança Option */}
          <div className="border border-gray-300 rounded-lg">
            <label className="flex items-center p-4 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mr-3 w-4 h-4 text-orange-500 focus:ring-orange-500"
              />
              <Truck className="w-5 h-5 mr-2 text-gray-600" />
              <span className="font-medium text-gray-800">Pagamento à Cobrança</span>
            </label>
          </div>
        </div>

              {/* Pay Now Button */}
              <button
                onClick={handleCheckout}
                disabled={isProcessing} 
                className={`w-full py-4 rounded-lg font-bold text-lg transition-colors mt-8 ${
                  isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isProcessing ? 'A Processar...' : 'Pagar agora'}
              </button>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:pl-8">
            <div className="bg-white rounded-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Resumo da Encomenda</h3>

              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{item.product_name}</h4>
                    </div>
                    <div className="flex flex-col items-end">
                      {item.original_price != null && item.original_price > item.price && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            €{(item.price * item.quantity).toFixed(2)}
                          </span>
                          <div className="text-lg font-bold text-gray-800">
                            €{(item.original_price * item.quantity).toFixed(2)}
                          </div>
                        </>
                      )}
                      {!(item.original_price != null && item.original_price > item.price) && (
                        <div className="text-lg font-bold text-gray-800">
                          €{(item.price * item.quantity).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cupão Section - Atualizado para múltiplos cupões */}
              <div className="mt-6 mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3">Cupão de Desconto</h4>
                <div className="flex w-full space-x-2">
                  <input
                    type="text"
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                    placeholder="Inserir código de cupão"
                    value={currentCouponCode}
                    onChange={(e) => setCurrentCouponCode(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddCoupon}
                    className="rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Adicionar
                  </button>
                </div>

                {/* Exibe a lista de cupões adicionados */}
                {couponCodes.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Cupões a serem aplicados:</p>
                    <ul className="list-disc list-inside">
                      {couponCodes.map((code, index) => (
                        <li key={index} className="font-semibold">{code}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || couponCodes.length === 0}
                  className={`mt-4 w-full rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors ${
                    isApplyingCoupon ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  {isApplyingCoupon ? 'A aplicar...' : 'Aplicar Cupões'}
                </button>

                {/* Mensagem de sucesso visível apenas quando há um desconto */}
                {discountApplied > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    Desconto total de €{discountApplied.toFixed(2)}.
                  </p>
                )}
              </div>

              {/* Order Totals */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800 font-medium">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envio</span>
                  <span className="text-green-600 font-medium">Grátis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Desconto</span>
                  <span className="text-red-600 font-medium">-€{discountApplied.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-gray-800 border-t-2 border-dashed border-gray-300 pt-4">
                  <span>Total</span>
                  <span>€{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;