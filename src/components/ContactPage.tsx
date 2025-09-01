import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Facebook,
  Twitter,
  Instagram,
  User,
  ArrowRight,
  Heart,
  ChevronDown
} from 'lucide-react';
import FAQAccordion from './FAQAccordion';
import Footer from '../components/FooterPage';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica no frontend
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Enviar dados para o endpoint da sua API de contacto
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.success);
        setFormData({ name: '', email: '', subject: '', message: '' }); // Limpar o formulário
      } else {
        toast.error(result.error || 'Ocorreu um erro.');
      }
    } catch (error) {
      console.error('Erro ao submeter o formulário:', error);
      toast.error('Não foi possível conectar-se ao servidor. Tente novamente mais tarde.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white py-4 px-4 border-b">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-600" aria-label="Breadcrumb">
            <span className="hover:text-orange-500 cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Contacto</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-400 to-red-500 py-12 md:py-16" role="banner">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">Entre em Contacto</h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Tem questões sobre os nossos produtos ou precisa de apoio? Estamos aqui para ajudá-lo na sua jornada de bem-estar.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-8 md:py-16" role="main">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
            {/* Address */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Visite a Nossa Loja</h3>
              <p className="text-gray-600 leading-relaxed">
                CAMINHO POÇO BARRAL N28<br />
                9020-222, Funchal<br />
                Madeira, Portugal
              </p>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Ligue-nos</h3>
              <p className="text-gray-600 leading-relaxed">
                Telefone: (+351) 935 708 047<br />
            
              </p>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Envie-nos Email</h3>
              <p className="text-gray-600 leading-relaxed">
                geral@rdpowernurtrition.pt<br />
              </p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-2xl p-6 md:p-8 mb-12 md:mb-16 shadow-lg">
            <div className="flex items-center justify-center mb-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Horário de Funcionamento</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-800">Segunda - Sábado</span>
                  <span className="text-gray-600">10:00 - 20:00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-800">Domingo</span>
                  <span className="text-gray-600">Fechado</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-800">Apoio ao Cliente</span>
                  <span className="text-gray-600">24/7 Online</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-800">Linha de Emergência</span>
                  <span className="text-gray-600">24/7 Disponível</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <div className="text-orange-500 font-medium mb-2 tracking-wider">ENVIE-NOS UMA MENSAGEM</div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Adoraríamos Ouvir de Si</h2>
                <p className="text-gray-600 leading-relaxed">
                  Tem alguma questão sobre os nossos produtos ou precisa de recomendações personalizadas?
                  Preencha o formulário abaixo e os nossos especialistas em bem-estar responderão em 24 horas.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Insira o seu nome completo"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço de Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Insira o seu email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Assunto *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Sobre o que é?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none"
                    placeholder="Diga-nos como podemos ajudá-lo..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white py-3 md:py-4 px-6 md:px-8 rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center text-sm md:text-base"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Mensagem
                </button>
              </form>
            </div>

            {/* Map */}
            <div>
              <div className="mb-8">
                <div className="text-orange-500 font-medium mb-2 tracking-wider">ENCONTRE-NOS</div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">A Nossa Localização</h2>
                <p className="text-gray-600 leading-relaxed">
                  Visite a nossa loja principal na Madeira. A nossa equipa especializada está pronta para ajudá-lo a encontrar os suplementos perfeitos para as suas necessidades.
                </p>
              </div>

              {/* Iframe do Google Maps */}
              <div className="bg-gray-200 rounded-2xl h-96 overflow-hidden">
                <iframe
                  title="Localização da Loja"
                  src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d723.849670140583!2d-16.944473493109957!3d32.65661574257207!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xc605fbc48b9347b%3A0xac957f80185b189f!2sCaminho%20do%20Po%C3%A7o%20Barral%2032%2C%209000-155%20Funchal!5e1!3m2!1spt-PT!2spt!4v1755778757296!5m2!1spt-PT!2spt"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              <div className="mt-6 md:mt-8 grid grid-cols-2 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-orange-500 mb-1">50+</div>
                  <div className="text-sm text-gray-600">Produtos Premium</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-xl md:text-2xl font-bold text-orange-500 mb-1">24/7</div>
                  <div className="text-sm text-gray-600">Apoio ao Cliente</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="text-orange-500 font-medium mb-2 tracking-wider">PERGUNTAS FREQUENTES</div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">Questões Comuns</h2>
            <p className="text-gray-600 leading-relaxed">
              Encontre respostas rápidas às questões mais comuns sobre os nossos produtos e serviços.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "O que torna os vossos suplementos diferentes dos outros?",
                answer: "Os nossos suplementos são feitos com ingredientes premium, testados por terceiros para pureza, e formulados por especialistas em nutrição para garantir máxima biodisponibilidade e eficácia."
              },
              {
                question: "Quanto tempo demora o envio?",
                answer: "Oferecemos envio padrão gratuito (3-5 dias úteis) em encomendas acima de 50€. Envio expresso (1-2 dias úteis) está disponível por uma taxa adicional."
              },
              {
                question: "Oferecem garantia de devolução do dinheiro?",
                answer: "Sim! Oferecemos uma garantia de devolução do dinheiro de 30 dias em todos os produtos. Se não estiver completamente satisfeito, devolva o produto para um reembolso total."
              },
              {
                question: "Os vossos produtos são seguros para uso diário?",
                answer: "Todos os nossos produtos são formulados para uso diário e são fabricados em instalações aprovadas pela FDA. No entanto, recomendamos consultar o seu profissional de saúde antes de iniciar qualquer novo regime de suplementos."
              }
            ].map((faq, index) => (
              <FAQAccordion
                key={index}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ContactPage;