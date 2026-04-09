import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import RolItem from '../components/RolItem';
import Modal from '../components/Modal';

export type Role = {
  _id: string;
  rol_name: string;
  rol_state?: string;
  created_at: string;
};

const Roles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState({ rol_name: '' });
  const [newRoleName, setNewRoleName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/roles');
      setRoles(data);
    } catch (error: any) {
      toast.error('Error al cargar roles: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const handleCreateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newRoleName) return;
    try {
      const { data } = await apiClient.post('/roles', { rol_name: newRoleName });
      setRoles([data, ...roles]);
      setNewRoleName('');
      toast.success('Rol creado');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error('Error al crear rol: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStartEditing = (role: Role) => {
    setEditingId(role._id);
    setEditFormState({ rol_name: role.rol_name || '' });
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditFormState({ rol_name: '' });
  };

  const handleUpdateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const { data } = await apiClient.put(`/roles/${editingId}`, editFormState);
      setRoles(roles.map(r => r._id === editingId ? data : r));
      toast.success('Rol actualizado');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este rol?')) return;
    try {
      await apiClient.delete(`/roles/${id}`);
      setRoles(roles.filter(r => r._id !== id));
      toast.success('Rol eliminado');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredRoles = roles.filter(role =>
    role.rol_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header"><h2>Gestión de Roles</h2></div>
      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input type="text" placeholder="Buscar roles..." className="search-bar"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="button" onClick={() => setIsModalOpen(true)}>Agregar</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Rol">
            <form onSubmit={handleCreateRole} className="add-product-form" style={{ marginTop: 0 }}>
              <input type="text" placeholder="Nombre del Rol"
                value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} required />
              <button type="submit" className="button">Añadir</button>
            </form>
          </Modal>
        </div>
        <div className="section">
          <h3>Lista de Roles</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Nombre</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <RolItem
                      key={role._id}
                      role={role}
                      isEditing={editingId === role._id}
                      editFormState={editFormState}
                      onStartEditing={handleStartEditing}
                      onCancelEditing={handleCancelEditing}
                      onUpdateRole={handleUpdateRole}
                      onDeleteRole={handleDeleteRole}
                      setEditFormState={setEditFormState}
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

export default Roles;
