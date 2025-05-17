import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/TripDetailPage.module.css';

const FinanceCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
  <div className={styles.financeCard} style={{ borderLeftColor: color }}>
    <span className={styles.cardTitle}>{title}</span>
    <span className={styles.cardValue}>{value}</span>
  </div>
);

const CircularProgress = ({ percentage, color }: { percentage: number; color: string }) => (
  <div className={styles.circleProgress} style={{ background: `
    conic-gradient(${color} ${percentage}%, #f0f0f0 ${percentage}% 100%)
  ` }}>
    <div className={styles.circleInner}>
      <span>{Math.round(percentage)}%</span>
    </div>
  </div>
);

const getCategoryIcon = (category: string) => {
  switch(category) {
    case 'transport': return '🚗';
    case 'lodging': return '🏨';
    case 'food': return '🍴';
    case 'activities': return '🎡';
    default: return '💸';
  }
};

export const TripDetailPage: React.FC = () => {
  const { tripId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<any>(null);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [activeView, setActiveView] = useState<'overview' | 'costs' | 'contributions'>('overview');
  
  const [newCost, setNewCost] = useState({
    description: '',
    value: '',
    category: 'transport'
  });

  const [newContribution, setNewContribution] = useState({
    amount: '',
    type: 'trip' as 'trip' | 'reserva'
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        // Buscar viagens do usuário
        const tripsQuery = query(
          collection(db, 'trips'),
          where('userId', '==', currentUser.uid)
        );
        const tripsSnapshot = await getDocs(tripsQuery);
        setUserTrips(tripsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Buscar detalhes da viagem atual
        if (tripId) {
          const docRef = doc(db, 'trips', tripId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const tripData = docSnap.data();
            setTrip({
              ...tripData,
              costs: tripData.costs?.map((c: any) => ({
                ...c,
                date: c.date?.toDate()
              })) || [],
              contributions: tripData.contributions?.map((c: any) => ({
                ...c,
                date: c.date?.toDate()
              })) || []
            });

            // Buscar nomes dos participantes
            const participants = [...(tripData.participants || []), currentUser.uid];
            const usersData: Record<string, string> = {};
            
            for (const userId of participants) {
              const userDoc = await getDoc(doc(db, 'users', userId));
              if (userDoc.exists()) {
                usersData[userId] = userDoc.data().displayName || userDoc.data().email;
              }
            }
            
            setUsers(usersData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tripId, currentUser]);

  const addCost = async () => {
    if (!tripId || !currentUser || !newCost.description || !newCost.value) return;
    
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        costs: arrayUnion({
          ...newCost,
          value: parseFloat(newCost.value),
          paidBy: currentUser.uid,
          date: new Date()
        })
      });
      
      setTrip({
        ...trip,
        costs: [...trip.costs, {
          ...newCost,
          value: parseFloat(newCost.value),
          paidBy: currentUser.uid,
          date: new Date()
        }]
      });
      
      setNewCost({ description: '', value: '', category: 'transport' });
    } catch (error) {
      console.error("Error adding cost:", error);
    }
  };

  const addContribution = async () => {
    if (!tripId || !currentUser || !users[currentUser.uid] || !newContribution.amount) return;
    
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        contributions: arrayUnion({
          ...newContribution,
          amount: parseFloat(newContribution.amount),
          userId: currentUser.uid,
          userName: users[currentUser.uid],
          date: new Date()
        })
      });
      
      setTrip({
        ...trip,
        contributions: [...trip.contributions, {
          ...newContribution,
          amount: parseFloat(newContribution.amount),
          userId: currentUser.uid,
          userName: users[currentUser.uid],
          date: new Date()
        }]
      });
      
      setNewContribution({ amount: '', type: 'trip' });
    } catch (error) {
      console.error("Error adding contribution:", error);
    }
  };

  // Cálculos
  const totalCosts = trip?.costs.reduce((sum: number, cost: any) => sum + cost.value, 0) || 0;
  const totalTripContributions = trip?.contributions
    .filter((c: any) => c.type === 'trip')
    .reduce((sum: number, c: any) => sum + c.amount, 0) || 0;
  
  const totalDepositContributions = trip?.contributions
    .filter((c: any) => c.type === 'reserva')
    .reduce((sum: number, c: any) => sum + c.amount, 0) || 0;

  const availableBalance = totalTripContributions - totalCosts;
  const tripProgress = trip?.savingsGoal ? (totalTripContributions / trip.savingsGoal) * 100 : 0;
  const depositProgress = trip?.houseDeposit ? (totalDepositContributions / trip.houseDeposit) * 100 : 0;

  if (loading) return <div className={styles.loading}>Carregando...</div>;
  if (!trip) return <div className={styles.error}>Viagem não encontrada</div>;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          className={styles.menuButton}
        >
          <span className={styles.menuIcon}>☰</span>
        </button>
        
        <h1 className={styles.tripName}>{trip.name}</h1>
        
        {showMenu && (
          <div className={styles.menuDropdown}>
            <h3>Minhas Viagens</h3>
            <ul>
              {userTrips.map(userTrip => (
                <li 
                  key={userTrip.id}
                  onClick={() => {
                    navigate(`/trip/${userTrip.id}`);
                    setShowMenu(false);
                  }}
                >
                  {userTrip.name}
                </li>
              ))}
            </ul>
            
            {/* Botão para nova viagem adicionado aqui */}
            <button 
              onClick={() => {
                navigate('/new-trip');
                setShowMenu(false);
              }}
              className={styles.newTripButton}
            >
              + Nova Viagem
            </button>
          </div>
        )}
      </header>

      {/* Abas */}
      <nav className={styles.tabBar}>
        <button 
          className={`${styles.tab} ${activeView === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveView('overview')}
        >
          Visão Geral
        </button>
        <button 
          className={`${styles.tab} ${activeView === 'costs' ? styles.active : ''}`}
          onClick={() => setActiveView('costs')}
        >
          Gastos
        </button>
        <button 
          className={`${styles.tab} ${activeView === 'contributions' ? styles.active : ''}`}
          onClick={() => setActiveView('contributions')}
        >
          Contribuições
        </button>
      </nav>

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        {activeView === 'overview' && (
          <>
            <div className={styles.cardsRow}>
              <FinanceCard 
                title="Total Contribuído" 
                value={`R$ ${totalTripContributions.toFixed(2)}`} 
                color="#7c3aed" 
              />
              <FinanceCard 
                title="Total Gastos" 
                value={`R$ ${totalCosts.toFixed(2)}`} 
                color="#ef4444" 
              />
            </div>

            <div className={styles.cardsRow}>
              <FinanceCard 
                title="Saldo Disponível" 
                value={`R$ ${availableBalance.toFixed(2)}`} 
                color={availableBalance >= 0 ? '#10b981' : '#ef4444'} 
              />
              <FinanceCard 
                title="Reserva Arrecadada" 
                value={`R$ ${totalDepositContributions.toFixed(2)}`} 
                color="#3b82f6" 
              />
            </div>

            <div className={styles.progressSection}>
              <h2 className={styles.sectionTitle}>Progresso da Viagem</h2>
              <div className={styles.progressContainer}>
                <CircularProgress 
                  percentage={tripProgress} 
                  color="#7c3aed" 
                />
                <div className={styles.progressDetails}>
                  <span className={styles.progressText}>
                    <strong>Meta:</strong> R$ {trip.savingsGoal?.toFixed(2) || '0.00'}
                  </span>
                  <span className={styles.progressText}>
                    <strong>Faltam:</strong> R$ {Math.max(0, (trip.savingsGoal - totalTripContributions)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.progressSection}>
              <h2 className={styles.sectionTitle}>Caixinha da Reserva</h2>
              <div className={styles.progressContainer}>
                <CircularProgress 
                  percentage={depositProgress} 
                  color="#3b82f6" 
                />
                <div className={styles.progressDetails}>
                  <span className={styles.progressText}>
                    <strong>Meta:</strong> R$ {trip.houseDeposit?.toFixed(2) || '0.00'}
                  </span>
                  <span className={styles.progressText}>
                    <strong>Faltam:</strong> R$ {Math.max(0, (trip.houseDeposit - totalDepositContributions)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'costs' && (
          <>
             <div className={styles.addForm}>
      <h2 className={styles.sectionTitle}>Adicionar Gasto</h2>
      <div className={styles.formRow}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Descrição"
            value={newCost.description}
            onChange={(e) => setNewCost({...newCost, description: e.target.value})}
            className={styles.input}
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="number"
            placeholder="Valor"
            value={newCost.value}
            onChange={(e) => setNewCost({...newCost, value: e.target.value})}
            className={styles.input}
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.selectGroup}>
          <select
            value={newCost.category}
            onChange={(e) => setNewCost({...newCost, category: e.target.value})}
            className={styles.select}
          >
            <option value="transport">Transporte</option>
            <option value="lodging">Hospedagem</option>
            <option value="food">Alimentação</option>
            <option value="activities">Atividades</option>
            <option value="other">Outros</option>
          </select>
        </div>
        <button 
          onClick={addCost} 
          className={styles.addButton}
          disabled={!newCost.description || !newCost.value}
        >
          Adicionar
        </button>
      </div>
    </div>

            <div className={styles.listSection}>
              <h2 className={styles.sectionTitle}>Últimos Gastos</h2>
              {trip.costs.length === 0 ? (
                <p className={styles.emptyMessage}>Nenhum gasto registrado ainda</p>
              ) : (
                <ul className={styles.list}>
                  {trip.costs.slice().reverse().map((cost: any, index: number) => (
                    <li key={index} className={styles.listItem}>
                      <div className={styles.itemIcon}>
                        {getCategoryIcon(cost.category)}
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemTitle}>{cost.description}</span>
                        <span className={styles.itemSubtitle}>
                          {cost.category} • {cost.date.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className={styles.itemAmount}>
                        - R$ {cost.value.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}

        {activeView === 'contributions' && (
          <>
            <div className={styles.addForm}>
              <h2 className={styles.sectionTitle}>Adicionar Contribuição</h2>
              <div className={styles.formRow}>
                <input
                  type="number"
                  placeholder="Valor"
                  value={newContribution.amount}
                  onChange={(e) => setNewContribution({
                    ...newContribution,
                    amount: e.target.value
                  })}
                  className={styles.input}
                />
                <select
                  value={newContribution.type}
                  onChange={(e) => setNewContribution({
                    ...newContribution,
                    type: e.target.value as 'trip' | 'reserva'
                  })}
                  className={styles.select}
                >
                  <option value="trip">Para a viagem</option>
                  <option value="reserva">Para a reserva</option>
                </select>
              </div>
              <button 
                onClick={addContribution} 
                className={styles.addButton}
                disabled={!newContribution.amount}
              >
                Adicionar como {users[currentUser]?.uid || 'Usuário'}
              </button>
            </div>

            <div className={styles.listSection}>
              <h2 className={styles.sectionTitle}>Últimas Contribuições</h2>
              {trip.contributions.length === 0 ? (
                <p className={styles.emptyMessage}>Nenhuma contribuição registrada</p>
              ) : (
                <ul className={styles.list}>
                  {trip.contributions.slice().reverse().map((contribution: any, index: number) => (
                    <li key={index} className={styles.listItem}>
                      <div className={styles.itemIcon}>
                        {contribution.type === 'trip' ? '✈️' : '🏠'}
                      </div>
                      <div className={styles.itemDetails}>
                        <span className={styles.itemTitle}>
                          {contribution.userName || 'Usuário'}
                        </span>
                        <span className={styles.itemSubtitle}>
                          {contribution.type === 'trip' ? 'Para viagem' : 'Para reserva'} • {contribution.date.toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className={styles.itemAmount}>
                        + R$ {contribution.amount.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};