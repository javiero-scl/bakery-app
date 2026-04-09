import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { RawMaterial, Unit } from '../pages/RawMaterials';

interface AddRawMaterialFormProps {
  onRawMaterialAdded: (rawMaterial: RawMaterial) => void;
}

const AddRawMaterialForm = ({ onRawMaterialAdded }: AddRawMaterialFormProps) => {
  const [name, setName] = useState('');
  const [unitId, setUnitId] = useState<string>('');
  const [units, setUnits] = useState<Unit[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUnits = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/units');
      setUnits(data);
    } catch (error: any) {
      toast.error('Error al cargar unidades: ' + (error.response?.data?.message || error.message));
    }
  }, []);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  const handleCreateRawMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !unitId) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/raw-materials', { name, unit_id: unitId });
      onRawMaterialAdded(data);
      toast.success('Materia prima añadida exitosamente!');
      setName('');
      setUnitId('');
    } catch (error: any) {
      toast.error(`Error al crear: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-product-form">
      <h3>Añadir Nueva Materia Prima</h3>
      <form onSubmit={handleCreateRawMaterial}>
        <input type="text" placeholder="Nombre (ej: Harina)" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="form-select">
          <option value="">Seleccionar Unidad</option>
          {units.map(u => (
            <option key={u._id} value={u._id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
          ))}
        </select>
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Añadiendo...' : 'Añadir'}
        </button>
      </form>
    </div>
  );
};

export default AddRawMaterialForm;
