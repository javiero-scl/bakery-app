import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';
import UserItem from '../components/UserItem';
import Modal from '../components/Modal';

type User = Database['public']['Tables']['user']['Row'];

const Users = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editFormState, setEditFormState] = useState({ user_name: '', user_email: '' });
    const [newUserState, setNewUserState] = useState({ user_name: '', user_email: '', user_password: '' });

    // New state for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('user')
                .select('*')
                .order('user_created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setUsers(data);
            }
        } catch (error: any) {
            toast.error('Error al cargar usuarios: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchUsers();
    }, [session, fetchUsers]);

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newUserState.user_name || !newUserState.user_email) return;

        try {
            const { data, error } = await supabase
                .from('user')
                .insert([{
                    user_name: newUserState.user_name,
                    user_email: newUserState.user_email,
                    user_password: newUserState.user_password, // Be careful with passwords in plain text!
                    user_id: crypto.randomUUID() // Generating a UUID if not auto-generated
                }])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setUsers([data, ...users]);
                setNewUserState({ user_name: '', user_email: '', user_password: '' });
                toast.success('Usuario creado');
                setIsModalOpen(false); // Close modal after adding
            }
        } catch (error: any) {
            toast.error('Error al crear usuario: ' + error.message);
        }
    };

    const handleStartEditing = (user: User) => {
        setEditingId(user.user_id);
        setEditFormState({
            user_name: user.user_name || '',
            user_email: user.user_email || ''
        });
    };

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditFormState({ user_name: '', user_email: '' });
    };

    const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('user')
                .update({
                    user_name: editFormState.user_name,
                    user_email: editFormState.user_email
                })
                .eq('user_id', editingId);

            if (error) throw error;

            setUsers(users.map(u =>
                u.user_id === editingId
                    ? { ...u, ...editFormState }
                    : u
            ));

            toast.success('Usuario actualizado');
            handleCancelEditing();
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

        try {
            const { error } = await supabase
                .from('user')
                .delete()
                .eq('user_id', id);

            if (error) throw error;

            setUsers(users.filter(u => u.user_id !== id));
            toast.success('Usuario eliminado');
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Gestión de Usuarios</h2>
            </div>

            <div className="content">
                <div className="section">
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar usuarios..."
                            className="search-bar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="button" onClick={() => setIsModalOpen(true)}>
                            Agregar
                        </button>
                    </div>

                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Añadir Usuario"
                    >
                        <form onSubmit={handleCreateUser} className="add-product-form" style={{ marginTop: 0 }}>
                            <input
                                type="text"
                                placeholder="Nombre de Usuario"
                                value={newUserState.user_name}
                                onChange={(e) => setNewUserState({ ...newUserState, user_name: e.target.value })}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={newUserState.user_email}
                                onChange={(e) => setNewUserState({ ...newUserState, user_email: e.target.value })}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newUserState.user_password}
                                onChange={(e) => setNewUserState({ ...newUserState, user_password: e.target.value })}
                                required
                            />
                            <button type="submit" className="button">Añadir</button>
                        </form>
                    </Modal>
                </div>

                <div className="section">
                    <h3>Lista de Usuarios</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Email</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <UserItem
                                            key={user.user_id}
                                            user={user}
                                            isEditing={editingId === user.user_id}
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
