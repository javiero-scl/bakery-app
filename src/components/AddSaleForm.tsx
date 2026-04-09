import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { Sale } from '../pages/Sales';
import { Product } from '../pages/Products';

interface AddSaleFormProps {
  onSaleAdded: (sale: Sale) => void;
}

const AddSaleForm = ({ onSaleAdded }: AddSaleFormProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantitySold, setQuantitySold] = useState<number | ''>('');
  const [unitSalePrice, setUnitSalePrice] = useState<number | ''>('');
  const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
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

  const handleCreateSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProductId || !quantitySold || !unitSalePrice || !saleDate) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/sales', {
        product_id: selectedProductId,
        quantity_sold: Number(quantitySold),
        unit_sale_price: Number(unitSalePrice),
        sale_date: saleDate,
      });
      onSaleAdded(data);
      toast.success('Venta registrada exitosamente!');
      setQuantitySold('');
      setUnitSalePrice('');
    } catch (error: any) {
      toast.error(`Error al crear: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-form">
      <h3>Registrar Venta</h3>
      <form onSubmit={handleCreateSale}>
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="form-select">
          <option value="">Seleccionar Producto</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <input type="number" placeholder="Cantidad Vendida" value={quantitySold}
          onChange={(e) => setQuantitySold(parseFloat(e.target.value))} />
        <input type="number" placeholder="Precio Unitario" value={unitSalePrice}
          onChange={(e) => setUnitSalePrice(parseFloat(e.target.value))} step="0.01" />
        <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
        </button>
      </form>
    </div>
  );
};

export default AddSaleForm;
