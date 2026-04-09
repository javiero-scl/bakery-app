import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import { account } from '../lib/appwriteClient';
import UserItem from '../components/UserItem';
import Modal from '../components/Modal';

export type AppUser = {
  _id: string;
  user_name: string;
  user_email: string;
  user_state?: string;
  appwrite_id?: string; // Vínculo al usuario en Appwrite Auth
  created_at: string;
};

const Users = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState({ user_name: '', user_email: '' });
  const [newUserState, setNewUserState] = useState({ user_name: '', user_email: '', user_password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/users');
      setUsers(data);
    } catch (error: any) {
      toast.error('Error al cargar usuarios: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newUserState.user_name || !newUserState.user_email) return;
    try {
      // Crear usuario en Appwrite Auth
      const appwriteUser = await account.create(
        'unique()',
        newUserState.user_email,
        newUserState.user_password,
        newUserState.user_name
      );
      // Registrar también en la base de datos propia
      const { data } = await apiClient.post('/users', {
        user_name: newUserState.user_name,
        user_email: newUserState.user_email,
        appwrite_id: appwriteUser.$id,
      });
      setUsers([data, ...users]);
      setNewUserState({ user_name: '', user_email: '', user_password: '' });
      toast.success('Usuario creado');
      setIsModalOpen(false);
    } catch (error: any) {
      toast.error('Error al crear usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStartEditing = (user: AppUser) => {
    setEditingId(user._id);
    setEditFormState({ user_name: user.user_name || '', user_email: user.user_email || '' });
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditFormState({ user_name: '', user_email: '' });
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const { data } = await apiClient.put(`/users/${editingId}`, editFormState);
      setUsers(users.map(u => u._id === editingId ? data : u));
      toast.success('Usuario actualizado');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await apiClient.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success('Usuario eliminado');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredUsers = users.filter(user =>
    user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header"><h2>Gestión de Usuarios</h2></div>
      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input type="text" placeholder="Buscar usuarios..." className="search-bar"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="button" onClick={() => setIsModalOpen(true)}>Agregar</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Añadir Usuario">
            <form onSubmit={handleCreateUser} className="add-product-form" style={{ marginTop: 0 }}>
              <input type="text" placeholder="Nombre de Usuario"
                value={newUserState.user_name}
                onChange={(e) => setNewUserState({ ...newUserState, user_name: e.target.value })} required />
              <input type="email" placeholder="Email"
                value={newUserState.user_email}
                onChange={(e) => setNewUserState({ ...newUserState, user_email: e.target.value })} required />
              <input type="password" placeholder="Password"
                value={newUserState.user_password}
                onChange={(e) => setNewUserState({ ...newUserState, user_password: e.target.value })} required />
              <button type="submit" className="button">Añadir</button>
            </form>
          </Modal>
        </div>
        <div className="section">
          <h3>Lista de Usuarios</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Nombre</th><th>Email</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <UserItem
                      key={user._id}
                      user={user}
                      isEditing={editingId === user._id}
                      editFormState={editFormState}
                      onStartEditing={handleStartEditing}
                      onCancelEditing={handleCancelEditing}
                      onUpdateUser={handleUpdateUser}
                      onDeleteUser={handleDeleteUser}
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

export default Users;
