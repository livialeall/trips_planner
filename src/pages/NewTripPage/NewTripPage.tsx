import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { createTrip } from '../../services/tripService';
import { Timestamp } from 'firebase/firestore';
import styles from '../../styles/NewTripPage.module.css';

export const NewTripPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [tripData, setTripData] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    status: 'planned' as const
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTripData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!currentUser) throw new Error('Usuário não autenticado');

      await createTrip({
        ...tripData,
        startDate: Timestamp.fromDate(new Date(tripData.startDate)),
        endDate: Timestamp.fromDate(new Date(tripData.endDate)),
        userId: currentUser.uid,
        imageUrl: tripData.imageUrl || 'https://source.unsplash.com/random/800x600/?travel'
      });

      navigate('/');
    } catch (err) {
      console.error('Error creating trip:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar viagem');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
       <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          &larr; Voltar
        </button>
        <h1 className={styles.title}>Nova Viagem</h1>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="name">Nome da Viagem</label>
          <input
            type="text"
            id="name"
            name="name"
            value={tripData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="destination">Destino</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={tripData.destination}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="startDate">Data de Início</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={tripData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="endDate">Data de Término</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={tripData.endDate}
            onChange={handleChange}
            required
          />
        </div>

        {/* <div className={styles.formGroup}>
          <label htmlFor="imageUrl">URL da Imagem (opcional)</label>
          <input
            type="url"
            id="imageUrl"
            name="imageUrl"
            value={tripData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div> */}

        <button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? 'Criando...' : 'Criar Viagem'}
        </button>
      </form>
    </div>
  );
};