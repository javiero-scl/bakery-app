
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import RolItem from '../components/RolItem';
import Modal from '../components/Modal';

type Role = Database['public']['Tables']['rol']['Row'];

const Roles = () => {


    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormState, setEditFormState] = useState({ rol_name: '' });
    const [newRoleName, setNewRoleName] = useState('');

    // New state for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRoles = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('rol')
                .select('*')
                .order('rol_created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setRoles(data);
            }
        } catch (error: any) {
            toast.error('Error al cargar roles: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const handleCreateRole = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newRoleName) return;

        try {
            const { data, error } = await supabase
                .from('rol')
                .insert([{
                    rol_name: newRoleName,
                    rol_id_ext: crypto.randomUUID() // Assuming rol_id_ext needs to be unique string
                }])
                .select()
                .single();

            if (error) throw error;

            if (data) {
                setRoles([data, ...roles]);
                setNewRoleName('');
                toast.success('Rol creado');
                setIsModalOpen(false); // Close modal after adding
            }
        } catch (error: any) {
            toast.error('Error al crear rol: ' + error.message);
        }
    };

    const handleStartEditing = (role: Role) => {
        setEditingId(role.rol_id);
        setEditFormState({
            rol_name: role.rol_name || ''
        });
    };

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditFormState({ rol_name: '' });
    };

    const handleUpdateRole = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('rol')
                .update({
                    rol_name: editFormState.rol_name
                })
                .eq('rol_id', editingId);

            if (error) throw error;

            setRoles(roles.map(r =>
                r.rol_id === editingId
                    ? { ...r, ...editFormState }
                    : r
            ));

            toast.success('Rol actualizado');
            handleCancelEditing();
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este rol?')) return;

        try {
            const { error } = await supabase
                .from('rol')
                .delete()
                .eq('rol_id', id);

            if (error) throw error;

            setRoles(roles.filter(r => r.rol_id !== id));
            toast.success('Rol eliminado');
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    // Filter roles based on search term
    const filteredRoles = roles.filter(role =>
        role.rol_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Gestión de Roles</h2>
            </div>

            <div className="content">
                <div className="section">
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar roles..."
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
                        title="Añadir Rol"
                    >
                        <form onSubmit={handleCreateRole} className="add-product-form" style={{ marginTop: 0 }}>
                            <input
                                type="text"
                                placeholder="Nombre del Rol"
                                value={newRoleName}
                                onChange={(e) => setNewRoleName(e.target.value)}
                                required
                            />
                            <button type="submit" className="button">Añadir</button>
                        </form>
                    </Modal>
                </div>

                <div className="section">
                    <h3>Lista de Roles</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRoles.map((role) => (
                                        <RolItem
                                            key={role.rol_id}
                                            role={role}
                                            isEditing={editingId === role.rol_id}
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



