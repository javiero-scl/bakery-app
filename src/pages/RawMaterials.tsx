import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import AddRawMaterialForm from '../components/AddRawMaterialForm';
import RawMaterialItem from '../components/RawMaterialItem';
import Modal from '../components/Modal';

export type Unit = {
  _id: string;
  name: string;
  abbreviation: string;
};

export type RawMaterial = {
  _id: string;
  name: string;
  unit_id: string;
  unit?: Unit; // Populated from backend
  created_at: string;
};

const RawMaterials = () => {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState({ name: '', unit_id: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRawMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rmRes, unitsRes] = await Promise.all([
        apiClient.get('/raw-materials'),
        apiClient.get('/units'),
      ]);
      setRawMaterials(rmRes.data);
      setUnits(unitsRes.data);
    } catch (error: any) {
      toast.error('Error al cargar datos: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRawMaterials(); }, [fetchRawMaterials]);

  const handleRawMaterialAdded = (newRawMaterial: RawMaterial) => {
    setRawMaterials([newRawMaterial, ...rawMaterials]);
    setIsModalOpen(false);
  };

  const handleStartEditing = (rm: RawMaterial) => {
    setEditingId(rm._id);
    setEditFormState({ name: rm.name || '', unit_id: rm.unit_id || '' });
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditFormState({ name: '', unit_id: '' });
  };

  const handleUpdateRawMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const { data } = await apiClient.put(`/raw-materials/${editingId}`, editFormState);
      setRawMaterials(rawMaterials.map(rm => rm._id === editingId ? data : rm));
      toast.success('Materia prima actualizada');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRawMaterial = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta materia prima?')) return;
    try {
      await apiClient.delete(`/raw-materials/${id}`);
      setRawMaterials(rawMaterials.filter(rm => rm._id !== id));
      toast.success('Materia prima eliminada');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredRawMaterials = rawMaterials.filter(rm =>
    rm.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header"><h2>Gestión de Materias Primas</h2></div>
      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input type="text" placeholder="Buscar materias primas..." className="search-bar"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="button" onClick={() => setIsModalOpen(true)}>Agregar</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Materia Prima">
            <AddRawMaterialForm onRawMaterialAdded={handleRawMaterialAdded} />
          </Modal>
        </div>
        <div className="section">
          <h3>Lista de Materias Primas</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Nombre</th><th>Unidad</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filteredRawMaterials.map((rm) => (
                    <RawMaterialItem
                      key={rm._id}
                      rawMaterial={rm}
                      isEditing={editingId === rm._id}
                      editFormState={editFormState}
                      onStartEditing={handleStartEditing}
                      onCancelEditing={handleCancelEditing}
                      onUpdateRawMaterial={handleUpdateRawMaterial}
                      onDeleteRawMaterial={handleDeleteRawMaterial}
                      setEditFormState={setEditFormState}
                      units={units}
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

export default RawMaterials;
