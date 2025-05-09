import React, { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

interface Viagem {
  id: string;
  nome: string;
  data: string;
  pessoas: string;
}

const UserTrips: React.FC = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novaViagem, setNovaViagem] = useState({ nome: "", data: "", pessoas: "" });
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/trips_planner/");
  };

  const handleSalvar = () => {
    if (!novaViagem.nome || !novaViagem.data || !novaViagem.pessoas) return;

    const nova: Viagem = {
      id: crypto.randomUUID(),
      ...novaViagem,
    };
    setViagens((v) => [...v, nova]);
    setNovaViagem({ nome: "", data: "", pessoas: "" });
    setMostrarModal(false);
  };

  const handleVerDetalhes = (id: string) => {
    navigate(`/trip/${id}`);
  };

  return (
    <div className="min-h-screen bg-[var(--background-color)] px-4 py-6 sm:px-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)]">Minhas Viagens</h1>
        <button
          onClick={handleLogout}
          className="text-xs sm:text-sm text-red-500 hover:text-red-600"
        >
          Sair
        </button>
      </div>

      {/* Ação principal */}
      <div className="mb-4">
        <button
          onClick={() => setMostrarModal(true)}
          className="w-full sm:w-auto bg-[var(--primary)] text-white px-4 py-3 rounded text-sm font-semibold hover:bg-[var(--primary-hover-dark)]"
        >
          + Nova Viagem
        </button>
      </div>

      {/* Lista de Viagens */}
      {viagens.length === 0 ? (
        <p className="text-center text-[var(--accent)] text-sm">
          Nenhuma viagem cadastrada ainda.
        </p>
      ) : (
        <ul className="space-y-3">
          {viagens.map((v) => (
            <li
              key={v.id}
              className="bg-[var(--primary-hover)] hover:bg-[var(--primary-hover-dark)] p-4 rounded-md shadow-sm flex flex-col sm:flex-row sm:justify-between sm:items-center"
            >
              <div>
                <p className="text-[var(--text)] font-medium text-base">{v.nome}</p>
                <p className="text-sm text-[var(--accent)]">
                  {v.data} • {v.pessoas} {parseInt(v.pessoas) === 1 ? "pessoa" : "pessoas"}
                </p>
              </div>
              <button
                onClick={() => handleVerDetalhes(v.id)}
                className="mt-2 sm:mt-0 text-sm text-[var(--primary)] hover:underline"
              >
                Ver detalhes
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[var(--background-color)] text-[var(--text)] p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4 text-center">Nova Viagem</h2>

            <input
              type="text"
              placeholder="Nome da viagem"
              value={novaViagem.nome}
              onChange={(e) => setNovaViagem({ ...novaViagem, nome: e.target.value })}
              className="mb-3 w-full border border-[var(--border)] bg-[var(--background-color)] text-[var(--text)] p-3 rounded"
            />

            <input
              type="date"
              value={novaViagem.data}
              onChange={(e) => setNovaViagem({ ...novaViagem, data: e.target.value })}
              className="mb-3 w-full border border-[var(--border)] bg-[var(--background-color)] text-[var(--text)] p-3 rounded"
            />

            <input
              type="number"
              placeholder="Número de pessoas"
              value={novaViagem.pessoas}
              onChange={(e) => setNovaViagem({ ...novaViagem, pessoas: e.target.value })}
              className="mb-4 w-full border border-[var(--border)] bg-[var(--background-color)] text-[var(--text)] p-3 rounded"
              min="1"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 text-sm text-[var(--accent)] hover:text-red-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="bg-[var(--primary)] hover:bg-[var(--primary-hover-dark)] text-white px-4 py-2 rounded text-sm font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTrips;
