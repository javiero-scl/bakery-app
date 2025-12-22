import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Database } from '../types/supabase';
import AddRecipeForm from '../components/AddRecipeForm';
import RecipeItem from '../components/RecipeItem';
import Modal from '../components/Modal';

type Recipe = Database['public']['Tables']['recipes']['Row'] & {
    products: { name: string } | null;
    raw_materials: { name: string } | null;
    units_of_measure: { name: string; abbreviation: string } | null;
};

const Recipes = () => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [units, setUnits] = useState<Database['public']['Tables']['units_of_measure']['Row'][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormState, setEditFormState] = useState({ required_quantity: 0, unit_id: 0 });

    // New state for Search and Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchRecipes = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('recipes')
                .select('*, products(name), raw_materials(name), units_of_measure(name, abbreviation)')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                setRecipes(data as any);
            }
        } catch (error: any) {
            toast.error('Error al cargar recetas: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }, [supabase]);

    const fetchUnits = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('units_of_measure')
                .select('*')
                .order('name');

            if (error) throw error;
            setUnits(data || []);
        } catch (error: any) {
            toast.error('Error al cargar unidades: ' + error.message);
        }
    }, [supabase]);

    useEffect(() => {
        if (session) {
            fetchRecipes();
            fetchUnits();
        }
    }, [session, fetchRecipes, fetchUnits]);

    const handleRecipeAdded = (newRecipe: any) => {
        setRecipes([newRecipe, ...recipes]);
        setIsModalOpen(false); // Close modal after adding
    };

    const handleStartEditing = (recipe: Recipe) => {
        setEditingId(recipe.id);
        setEditFormState({
            required_quantity: recipe.required_quantity || 0,
            unit_id: recipe.unit_id || 0
        });
    };

    const handleCancelEditing = () => {
        setEditingId(null);
        setEditFormState({ required_quantity: 0, unit_id: 0 });
    };

    const handleUpdateRecipe = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId) return;

        try {
            const { error } = await supabase
                .from('recipes')
                .update({
                    required_quantity: editFormState.required_quantity,
                    unit_id: editFormState.unit_id
                })
                .eq('id', editingId);

            if (error) throw error;

            setRecipes(recipes.map(r =>
                r.id === editingId
                    ? { ...r, ...editFormState }
                    : r
            ));

            toast.success('Receta actualizada');
            handleCancelEditing();
        } catch (error: any) {
            toast.error('Error al actualizar: ' + error.message);
        }
    };

    const handleDeleteRecipe = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta receta?')) return;

        try {
            const { error } = await supabase
                .from('recipes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setRecipes(recipes.filter(r => r.id !== id));
            toast.success('Receta eliminada');
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    // Filter recipes based on search term
    const filteredRecipes = recipes.filter(recipe =>
        recipe.products?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.raw_materials?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="dashboard">
            <div className="header">
                <h2>Gestión de Recetas</h2>
            </div>

            <div className="content">
                <div className="section">
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Buscar por producto o ingrediente..."
                            className="search-bar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="button" onClick={() => setIsModalOpen(true)}>
                            Agregar
                        </button>
                    </div>

                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Agregar Ingrediente a Receta"
                    >
                        <AddRecipeForm onRecipeAdded={handleRecipeAdded} />
                    </Modal>
                </div>

                <div className="section">
                    <h3>Lista de Recetas</h3>
                    {isLoading ? (
                        <p>Cargando...</p>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Producto</th>
                                        <th>Ingrediente</th>
                                        <th>Cantidad Requerida</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRecipes.map((recipe) => (
                                        <RecipeItem
                                            key={recipe.id}
                                            recipe={recipe}
                                            isEditing={editingId === recipe.id}
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
