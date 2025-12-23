import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

interface AddRawMaterialFormProps {
    onRawMaterialAdded: (rawMaterial: Database['public']['Tables']['raw_materials']['Row']) => void;
}

const AddRawMaterialForm = ({ onRawMaterialAdded }: AddRawMaterialFormProps) => {

    const [name, setName] = useState('');
    const [unitId, setUnitId] = useState<number | ''>('');
    const [units, setUnits] = useState<Database['public']['Tables']['units_of_measure']['Row'][]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUnits = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('units_of_measure')
                .select('*')
                .order('name');

            if (error) throw error;
            setUnits(data || []);
        } catch (error: any) {
            toast.error('Error al cargar unidades: ' + error.message);
        }
    }, []);

    useEffect(() => {
        fetchUnits();
    }, [fetchUnits]);

    const handleCreateRawMaterial = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name || !unitId) {
            toast.error('Todos los campos son obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('raw_materials')
                .insert({ name, unit_id: Number(unitId) })
                .select('*, units_of_measure(name, abbreviation)')
                .single();

            if (error) throw error;

            if (data) {
                onRawMaterialAdded(data);
                toast.success('Materia prima añadida exitosamente!');
                setName('');
                setUnitId('');
            }
        } catch (error: any) {
            toast.error(`Error al crear: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-product-form">
            <h3>Añadir Nueva Materia Prima</h3>
            <form onSubmit={handleCreateRawMaterial}>
                <input
                    type="text"
                    placeholder="Nombre (ej: Harina)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <select
                    value={unitId}
                    onChange={(e) => setUnitId(Number(e.target.value))}
                    className="form-select"
                >
                    <option value="">Seleccionar Unidad</option>
                    {units.map(u => (
                        <option key={u.id} value={u.id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
                    ))}
                </select>
                <button type="submit" className="button" disabled={isSubmitting}>
                    {isSubmitting ? 'Añadiendo...' : 'Añadir'}
                </button>
            </form>
        </div>
    );
};

export default AddRawMaterialForm;


