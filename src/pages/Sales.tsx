
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import AddSaleForm from '../components/AddSaleForm';
import SaleItem from '../components/SaleItem';
import Modal from '../components/Modal';

type Sale = Database['public']['Tables']['sales']['Row'] & {
    products: { name: string } | null;
};

const Sales = () => {


    const [sales, setSales] = useState<Sale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormState, setEditFormState] = useState({ quantity_sold: 0, unit_sale_price: 0, sale_date: '' });

    // New state for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchSales = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('sales')
                .select('*, products(name)')
                .order('sale_date', { ascending: false });

            if (error) throw error;

            if (data) {
                setSales(data as any);
            }
        } catch (error: any) {
            toast.error('Error al cargar ventas: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const handleSaleAdded = (newSale: any) => {
        setSales([newSale, ...sales]);
        setIsModalOpen(false); // Close modal after adding
    };

    const handleStartEditing = (sale: Sale) => {
        setEditingId(sale.id);
        setEditFormState({
            quantity_sold: sale.quantity_sold || 0,
            unit_sale_price: sale.unit_sale_price || 0,
            sale_date: sale.sale_date || ''
        });
    };

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditFormState({ quantity_sold: 0, unit_sale_price: 0, sale_date: '' });
    };

    const handleUpdateSale = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('sales')
                .update({
                    quantity_sold: editFormState.quantity_sold,
                    unit_sale_price: editFormState.unit_sale_price,
                    sale_date: editFormState.sale_date
                })
                .eq('id', editingId);

            if (error) throw error;

            setSales(sales.map(s =>
                s.id === editingId
                    ? { ...s, ...editFormState }
                    : s
            ));

            toast.success('Venta actualizada');
            handleCancelEditing();
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    const handleDeleteSale = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta venta?')) return;

        try {
            const { error } = await supabase
                .from('sales')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setSales(sales.filter(s => s.id !== id));
            toast.success('Venta eliminada');
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    // Filter sales based on search term
    const filteredSales = sales.filter(sale =>
        sale.products?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Gestión de Ventas</h2>
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
                        title="Registrar Venta"
                    >
                        <AddSaleForm onSaleAdded={handleSaleAdded} />
                    </Modal>
                </div>

                <div className="section">
                    <h3>Historial de Ventas</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unitario</th>
                                        <th>Fecha</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSales.map((sale) => (
                                        <SaleItem
                                            key={sale.id}
                                            sale={sale}
                                            isEditing={editingId === sale.id}
                                            editFormState={editFormState}
                                            onStartEditing={handleStartEditing}
                                            onCancelEditing={handleCancelEditing}
                                            onUpdateSale={handleUpdateSale}
                                            onDeleteSale={handleDeleteSale}
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

export default Sales;



