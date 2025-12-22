import React, { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';

type Production = Database['public']['Tables']['productions']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

interface AddProductionFormProps {
    onProductionAdded: (production: Production) => void;
}

const AddProductionForm = ({ onProductionAdded }: AddProductionFormProps) => {
    const supabase = useSupabaseClient();
    const [products, setProducts] = useState<Product[]>([]);

    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [quantityProduced, setQuantityProduced] = useState<number | ''>('');
    const [productionDate, setProductionDate] = useState<string>('');
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

    const handleCreateProduction = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedProductId || !quantityProduced || !productionDate) {
            toast.error('Todos los campos son obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('productions')
                .insert({
                    product_id: Number(selectedProductId),
                    quantity_produced: Number(quantityProduced),
                    production_date: productionDate
                })
                .select('*, products(name)')
                .single();

            if (error) throw error;

            if (data) {
                onProductionAdded(data);
                toast.success('Producción registrada exitosamente!');
                setQuantityProduced('');
                // Keep product and dates for easier multiple entry
            }
        } catch (error: any) {
            toast.error(`Error al crear: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-product-form" style={{ marginTop: 0 }}>
            <form onSubmit={handleCreateProduction}>
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
                    placeholder="Cantidad Producida"
                    value={quantityProduced}
                    onChange={(e) => setQuantityProduced(parseFloat(e.target.value))}
                />

                <div className="form-group">
                    <label>Fecha de Elaboración:</label>
                    <input
                        type="date"
                        value={productionDate}
                        onChange={(e) => setProductionDate(e.target.value)}
                    />
                </div>

                <button type="submit" className="button" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar Producción'}
                </button>
            </form>
        </div>
    );
};

export default AddProductionForm;
