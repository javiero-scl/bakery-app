import React from 'react';
import { Database } from '../types/supabase';

type RawMaterial = Database['public']['Tables']['raw_materials']['Row'] & {
    units_of_measure: { name: string; abbreviation: string } | null;
};

interface RawMaterialItemProps {
    rawMaterial: RawMaterial;
    isEditing: boolean;
    editFormState: { name: string; unit_id: number };
    onStartEditing: (rawMaterial: RawMaterial) => void;
    onCancelEditing: () => void;
    onUpdateRawMaterial: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onDeleteRawMaterial: (id: number) => Promise<void>;
    setEditFormState: React.Dispatch<React.SetStateAction<{ name: string; unit_id: number }>>;
    units: Database['public']['Tables']['units_of_measure']['Row'][];
}

const RawMaterialItem = ({
    rawMaterial,
    isEditing,
    editFormState,
    onStartEditing,
    onCancelEditing,
    onUpdateRawMaterial,
    onDeleteRawMaterial,
    setEditFormState,
    units,
}: RawMaterialItemProps) => {
    if (isEditing) {
        return (
            <tr>
                <td colSpan={3}>
                    <form onSubmit={onUpdateRawMaterial} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <input
                            type="text"
                            value={editFormState.name}
                            onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
                            placeholder="Nombre"
                            required
                            style={{ flex: 2 }}
                        />
                        <select
                            value={editFormState.unit_id}
                            onChange={(e) => setEditFormState({ ...editFormState, unit_id: Number(e.target.value) })}
                            required
                            style={{ flex: 1 }}
                        >
                            <option value={0}>Seleccionar Unidad</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
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
            <td>{rawMaterial.units_of_measure?.name} {rawMaterial.units_of_measure?.abbreviation ? `(${rawMaterial.units_of_measure.abbreviation})` : ''}</td>
            <td>
                <div className="button-group">
                    <button className="button" onClick={() => onStartEditing(rawMaterial)}>Editar</button>
                    <button className="button button-secondary" onClick={() => onDeleteRawMaterial(rawMaterial.id)}>Eliminar</button>
                </div>
            </td>
        </tr>
    );
};

export default RawMaterialItem;


