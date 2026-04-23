import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Navigate } from 'react-router-dom';

const AdminContent = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-primary">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-primary-foreground/70">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm forceLogin={true} />;
  }

  if (!isAdmin) {
    // Se estiver logado mas não for admin, volta pro dashboard normal
    return <Navigate to="/" replace />;
  }

  return <AdminDashboard />;
};

const Admin = () => {
  return <AdminContent />;
};

export default Admin;
