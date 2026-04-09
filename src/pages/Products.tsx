import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import AddProductForm from '../components/AddProductForm';
import ProductItem from '../components/ProductItem';
import Modal from '../components/Modal';

export type Product = {
  _id: string;
  name: string;
  description: string;
  created_at: string;
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await apiClient.get('/products');
      setProducts(data);
    } catch (error: any) {
      toast.error('Error al cargar productos: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleProductAdded = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    setIsModalOpen(false);
  };

  const handleStartEditing = (product: Product) => {
    setEditingId(product._id);
    setEditFormState({ name: product.name || '', description: product.description || '' });
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditFormState({ name: '', description: '' });
  };

  const handleUpdateProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const { data } = await apiClient.put(`/products/${editingId}`, editFormState);
      setProducts(products.map(p => p._id === editingId ? data : p));
      toast.success('Producto actualizado');
      handleCancelEditing();
    } catch (error: any) {
      toast.error('Error al actualizar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Producto eliminado');
    } catch (error: any) {
      toast.error('Error al eliminar: ' + (error.response?.data?.message || error.message));
    }
  };

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
            <button className="button" onClick={() => setIsModalOpen(true)}>Agregar</button>
          </div>
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Agregar Producto">
            <AddProductForm onProductAdded={handleProductAdded} />
          </Modal>
        </div>
        <div className="section">
          <h3>Lista de Productos</h3>
          {isLoading ? (<p>Cargando...</p>) : (
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
                      key={product._id}
                      product={product}
                      isEditing={editingId === product._id}
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
