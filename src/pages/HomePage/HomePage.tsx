import React, { useEffect, useState } from 'react';
import styles from '../../styles/HomePage.module.css';
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { deleteTrip, getUserTrips, Trip } from '../../services/tripService';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { TripCard } from '../../components/TripCard/TripCard';
import { Modal } from '../../components/Modal/Modal';
import { EditTripForm } from '../../components/EditTripForm/EditTripForm';

export const HomePage: React.FC = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [tripToDelete, setTripToDelete] = useState<string | null>(null);
  
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
  
    const handleDeleteTrip = async () => {
      if (!tripToDelete) return;
      
      try {
        await deleteTrip(tripToDelete);
        setTrips(trips.filter(trip => trip.id !== tripToDelete));
        setShowDeleteModal(false);
      } catch (err) {
        console.error('Error deleting trip:', err);
        setError('Erro ao excluir viagem');
      }
    };
  
    const handleUpdateTrip = async (updatedTrip: Trip) => {
      try {
        // Implemente a função updateTrip no seu serviço
        // await updateTrip(updatedTrip.id, updatedTrip);
        setTrips(trips.map(trip => 
          trip.id === updatedTrip.id ? updatedTrip : trip
        ));
        setEditingTrip(null);
      } catch (err) {
        console.error('Error updating trip:', err);
        setError('Erro ao atualizar viagem');
      }
    };
  
    if (!currentUser) {
      return null;
    }
  
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Minhas Viagens</h1>
          <button 
            className={styles.addButton}
            onClick={() => navigate('/new-trip')}
          >
            Nova Viagem
          </button>
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
                <TripCard 
                  key={trip.id}
                  trip={trip}
                  onEdit={() => setEditingTrip(trip)}
                  onDelete={() => {
                    setTripToDelete(trip.id!);
                    setShowDeleteModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </main>
  
        {/* Modal de Edição */}
        {editingTrip && (
          <Modal onClose={() => setEditingTrip(null)}>
            <EditTripForm
              trip={editingTrip}
              onSave={handleUpdateTrip}
              onCancel={() => setEditingTrip(null)}
            />
          </Modal>
        )}
  
        {/* Modal de Confirmação de Exclusão */}
        {showDeleteModal && (
          <Modal onClose={() => setShowDeleteModal(false)}>
            <div className={styles.deleteModal}>
              <h3>Confirmar Exclusão</h3>
              <p>Tem certeza que deseja excluir esta viagem?</p>
              <div className={styles.modalButtons}>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDeleteTrip}
                  className={styles.confirmButton}
                >
                  Excluir
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  };