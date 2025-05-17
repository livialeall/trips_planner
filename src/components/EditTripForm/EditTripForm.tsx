import React, { useState } from 'react';
import styles from '../../styles/EditTripForm.module.css';
import { Trip } from '../../services/tripService';

interface EditTripFormProps {
  trip: Trip;
  onSave: (updatedTrip: Trip) => void;
  onCancel: () => void;
}

export const EditTripForm: React.FC<EditTripFormProps> = ({ 
  trip, 
  onSave, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    name: trip.name,
    destination: trip.destination,
    startDate: trip.startDate?.toDate().toISOString().split('T')[0],
    endDate: trip.endDate?.toDate().toISOString().split('T')[0],
    imageUrl: trip.imageUrl,
    status: trip.status
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...trip,
      ...formData,
      startDate: trip.startDate, // Mantém o objeto Timestamp original
      endDate: trip.endDate // Mantém o objeto Timestamp original
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Editar Viagem</h2>
      
      <div className={styles.formGroup}>
        <label>Nome da Viagem</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Destino</label>
        <input
          type="text"
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Data de Início</label>
        <input
          type="date"
          name="startDate"
          value={formData.startDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Data de Término</label>
        <input
          type="date"
          name="endDate"
          value={formData.endDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="planned">Planejada</option>
          <option value="in-progress">Em andamento</option>
          <option value="completed">Concluída</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>URL da Imagem</label>
        <input
          type="url"
          name="imageUrl"
          value={formData.imageUrl || ''}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          Cancelar
        </button>
        <button type="submit" className={styles.saveButton}>
          Salvar Alterações
        </button>
      </div>
    </form>
  );
};