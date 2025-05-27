import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import styles from '../../styles/TripDetailPage.module.css';
import { SwipeToDelete } from '../../components/SwipeToDelete/SwipeToDelete';

const FinanceCard = ({ title, value, color }: { title: string; value: string; color: string }) => (
    <div className={styles.financeCard} style={{ borderLeft: `4px solid ${color}` }}>
      <div className={styles.cardContent}>
        <span className={styles.cardTitle}>{title}</span>
        <span className={styles.cardValue}>{value}</span>
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
    type: 'trip' as 'trip' | 'reserva',
    participantName: '' // Novo campo adicionado
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

  const addCost = async (e: React.FormEvent) => {
    if (!tripId || !currentUser || !newCost.description || !newCost.value) return;

    e.preventDefault(); // Adicione esta linha
    
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

  const addContribution = async (e: React.FormEvent) => {

    if (!tripId || !currentUser || !newContribution.amount) return;
    e.preventDefault();

    try {
      await updateDoc(doc(db, 'trips', tripId), {
        contributions: arrayUnion({
          amount: parseFloat(newContribution.amount),
          type: newContribution.type,
          userId: currentUser.uid,
          participantName: newContribution.participantName || undefined, // Opcional
          date: new Date()
        })
      });
      
      setTrip({
        ...trip,
        contributions: [...trip.contributions, {
          amount: parseFloat(newContribution.amount),
          type: newContribution.type,
          userId: currentUser.uid,
          userName: users[currentUser.uid],
          participantName: newContribution.participantName || undefined,
          date: new Date()
        }]
      });
      
      setNewContribution({ 
        amount: '', 
        type: 'trip',
        participantName: '' // Reseta o campo
      });
    } catch (error) {
      console.error("Error adding contribution:", error);
    }
  };
  const deleteCost = async (costIndex: number) => {
    if (!tripId || !trip) return;
    
    try {
      const updatedCosts = [...trip.costs];
      updatedCosts.splice(costIndex, 1);
      
      await updateDoc(doc(db, 'trips', tripId), {
        costs: updatedCosts
      });
      
      setTrip({
        ...trip,
        costs: updatedCosts
      });
    } catch (error) {
      console.error("Error deleting cost:", error);
    }
  };
  
  const deleteContribution = async (contributionIndex: number) => {
    if (!tripId || !trip) return;
    
    try {
      const updatedContributions = [...trip.contributions];
      updatedContributions.splice(contributionIndex, 1);
      
      await updateDoc(doc(db, 'trips', tripId), {
        contributions: updatedContributions
      });
      
      setTrip({
        ...trip,
        contributions: updatedContributions
      });
    } catch (error) {
      console.error("Error deleting contribution:", error);
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
  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      transport: 'Transporte',
      lodging: 'Hospedagem',
      food: 'Alimentação',
      activities: 'Atividades',
      other: 'Outros'
    };
    return names[category] || category;
  };
  
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      transport: '#3b82f6', // Azul
      lodging: '#8b5cf6', // Roxo
      food: '#10b981', // Verde
      activities: '#f59e0b', // Amarelo
      other: '#64748b' // Cinza
    };
    return colors[category] || '#94a3b8';
  };

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

            <div className={styles.spendingCategories}>
      <h3 className={styles.sectionSubtitle}>Gastos por Categoria</h3>
      
        <div className={styles.categoryGrid}>
            {Object.entries(
            trip.costs.reduce((acc: Record<string, number>, cost: any) => {
                const category = cost.category || 'other';
                acc[category] = (acc[category] || 0) + cost.value;
                return acc;
            }, {})
            )
            .sort((a, b) => b[1] - a[1]) // Ordena do maior para o menor
            .map(([category, amount]) => (
            <div key={category} className={styles.categoryCard}>
                <div className={styles.categoryHeader}>
                <span className={styles.categoryIcon}>
                    {getCategoryIcon(category)}
                </span>
                <span className={styles.categoryName}>
                    {getCategoryName(category)}
                </span>
                </div>
                <div className={styles.categoryAmount}>
                R$ {amount.toFixed(2)}
                </div>
                <div className={styles.categoryProgress}>
                <div 
                    className={styles.progressBar}
                    style={{
                    width: `${(amount / totalCosts) * 100}%`,
                    backgroundColor: getCategoryColor(category)
                    }}
                ></div>
                </div>
            </div>
            ))}
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
                <SwipeToDelete 
                    key={index} 
                    onDelete={() => deleteCost(trip.costs.length - 1 - index)}
                >
                    <li className={styles.listItem}>
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
                </SwipeToDelete>
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
          <div className={styles.inputGroup}>
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
          </div>
          <div className={styles.selectGroup}>
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
        </div>
        <div className={styles.formRow}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nome do participante"
              value={newContribution.participantName}
              onChange={(e) => setNewContribution({
                ...newContribution,
                participantName: e.target.value
              })}
              className={styles.input}
            />
          </div>
          <button 
            onClick={addContribution}
            className={styles.addButton}
            disabled={!newContribution.amount}
          >
            Adicionar
          </button>
        </div>
      </div>

      <div className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Últimas Contribuições</h2>
        {trip.contributions.length === 0 ? (
          <p className={styles.emptyMessage}>Nenhuma contribuição registrada</p>
        ) : (
          <ul className={styles.list}>
                        {trip.contributions.slice().reverse().map((contribution: any, index: number) => (
            <SwipeToDelete 
                key={index} 
                onDelete={() => deleteContribution(trip.contributions.length - 1 - index)}
            >
                <li className={styles.listItem}>
                <div className={styles.itemIcon}>
                    {contribution.type === 'trip' ? '✈️' : '🏠'}
                </div>
                <div className={styles.itemDetails}>
                    <span className={styles.itemTitle}>
                    {contribution.participantName || contribution.userName || 'Usuário'}
                    </span>
                    <span className={styles.itemSubtitle}>
                    {contribution.type === 'trip' ? 'Para viagem' : 'Para reserva'} • {contribution.date.toLocaleDateString('pt-BR')}
                    </span>
                </div>
                <div className={styles.itemAmount}>
                    + R$ {contribution.amount.toFixed(2)}
                </div>
                </li>
            </SwipeToDelete>
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