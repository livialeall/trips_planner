import { useEffect, useState } from "react";
import { auth, User } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

import Login from "./Login";
import TelaPrincipal from "./TelaPrincipal";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return user ? (
    <TelaPrincipal />
  ) : (
    <Login
      onAuthenticated={(user) => {
        setUser(user);
      }}
    />
  );
}

export default App;
