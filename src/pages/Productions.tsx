import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import AddProductionForm from '../components/AddProductionForm';
import ProductionItem from '../components/ProductionItem';
import Modal from '../components/Modal';

export type Production = {
  _id: string;
  product_id: string;
  product_name?: string; // Populated from backend
  quantity_produced: number;
  unit_production_cost?: number;
  production_date: string;
  created_at: string;
};

const Productions = () => {
  const [productions, setProductions] = useState<Production[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState({ quantity_produced: 0, production_date: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProductions = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/productions');
      setProductions(data);
    } catch (error: any) {
      toast.error('Error al cargar producciones: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProductions(); }, [fetchProductions]);

  const handleProductionAdded = (newProduction: Production) => {
    setProductions([newProduction, ...productions]);
    setIsModalOpen(false);
  };

  const handleStartEditing = (production: Production) => {
    setEditingId(production._id);
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
      const { data } = await apiClient.put(`/productions/${editingId}`, editFormState);
      setProductions(productions.map(p => p._id === editingId ? data : p));
      toast.success('Producción actualizada');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProduction = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta producción?')) return;
    try {
      await apiClient.delete(`/productions/${id}`);
      setProductions(productions.filter(p => p._id !== id));
      toast.success('Producción eliminada');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredProductions = productions.filter(production =>
    production.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header"><h2>Gestión de Producción</h2></div>
      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input type="text" placeholder="Buscar por producto..." className="search-bar"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="button" onClick={() => setIsModalOpen(true)}>Agregar</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Registrar Producción">
            <AddProductionForm onProductionAdded={handleProductionAdded} />
          </Modal>
        </div>
        <div className="section">
          <h3>Historial de Producción</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Producto</th><th>Cantidad</th><th>Fecha Elaboración</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filteredProductions.map((production) => (
                    <ProductionItem
                      key={production._id}
                      production={production}
                      isEditing={editingId === production._id}
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
