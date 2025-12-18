import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';
import AddProductionForm from '../components/AddProductionForm';
import ProductionItem from '../components/ProductionItem';
import Modal from '../components/Modal';

type Production = Database['public']['Tables']['productions']['Row'] & {
    products: { name: string } | null;
};

const Productions = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [productions, setProductions] = useState<Production[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormState, setEditFormState] = useState({ quantity_produced: 0, production_date: '' });

    // New state for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchProductions();
    }, [session]);

    async function fetchProductions() {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('productions')
                .select('*, products(name)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setProductions(data as any);
            }
        } catch (error: any) {
            toast.error('Error al cargar producciones: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleProductionAdded = (newProduction: any) => {
        setProductions([newProduction, ...productions]);
        setIsModalOpen(false); // Close modal after adding
    };

    const handleStartEditing = (production: Production) => {
        setEditingId(production.id);
        setEditFormState({
            quantity_produced: production.quantity_produced || 0,
            production_date: production.production_date || ''
        });
    };

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditFormState({ quantity_produced: 0, production_date: '' });
    };

    const handleUpdateProduction = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('productions')
                .update({
                    quantity_produced: editFormState.quantity_produced,
                    production_date: editFormState.production_date
                })
                .eq('id', editingId);

            if (error) throw error;

            setProductions(productions.map(p =>
                p.id === editingId
                    ? { ...p, ...editFormState }
                    : p
            ));

            toast.success('Producción actualizada');
            handleCancelEditing();
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    const handleDeleteProduction = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta producción?')) return;

        try {
            const { error } = await supabase
                .from('productions')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setProductions(productions.filter(p => p.id !== id));
            toast.success('Producción eliminada');
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    // Filter productions based on search term
    const filteredProductions = productions.filter(production =>
        production.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Gestión de Producción</h2>
            </div>

            <div className="content">
                <div className="section">
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar por producto..."
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
                        title="Registrar Producción"
                    >
                        <AddProductionForm onProductionAdded={handleProductionAdded} />
                    </Modal>
                </div>

                <div className="section">
                    <h3>Historial de Producción</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Fecha Elaboración</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProductions.map((production) => (
                                        <ProductionItem
                                            key={production.id}
                                            production={production}
                                            isEditing={editingId === production.id}
                                            editFormState={editFormState}
                                            onStartEditing={handleStartEditing}
                                            onCancelEditing={handleCancelEditing}
                                            onUpdateProduction={handleUpdateProduction}
                                            onDeleteProduction={handleDeleteProduction}
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

export default Productions;
