import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

// Usamos el tipo generado automáticamente
type Product = Database['public']['Tables']['products']['Row'];

// Definimos las props que recibirá el componente.
// Necesita una función para notificar al padre cuando un producto es añadido.
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
      const { data, error: insertError } = await supabase
        .from('products')
        .insert({ name: newProductName, description: newProductDescription })
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        onProductAdded(data); // Llama a la función del padre para actualizar el estado
        toast.success('¡Producto creado exitosamente!');
        setNewProductName('');
        setNewProductDescription('');
      }
    } catch (error: any) {
      toast.error(`Error al crear el producto: ${error.message}`);
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

