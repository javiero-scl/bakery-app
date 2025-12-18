import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';
import AddPurchaseForm from '../components/AddPurchaseForm';
import PurchaseItem from '../components/PurchaseItem';
import Modal from '../components/Modal';

type Purchase = Database['public']['Tables']['purchases']['Row'] & {
    raw_materials: { name: string } | null;
    units_of_measure: { name: string; abbreviation: string } | null;
};

const Purchases = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormState, setEditFormState] = useState({ quantity: 0, total_cost: 0, purchase_date: '' });

    // New state for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchPurchases();
    }, [session]);

    async function fetchPurchases() {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('purchases')
                .select('*, raw_materials(name), units_of_measure(name, abbreviation)')
                .order('purchase_date', { ascending: false });

            if (error) throw error;

            if (data) {
                setPurchases(data as any);
            }
        } catch (error: any) {
            toast.error('Error al cargar compras: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handlePurchaseAdded = (newPurchase: any) => {
        setPurchases([newPurchase, ...purchases]);
        setIsModalOpen(false); // Close modal after adding
    };

    const handleStartEditing = (purchase: Purchase) => {
        setEditingId(purchase.id);
        setEditFormState({
            quantity: purchase.quantity || 0,
            total_cost: purchase.total_cost || 0,
            purchase_date: purchase.purchase_date || ''
        });
    };

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditFormState({ quantity: 0, total_cost: 0, purchase_date: '' });
    };

    const handleUpdatePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('purchases')
                .update({
                    quantity: editFormState.quantity,
                    total_cost: editFormState.total_cost,
                    purchase_date: editFormState.purchase_date
                })
                .eq('id', editingId);

            if (error) throw error;

            setPurchases(purchases.map(p =>
                p.id === editingId
                    ? { ...p, ...editFormState }
                    : p
            ));

            toast.success('Compra actualizada');
            handleCancelEditing();
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    const handleDeletePurchase = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta compra?')) return;

        try {
            const { error } = await supabase
                .from('purchases')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setPurchases(purchases.filter(p => p.id !== id));
            toast.success('Compra eliminada');
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    // Filter purchases based on search term
    const filteredPurchases = purchases.filter(purchase =>
        purchase.raw_materials?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Gestión de Compras</h2>
            </div>

            <div className="content">
                <div className="section">
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar por materia prima..."
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
                        title="Registrar Compra"
                    >
                        <AddPurchaseForm onPurchaseAdded={handlePurchaseAdded} />
                    </Modal>
                </div>

                <div className="section">
                    <h3>Historial de Compras</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Materia Prima</th>
                                        <th>Cantidad</th>
                                        <th>Costo Total</th>
                                        <th>Fecha</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPurchases.map((purchase) => (
                                        <PurchaseItem
                                            key={purchase.id}
                                            purchase={purchase}
                                            isEditing={editingId === purchase.id}
                                            editFormState={editFormState}
                                            onStartEditing={handleStartEditing}
                                            onCancelEditing={handleCancelEditing}
                                            onUpdatePurchase={handleUpdatePurchase}
                                            onDeletePurchase={handleDeletePurchase}
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

export default Purchases;
