import React from 'react';
import { Database } from '../types/supabase';

type User = Database['public']['Tables']['user']['Row'];

interface UserItemProps {
    user: User;
    isEditing: boolean;
    editFormState: { user_name: string; user_email: string };
    onStartEditing: (user: User) => void;
    onCancelEditing: () => void;
    onUpdateUser: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onDeleteUser: (id: string) => Promise<void>;
    setEditFormState: React.Dispatch<React.SetStateAction<{ user_name: string; user_email: string }>>;
}

const UserItem = ({
    user,
    isEditing,
    editFormState,
    onStartEditing,
    onCancelEditing,
    onUpdateUser,
    onDeleteUser,
    setEditFormState,
}: UserItemProps) => {
    if (isEditing) {
        return (
            <tr>
                <td colSpan={3}>
                    <form onSubmit={onUpdateUser} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <input
                            type="text"
                            value={editFormState.user_name}
                            onChange={(e) => setEditFormState({ ...editFormState, user_name: e.target.value })}
                            placeholder="Nombre"
                            required
                            style={{ flex: 1 }}
                        />
                        <input
                            type="email"
                            value={editFormState.user_email}
                            onChange={(e) => setEditFormState({ ...editFormState, user_email: e.target.value })}
                            placeholder="Email"
                            required
                            style={{ flex: 1 }}
                        />
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
            <td>{user.user_name}</td>
            <td>{user.user_email}</td>
            <td>
                <div className="button-group">
                    <button className="button" onClick={() => onStartEditing(user)}>Editar</button>
                    <button className="button button-secondary" onClick={() => onDeleteUser(user.user_id)}>Eliminar</button>
                </div>
            </td>
        </tr>
    );
};

export default UserItem;


