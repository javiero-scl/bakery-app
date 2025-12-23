import React from 'react';
import { Database } from '../types/supabase';

type Sale = Database['public']['Tables']['sales']['Row'] & {
    products: { name: string } | null;
};

interface SaleItemProps {
    sale: Sale;
    isEditing: boolean;
    editFormState: { quantity_sold: number; unit_sale_price: number; sale_date: string };
    onStartEditing: (sale: Sale) => void;
    onCancelEditing: () => void;
    onUpdateSale: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onDeleteSale: (id: number) => Promise<void>;
    setEditFormState: React.Dispatch<React.SetStateAction<{ quantity_sold: number; unit_sale_price: number; sale_date: string }>>;
}

const SaleItem = ({
    sale,
    isEditing,
    editFormState,
    onStartEditing,
    onCancelEditing,
    onUpdateSale,
    onDeleteSale,
    setEditFormState,
}: SaleItemProps) => {
    if (isEditing) {
        return (
            <tr>
                <td>{sale.products?.name}</td>
                <td colSpan={4}>
                    <form onSubmit={onUpdateSale} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <input
                            type="number"
                            value={editFormState.quantity_sold}
                            onChange={(e) => setEditFormState({ ...editFormState, quantity_sold: parseFloat(e.target.value) })}
                            placeholder="Cantidad"
                            required
                            style={{ flex: 1 }}
                        />
                        <input
                            type="number"
                            value={editFormState.unit_sale_price}
                            onChange={(e) => setEditFormState({ ...editFormState, unit_sale_price: parseFloat(e.target.value) })}
                            placeholder="Precio Unitario"
                            required
                            style={{ flex: 1 }}
                        />
                        <input
                            type="date"
                            value={editFormState.sale_date}
                            onChange={(e) => setEditFormState({ ...editFormState, sale_date: e.target.value })}
                            required
                            style={{ flex: 1 }}
                        />
                        <div className="button-group">
                            <button type="submit" className="button">Guardar</button>
                            <button type="button" className="button button-secondary" onClick={onCancelEditing}>Cancelar</button>
                        </div>
                    </form>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td>{sale.products?.name}</td>
            <td>{sale.quantity_sold}</td>
            <td>${sale.unit_sale_price}</td>
            <td>{sale.sale_date}</td>
            <td>
                <div className="button-group">
                    <button className="button" onClick={() => onStartEditing(sale)}>Editar</button>
                    <button className="button button-secondary" onClick={() => onDeleteSale(sale.id)}>Eliminar</button>
                </div>
            </td>
        </tr>
    );
};

export default SaleItem;


