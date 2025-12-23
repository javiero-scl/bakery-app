import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';

type Purchase = Database['public']['Tables']['purchases']['Row'];
type RawMaterial = Database['public']['Tables']['raw_materials']['Row'] & {
    units_of_measure: { name: string; abbreviation: string } | null;
};

interface AddPurchaseFormProps {
    onPurchaseAdded: (purchase: Purchase) => void;
}

const AddPurchaseForm = ({ onPurchaseAdded }: AddPurchaseFormProps) => {

    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);

    const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<number | ''>('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [totalCost, setTotalCost] = useState<number | ''>('');
    const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchRawMaterials = useCallback(async () => {
        try {
            const { data } = await supabase.from('raw_materials').select('*, units_of_measure(name, abbreviation)');
            if (data) setRawMaterials(data as any);
        } catch (error) {
            console.error('Error fetching raw materials:', error);
        }
    }, [supabase]);

    useEffect(() => {
        fetchRawMaterials();
    }, [fetchRawMaterials]);

    const handleCreatePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedRawMaterialId || !quantity || !totalCost || !purchaseDate) {
            toast.error('Todos los campos son obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('purchases')
                .insert({
                    raw_material_id: Number(selectedRawMaterialId),
                    quantity: Number(quantity),
                    total_cost: Number(totalCost),
                    purchase_date: purchaseDate
                })
                .select('*, raw_materials(name, unit_of_measure)')
                .single();

            if (error) throw error;

            if (data) {
                onPurchaseAdded(data);
                toast.success('Compra registrada exitosamente!');
                setQuantity('');
                setTotalCost('');
                // Keep raw material and date for easier multiple entry
            }
        } catch (error: any) {
            toast.error(`Error al crear: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-product-form">
            <h3>Registrar Compra</h3>
            <form onSubmit={handleCreatePurchase}>
                <select
                    value={selectedRawMaterialId}
                    onChange={(e) => setSelectedRawMaterialId(Number(e.target.value))}
                    className="form-select"
                >
                    <option value="">Seleccionar Materia Prima</option>
                    {rawMaterials.map(rm => (
                        <option key={rm.id} value={rm.id}>{rm.name} ({rm.units_of_measure?.name} {rm.units_of_measure?.abbreviation ? `(${rm.units_of_measure.abbreviation})` : ''})</option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Cantidad Comprada"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value))}
                />

                <input
                    type="number"
                    placeholder="Costo Total"
                    value={totalCost}
                    onChange={(e) => setTotalCost(parseFloat(e.target.value))}
                    step="0.01"
                />

                <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                />

                <button type="submit" className="button" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar Compra'}
                </button>
            </form>
        </div>
    );
};

export default AddPurchaseForm;



