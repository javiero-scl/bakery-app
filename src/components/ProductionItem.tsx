import React from 'react';
import { Database } from '../types/supabase';

type Production = Database['public']['Tables']['productions']['Row'] & {
    products: { name: string } | null;
};

interface ProductionItemProps {
    production: Production;
    isEditing: boolean;
    editFormState: { quantity_produced: number; production_date: string };
    onStartEditing: (production: Production) => void;
    onCancelEditing: () => void;
    onUpdateProduction: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onDeleteProduction: (id: number) => Promise<void>;
    setEditFormState: React.Dispatch<React.SetStateAction<{ quantity_produced: number; production_date: string }>>;
}

const ProductionItem = ({
    production,
    isEditing,
    editFormState,
    onStartEditing,
    onCancelEditing,
    onUpdateProduction,
    onDeleteProduction,
    setEditFormState,
}: ProductionItemProps) => {
    if (isEditing) {
        return (
            <tr>
                <td>{production.products?.name}</td>
                <td colSpan={3}>
                    <form onSubmit={onUpdateProduction} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <input
                            type="number"
                            value={editFormState.quantity_produced}
                            onChange={(e) => setEditFormState({ ...editFormState, quantity_produced: parseFloat(e.target.value) })}
                            placeholder="Cantidad"
                            required
                            style={{ flex: 1 }}
                        />
                        <input
                            type="date"
                            value={editFormState.production_date}
                            onChange={(e) => setEditFormState({ ...editFormState, production_date: e.target.value })}
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
            <td>{production.products?.name}</td>
            <td>{production.quantity_produced}</td>
            <td>{production.production_date}</td>
            <td>
                <div className="button-group">
                    <button className="button" onClick={() => onStartEditing(production)}>Editar</button>
                    <button className="button button-secondary" onClick={() => onDeleteProduction(production.id)}>Eliminar</button>
                </div>
            </td>
        </tr>
    );
};

export default ProductionItem;
