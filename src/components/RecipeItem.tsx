import React from 'react';
import { Database } from '../types/supabase';

type Recipe = Database['public']['Tables']['recipes']['Row'] & {
    products: { name: string } | null;
    raw_materials: { name: string } | null;
    units_of_measure: { name: string; abbreviation: string } | null;
};

interface RecipeItemProps {
    recipe: Recipe;
    isEditing: boolean;
    editFormState: { required_quantity: number; unit_id: number };
    onStartEditing: (recipe: Recipe) => void;
    onCancelEditing: () => void;
    onUpdateRecipe: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    onDeleteRecipe: (id: number) => Promise<void>;
    setEditFormState: React.Dispatch<React.SetStateAction<{ required_quantity: number; unit_id: number }>>;
    units: Database['public']['Tables']['units_of_measure']['Row'][];
}

const RecipeItem = ({
    recipe,
    isEditing,
    editFormState,
    onStartEditing,
    onCancelEditing,
    onUpdateRecipe,
    onDeleteRecipe,
    setEditFormState,
    units,
}: RecipeItemProps) => {
    if (isEditing) {
        return (
            <tr>
                <td>{recipe.products?.name}</td>
                <td>{recipe.raw_materials?.name}</td>
                <td>
                    <form onSubmit={onUpdateRecipe} style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <input
                            type="number"
                            value={editFormState.required_quantity}
                            onChange={(e) => setEditFormState({ ...editFormState, required_quantity: parseFloat(e.target.value) })}
                            placeholder="Cantidad"
                            required
                            style={{ flex: 1 }}
                        />
                        <select
                            value={editFormState.unit_id}
                            onChange={(e) => setEditFormState({ ...editFormState, unit_id: Number(e.target.value) })}
                            required
                            style={{ flex: 1 }}
                        >
                            <option value="">Unidad</option>
                            {units.map(u => (
                                <option key={u.id} value={u.id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
                            ))}
                        </select>
                        <div className="button-group">
                            <button type="submit" className="button">Guardar</button>
                            <button type="button" className="button button-secondary" onClick={onCancelEditing}>Cancelar</button>
                        </div>
                    </form>
                </td>
                <td></td>
            </tr>
        );
    }

    return (
        <tr>
            <td>{recipe.products?.name}</td>
            <td>{recipe.raw_materials?.name}</td>
            <td>{recipe.required_quantity} {recipe.units_of_measure?.name} {recipe.units_of_measure?.abbreviation ? `(${recipe.units_of_measure.abbreviation})` : ''}</td>
            <td>
                <div className="button-group">
                    <button className="button" onClick={() => onStartEditing(recipe)}>Editar</button>
                    <button className="button button-secondary" onClick={() => onDeleteRecipe(recipe.id)}>Eliminar</button>
                </div>
            </td>
        </tr>
    );
};

export default RecipeItem;
