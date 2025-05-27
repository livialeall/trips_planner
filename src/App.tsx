import { useEffect, useState } from "react";
import { auth } from "./firebase"; // seu setup firebase
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  User,
} from "firebase/auth";

import Login from "./Login";
import TelaPrincipal from "./TelaPrincipal";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = window.location.href;

    if (isSignInWithEmailLink(auth, url)) {
      const email = window.localStorage.getItem("emailForSignIn");

      if (!email) {
        setLoading(false);
        return;
      }

      signInWithEmailLink(auth, email, url)
        .then((result) => {
          window.localStorage.removeItem("emailForSignIn");
          setUser(result.user);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      // Se não for login por link, verificar se já tem usuário logado
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, []);

  if (loading) return <div>Carregando...</div>;

  if (user) {
    return <TelaPrincipal />;
  } else {
    return (
      <Login
        onAuthenticated={(user) => {
          setUser(user);
        }}
      />
    );
  }
}

export default App;
