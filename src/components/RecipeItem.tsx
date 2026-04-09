import React from 'react';
import { Recipe } from '../pages/Recipes';
import { Unit } from '../pages/RawMaterials';

interface RecipeItemProps {
  recipe: Recipe;
  isEditing: boolean;
  editFormState: { required_quantity: number; unit_id: string };
  onStartEditing: (recipe: Recipe) => void;
  onCancelEditing: () => void;
  onUpdateRecipe: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteRecipe: (id: string) => Promise<void>;
  setEditFormState: React.Dispatch<React.SetStateAction<{ required_quantity: number; unit_id: string }>>;
  units: Unit[];
}

const RecipeItem = ({
  recipe, isEditing, editFormState,
  onStartEditing, onCancelEditing, onUpdateRecipe, onDeleteRecipe, setEditFormState, units,
}: RecipeItemProps) => {
  if (isEditing) {
    return (
      <tr>
        <td>{recipe.product_name}</td>
        <td>{recipe.raw_material_name}</td>
        <td>
          <form onSubmit={onUpdateRecipe} style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <input type="number" value={editFormState.required_quantity}
              onChange={(e) => setEditFormState({ ...editFormState, required_quantity: parseFloat(e.target.value) })}
              placeholder="Cantidad" required style={{ flex: 1 }} />
            <select value={editFormState.unit_id}
              onChange={(e) => setEditFormState({ ...editFormState, unit_id: e.target.value })}
              required style={{ flex: 1 }}>
              <option value="">Unidad</option>
              {units.map(u => (
                <option key={u._id} value={u._id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
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
      <td>{recipe.product_name}</td>
      <td>{recipe.raw_material_name}</td>
      <td>
        {recipe.required_quantity} {recipe.unit?.name} {recipe.unit?.abbreviation ? `(${recipe.unit.abbreviation})` : ''}
      </td>
      <td>
        <div className="button-group">
          <button className="button" onClick={() => onStartEditing(recipe)}>Editar</button>
          <button className="button button-secondary" onClick={() => onDeleteRecipe(recipe._id)}>Eliminar</button>
        </div>
      </td>
    </tr>
  );
};

export default RecipeItem;
