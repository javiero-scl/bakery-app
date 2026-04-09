import { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { Product } from '../pages/Products';

interface AddProductFormProps {
  onProductAdded: (product: Product) => void;
}

const AddProductForm = ({ onProductAdded }: AddProductFormProps) => {
  const [newProductName, setNewProductName] = useState('');
  const [newProductDescription, setNewProductDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProductName) {
      toast.error('El nombre del producto es obligatorio.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/products', {
        name: newProductName,
        description: newProductDescription,
      });
      onProductAdded(data);
      toast.success('¡Producto creado exitosamente!');
      setNewProductName('');
      setNewProductDescription('');
    } catch (error: any) {
      toast.error(`Error al crear el producto: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-form">
      <h3>Añadir Nuevo Producto</h3>
      <form onSubmit={handleCreateProduct}>
        <input type="text" placeholder="Nombre del pastel o torta" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} />
        <input type="text" placeholder="Descripción (opcional)" value={newProductDescription} onChange={(e) => setNewProductDescription(e.target.value)} />
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Añadiendo...' : 'Añadir Producto'}
        </button>
      </form>
    </div>
  );
};

export default AddProductForm;
