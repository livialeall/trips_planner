import React from 'react';
import styles from '../../styles/TripCard.module.css';
import { Trip } from '../../services/tripService';
import { useNavigate } from 'react-router-dom';

interface TripCardProps {
    trip: Trip;
    onEdit: () => void;
    onDelete: () => void;
  }
  
  export const TripCard: React.FC<TripCardProps> = ({ trip, onEdit, onDelete }) => {
    const formatDate = (date: any) => {
      if (date?.toDate) {
        return date.toDate().toLocaleDateString('pt-BR');
      }
      return 'Data inválida';
    };
    const navigate = useNavigate();
    return (
      <div className={styles.card}
      onClick={() => navigate(`/trip/${trip.id}`)}>
        <div className={styles.content}>
          <h3 className={styles.destination}>{trip.destination}</h3>
          <div className={styles.dates}>
            <span>{formatDate(trip.startDate)}</span>
            <span> → </span>
            <span>{formatDate(trip.endDate)}</span>
          </div>
          
          <div className={styles.actions}>
            <button onClick={onEdit} className={styles.editButton}>
              Editar
            </button>
            <button onClick={onDelete} className={styles.deleteButton}>
              Excluir
            </button>
          </div>
        </div>
      </div>
    );
  };