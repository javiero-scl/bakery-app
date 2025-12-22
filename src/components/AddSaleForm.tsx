import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';

type Sale = Database['public']['Tables']['sales']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface AddSaleFormProps {
    onSaleAdded: (sale: Sale) => void;
}

const AddSaleForm = ({ onSaleAdded }: AddSaleFormProps) => {
    const supabase = useSupabaseClient();
    const [products, setProducts] = useState<Product[]>([]);

    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [quantitySold, setQuantitySold] = useState<number | ''>('');
    const [unitSalePrice, setUnitSalePrice] = useState<number | ''>('');
    const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            const { data } = await supabase.from('products').select('*');
            if (data) setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleCreateSale = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedProductId || !quantitySold || !unitSalePrice || !saleDate) {
            toast.error('Todos los campos son obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('sales')
                .insert({
                    product_id: Number(selectedProductId),
                    quantity_sold: Number(quantitySold),
                    unit_sale_price: Number(unitSalePrice),
                    sale_date: saleDate
                })
                .select('*, products(name)')
                .single();

            if (error) throw error;

            if (data) {
                onSaleAdded(data);
                toast.success('Venta registrada exitosamente!');
                setQuantitySold('');
                setUnitSalePrice('');
                // Keep product and date for easier multiple entry
            }
        } catch (error: any) {
            toast.error(`Error al crear: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-product-form">
            <h3>Registrar Venta</h3>
            <form onSubmit={handleCreateSale}>
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

                <input
                    type="number"
                    placeholder="Cantidad Vendida"
                    value={quantitySold}
                    onChange={(e) => setQuantitySold(parseFloat(e.target.value))}
                />

                <input
                    type="number"
                    placeholder="Precio Unitario"
                    value={unitSalePrice}
                    onChange={(e) => setUnitSalePrice(parseFloat(e.target.value))}
                    step="0.01"
                />

                <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                />

                <button type="submit" className="button" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
                </button>
            </form>
        </div>
    );
};

export default AddSaleForm;
