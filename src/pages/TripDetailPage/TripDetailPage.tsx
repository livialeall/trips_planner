import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Cost, addCostToTrip, shareTrip } from '../../services/tripService';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/TripDetailPage.module.css';

export const TripDetailPage: React.FC = () => {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareEmail, setShareEmail] = useState('');

  const [newCost, setNewCost] = useState<Omit<Cost, 'id'>>({
    description: '',
    value: 0,
    category: 'Transporte',
    date: new Date(),
    paidBy: currentUser?.uid || ''
  });

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        if (!tripId) throw new Error('ID da viagem não fornecido');
        
        const docRef = doc(db, 'trips', tripId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setTrip({ id: docSnap.id, ...docSnap.data() });
        } else {
          throw new Error('Viagem não encontrada');
        }
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar viagem');
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  const handleAddCost = async () => {
    try {
      if (!tripId) throw new Error('ID da viagem não fornecido');
      await addCostToTrip(tripId, newCost);
      // Atualizar a lista de custos
      setTrip(prev => ({
        ...prev,
        costs: [...prev.costs, newCost]
      }));
      // Resetar formulário
      setNewCost({
        description: '',
        value: 0,
        category: 'Transporte',
        date: new Date(),
        paidBy: currentUser?.uid || ''
      });
    } catch (err) {
      console.error('Error adding cost:', err);
      setError(err instanceof Error ? err.message : 'Erro ao adicionar custo');
    }
  };

  const handleShareTrip = async () => {
    try {
      if (!tripId) throw new Error('ID da viagem não fornecido');
      if (!shareEmail) throw new Error('E-mail não fornecido');
      // Aqui você precisaria buscar o ID do usuário pelo email
      // Esta é uma implementação simplificada
      await shareTrip(tripId, shareEmail);
      alert(`Viagem compartilhada com ${shareEmail}`);
    } catch (err) {
      console.error('Error sharing trip:', err);
      setError(err instanceof Error ? err.message : 'Erro ao compartilhar viagem');
    }
  };

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/trip/${tripId}`;
    navigator.clipboard.writeText(shareLink);
    alert('Link copiado para a área de transferência!');
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!trip) return <div>Viagem não encontrada</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{trip.name}</h1>
      <p className={styles.destination}>{trip.destination}</p>
      
      <div className={styles.section}>
        <h2>Compartilhar Viagem</h2>
        <div className={styles.shareContainer}>
          <input
            type="email"
            placeholder="E-mail do usuário"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className={styles.shareInput}
          />
          <button onClick={handleShareTrip} className={styles.shareButton}>
            Compartilhar
          </button>
          <button onClick={copyShareLink} className={styles.linkButton}>
            Copiar Link
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Adicionar Custo</h2>
        <div className={styles.costForm}>
          <input
            type="text"
            placeholder="Descrição"
            value={newCost.description}
            onChange={(e) => setNewCost({...newCost, description: e.target.value})}
          />
          <input
            type="number"
            placeholder="Valor"
            value={newCost.value}
            onChange={(e) => setNewCost({...newCost, value: Number(e.target.value)})}
          />
          <select
            value={newCost.category}
            onChange={(e) => setNewCost({...newCost, category: e.target.value})}
          >
            <option value="Transporte">Transporte</option>
            <option value="Hospedagem">Hospedagem</option>
            <option value="Alimentação">Alimentação</option>
            <option value="Entretenimento">Entretenimento</option>
            <option value="Outros">Outros</option>
          </select>
          <button 
            type="button" 
            onClick={handleAddCost}
            className={styles.addButton}
          >
            Adicionar Custo
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h2>Custos da Viagem</h2>
        {trip.costs?.length > 0 ? (
          <ul className={styles.costsList}>
            {trip.costs.map((cost: Cost, index: number) => (
              <li key={index} className={styles.costItem}>
                <span>{cost.description}</span>
                <span>R$ {cost.value.toFixed(2)}</span>
                <span>{cost.category}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum custo registrado ainda.</p>
        )}
      </div>
    </div>
  );
};