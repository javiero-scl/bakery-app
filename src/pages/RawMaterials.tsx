
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import AddRawMaterialForm from '../components/AddRawMaterialForm';
import RawMaterialItem from '../components/RawMaterialItem';
import Modal from '../components/Modal';

type RawMaterial = Database['public']['Tables']['raw_materials']['Row'] & {
    units_of_measure: { name: string; abbreviation: string } | null;
};

const RawMaterials = () => {


    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    const [units, setUnits] = useState<Database['public']['Tables']['units_of_measure']['Row'][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormState, setEditFormState] = useState({ name: '', unit_id: 0 });

    // New state for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRawMaterials = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data: rawMaterialsData, error: rmError } = await supabase
                .from('raw_materials')
                .select('*, units_of_measure(name, abbreviation)')
                .order('created_at', { ascending: false });

            const { data: unitsData, error: uError } = await supabase
                .from('units_of_measure')
                .select('*')
                .order('name');

            if (rmError) throw rmError;
            if (uError) throw uError;

            if (rawMaterialsData) {
                setRawMaterials(rawMaterialsData as any);
            }
            if (unitsData) {
                setUnits(unitsData);
            }
        } catch (error: any) {
            toast.error('Error al cargar datos: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRawMaterials();
    }, [fetchRawMaterials]);

    const handleRawMaterialAdded = (newRawMaterial: Database['public']['Tables']['raw_materials']['Row']) => {
        setRawMaterials([newRawMaterial as RawMaterial, ...rawMaterials]);
        setIsModalOpen(false); // Close modal after adding
    };

    const handleStartEditing = (rawMaterial: RawMaterial) => {
        setEditingId(rawMaterial.id);
        setEditFormState({
            name: rawMaterial.name || '',
            unit_id: rawMaterial.unit_id || 0
        });
    };

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditFormState({ name: '', unit_id: 0 });
    };

    const handleUpdateRawMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('raw_materials')
                .update({
                    name: editFormState.name,
                    unit_id: editFormState.unit_id
                })
                .eq('id', editingId);

            if (error) throw error;

            setRawMaterials(rawMaterials.map(rm =>
                rm.id === editingId
                    ? { ...rm, ...editFormState }
                    : rm
            ));

            toast.success('Materia prima actualizada');
            handleCancelEditing();
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    const handleDeleteRawMaterial = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta materia prima?')) return;

        try {
            const { error } = await supabase
                .from('raw_materials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRawMaterials(rawMaterials.filter(rm => rm.id !== id));
            toast.success('Materia prima eliminada');
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    // Filter raw materials based on search term
    const filteredRawMaterials = rawMaterials.filter(rm =>
        rm.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Gestión de Materias Primas</h2>
            </div>

            <div className="content">
                <div className="section">
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar materias primas..."
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
                        title="Agregar Materia Prima"
                    >
                        <AddRawMaterialForm onRawMaterialAdded={handleRawMaterialAdded} />
                    </Modal>
                </div>

                <div className="section">
                    <h3>Lista de Materias Primas</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Unidad</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRawMaterials.map((rm) => (
                                        <RawMaterialItem
                                            key={rm.id}
                                            rawMaterial={rm}
                                            isEditing={editingId === rm.id}
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



