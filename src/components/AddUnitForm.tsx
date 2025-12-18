import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';

type UnitOfMeasure = Database['public']['Tables']['units_of_measure']['Row'];

interface AddUnitFormProps {
    onUnitAdded: (unit: UnitOfMeasure) => void;
}

const AddUnitForm = ({ onUnitAdded }: AddUnitFormProps) => {
    const supabase = useSupabaseClient();
    const [name, setName] = useState('');
    const [abbreviation, setAbbreviation] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateUnit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('El nombre es obligatorio.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('units_of_measure')
                .insert({
                    name: name.trim(),
                    abbreviation: abbreviation.trim() || null
                })
                .select()
                .single();

            if (error) throw error;

            if (data) {
                onUnitAdded(data);
                toast.success('Unidad de medida creada exitosamente!');
                setName('');
                setAbbreviation('');
            }
        } catch (error: any) {
            toast.error(`Error al crear unidad: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-form">
            <h3>Añadir Unidad de Medida</h3>
            <form onSubmit={handleCreateUnit}>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre (ej. Kilogramo)"
                    required
                    className="form-input"
                />
                <input
                    type="text"
                    value={abbreviation}
                    onChange={(e) => setAbbreviation(e.target.value)}
                    placeholder="Abreviatura (ej. kg)"
                    className="form-input"
                />
                <button type="submit" className="button" disabled={isSubmitting}>
                    {isSubmitting ? 'Creando...' : 'Crear Unidad'}
                </button>
            </form>
        </div>
    );
};

export default AddUnitForm;