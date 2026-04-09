import React from 'react';
import { Purchase } from '../pages/Purchases';

interface PurchaseItemProps {
  purchase: Purchase;
  isEditing: boolean;
  editFormState: { quantity: number; total_cost: number; purchase_date: string };
  onStartEditing: (purchase: Purchase) => void;
  onCancelEditing: () => void;
  onUpdatePurchase: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onDeletePurchase: (id: string) => Promise<void>;
  setEditFormState: React.Dispatch<React.SetStateAction<{ quantity: number; total_cost: number; purchase_date: string }>>;
}

const PurchaseItem = ({
  purchase, isEditing, editFormState,
  onStartEditing, onCancelEditing, onUpdatePurchase, onDeletePurchase, setEditFormState,
}: PurchaseItemProps) => {
  if (isEditing) {
    return (
      <tr>
        <td>{purchase.raw_material_name}</td>
        <td colSpan={4}>
          <form onSubmit={onUpdatePurchase} style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <input type="number" value={editFormState.quantity}
              onChange={(e) => setEditFormState({ ...editFormState, quantity: parseFloat(e.target.value) })}
              placeholder="Cantidad" required style={{ flex: 1 }} />
            <input type="number" value={editFormState.total_cost}
              onChange={(e) => setEditFormState({ ...editFormState, total_cost: parseFloat(e.target.value) })}
              placeholder="Costo Total" required style={{ flex: 1 }} />
            <input type="date" value={editFormState.purchase_date}
              onChange={(e) => setEditFormState({ ...editFormState, purchase_date: e.target.value })}
              required style={{ flex: 1 }} />
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
      <td>{purchase.raw_material_name}</td>
      <td>{purchase.quantity} {purchase.unit_abbreviation ? `(${purchase.unit_abbreviation})` : ''}</td>
      <td>${purchase.total_cost}</td>
      <td>{purchase.purchase_date}</td>
      <td>
        <div className="button-group">
          <button className="button" onClick={() => onStartEditing(purchase)}>Editar</button>
          <button className="button button-secondary" onClick={() => onDeletePurchase(purchase._id)}>Eliminar</button>
        </div>
      </td>
    </tr>
  );
};

export default PurchaseItem;
