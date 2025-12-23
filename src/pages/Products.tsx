
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase';
import AddProductForm from '../components/AddProductForm';
import ProductItem from '../components/ProductItem';
import Modal from '../components/Modal';

type Product = Database['public']['Tables']['products']['Row'];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormState, setEditFormState] = useState({ name: '', description: '' });

  // New state for Search and Modal
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProducts(data);
      }
    } catch (error: any) {
      toast.error('Error al cargar productos: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductAdded = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    setIsModalOpen(false); // Close modal after adding
  };

  const handleStartEditing = (product: Product) => {
    setEditingId(product.id);
    setEditFormState({
      name: product.name || '',
      description: product.description || ''
    });
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditFormState({ name: '', description: '' });
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: editFormState.name,
          description: editFormState.description
        })
        .eq('id', editingId);

      if (error) throw error;

      setProducts(products.map(p =>
        p.id === editingId
          ? { ...p, ...editFormState }
          : p
      ));

      toast.success('Producto actualizado');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + error.message);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProducts(products.filter(p => p.id !== id));
      toast.success('Producto eliminado');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + error.message);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header">
        <h2>Gestión de Productos</h2>
      </div>

      <div className="content">
        <div className="section">
          <div className="header-actions">
            <input
              type="text"
              placeholder="Buscar productos..."
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
            title="Agregar Producto"
          >
            <AddProductForm onProductAdded={handleProductAdded} />
          </Modal>
        </div>

        <div className="section">
          <h3>Lista de Productos</h3>
          {isLoading ? (
            <p>Cargando...</p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <ProductItem
                      key={product.id}
                      product={product}
                      isEditing={editingId === product.id}
                      editFormState={editFormState}
                      onStartEditing={handleStartEditing}
                      onCancelEditing={handleCancelEditing}
                      onUpdateProduct={handleUpdateProduct}
                      onDeleteProduct={handleDeleteProduct}
                      setEditFormState={setEditFormState}
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

export default Products;



