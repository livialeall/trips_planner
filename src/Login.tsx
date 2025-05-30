import { useState } from 'react';
import './index.css';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from './firebase';

type LoginProps = {
  onAuthenticated: (user: User | null) => void;
};

export default function Login({ onAuthenticated }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, senha);
      onAuthenticated(result.user);
    } catch (err: any) {
      console.error(err);
      setError('Email ou senha inválidos.');
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError('');
        }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => {
          setSenha(e.target.value);
          setError('');
        }}
      />
      <button onClick={handleLogin}>Entrar</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
