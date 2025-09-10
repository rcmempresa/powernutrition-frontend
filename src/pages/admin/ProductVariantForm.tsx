import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Este componente é um formulário para adicionar variantes a um produto existente.
const ProductVariantForm = () => {
  // Use `useParams` para extrair o `productId` da URL.
  const { productId } = useParams();
  
  // Use `useState` para gerenciar o estado dos dados do formulário e do produto.
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variant, setVariant] = useState({
    name: '', // Nome da variante (ex: "Sabor Chocolate")
    sku: '', // SKU (Stock Keeping Unit)
    price: '', // Preço da variante
    stock: '', // Quantidade em stock
  });

  // `useEffect` para carregar os dados do produto ao montar o componente.
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulação de chamada de API para obter os detalhes do produto
        // Substitua este bloco pela sua chamada `axios` real.
        const mockProducts = {
          '34': { id: 34, name: 'Whey Protein RD', description: 'O melhor whey do mercado.', variants: [] },
          '101': { id: 101, name: 'Creatina Monohidratada', description: 'Creatina de alta pureza.', variants: [] },
        };
        const fetchedProduct = mockProducts[productId];
        
        if (fetchedProduct) {
          setProduct(fetchedProduct);
        } else {
          setError('Produto não encontrado.');
        }
      } catch (err) {
        setError('Erro ao carregar detalhes do produto.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  // Função para lidar com a mudança nos campos do formulário.
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVariant(prev => ({ ...prev, [name]: value }));
  };

  // Função para lidar com a submissão do formulário.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Aqui você faria a chamada real para a sua API, por exemplo:
      // await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/products/${productId}/variants`, variant);
      
      console.log('Dados da variante a serem enviados:', { ...variant, productId });
      toast.success('Variante adicionada com sucesso! (Ação simulada)');
      
      // Opcional: Limpar o formulário após a submissão bem-sucedida.
      setVariant({ name: '', sku: '', price: '', stock: '' });
      
    } catch (err) {
      toast.error('Erro ao adicionar variante.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="text-xl text-gray-700">A carregar...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <span className="text-xl text-red-500">{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Adicionar Variante a: {product.name}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Nome da Variante</label>
            <input
              type="text"
              id="name"
              name="name"
              value={variant.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Sabor Chocolate"
              required
            />
          </div>
          <div>
            <label htmlFor="sku" className="block text-gray-700 font-bold mb-2">SKU</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={variant.sku}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: WHEY-CHOC-500G"
              required
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-gray-700 font-bold mb-2">Preço (€)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={variant.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 29.99"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-gray-700 font-bold mb-2">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={variant.stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 50"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300"
        >
          Adicionar Variante
        </button>
      </form>
      <Link to="/admin/products" className="mt-6 inline-block text-blue-500 hover:underline">
        &larr; Voltar para a lista de produtos
      </Link>
    </div>
  );
};

export default ProductVariantForm;
