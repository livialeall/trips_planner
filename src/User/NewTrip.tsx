// NovaViagemModal.tsx
import React, { useState } from "react";

interface NewTripProps {
  onFechar: () => void;
  onSalvar: (viagem: { nome: string; data: string; pessoas: string }) => void;
}

const NewTrip: React.FC<NewTripProps> = ({ onFechar, onSalvar }) => {
  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [pessoas, setPessoas] = useState("");

  const handleSubmit = () => {
    if (nome && data && pessoas) {
      onSalvar({ nome, data, pessoas });
      onFechar();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Nova Viagem</h2>

        <input
          type="text"
          placeholder="Destino"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="w-full p-2 border mb-3 rounded"
        />

        <input
          type="text"
          placeholder="Pessoas"
          value={pessoas}
          onChange={(e) => setPessoas(e.target.value)}
          className="w-full p-2 border mb-4 rounded"
        />

        <div className="flex justify-end space-x-2">
          <button onClick={onFechar} className="px-4 py-2 bg-gray-300 rounded">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTrip;
