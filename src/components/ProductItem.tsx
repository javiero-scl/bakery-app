import React from 'react';
import { Database } from '../types/supabase';

type Product = Database['public']['Tables']['products']['Row'];

interface ProductItemProps {
  product: Product;
  isEditing: boolean;
  editFormState: { name: string; description: string };
  onStartEditing: (product: Product) => void;
  onCancelEditing: () => void;
  onUpdateProduct: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  setEditFormState: React.Dispatch<React.SetStateAction<{ name: string; description: string }>>;
}

const ProductItem = ({
  product,
  isEditing,
  editFormState,
  onStartEditing,
  onCancelEditing,
  onUpdateProduct,
  onDeleteProduct,
  setEditFormState,
}: ProductItemProps) => {
  if (isEditing) {
    return (
      <tr>
        <td colSpan={3}>
          <form onSubmit={onUpdateProduct} style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <input
              type="text"
              value={editFormState.name}
              onChange={(e) => setEditFormState({ ...editFormState, name: e.target.value })}
              placeholder="Nombre"
              required
              style={{ flex: 1 }}
            />
            <input
              type="text"
              value={editFormState.description}
              onChange={(e) => setEditFormState({ ...editFormState, description: e.target.value })}
              placeholder="Descripción"
              style={{ flex: 2 }}
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
      <td>{product.name}</td>
      <td>{product.description}</td>
      <td>
        <div className="button-group">
          <button className="button" onClick={() => onStartEditing(product)}>Editar</button>
          <button className="button button-secondary" onClick={() => onDeleteProduct(product.id)}>Eliminar</button>
        </div>
      </td>
    </tr>
  );
};

export default ProductItem;