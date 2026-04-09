import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import AddSaleForm from '../components/AddSaleForm';
import SaleItem from '../components/SaleItem';
import Modal from '../components/Modal';

export type Sale = {
  _id: string;
  product_id: string;
  product_name?: string; // Populated from backend join
  quantity_sold: number;
  unit_sale_price: number;
  sale_date: string;
  weighted_average_cost_at_sale?: number;
  created_at: string;
};

const Sales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState({ quantity_sold: 0, unit_sale_price: 0, sale_date: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/sales');
      setSales(data);
    } catch (error: any) {
      toast.error('Error al cargar ventas: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const handleSaleAdded = (newSale: Sale) => {
    setSales([newSale, ...sales]);
    setIsModalOpen(false);
  };

  const handleStartEditing = (sale: Sale) => {
    setEditingId(sale._id);
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
      const { data } = await apiClient.put(`/sales/${editingId}`, editFormState);
      setSales(sales.map(s => s._id === editingId ? data : s));
      toast.success('Venta actualizada');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteSale = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta venta?')) return;
    try {
      await apiClient.delete(`/sales/${id}`);
      setSales(sales.filter(s => s._id !== id));
      toast.success('Venta eliminada');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header"><h2>Gestión de Ventas</h2></div>
      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input type="text" placeholder="Buscar por producto..." className="search-bar"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="button" onClick={() => setIsModalOpen(true)}>Agregar</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Venta">
            <AddSaleForm onSaleAdded={handleSaleAdded} />
          </Modal>
        </div>
        <div className="section">
          <h3>Historial de Ventas</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Fecha</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <SaleItem
                      key={sale._id}
                      sale={sale}
                      isEditing={editingId === sale._id}
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
