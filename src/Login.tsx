import { useState } from 'react';
import './index.css';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, User } from 'firebase/auth';
import { auth } from './firebase';

const actionCodeSettings = {
  url: window.location.href,
  handleCodeInApp: true,
};

type LoginProps = {
  onAuthenticated: (user: User | null) => void;
};

export default function Login({ onAuthenticated }: LoginProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Link de acesso enviado! Verifique seu e-mail.');
    } catch (err: any) {
      console.error(err);
      setError('Erro ao enviar o link. Verifique o email.');
    }
  };

  // Verifica se o link foi clicado e faz login
  if (isSignInWithEmailLink(auth, window.location.href)) {
    const emailStored = window.localStorage.getItem('emailForSignIn');
    window.localStorage.removeItem('emailForSignIn');
    if (emailStored) {
    const result = signInWithEmailLink(auth, emailStored, window.location.href);
      signInWithEmailLink(auth, emailStored, window.location.href)
        .then(async () => {
          window.localStorage.removeItem('emailForSignIn');
          onAuthenticated((await result).user);
        })
        .catch((err) => {
          console.error('Erro ao autenticar com link:', err);
          setError('Link inválido ou expirado.');
        });
    }
  }

  return (
    <div className="login-container">
      <h1>Login</h1>
      <input
        type="email"
        placeholder="Seu email autorizado"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError('');
        }}
      />
      <button onClick={handleLogin}>Enviar link</button>
      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
