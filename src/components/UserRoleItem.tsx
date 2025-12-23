import React from 'react';
import { Database } from '../types/supabase';

type UserRole = Database['public']['Tables']['user_rol']['Row'] & {
    user: { user_name: string } | null;
    rol: { rol_name: string } | null;
};

interface UserRoleItemProps {
    userRole: UserRole;
    onDeleteUserRole: (id: number) => Promise<void>;
}

const UserRoleItem = ({
    userRole,
    onDeleteUserRole,
}: UserRoleItemProps) => {
    return (
        <tr>
            <td>{userRole.user?.user_name}</td>
            <td>{userRole.rol?.rol_name}</td>
            <td>
                <button className="button button-secondary" onClick={() => onDeleteUserRole(userRole.userrol_id)}>Eliminar</button>
            </td>
        </tr>
    );
};

export default UserRoleItem;


