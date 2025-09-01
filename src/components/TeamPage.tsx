import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  Dumbbell,
  Calendar,
  Award,
  HeartHandshake,
  MapPin
} from 'lucide-react';
import Footer from '../components/FooterPage';
import { motion } from 'framer-motion';

// Array com os caminhos das imagens da equipa
const teamPhotos = [
  "/equipa_1.jpeg", 
  "/euipa_2.jpeg", 
  "/equipa_3.jpeg",
];

const TeamPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200 font-sans">

      {/* Título e Breadcrumb */}
      <div className="bg-gray-800 py-8 px-4 border-b border-gray-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">A Nossa Equipa</h1>
          <nav className="text-sm text-gray-400" aria-label="Breadcrumb">
            <ol className="list-none p-0 inline-flex">
              <li className="flex items-center">
                <Link to="/" className="text-gray-400 hover:text-orange-500 transition-colors">Home</Link>
                <span className="mx-2 text-gray-500">/</span>
              </li>
              <li className="flex items-center">
                <span className="text-orange-500 font-medium">A Nossa Equipa</span>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Secção de Abertura com Fotos e História */}
      <section className="bg-gray-900 py-16 md:py-24 px-4 relative overflow-hidden">
        {/* Elemento decorativo de fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-orange-900 z-0 opacity-75"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Galeria de Fotos da Equipa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 md:mb-16">
            {teamPhotos.slice(1).map((photo, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden rounded-3xl shadow-xl hover:shadow-orange-700/30 transition-shadow duration-300 transform hover:-translate-y-1"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <img
                  src={photo}
                  alt={`Equipa RD Power Nutrition ${index + 2}`} 
                  className="w-full h-80 object-cover"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>

          {/* História de Fundação em formato de Marcos */}
          <motion.div
            className="bg-gray-800 p-8 md:p-12 rounded-3xl shadow-2xl border border-gray-700 transform transition-transform duration-500 hover:scale-[1.01]"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }} // Animação ativada mais cedo
            transition={{ duration: 0.6 }} // Atraso removido
          >
            <h2 className="text-center text-4xl md:text-5xl font-extrabold mb-6 text-orange-500">
              <Sparkles className="inline-block mr-3 mb-2 text-red-400" size={40} />
              A Nossa Jornada: De uma Ideia a uma Comunidade
              <Sparkles className="inline-block ml-3 mb-2 text-red-400" size={40} />
            </h2>
            
            <div className="md:grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              
              {/* Texto da Jornada */}
              <div className="flex flex-col gap-8 md:gap-12 text-center md:text-left">
                
                {/* Marco 1: O Início */}
                <motion.div
                  className="flex flex-col items-center md:items-start"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }} // Atraso removido
                >
                  <Calendar size={60} className="text-orange-500 mb-4" />
                  <h3 className="font-bold text-2xl mb-2 text-white">O Início: 2024</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Tudo começou com uma paixão partilhada por um estilo de vida <strong>ativo</strong> e <strong>saudável</strong>. Frustrados com a falta de qualidade no mercado, decidimos criar a nossa própria solução.
                  </p>
                </motion.div>

                {/* Marco 2: A Missão */}
                <motion.div
                  className="flex flex-col items-center md:items-start"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }} // Atraso ligeiro
                >
                  <Award size={60} className="text-orange-500 mb-4" />
                  <h3 className="font-bold text-2xl mb-2 text-white">A Missão: Qualidade</h3>
                  <p className="text-gray-300 leading-relaxed">
                    O nosso objetivo principal era claro: oferecer conhecimento, transparência e apenas os melhores suplementos para os nossos clientes.
                  </p>
                </motion.div>
                
                {/* Marco 3: A Comunidade */}
                <motion.div
                  className="flex flex-col items-center md:items-start"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }} // Atraso ligeiro
                >
                  <HeartHandshake size={60} className="text-orange-500 mb-4" />
                  <h3 className="font-bold text-2xl mb-2 text-white">A Comunidade</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Não somos apenas uma loja, somos uma comunidade. Estamos aqui para ser o seu parceiro em cada passo e garantir que alcança os seus objetivos de fitness.
                  </p>
                </motion.div>
                
              </div>

              {/* Imagem da Equipa ao lado do texto da jornada */}
              <motion.div
                className="mt-8 md:mt-0 flex justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, delay: 0.4 }} // Atraso ligeiro
              >
                <img
                  src={teamPhotos[0]}
                  alt="Equipa da RD Power Nutrition"
                  className="w-full h-auto object-cover rounded-3xl shadow-xl border-4 border-gray-700 transform transition-transform hover:scale-[1.03]"
                  loading="lazy"
                />
              </motion.div>
              
            </div>
            
            {/* Informação de localização no final da secção */}
            <p className="text-center text-sm text-gray-400 mt-10">
              A nossa jornada começou no <MapPin className="inline-block mr-1 text-gray-500" size={16} /> <strong>Funchal</strong>, no Caminho do Poço Barral. Para a morada exata e como chegar até nós, visite a nossa <Link to="/contacto" className="font-bold text-orange-500 hover:text-orange-400 transition-colors">página de contacto</Link>.
            </p>

          </motion.div>
        </div>
      </section>

      {/* Secção de Valores - Os Nossos Pilares (Design Melhorado) */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Os Nossos Valores</h2>
          <p className="text-gray-400 mb-12 max-w-2xl mx-auto">
            Guiados pela excelência, estes são os princípios que definem tudo o que fazemos.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div 
              className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-orange-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <ShieldCheck size={48} className="text-orange-500 mb-4 transform group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2 text-white">Qualidade Inquestionável</h3>
              <p className="text-sm text-center text-gray-300 leading-relaxed">Oferecemos apenas suplementos testados e comprovados para a sua segurança e eficácia.</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-orange-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Sparkles size={48} className="text-orange-500 mb-4 transform group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2 text-white">Inovação Constante</h3>
              <p className="text-sm text-center text-gray-300 leading-relaxed">Estamos sempre à procura das fórmulas mais recentes e dos ingredientes mais potentes.</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-orange-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Users size={48} className="text-orange-500 mb-4 transform group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2 text-white">Comunidade e Suporte</h3>
              <p className="text-sm text-center text-gray-300 leading-relaxed">Acreditamos que o sucesso é construído em conjunto. Estamos aqui para o ajudar em cada passo.</p>
            </motion.div>
            <motion.div 
              className="flex flex-col items-center p-8 bg-gray-800 rounded-xl shadow-lg border border-gray-700 transition-all duration-300 hover:shadow-xl hover:border-orange-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Dumbbell size={48} className="text-orange-500 mb-4 transform group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-xl mb-2 text-white">Paixão pelo Fitness</h3>
              <p className="text-sm text-center text-gray-300 leading-relaxed">Vivemos e respiramos o mundo do fitness, o que nos permite entender verdadeiramente as suas necessidades.</p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Call to Action Final com Design Duas Colunas */}
      <section className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto md:grid md:grid-cols-2 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 md:text-left text-center">Pronto para a Transformação?</h2>
            <p className="mb-8 text-xl font-light md:text-left text-center">
              Deixe-nos ser o combustível para a sua jornada. Explore a nossa seleção premium e comece a alcançar os seus objetivos hoje mesmo.
            </p>
            <motion.button 
              onClick={() => navigate('/produtos')}
              className="bg-white text-orange-500 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center mx-auto md:mx-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              VER TODOS OS PRODUTOS <ArrowRight className="ml-2 w-5 h-5" />
            </motion.button>
          </motion.div>

          <motion.div 
            className="hidden md:flex justify-end"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Dumbbell size={200} className="text-white opacity-20" />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TeamPage;