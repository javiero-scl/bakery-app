import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';
import Modal from '../components/Modal';
import UserRoleItem from '../components/UserRoleItem';

type User = Database['public']['Tables']['user']['Row'];
type Role = Database['public']['Tables']['rol']['Row'];
type UserRole = Database['public']['Tables']['user_rol']['Row'] & {
    user: { user_name: string } | null;
    rol: { rol_name: string } | null;
};

const UserRoles = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [userRoles, setUserRoles] = useState<UserRole[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedUserName, setSelectedUserName] = useState<string>('');
    const [selectedRoleIdExt, setSelectedRoleIdExt] = useState<string>('');

    // New state for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [session]);

    async function fetchData() {
        try {
            setIsLoading(true);
            // Note: The foreign key relationships in supabase.ts are:
            // user_rol.user_name -> user.user_name
            // user_rol.rol_idext -> rol.rol_id_ext
            const { data: userRolesData, error: userRolesError } = await supabase
                .from('user_rol')
                .select('*, user(user_name), rol(rol_name)')
                .order('userrol_created_at', { ascending: false });

            const { data: usersData } = await supabase.from('user').select('*');
            const { data: rolesData } = await supabase.from('rol').select('*');

            if (userRolesError) throw userRolesError;

            if (userRolesData) setUserRoles(userRolesData as any);
            if (usersData) setUsers(usersData);
            if (rolesData) setRoles(rolesData);

        } catch (error: any) {
            toast.error('Error al cargar datos: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleAssignRole = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedUserName || !selectedRoleIdExt) return;

        try {
            const { data, error } = await supabase
                .from('user_rol')
                .insert({
                    user_name: selectedUserName,
                    rol_idext: selectedRoleIdExt
                })
                .select('*, user(user_name), rol(rol_name)')
                .single();

            if (error) throw error;

            if (data) {
                setUserRoles([data as any, ...userRoles]);
                toast.success('Rol asignado correctamente');
                setIsModalOpen(false); // Close modal after adding
            }
        } catch (error: any) {
            toast.error('Error al asignar rol: ' + error.message);
        }
    };

    const handleRemoveRole = async (id: number) => {
        if (!window.confirm('¿Estás seguro de remover este rol al usuario?')) return;

        try {
            const { error } = await supabase
                .from('user_rol')
                .delete()
                .eq('userrol_id', id);

            if (error) throw error;

            setUserRoles(userRoles.filter(ur => ur.userrol_id !== id));
            toast.success('Asignación eliminada');
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    // Filter user roles based on search term
    const filteredUserRoles = userRoles.filter(ur =>
        ur.user?.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ur.rol?.rol_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Asignación de Roles</h2>
            </div>

            <div className="content">
                <div className="section">
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar asignaciones..."
                            className="search-bar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="button" onClick={() => setIsModalOpen(true)}>
                            Asignar Rol
                        </button>
                    </div>

                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Asignar Rol a Usuario"
                    >
                        <form onSubmit={handleAssignRole} className="add-product-form" style={{ marginTop: 0 }}>
                            <select
                                value={selectedUserName}
                                onChange={(e) => setSelectedUserName(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Seleccionar Usuario</option>
                                {users.map(u => (
                                    <option key={u.user_id} value={u.user_name || ''}>{u.user_name}</option>
                                ))}
                            </select>

                            <select
                                value={selectedRoleIdExt}
                                onChange={(e) => setSelectedRoleIdExt(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Seleccionar Rol</option>
                                {roles.map(r => (
                                    <option key={r.rol_id} value={r.rol_id_ext || ''}>{r.rol_name}</option>
                                ))}
                            </select>

                            <button type="submit" className="button">Asignar</button>
                        </form>
                    </Modal>
                </div>

                <div className="section">
                    <h3>Roles Asignados</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Usuario</th>
                                        <th>Rol</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUserRoles.map((ur) => (
                                        <UserRoleItem
                                            key={ur.userrol_id}
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
