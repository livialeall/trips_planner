import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import NewTrip from "./NewTrip";

interface Viagem {
  id: string;
  nome: string;
  data: string;
  pessoas: string;
}

const UserTrips: React.FC = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleNovaViagem = (viagem: { nome: string; data: string; pessoas: string }) => {
    const nova: Viagem = {
      id: crypto.randomUUID(),
      ...viagem,
    };
    setViagens((v) => [...v, nova]);
  };

  const handleVerDetalhes = (id: string) => {
    navigate(`/trip/${id}`);  // Navegar para a tela de detalhes da viagem
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Minhas Viagens</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sair
        </button>
      </div>

      <button
        onClick={() => setMostrarModal(true)}
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Cadastrar Nova Viagem
      </button>

      {viagens.length === 0 ? (
        <p>Nenhuma viagem cadastrada.</p>
      ) : (
        <ul className="space-y-4">
          {viagens.map((v) => (
            <li key={v.id} className="bg-white p-4 rounded shadow-md flex justify-between items-center">
              <div>
                <p className="font-semibold">{v.nome}</p>
                <p className="text-sm text-gray-500">
                  {v.data} • Pessoas: {v.pessoas}
                </p>
              </div>
              <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => handleVerDetalhes(v.id)} // Ao clicar, navega para a tela de detalhes
                title="Ver detalhes"
              >
                Ver detalhes
              </button>
            </li>
          ))}
        </ul>
      )}

      {mostrarModal && (
        <NewTrip
          onFechar={() => setMostrarModal(false)}
          onSalvar={handleNovaViagem}
        />
      )}
    </div>
  );
};

export default UserTrips;
