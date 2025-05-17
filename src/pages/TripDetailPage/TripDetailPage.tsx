import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/TripDetailPage.module.css';

interface Cost {
  id?: string;
  description: string;
  value: number;
  category: string;
  paidBy: string;
  date: Date;
}

interface Contribution {
  userId: string;
  amount: number;
  date: Date;
  type: 'trip' | 'reserva';
}

interface TripDetails {
  id: string;
  name: string;
  participants: string[];
  costs: Cost[];
  contributions: Contribution[];
  savingsGoal: number;
  houseDeposit: number;
}

export const TripDetailPage: React.FC = () => {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'costs' | 'contributions' | 'savings'>('costs');
  
  // Form states
  const [newCost, setNewCost] = useState<Omit<Cost, 'id'>>({
    description: '',
    value: 0,
    category: 'Transporte',
    paidBy: currentUser?.uid || '',
    date: new Date()
  });

  const [newContribution, setNewContribution] = useState<Omit<Contribution, 'date'>>({
    userId: currentUser?.uid || '',
    amount: 0,
    type: 'trip'
  });

  useEffect(() => {
    const fetchTrip = async () => {
      if (!tripId || !currentUser) return;
      
      try {
        const docRef = doc(db, 'trips', tripId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setTrip({
            id: docSnap.id,
            name: data.name,
            participants: data.participants || [],
            costs: data.costs?.map((c: any) => ({
              ...c,
              date: c.date?.toDate()
            })) || [],
            contributions: data.contributions?.map((c: any) => ({
              ...c,
              date: c.date?.toDate()
            })) || [],
            savingsGoal: data.savingsGoal || 0,
            houseDeposit: data.houseDeposit || 0
          });
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, currentUser]);

  const addCost = async () => {
    if (!tripId || !currentUser) return;
    
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        costs: arrayUnion({
          ...newCost,
          date: new Date()
        })
      });
      
      // Atualizar estado local
      setTrip(prev => prev ? {
        ...prev,
        costs: [...prev.costs, { ...newCost, date: new Date() }]
      } : null);
      
      // Resetar formulário
      setNewCost({
        description: '',
        value: 0,
        category: 'Transporte',
        paidBy: currentUser.uid,
        date: new Date()
      });
    } catch (error) {
      console.error("Error adding cost:", error);
    }
  };

  const addContribution = async () => {
    if (!tripId || !currentUser) return;
    
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        contributions: arrayUnion({
          ...newContribution,
          date: new Date()
        })
      });
      
      // Atualizar estado local
      setTrip(prev => prev ? {
        ...prev,
        contributions: [...prev.contributions, { ...newContribution, date: new Date() }]
      } : null);
      
      // Resetar formulário
      setNewContribution({
        userId: currentUser.uid,
        amount: 0,
        type: 'trip'
      });
    } catch (error) {
      console.error("Error adding contribution:", error);
    }
  };

  // Cálculos
  const totalCosts = trip?.costs.reduce((sum, cost) => sum + cost.value, 0) || 0;
  const totalContributions = trip?.contributions
    .filter(c => c.type === 'trip')
    .reduce((sum, contrib) => sum + contrib.amount, 0) || 0;
  
  const totalReserva = trip?.contributions
    .filter(c => c.type === 'reserva')
    .reduce((sum, contrib) => sum + contrib.amount, 0) || 0;

  const remainingAmount = (trip?.savingsGoal || 0) - totalContributions;
  const remainingReserva = (trip?.houseDeposit || 0) - totalReserva;

  if (loading) return <div>Carregando...</div>;
  if (!trip) return <div>Viagem não encontrada</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          &larr; Voltar
        </button>
        <h1>{trip.name}</h1>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'costs' ? styles.active : ''}`}
          onClick={() => setActiveTab('costs')}
        >
          Custos
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'contributions' ? styles.active : ''}`}
          onClick={() => setActiveTab('contributions')}
        >
          Contribuições
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'savings' ? styles.active : ''}`}
          onClick={() => setActiveTab('savings')}
        >
          Caixinha
        </button>
      </div>

      {activeTab === 'costs' && (
        <div className={styles.tabContent}>
          <h2>Adicionar Custo</h2>
          <div className={styles.form}>
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
            <button onClick={addCost}>Adicionar</button>
          </div>

          <h2>Custos da Viagem</h2>
          <div className={styles.costsList}>
            {trip.costs.map((cost, index) => (
              <div key={index} className={styles.costItem}>
                <span>{cost.description}</span>
                <span>{cost.category}</span>
                <span>R$ {cost.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'contributions' && (
        <div className={styles.tabContent}>
          <h2>Adicionar Contribuição</h2>
          <div className={styles.form}>
            <input
              type="number"
              placeholder="Valor"
              value={newContribution.amount}
              onChange={(e) => setNewContribution({
                ...newContribution,
                amount: Number(e.target.value)
              })}
            />
            <select
              value={newContribution.type}
              onChange={(e) => setNewContribution({
                ...newContribution,
                type: e.target.value as 'trip' | 'reserva'
              })}
            >
              <option value="trip">Para a viagem</option>
              <option value="reserva">Para a reserva</option>
            </select>
            <button onClick={addContribution}>Adicionar</button>
          </div>

          <div className={styles.progressContainer}>
            <h3>Progresso do Valor Total</h3>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(totalContributions / trip.savingsGoal) * 100}%` }}
              ></div>
            </div>
            <p>
              Arrecadado: R$ {totalContributions.toFixed(2)} / 
              Meta: R$ {trip.savingsGoal.toFixed(2)} | 
              Falta: R$ {remainingAmount.toFixed(2)}
            </p>
          </div>

          <h2>Histórico de Contribuições</h2>
          <div className={styles.contributionsList}>
            {trip.contributions
              .filter(c => c.type === 'trip')
              .map((contribution, index) => (
                <div key={index} className={styles.contributionItem}>
                  <span>Usuário {contribution.userId}</span>
                  <span>R$ {contribution.amount.toFixed(2)}</span>
                  <span>{contribution.date.toLocaleDateString()}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {activeTab === 'savings' && (
        <div className={styles.tabContent}>
          <h2>Caixinha da Reserva</h2>
          
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${(totalReserva / trip.houseDeposit) * 100}%` }}
              ></div>
            </div>
            <p>
              Arrecadado: R$ {totalReserva.toFixed(2)} / 
              Meta: R$ {trip.houseDeposit.toFixed(2)} | 
              Falta: R$ {remainingReserva.toFixed(2)}
            </p>
          </div>

          <h2>Histórico de Depósitos</h2>
          <div className={styles.contributionsList}>
            {trip.contributions
              .filter(c => c.type === 'reserva')
              .map((contribution, index) => (
                <div key={index} className={styles.contributionItem}>
                  <span>Usuário {contribution.userId}</span>
                  <span>R$ {contribution.amount.toFixed(2)}</span>
                  <span>{contribution.date.toLocaleDateString()}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className={styles.summary}>
        <h3>Resumo Financeiro</h3>
        <p>Total de Custos: R$ {totalCosts.toFixed(2)}</p>
        <p>Total Arrecadado: R$ {totalContributions.toFixed(2)}</p>
        <p>Valor Restante: R$ {remainingAmount.toFixed(2)}</p>
        <p>Reserva Arrecadada: R$ {totalReserva.toFixed(2)}</p>
      </div>
    </div>
  );
};