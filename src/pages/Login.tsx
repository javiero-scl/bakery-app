import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const session = useSession();
  const supabase = useSupabaseClient();

  // Si ya hay una sesión, redirige al dashboard (ruta principal)
  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <div className="auth-container">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        theme="dark"
        providers={['google', 'github']}
      />
    </div>
  );
};

export default Login;