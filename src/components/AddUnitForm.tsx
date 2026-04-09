import { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { UnitOfMeasure } from '../pages/Units';

interface AddUnitFormProps {
  onUnitAdded: (unit: UnitOfMeasure) => void;
}

const AddUnitForm = ({ onUnitAdded }: AddUnitFormProps) => {
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('El nombre es obligatorio.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post('/units', {
        name: name.trim(),
        abbreviation: abbreviation.trim() || null,
      });
      onUnitAdded(data);
      toast.success('Unidad de medida creada exitosamente!');
      setName('');
      setAbbreviation('');
    } catch (error: any) {
      toast.error(`Error al crear unidad: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-form">
      <h3>Añadir Unidad de Medida</h3>
      <form onSubmit={handleCreateUnit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          placeholder="Nombre (ej. Kilogramo)" required className="form-input" />
        <input type="text" value={abbreviation} onChange={(e) => setAbbreviation(e.target.value)}
          placeholder="Abreviatura (ej. kg)" className="form-input" />
        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Unidad'}
        </button>
      </form>
    </div>
  );
};

export default AddUnitForm;
