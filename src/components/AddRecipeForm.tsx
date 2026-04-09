import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { Recipe } from '../pages/Recipes';
import { Product } from '../pages/Products';
import { RawMaterial, Unit } from '../pages/RawMaterials';

interface AddRecipeFormProps {
  onRecipeAdded: (recipe: Recipe) => void;
}

const AddRecipeForm = ({ onRecipeAdded }: AddRecipeFormProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [requiredQuantity, setRequiredQuantity] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOptions = useCallback(async () => {
    try {
      const [productsRes, rawMaterialsRes, unitsRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/raw-materials'),
        apiClient.get('/units'),
      ]);
      setProducts(productsRes.data);
      setRawMaterials(rawMaterialsRes.data);
      setUnits(unitsRes.data);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  }, []);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const handleCreateRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProductId || !selectedRawMaterialId || !requiredQuantity || !selectedUnitId) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/recipes', {
        product_id: selectedProductId,
        raw_material_id: selectedRawMaterialId,
        required_quantity: Number(requiredQuantity),
        unit_id: selectedUnitId,
      });
      onRecipeAdded(data);
      toast.success('Ingrediente añadido a la receta exitosamente!');
      setRequiredQuantity('');
      setSelectedUnitId('');
    } catch (error: any) {
      toast.error(`Error al crear: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-form">
      <h3>Añadir Ingrediente a Receta</h3>
      <form onSubmit={handleCreateRecipe}>
        <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="form-select">
          <option value="">Seleccionar Producto</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={selectedRawMaterialId} onChange={(e) => setSelectedRawMaterialId(e.target.value)} className="form-select">
          <option value="">Seleccionar Ingrediente</option>
          {rawMaterials.map(rm => (
            <option key={rm._id} value={rm._id}>
              {rm.name} {rm.unit ? `(${rm.unit.abbreviation})` : ''}
            </option>
          ))}
        </select>
        <input type="number" placeholder="Cantidad Requerida" value={requiredQuantity}
          onChange={(e) => setRequiredQuantity(parseFloat(e.target.value))} step="0.01" />
        <select value={selectedUnitId} onChange={(e) => setSelectedUnitId(e.target.value)} className="form-select">
          <option value="">Seleccionar Unidad</option>
          {units.map(u => <option key={u._id} value={u._id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>)}
        </select>
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Añadiendo...' : 'Añadir'}
        </button>
      </form>
    </div>
  );
};

export default AddRecipeForm;
