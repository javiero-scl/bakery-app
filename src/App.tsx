import './App.css';
import { useEffect, useState } from 'react';
import { account } from './lib/appwriteClient';
import { Models } from 'appwrite';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Products from './pages/Products';
import RawMaterials from './pages/RawMaterials';
import Recipes from './pages/Recipes';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import Productions from './pages/Productions';
import Users from './pages/Users';
import Roles from './pages/Roles';
import UserRoles from './pages/UserRoles';
import Units from './pages/Units';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';

function App() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    account.get()
      .then((u) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={setUser} /> : <Navigate to="/products" />} />

        <Route element={user ? <Layout onLogout={() => setUser(null)} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<Products />} />
          <Route path="/raw-materials" element={<RawMaterials />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/units" element={<Units />} />
          <Route path="/productions" element={<Productions />} />
          <Route path="/purchases" element={<Purchases />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/user-roles" element={<UserRoles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
