import React, { useEffect, useState } from 'react';
import styles from '../../styles/AuthPage.module.css';
import { AuthForm } from '../../components/AuthForm/AuthForm';
import { register, login } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export type AuthType = 'login' | 'register';

export const AuthPage: React.FC = () => {
    const [authType, setAuthType] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [navigationChecked, setNavigationChecked] = useState(false);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

  // Controle de navegação seguro
  useEffect(() => {
    if (currentUser && !navigationChecked) {
      setNavigationChecked(true);
      navigate('/auth', { replace: true });
    }
  }, [currentUser, navigate, navigationChecked]);

  const handleAuthSubmit = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      if (authType === 'login') {
        await login(email, password);
      } else {
        await register(email, password);
      }
      // Navegação será tratada pelo useEffect quando currentUser mudar
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro na autenticação');
      setLoading(false);
    }
  };

  const toggleAuthType = () => {
    setAuthType(authType === 'login' ? 'register' : 'login');
    setError(null);
  };

  if (currentUser) {
    return null; // Ou um loading spinner enquanto redireciona
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <AuthForm 
          type={authType} 
          onSubmit={handleAuthSubmit} 
          loading={loading} 
          error={error} 
        />
        
        <div className={styles.footer}>
          <button 
            onClick={toggleAuthType} 
            className={styles.toggleButton}
            disabled={loading}
          >
            {authType === 'login' 
              ? 'Não tem uma conta? Cadastre-se' 
              : 'Já tem uma conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  );
};