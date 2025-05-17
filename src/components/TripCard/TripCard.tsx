import React from 'react';
import styles from '../../styles/TripCard.module.css';
import { Trip } from '../../services/tripService';

interface TripCardProps {
  trip: Trip;
}

export const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const formatDate = (date: any) => {
    if (date?.toDate) {
      return date.toDate().toLocaleDateString('pt-BR');
    }
    return 'Data inválida';
  };

  const statusColors = {
    'planned': '#3b82f6',
    'in-progress': '#f59e0b',
    'completed': '#10b981'
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        <img 
          src={trip.imageUrl || 'https://source.unsplash.com/random/300x200/?travel'} 
          alt={trip.destination}
          className={styles.image}
        />
        <span 
          className={styles.statusBadge}
          style={{ backgroundColor: statusColors[trip.status] }}
        >
          {trip.status === 'planned' && 'Planejada'}
          {trip.status === 'in-progress' && 'Em andamento'}
          {trip.status === 'completed' && 'Concluída'}
        </span>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.destination}>{trip.destination}</h3>
        <div className={styles.dates}>
          <span>{formatDate(trip.startDate)}</span>
          <span> → </span>
          <span>{formatDate(trip.endDate)}</span>
        </div>
      </div>
    </div>
  );
};