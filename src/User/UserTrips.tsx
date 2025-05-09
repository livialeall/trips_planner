import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
}

const UserTrips: React.FC = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([
    { id: '1', destination: 'Tokyo', startDate: 'April 20', endDate: 'April 27' }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrip, setNewTrip] = useState<Omit<Trip, 'id'>>({ 
    destination: '', 
    startDate: '', 
    endDate: '' 
  });

  const handleNewTripChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTrip(prev => ({ ...prev, [name]: value }));
  };

  const handleSubscribeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubscribeData(prev => ({ ...prev, [name]: value }));
  };

  const addNewTrip = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTrip.destination && newTrip.startDate && newTrip.endDate) {
      setTrips([...trips, {
        ...newTrip,
        id: Date.now().toString()
      }]);
      setNewTrip({ destination: '', startDate: '', endDate: '' });
      setIsModalOpen(false);
    }
  };

  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };

  return (
    <div className="container">
      <h1>Itinerary</h1>
      <h2>Manage your trips</h2>
      
      <p>View and organize your upcoming trips.</p>
      <p>Add new destinations to your itinerary.</p>
      
      <section className="trips-section">
        <div className="trips-header">
          <h3>Trips</h3>
          <button onClick={() => setIsModalOpen(true)}>New Trip</button>
        </div>
        
        <ul className="trips-list">
          {trips.map(trip => (
            <li 
              key={trip.id} 
              className="trip-item"
              onClick={() => handleTripClick(trip.id)}
            >
              <strong>{trip.destination}</strong>
              <span>{trip.startDate} – {trip.endDate}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Modal for new trip */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Create New Trip</h3>
              <button 
                className="close-button"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={addNewTrip} className="new-trip-form">
              <label>
                Destination
                <input
                  type="text"
                  name="destination"
                  placeholder="Where are you going?"
                  value={newTrip.destination}
                  onChange={handleNewTripChange}
                  required
                />
              </label>
              <label>
                Start Date
                <input
                  type="text"
                  name="startDate"
                  placeholder="Start date"
                  value={newTrip.startDate}
                  onChange={handleNewTripChange}
                  required
                />
              </label>
              <label>
                End Date
                <input
                  type="text"
                  name="endDate"
                  placeholder="End date"
                  value={newTrip.endDate}
                  onChange={handleNewTripChange}
                  required
                />
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit">Create Trip</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTrips;