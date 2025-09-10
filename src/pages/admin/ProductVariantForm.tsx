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
    sabor_id: '',
    weight_value: '',
    weight_unit: 'g', // Definido como 'g' por padrão
    preco: '',
    quantidade_em_stock: '',
    stock_ginasio: '',
    sku: '',
  });

  // `useEffect` para carregar os dados do produto ao montar o componente.
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        // Chamada real à API para obter os detalhes do produto
        const response = await axios.get(`https://powernutrition-backend-production-7883.up.railway.app/api/products/listar/${productId}`);
        
        if (response.data) {
          setProduct(response.data);
        } else {
          setError('Produto não encontrado.');
        }
      } catch (err) {
        setError('Erro ao carregar detalhes do produto.');
        console.error('Erro na requisição:', err.response ? err.response.data : err.message);
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
      // Monta o corpo da requisição com a chave "variant"
      const requestBody = {
        variant: {
          sabor_id: parseInt(variant.sabor_id),
          weight_value: parseFloat(variant.weight_value),
          weight_unit: variant.weight_unit,
          preco: parseFloat(variant.preco),
          quantidade_em_stock: parseInt(variant.quantidade_em_stock),
          stock_ginasio: parseInt(variant.stock_ginasio),
          sku: variant.sku,
        }
      };

      const response = await axios.post(
        `https://powernutrition-backend-production-7883.up.railway.app/api/products/adicionar-variante/${productId}`,
        requestBody
      );
      
      console.log('Dados da variante enviados com sucesso:', response.data);
      toast.success('Variante adicionada com sucesso!');
      
      // Opcional: Limpar o formulário após a submissão bem-sucedida.
      setVariant({
        sabor_id: '',
        weight_value: '',
        weight_unit: 'g',
        preco: '',
        quantidade_em_stock: '',
        stock_ginasio: '',
        sku: '',
      });
      
    } catch (err) {
      toast.error('Erro ao adicionar variante.');
      console.error('Erro na requisição:', err.response ? err.response.data : err.message);
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
            <label htmlFor="sabor_id" className="block text-gray-700 font-bold mb-2">ID do Sabor</label>
            <input
              type="number"
              id="sabor_id"
              name="sabor_id"
              value={variant.sabor_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 1"
              required
            />
          </div>
          <div>
            <label htmlFor="weight_value" className="block text-gray-700 font-bold mb-2">Valor do Peso</label>
            <input
              type="number"
              id="weight_value"
              name="weight_value"
              value={variant.weight_value}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 200"
              required
            />
          </div>
          <div>
            <label htmlFor="weight_unit" className="block text-gray-700 font-bold mb-2">Unidade do Peso</label>
            <input
              type="text"
              id="weight_unit"
              name="weight_unit"
              value={variant.weight_unit}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: g ou kg"
              required
            />
          </div>
          <div>
            <label htmlFor="preco" className="block text-gray-700 font-bold mb-2">Preço (€)</label>
            <input
              type="number"
              id="preco"
              name="preco"
              value={variant.preco}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 39.99"
              step="0.01"
              required
            />
          </div>
          <div>
            <label htmlFor="quantidade_em_stock" className="block text-gray-700 font-bold mb-2">Stock Total</label>
            <input
              type="number"
              id="quantidade_em_stock"
              name="quantidade_em_stock"
              value={variant.quantidade_em_stock}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 100"
              required
            />
          </div>
          <div>
            <label htmlFor="stock_ginasio" className="block text-gray-700 font-bold mb-2">Stock em Ginásio</label>
            <input
              type="number"
              id="stock_ginasio"
              name="stock_ginasio"
              value={variant.stock_ginasio}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 50"
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
              placeholder="Ex: WHEY-CHOC-200G-25"
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
