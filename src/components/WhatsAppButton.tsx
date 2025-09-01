import React from 'react';

interface WhatsAppButtonProps {
  phoneNumber: string; // O número de telefone do dono da loja (ex: "351912345678")
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ phoneNumber }) => {
  // Formata o número para o link do WhatsApp (apenas dígitos)
  const formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
  const whatsappLink = `https://wa.me/${formattedPhoneNumber}`;

  return (
    <>
      {/* CSS para a animação de piscar */}
      <style>
        {`
        @keyframes pulse-whatsapp {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08); /* Ligeiramente maior no meio da animação */
            opacity: 0.8; /* Ligeiramente mais transparente no meio */
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-pulse-whatsapp {
          animation: pulse-whatsapp 2s infinite ease-in-out; /* 2 segundos de duração, infinito, com suavização */
        }
        `}
      </style>

      <a
        href={whatsappLink}
        target="_blank" // Abre o link numa nova aba
        rel="noopener noreferrer" // Recomendado para segurança ao usar target="_blank"
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-300 z-50 flex items-center justify-center animate-pulse-whatsapp" // Aumentado p- para maior padding e adicionada a classe de animação
        aria-label="Iniciar conversa no WhatsApp" // Para acessibilidade
        title="Fale connosco no WhatsApp" // Dica de ferramenta ao passar o mouse
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" // URL do logo do WhatsApp. Considere hospedar sua própria imagem para maior controle.
          alt="WhatsApp Logo"
          className="w-10 h-10" // Ajustado o tamanho da imagem para ser maior
        />
      </a>
    </>
  );
};

export default WhatsAppButton;
