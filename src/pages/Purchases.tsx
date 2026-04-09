import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import AddPurchaseForm from '../components/AddPurchaseForm';
import PurchaseItem from '../components/PurchaseItem';
import Modal from '../components/Modal';

export type Purchase = {
  _id: string;
  raw_material_id: string;
  raw_material_name?: string; // Populated from backend
  unit_abbreviation?: string; // Populated from backend
  quantity: number;
  total_cost: number;
  purchase_date: string;
  created_at: string;
};

const Purchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState({ quantity: 0, total_cost: 0, purchase_date: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPurchases = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/purchases');
      setPurchases(data);
    } catch (error: any) {
      toast.error('Error al cargar compras: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPurchases(); }, [fetchPurchases]);

  const handlePurchaseAdded = (newPurchase: Purchase) => {
    setPurchases([newPurchase, ...purchases]);
    setIsModalOpen(false);
  };

  const handleStartEditing = (purchase: Purchase) => {
    setEditingId(purchase._id);
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
      const { data } = await apiClient.put(`/purchases/${editingId}`, editFormState);
      setPurchases(purchases.map(p => p._id === editingId ? data : p));
      toast.success('Compra actualizada');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta compra?')) return;
    try {
      await apiClient.delete(`/purchases/${id}`);
      setPurchases(purchases.filter(p => p._id !== id));
      toast.success('Compra eliminada');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.raw_material_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header"><h2>Gestión de Compras</h2></div>
      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input type="text" placeholder="Buscar por materia prima..." className="search-bar"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="button" onClick={() => setIsModalOpen(true)}>Agregar</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Compra">
            <AddPurchaseForm onPurchaseAdded={handlePurchaseAdded} />
          </Modal>
        </div>
        <div className="section">
          <h3>Historial de Compras</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Materia Prima</th><th>Cantidad</th><th>Costo Total</th><th>Fecha</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <PurchaseItem
                      key={purchase._id}
                      purchase={purchase}
                      isEditing={editingId === purchase._id}
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
