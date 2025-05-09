import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [modoCadastro, setModoCadastro] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (modoCadastro) {
        await createUserWithEmailAndPassword(auth, email, senha);
        toast.success("Conta criada com sucesso! 🎉");
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
        toast.success("Bem-vindo(a) de volta!");
      }
      setTimeout(() => navigate("/trips_planner/user"), 1500);
    } catch (err: any) {
      toast.error("Ops! Algo deu errado. Verifique seus dados e tente novamente.");
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Login com Google realizado com sucesso! 🚀");
      setTimeout(() => navigate("/trips_planner/user"), 1500);
    } catch (error) {
      toast.error("Falha no login com Google. Tente novamente.");
    }
  };

  return (
    <div className="container" style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "var(--border)",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "400px",
          boxSizing: "border-box"
        }}
      >
        <ToastContainer />

        <h2 style={{
          fontSize: "1.6rem",
          textAlign: "center",
          color: "var(--text)",
          marginBottom: "0.5rem"
        }}>
          {modoCadastro ? "Criar nova conta" : "Entrar na sua conta"}
        </h2>

        <p style={{
          textAlign: "center",
          fontSize: "0.95rem",
          color: "var(--accent)",
          marginBottom: "1.5rem"
        }}>
          {modoCadastro
            ? "Preencha os campos abaixo para começar a usar o app."
            : "Acesse sua conta para continuar sua jornada."}
        </p>

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "1rem",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            backgroundColor: "var(--background-color)",
            fontSize: "1rem",
            color: "var(--text)",
            textAlign: "center",
            boxSizing: "border-box",
            marginBottom: "1rem"
          }}
        />

        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "1rem",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            backgroundColor: "var(--background-color)",
            fontSize: "1rem",
            color: "var(--text)",
            textAlign: "center",
            boxSizing: "border-box",
            marginBottom: "1rem"
          }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "1rem",
            fontWeight: "bold",
            backgroundColor: "var(--primary)",
            color: "var(--text)",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "1rem"
          }}
        >
          {modoCadastro ? "Criar conta" : "Entrar"}
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: "100%",
            padding: "1rem",
            fontWeight: "bold",
            backgroundColor: "#DB4437",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginTop: "1rem"
          }}
        >
          Entrar com Google
        </button>

        <p style={{
          textAlign: "center",
          fontSize: "0.9rem",
          color: "var(--accent)"
        }}>
          {modoCadastro ? "Já tem uma conta?" : "Ainda não tem uma conta?"}{" "}
          <button
            type="button"
            onClick={() => setModoCadastro(!modoCadastro)}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.9rem"
            }}
          >
            {modoCadastro ? "Fazer login" : "Cadastrar-se"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
