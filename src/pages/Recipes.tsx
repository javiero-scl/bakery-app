import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import AddRecipeForm from '../components/AddRecipeForm';
import RecipeItem from '../components/RecipeItem';
import Modal from '../components/Modal';
import { Unit } from './RawMaterials';

export type Recipe = {
  _id: string;
  product_id: string;
  product_name?: string;
  raw_material_id: string;
  raw_material_name?: string;
  required_quantity: number;
  unit_id: string;
  unit?: Unit;
  created_at: string;
};

const Recipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState({ required_quantity: 0, unit_id: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRecipes = useCallback(async () => {
    try {
      setIsLoading(true);
      const [recipesRes, unitsRes] = await Promise.all([
        apiClient.get('/recipes'),
        apiClient.get('/units'),
      ]);
      setRecipes(recipesRes.data);
      setUnits(unitsRes.data);
    } catch (error: any) {
      toast.error('Error al cargar recetas: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecipes(); }, [fetchRecipes]);

  const handleRecipeAdded = (newRecipe: Recipe) => {
    setRecipes([newRecipe, ...recipes]);
    setIsModalOpen(false);
  };

  const handleStartEditing = (recipe: Recipe) => {
    setEditingId(recipe._id);
    setEditFormState({ required_quantity: recipe.required_quantity || 0, unit_id: recipe.unit_id || '' });
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditFormState({ required_quantity: 0, unit_id: '' });
  };

  const handleUpdateRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const { data } = await apiClient.put(`/recipes/${editingId}`, editFormState);
      setRecipes(recipes.map(r => r._id === editingId ? data : r));
      toast.success('Receta actualizada');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar esta receta?')) return;
    try {
      await apiClient.delete(`/recipes/${id}`);
      setRecipes(recipes.filter(r => r._id !== id));
      toast.success('Receta eliminada');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredRecipes = recipes.filter(recipe =>
    recipe.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.raw_material_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header"><h2>Gestión de Recetas</h2></div>
      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input type="text" placeholder="Buscar por producto o ingrediente..." className="search-bar"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button className="button" onClick={() => setIsModalOpen(true)}>Agregar</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Ingrediente a Receta">
            <AddRecipeForm onRecipeAdded={handleRecipeAdded} />
          </Modal>
        </div>
        <div className="section">
          <h3>Lista de Recetas</h3>
          {isLoading ? (<p>Cargando...</p>) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr><th>Producto</th><th>Ingrediente</th><th>Cantidad Requerida</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filteredRecipes.map((recipe) => (
                    <RecipeItem
                      key={recipe._id}
                      recipe={recipe}
                      isEditing={editingId === recipe._id}
                      editFormState={editFormState}
                      onStartEditing={handleStartEditing}
                      onCancelEditing={handleCancelEditing}
                      onUpdateRecipe={handleUpdateRecipe}
                      onDeleteRecipe={handleDeleteRecipe}
                      setEditFormState={setEditFormState}
                      units={units}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipes;
