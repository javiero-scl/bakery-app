import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import Modal from '../components/Modal';
import UserRoleItem from '../components/UserRoleItem';

export type AppUserSimple = { _id: string; user_name: string; };
export type RoleSimple = { _id: string; rol_name: string; };
export type UserRole = {
  _id: string;
  user_id: string;
  user_name?: string;
  role_id: string;
  rol_name?: string;
  state?: string;
  created_at: string;
};

const UserRoles = () => {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [users, setUsers] = useState<AppUserSimple[]>([]);
  const [roles, setRoles] = useState<RoleSimple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [urRes, usersRes, rolesRes] = await Promise.all([
        apiClient.get('/user-roles'),
        apiClient.get('/users'),
        apiClient.get('/roles'),
      ]);
      setUserRoles(urRes.data);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
    } catch (error: any) {
      toast.error('Error al cargar datos: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssignRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUserId || !selectedRoleId) return;
    try {
      const { data } = await apiClient.post('/user-roles', {
        user_id: selectedUserId,
        role_id: selectedRoleId,
      });
      setUserRoles([data, ...userRoles]);
      toast.success('Rol asignado correctamente');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error('Error al asignar rol: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveRole = async (id: string) => {
    if (!window.confirm('¿Estás seguro de remover este rol al usuario?')) return;
    try {
      await apiClient.delete(`/user-roles/${id}`);
      setUserRoles(userRoles.filter(ur => ur._id !== id));
      toast.success('Asignación eliminada');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredUserRoles = userRoles.filter(ur =>
    ur.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ur.rol_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header"><h2>Asignación de Roles</h2></div>
      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input type="text" placeholder="Buscar asignaciones..." className="search-bar"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="button" onClick={() => setIsModalOpen(true)}>Asignar Rol</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Asignar Rol a Usuario">
            <form onSubmit={handleAssignRole} className="add-product-form" style={{ marginTop: 0 }}>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="form-select">
                <option value="">Seleccionar Usuario</option>
                {users.map(u => (
                  <option key={u._id} value={u._id}>{u.user_name}</option>
                ))}
              </select>
              <select value={selectedRoleId} onChange={(e) => setSelectedRoleId(e.target.value)} className="form-select">
                <option value="">Seleccionar Rol</option>
                {roles.map(r => (
                  <option key={r._id} value={r._id}>{r.rol_name}</option>
                ))}
              </select>
              <button type="submit" className="button">Asignar</button>
            </form>
          </Modal>
        </div>
        <div className="section">
          <h3>Roles Asignados</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Usuario</th><th>Rol</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filteredUserRoles.map((ur) => (
                    <UserRoleItem
                      key={ur._id}
                      userRole={ur}
                      onDeleteUserRole={handleRemoveRole}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRoles;
