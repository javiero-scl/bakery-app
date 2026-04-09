import React from 'react';
import { UserRole } from '../pages/UserRoles';

interface UserRoleItemProps {
  userRole: UserRole;
  onDeleteUserRole: (id: string) => Promise<void>;
}

const UserRoleItem = ({ userRole, onDeleteUserRole }: UserRoleItemProps) => {
  return (
    <tr>
      <td>{userRole.user_name}</td>
      <td>{userRole.rol_name}</td>
      <td>
        <button className="button button-secondary" onClick={() => onDeleteUserRole(userRole._id)}>
          Eliminar
        </button>
      </td>
    </tr>
  );
};

export default UserRoleItem;
