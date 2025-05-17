import React, { useState } from 'react';
import styles from '../../styles/AuthForm.module.css';
import { AuthType } from '../../pages/AuthPage/AuthPage';

interface AuthFormProps {
  type: AuthType;
  onSubmit: (email: string, password: string) => void;
  loading: boolean;
  error: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({ type, onSubmit, loading, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2 className={styles.title}>{type === 'login' ? 'Login' : 'Cadastro'}</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.inputGroup}>
        <label htmlFor="email" className={styles.label}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
          placeholder="seu@email.com"
          required
        />
      </div>
      
      <div className={styles.inputGroup}>
        <label htmlFor="password" className={styles.label}>Senha</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          placeholder="••••••••"
          minLength={6}
          required
        />
      </div>
      
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? (
          <span>Carregando...</span>
        ) : (
          <span>{type === 'login' ? 'Entrar' : 'Cadastrar'}</span>
        )}
      </button>
    </form>
  );
};