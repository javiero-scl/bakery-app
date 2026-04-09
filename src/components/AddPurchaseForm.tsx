import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { Purchase } from '../pages/Purchases';
import { RawMaterial } from '../pages/RawMaterials';

interface AddPurchaseFormProps {
  onPurchaseAdded: (purchase: Purchase) => void;
}

const AddPurchaseForm = ({ onPurchaseAdded }: AddPurchaseFormProps) => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number | ''>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRawMaterials = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/raw-materials');
      setRawMaterials(data);
    } catch (error) {
      console.error('Error fetching raw materials:', error);
    }
  }, []);

  useEffect(() => { fetchRawMaterials(); }, [fetchRawMaterials]);

  const handleCreatePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRawMaterialId || !quantity || !totalCost || !purchaseDate) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/purchases', {
        raw_material_id: selectedRawMaterialId,
        quantity: Number(quantity),
        total_cost: Number(totalCost),
        purchase_date: purchaseDate,
      });
      onPurchaseAdded(data);
      toast.success('Compra registrada exitosamente!');
      setQuantity('');
      setTotalCost('');
    } catch (error: any) {
      toast.error(`Error al crear: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-form">
      <h3>Registrar Compra</h3>
      <form onSubmit={handleCreatePurchase}>
        <select value={selectedRawMaterialId} onChange={(e) => setSelectedRawMaterialId(e.target.value)} className="form-select">
          <option value="">Seleccionar Materia Prima</option>
          {rawMaterials.map(rm => (
            <option key={rm._id} value={rm._id}>
              {rm.name} {rm.unit ? `(${rm.unit.abbreviation})` : ''}
            </option>
          ))}
        </select>
        <input type="number" placeholder="Cantidad Comprada" value={quantity}
          onChange={(e) => setQuantity(parseFloat(e.target.value))} />
        <input type="number" placeholder="Costo Total" value={totalCost}
          onChange={(e) => setTotalCost(parseFloat(e.target.value))} step="0.01" />
        <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} />
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Registrando...' : 'Registrar Compra'}
        </button>
      </form>
    </div>
  );
};

export default AddPurchaseForm;
