import React, { useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { UnitOfMeasure } from '../pages/Units';

interface UnitItemProps {
  unit: UnitOfMeasure;
  onUnitUpdated: (unit: UnitOfMeasure) => void;
  onUnitDeleted: (id: string) => void;
}

const UnitItem = ({ unit, onUnitUpdated, onUnitDeleted }: UnitItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormState, setEditFormState] = useState({
    name: unit.name || '',
    abbreviation: unit.abbreviation || ''
  });

  const handleStartEditing = () => setIsEditing(true);

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditFormState({ name: unit.name || '', abbreviation: unit.abbreviation || '' });
  };

  const handleUpdateUnit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editFormState.name.trim()) {
      toast.error('El nombre es obligatorio.');
      return;
    }
    try {
      const { data } = await apiClient.put(`/units/${unit._id}`, {
        name: editFormState.name.trim(),
        abbreviation: editFormState.abbreviation.trim() || null,
      });
      onUnitUpdated(data);
      setIsEditing(false);
      toast.success('Unidad actualizada exitosamente!');
    } catch (error: any) {
      toast.error(`Error al actualizar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteUnit = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta unidad?')) return;
    try {
      await apiClient.delete(`/units/${unit._id}`);
      onUnitDeleted(unit._id);
      toast.success('Unidad eliminada exitosamente!');
    } catch (error: any) {
      toast.error(`Error al eliminar: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isEditing) {
    return (
      <tr>
        <form id={`edit-form-${unit._id}`} onSubmit={handleUpdateUnit}>
          <td>
            <input type="text" value={editFormState.name}
              onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
              required className="form-input" />
          </td>
          <td>
            <input type="text" value={editFormState.abbreviation}
              onChange={(e) => setEditFormState({ ...editFormState, abbreviation: e.target.value })}
              className="form-input" />
          </td>
          <td>
            <div className="button-group">
              <button type="submit" className="button">Guardar</button>
              <button type="button" className="button button-secondary" onClick={handleCancelEditing}>Cancelar</button>
            </div>
          </td>
        </form>
      </tr>
    );
  }

  return (
    <tr>
      <td>{unit.name}</td>
      <td>{unit.abbreviation}</td>
      <td>
        <div className="button-group">
          <button className="button button-secondary" onClick={handleStartEditing}>Editar</button>
          <button className="button button-danger" onClick={handleDeleteUnit}>Eliminar</button>
        </div>
      </td>
    </tr>
  );
};

export default UnitItem;
