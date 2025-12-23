import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import AddUnitForm from '../components/AddUnitForm';
import UnitItem from '../components/UnitItem';
import { Database } from '../types/supabase';

type UnitOfMeasure = Database['public']['Tables']['units_of_measure']['Row'];

const Units = () => {


    const [units, setUnits] = useState<UnitOfMeasure[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUnits = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('units_of_measure')
                .select('*')
                .order('name');

            if (error) throw error;
            setUnits(data || []);
        } catch (error: any) {
            toast.error(`Error al cargar unidades: ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUnits();
    }, [fetchUnits]);

    const handleUnitAdded = (newUnit: UnitOfMeasure) => {
        setUnits([newUnit, ...units]);
    };

    const handleUnitUpdated = (updatedUnit: UnitOfMeasure) => {
        setUnits(units.map(u => u.id === updatedUnit.id ? updatedUnit : u));
    };

    const handleUnitDeleted = (id: number) => {
        setUnits(units.filter(u => u.id !== id));
    };

    return (
        <div className="container">
            <h1>Unidades de Medida</h1>
            <AddUnitForm onUnitAdded={handleUnitAdded} />
            {loading ? (
                <p>Cargando unidades...</p>
            ) : (
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Abreviatura</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {units.map(unit => (
                            <UnitItem
                                key={unit.id}
                                unit={unit}
                                onUnitUpdated={handleUnitUpdated}
                                onUnitDeleted={handleUnitDeleted}
                            />
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Units;


