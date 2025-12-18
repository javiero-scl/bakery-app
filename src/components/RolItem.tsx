import React from 'react';
import { Database } from '../types/supabase';

type Role = Database['public']['Tables']['rol']['Row'];

interface RolItemProps {
    role: Role;
    isEditing: boolean;
    editFormState: { rol_name: string };
    onStartEditing: (role: Role) => void;
    onCancelEditing: () => void;
    onUpdateRole: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onDeleteRole: (id: number) => Promise<void>;
    setEditFormState: React.Dispatch<React.SetStateAction<{ rol_name: string }>>;
}

const RolItem = ({
    role,
    isEditing,
    editFormState,
    onStartEditing,
    onCancelEditing,
    onUpdateRole,
    onDeleteRole,
    setEditFormState,
}: RolItemProps) => {
    if (isEditing) {
        return (
            <tr>
                <td>
                    <form onSubmit={onUpdateRole} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <input
                            type="text"
                            value={editFormState.rol_name}
                            onChange={(e) => setEditFormState({ ...editFormState, rol_name: e.target.value })}
                            placeholder="Nombre del Rol"
                            required
                            style={{ flex: 1 }}
                        />
                        <div className="button-group">
                            <button type="submit" className="button">Guardar</button>
                            <button type="button" className="button button-secondary" onClick={onCancelEditing}>Cancelar</button>
                        </div>
                    </form>
                </td>
                <td></td>
            </tr>
        );
    }

    return (
        <tr>
            <td>{role.rol_name}</td>
            <td>
                <div className="button-group">
                    <button className="button" onClick={() => onStartEditing(role)}>Editar</button>
                    <button className="button button-secondary" onClick={() => onDeleteRole(role.rol_id)}>Eliminar</button>
                </div>
            </td>
        </tr>
    );
};

export default RolItem;
