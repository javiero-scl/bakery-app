import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';

type Recipe = Database['public']['Tables']['recipes']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type RawMaterial = Database['public']['Tables']['raw_materials']['Row'] & {
    units_of_measure: { name: string; abbreviation: string } | null;
};
type UnitOfMeasure = Database['public']['Tables']['units_of_measure']['Row'];

interface AddRecipeFormProps {
    onRecipeAdded: (recipe: Recipe) => void;
}

const AddRecipeForm = ({ onRecipeAdded }: AddRecipeFormProps) => {
    const supabase = useSupabaseClient();
    const [products, setProducts] = useState<Product[]>([]);
    const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
    const [units, setUnits] = useState<UnitOfMeasure[]>([]);

    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<number | ''>('');
    const [selectedUnitId, setSelectedUnitId] = useState<number | ''>('');
    const [requiredQuantity, setRequiredQuantity] = useState<number | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchOptions();
    }, []);

    async function fetchOptions() {
        try {
            const { data: productsData } = await supabase.from('products').select('*');
            const { data: rawMaterialsData } = await supabase.from('raw_materials').select('*, units_of_measure(name, abbreviation)');
            const { data: unitsData } = await supabase.from('units_of_measure').select('*');

            if (productsData) setProducts(productsData);
            if (rawMaterialsData) setRawMaterials(rawMaterialsData);
            if (unitsData) setUnits(unitsData);
        } catch (error) {
            console.error('Error fetching options:', error);
        }
    }

    const handleCreateRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedProductId || !selectedRawMaterialId || !requiredQuantity || !selectedUnitId) {
            toast.error('Todos los campos son obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('recipes')
                .insert({
                    product_id: Number(selectedProductId),
                    raw_material_id: Number(selectedRawMaterialId),
                    required_quantity: Number(requiredQuantity),
                    unit_id: Number(selectedUnitId)
                })
                .select('*, products(name), raw_materials(name), units_of_measure(name, abbreviation)')
                .single();

            if (error) throw error;

            if (data) {
                onRecipeAdded(data);
                toast.success('Ingrediente añadido a la receta exitosamente!');
                setRequiredQuantity('');
                setSelectedUnitId('');
                // Keep product selected for easier multiple entry
            }
        } catch (error: any) {
            toast.error(`Error al crear: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-product-form">
            <h3>Añadir Ingrediente a Receta</h3>
            <form onSubmit={handleCreateRecipe}>
                <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(Number(e.target.value))}
                    className="form-select"
                >
                    <option value="">Seleccionar Producto</option>
                    {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>

                <select
                    value={selectedRawMaterialId}
                    onChange={(e) => setSelectedRawMaterialId(Number(e.target.value))}
                    className="form-select"
                >
                    <option value="">Seleccionar Ingrediente</option>
                    {rawMaterials.map(rm => (
                        <option key={rm.id} value={rm.id}>{rm.name} ({rm.units_of_measure?.name} {rm.units_of_measure?.abbreviation ? `(${rm.units_of_measure.abbreviation})` : ''})</option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Cantidad Requerida"
                    value={requiredQuantity}
                    onChange={(e) => setRequiredQuantity(parseFloat(e.target.value))}
                    step="0.01"
                />

                <select
                    value={selectedUnitId}
                    onChange={(e) => setSelectedUnitId(Number(e.target.value))}
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

export default AddRecipeForm;
