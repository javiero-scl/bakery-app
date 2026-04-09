import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../lib/apiClient';
import AddUnitForm from '../components/AddUnitForm';
import UnitItem from '../components/UnitItem';

export type UnitOfMeasure = {
  _id: string;
  name: string;
  abbreviation: string;
  created_at: string;
};

const Units = () => {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUnits = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/units');
      setUnits(data);
    } catch (error: any) {
      toast.error(`Error al cargar unidades: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  const handleUnitAdded = (newUnit: UnitOfMeasure) => {
    setUnits([newUnit, ...units]);
  };

  const handleUnitUpdated = (updatedUnit: UnitOfMeasure) => {
    setUnits(units.map(u => u._id === updatedUnit._id ? updatedUnit : u));
  };

  const handleUnitDeleted = (id: string) => {
    setUnits(units.filter(u => u._id !== id));
  };

  return (
    <div className="container">
      <h1>Unidades de Medida</h1>
      <AddUnitForm onUnitAdded={handleUnitAdded} />
      {loading ? (
        <p>Cargando unidades...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Abreviatura</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {units.map(unit => (
              <UnitItem
                key={unit._id}
                unit={unit}
                onUnitUpdated={handleUnitUpdated}
                onUnitDeleted={handleUnitDeleted}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Units;
