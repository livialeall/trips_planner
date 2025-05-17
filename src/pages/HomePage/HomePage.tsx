import React, { useEffect, useState } from 'react';
import styles from '../../styles/HomePage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { getUserTrips, Trip } from '../../services/tripService';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { TripCard } from '../../components/TripCard/TripCard';

export const HomePage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      const fetchTrips = async () => {
        if (!currentUser) return;
        
        try {
          setLoading(true);
          const userTrips = await getUserTrips(currentUser.uid);
          setTrips(userTrips);
        } catch (err) {
          console.error('Error fetching trips:', err);
          setError('Não foi possível carregar suas viagens');
        } finally {
          setLoading(false);
        }
      };
  
      fetchTrips();
    }, [currentUser]);
  
    const handleLogout = async () => {
      try {
        await logout();
        navigate('/auth');
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
  
    if (!currentUser) {
      return null;
    }
  
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Minhas Viagens</h1>
          {currentUser.email && (
            <p className={styles.userEmail}>{currentUser.email}</p>
          )}
        </header>
  
        <main className={styles.main}>
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : trips.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Você ainda não tem viagens cadastradas</p>
              <button 
                className={styles.addButton}
                onClick={() => navigate('/new-trip')}
              >
                Adicionar Viagem
              </button>
            </div>
          ) : (
            <div className={styles.tripsList}>
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
  
          <button onClick={handleLogout} className={styles.logoutButton}>
            Sair
          </button>
        </main>
  
        <footer className={styles.footer}>
          <p>© {new Date().getFullYear()} Travel Planner</p>
        </footer>
      </div>
    );
  };