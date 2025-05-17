import React from 'react';
import styles from '../../styles/HomePage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';
import { useNavigate } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bem-vindo</h1>
        {currentUser?.email && (
          <p className={styles.userEmail}>{currentUser.email}</p>
        )}
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Dashboard</h2>
          <p className={styles.cardText}>
            Você está autenticado e pode acessar este conteúdo protegido.
          </p>
        </div>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Sair
        </button>
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} Minha Aplicação</p>
      </footer>
    </div>
  );
};