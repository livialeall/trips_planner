// AuthPage.tsx
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
  const navigate = useNavigate(); // <-- Adicionado aqui

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");

    try {
      if (modoCadastro) {
        await createUserWithEmailAndPassword(auth, email, senha);
        alert("Cadastro realizado com sucesso!");
      } else {
        await signInWithEmailAndPassword(auth, email, senha);
        alert("Login realizado com sucesso!");
      }
      // Redireciona para a página de viagens
      navigate("/userTrip");
    } catch (err: any) {
      setErro(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {modoCadastro ? "Cadastro" : "Login"}
        </h2>

        {erro && <p className="text-red-500 mb-4">{erro}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {modoCadastro ? "Cadastrar" : "Entrar"}
        </button>

        <p className="mt-4 text-center">
          {modoCadastro ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
          <button
            type="button"
            onClick={() => setModoCadastro(!modoCadastro)}
            className="text-blue-600 underline"
          >
            {modoCadastro ? "Entrar" : "Cadastrar"}
          </button>
        </p>
      </form>
    </div>
  );
};

export default AuthPage;
