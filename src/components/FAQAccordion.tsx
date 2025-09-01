// src/components/FAQAccordion.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQAccordionProps {
  question: string;
  answer: string;
}

const FAQAccordion: React.FC<FAQAccordionProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full p-6 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-base md:text-lg font-semibold text-gray-800">
          {question}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600 transition-transform duration-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 transition-transform duration-300" />
        )}
      </button>
      {isOpen && (
        <div className="p-6 pt-0">
          <p className="text-gray-600 leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

export default FAQAccordion;