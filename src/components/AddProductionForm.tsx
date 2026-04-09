import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { Production } from '../pages/Productions';
import { Product } from '../pages/Products';

interface AddProductionFormProps {
  onProductionAdded: (production: Production) => void;
}

const AddProductionForm = ({ onProductionAdded }: AddProductionFormProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantityProduced, setQuantityProduced] = useState<number | ''>('');
  const [productionDate, setProductionDate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/products');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCreateProduction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProductId || !quantityProduced || !productionDate) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/productions', {
        product_id: selectedProductId,
        quantity_produced: Number(quantityProduced),
        production_date: productionDate,
      });
      onProductionAdded(data);
      toast.success('Producción registrada exitosamente!');
      setQuantityProduced('');
    } catch (error: any) {
      toast.error(`Error al crear: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-form" style={{ marginTop: 0 }}>
      <form onSubmit={handleCreateProduction}>
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="form-select">
          <option value="">Seleccionar Producto</option>
          {products.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
        <input
          type="number" placeholder="Cantidad Producida" value={quantityProduced}
          onChange={(e) => setQuantityProduced(parseFloat(e.target.value))}
        />
        <div className="form-group">
          <label>Fecha de Elaboración:</label>
          <input type="date" value={productionDate} onChange={(e) => setProductionDate(e.target.value)} />
        </div>
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Producción'}
        </button>
      </form>
    </div>
  );
};

export default AddProductionForm;
