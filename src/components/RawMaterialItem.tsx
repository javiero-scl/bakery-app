import React from 'react';
import { RawMaterial, Unit } from '../pages/RawMaterials';

interface RawMaterialItemProps {
  rawMaterial: RawMaterial;
  isEditing: boolean;
  editFormState: { name: string; unit_id: string };
  onStartEditing: (rawMaterial: RawMaterial) => void;
  onCancelEditing: () => void;
  onUpdateRawMaterial: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteRawMaterial: (id: string) => Promise<void>;
  setEditFormState: React.Dispatch<React.SetStateAction<{ name: string; unit_id: string }>>;
  units: Unit[];
}

const RawMaterialItem = ({
  rawMaterial, isEditing, editFormState,
  onStartEditing, onCancelEditing, onUpdateRawMaterial, onDeleteRawMaterial, setEditFormState, units,
}: RawMaterialItemProps) => {
  if (isEditing) {
    return (
      <tr>
        <td colSpan={3}>
          <form onSubmit={onUpdateRawMaterial} style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <input type="text" value={editFormState.name}
              onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
              placeholder="Nombre" required style={{ flex: 2 }} />
            <select value={editFormState.unit_id}
              onChange={(e) => setEditFormState({ ...editFormState, unit_id: e.target.value })}
              required style={{ flex: 1 }}>
              <option value="">Seleccionar Unidad</option>
              {units.map(u => (
                <option key={u._id} value={u._id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
              ))}
            </select>
            <div className="button-group">
              <button type="submit" className="button">Guardar</button>
              <button type="button" className="button button-secondary" onClick={onCancelEditing}>Cancelar</button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{rawMaterial.name}</td>
      <td>{rawMaterial.unit?.name} {rawMaterial.unit?.abbreviation ? `(${rawMaterial.unit.abbreviation})` : ''}</td>
      <td>
        <div className="button-group">
          <button className="button" onClick={() => onStartEditing(rawMaterial)}>Editar</button>
          <button className="button button-secondary" onClick={() => onDeleteRawMaterial(rawMaterial._id)}>Eliminar</button>
        </div>
      </td>
    </tr>
  );
};

export default RawMaterialItem;
