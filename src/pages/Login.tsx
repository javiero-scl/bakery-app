import { useState } from 'react';
import { account } from '../lib/appwriteClient';
import { Models } from 'appwrite';
import { Navigate } from 'react-router-dom';

interface LoginProps {
  onLogin: (user: Models.User<Models.Preferences>) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      onLogin(user);
    } catch (error: any) {
      alert(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ minHeight: '100vh' }}>
      <div className="auth-container">
        <div className="auth-form">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ marginBottom: '1.2rem' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="button" style={{ width: '100%' }}>
              {loading ? 'Cargando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
