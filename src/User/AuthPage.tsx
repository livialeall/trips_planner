import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [senha, setSenha] = useState<string>("");
  const [erro, setErro] = useState<string>("");
  const [modoCadastro, setModoCadastro] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      if (modoCadastro) {
        await createUserWithEmailAndPassword(auth, email, senha);
        alert("Conta criada com sucesso! 🎉");
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
        alert("Bem-vindo(a) de volta!");
      }
      navigate("/userTrip");
    } catch (err: any) {
      setErro("Ops! Algo deu errado. Verifique seus dados e tente novamente.");
    }
  };

  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: "var(--border)",
          padding: "2rem",
          borderRadius: "8px",
          boxShadow: "0 0 10px rgba(0,0,0,0.3)",
          width: "100%",
          maxWidth: "400px"
        }}
      >
        <h2 style={{ fontSize: "1.6rem", textAlign: "center", color: "var(--text)", marginBottom: "0.5rem" }}>
          {modoCadastro ? "Criar nova conta" : "Entrar na sua conta"}
        </h2>

        <p style={{ textAlign: "center", fontSize: "0.95rem", color: "var(--accent)", marginBottom: "1.5rem" }}>
          {modoCadastro
            ? "Preencha os campos abaixo para começar a usar o app."
            : "Acesse sua conta para continuar sua jornada."}
        </p>

        {erro && (
          <p style={{ color: "red", textAlign: "center", marginBottom: "1rem" }}>
            {erro}
          </p>
        )}

        <input
          type="email"
          placeholder="Digite seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{ marginTop: "1rem" }}
        />

        <button type="submit">
          {modoCadastro ? "Criar conta" : "Entrar"}
        </button>

        <p style={{ marginTop: "1.5rem", textAlign: "center", fontSize: "0.9rem", color: "var(--accent)" }}>
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
