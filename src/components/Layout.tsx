import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const Layout = () => {
    const location = useLocation();

    const menuItems = [
        { path: '/products', label: 'Productos' },
        { path: '/raw-materials', label: 'Materias Primas' },
        { path: '/recipes', label: 'Recetas' },
        { path: '/units', label: 'Unidades' },
        { path: '/productions', label: 'Producción' },
        { path: '/purchases', label: 'Compras' },
        { path: '/sales', label: 'Ventas' },
        { path: '/users', label: 'Usuarios' },
        { path: '/roles', label: 'Roles' },
        { path: '/user-roles', label: 'Asignar Roles' },
    ];

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Pastelería</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.path} className={location.pathname === item.path ? 'active' : ''}>
                                <Link to={item.path}>{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="sidebar-footer">
                    <button className="button logout-btn" onClick={() => supabase.auth.signOut()}>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;



