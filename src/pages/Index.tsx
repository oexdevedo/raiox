import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { LandingPage } from '@/components/LandingPage';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [view, setView] = useState<'landing' | 'register'>('landing');

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
    if (view === 'landing') {
      return (
        <LandingPage 
          onStart={() => setView('register')} 
        />
      );
    }
    
    return (
      <LoginForm 
        forceLogin={view === 'login'} 
        onBack={() => setView('landing')} 
      />
    );
  }

  return <Dashboard />;
};

const Index = () => {
  return <AppContent />;
};

export default Index;
