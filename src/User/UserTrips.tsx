import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  updateDoc,
  arrayUnion,
  deleteDoc
} from 'firebase/firestore';
import { db,auth } from '../firebase';
import { generateShareableLink } from '../utils/linkGenerator';

interface CostItem {
  category: string;
  amount: number;
  description?: string;
}

interface Trip {
  id: string;
  name: string;
  tripDate: string;
  costs: CostItem[];
  creatorId: string;
  travelers: string[];
  shareLink?: string;
}

const UserTrips: React.FC = () => {
  const navigate = useNavigate();
  const currentUser  = auth.currentUser;
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCostModalOpen, setIsCostModalOpen] = useState(false);
  const [currentTripId, setCurrentTripId] = useState<string | null>(null);
  const [emailToShare, setEmailToShare] = useState('');
  const [newTrip, setNewTrip] = useState<Omit<Trip, 'id' | 'creatorId' | 'travelers' | 'costs'>>({ 
    name: '', 
    tripDate: '', 
  });
  const [newCost, setNewCost] = useState<CostItem>({
    category: 'Transport',
    amount: 0,
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);

  // Fetch user's trips on component mount
  useEffect(() => {
    const fetchTrips = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const tripsRef = collection(db, 'trips');
        const q = query(tripsRef, where('travelers', 'array-contains', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const tripsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Trip[];
        
        setTrips(tripsData);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [currentUser]);

  const handleNewTripChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTrip(prev => ({ ...prev, [name]: value }));
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewCost(prev => ({ 
      ...prev, 
      [name]: name === 'amount' ? parseFloat(value) || 0 : value 
    }));
  };

  const addNewTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.uid || !newTrip.name || !newTrip.tripDate) {
      return;
    }

    try {
      setLoading(true);
      
      const shareLink = generateShareableLink();
      
      const tripData = {
        name: newTrip.name,
        tripDate: newTrip.tripDate,
        costs: [],
        creatorId: currentUser.uid,
        travelers: [currentUser.uid],
        shareLink,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'trips'), tripData);
      
      setTrips(prev => [...prev, {
        id: docRef.id,
        ...tripData
      }]);
      
      setNewTrip({ name: '', tripDate: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCostToTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTripId || !newCost.category || newCost.amount <= 0) return;

    try {
      setLoading(true);
      
      const tripRef = doc(db, 'trips', currentTripId);
      await updateDoc(tripRef, {
        costs: arrayUnion(newCost)
      });
      
      // Update local state
      setTrips(prev => prev.map(trip => 
        trip.id === currentTripId 
          ? { ...trip, costs: [...trip.costs, newCost] } 
          : trip
      ));
      
      setNewCost({
        category: 'Transport',
        amount: 0,
        description: ''
      });
      setIsCostModalOpen(false);
    } catch (error) {
      console.error('Error adding cost:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeCostFromTrip = async (tripId: string, costIndex: number) => {
    try {
      setLoading(true);
      
      const trip = trips.find(t => t.id === tripId);
      if (!trip) return;
      
      const updatedCosts = [...trip.costs];
      updatedCosts.splice(costIndex, 1);
      
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        costs: updatedCosts
      });
      
      // Update local state
      setTrips(prev => prev.map(t => 
        t.id === tripId 
          ? { ...t, costs: updatedCosts } 
          : t
      ));
    } catch (error) {
      console.error('Error removing cost:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareTrip = async () => {
    if (!currentTripId || !emailToShare) return;
    
    try {
      setLoading(true);
      
      const tripRef = doc(db, 'trips', currentTripId);
      await updateDoc(tripRef, {
        travelers: arrayUnion(emailToShare)
      });
      
      // Update local state
      setTrips(prev => prev.map(trip => 
        trip.id === currentTripId 
          ? { ...trip, travelers: [...trip.travelers, emailToShare] } 
          : trip
      ));
      
      setEmailToShare('');
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Error sharing trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripClick = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };

  const openShareModal = (tripId: string) => {
    setCurrentTripId(tripId);
    setIsShareModalOpen(true);
  };

  const openCostModal = (tripId: string) => {
    setCurrentTripId(tripId);
    setIsCostModalOpen(true);
  };

  const startEditingTrip = (tripId: string) => {
    setEditingTripId(tripId);
    const tripToEdit = trips.find(trip => trip.id === tripId);
    if (tripToEdit) {
      setNewTrip({
        name: tripToEdit.name,
        tripDate: tripToEdit.tripDate
      });
    }
  };

  const saveEditedTrip = async (tripId: string) => {
    try {
      setLoading(true);
      
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        name: newTrip.name,
        tripDate: newTrip.tripDate
      });
      
      // Update local state
      setTrips(prev => prev.map(trip => 
        trip.id === tripId 
          ? { ...trip, name: newTrip.name, tripDate: newTrip.tripDate } 
          : trip
      ));
      
      setEditingTripId(null);
      setNewTrip({ name: '', tripDate: '' });
    } catch (error) {
      console.error('Error updating trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelEditing = () => {
    setEditingTripId(null);
    setNewTrip({ name: '', tripDate: '' });
  };

  const deleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'trips', tripId));
        setTrips(prev => prev.filter(trip => trip.id !== tripId));
      } catch (error) {
        console.error('Error deleting trip:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const calculateTotalCost = (costs: CostItem[]) => {
    return costs.reduce((total, cost) => total + cost.amount, 0);
  };

  if (loading && trips.length === 0) {
    return <div className="container">Loading your trips...</div>;
  }

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
        
        {trips.length === 0 ? (
          <p>You don't have any trips yet. Create your first trip!</p>
        ) : (
          <ul className="trips-list">
            {trips.map(trip => (
              <li key={trip.id} className="trip-item">
                {editingTripId === trip.id ? (
                  <div className="trip-edit-form">
                    <input
                      type="text"
                      name="name"
                      value={newTrip.name}
                      onChange={handleNewTripChange}
                      placeholder="Trip name"
                    />
                    <input
                      type="date"
                      name="tripDate"
                      value={newTrip.tripDate}
                      onChange={handleNewTripChange}
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveEditedTrip(trip.id)}>Save</button>
                      <button onClick={cancelEditing}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div onClick={() => handleTripClick(trip.id)}>
                      <strong>{trip.name}</strong>
                      <span>{new Date(trip.tripDate).toLocaleDateString()}</span>
                      <div className="cost-summary">
                        <span>Total: ${calculateTotalCost(trip.costs).toFixed(2)}</span>
                        <ul className="cost-categories">
                          {trip.costs.reduce((acc, cost) => {
                            const existing = acc.find(c => c.category === cost.category);
                            if (existing) {
                              existing.amount += cost.amount;
                            } else {
                              acc.push({ ...cost });
                            }
                            return acc;
                          }, [] as CostItem[]).map((cost, i) => (
                            <li key={i}>
                              {cost.category}: ${cost.amount.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="trip-actions">
                      <button 
                        className="edit-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingTrip(trip.id);
                        }}
                      >
                        Edit
                      </button>
                      <button 
                        className="share-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openShareModal(trip.id);
                        }}
                      >
                        Share
                      </button>
                      <button 
                        className="add-cost-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openCostModal(trip.id);
                        }}
                      >
                        Add Cost
                      </button>
                      <button 
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrip(trip.id);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
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
                disabled={loading}
              >
                ×
              </button>
            </div>
            <form onSubmit={addNewTrip} className="new-trip-form">
              <label>
                Trip Name
                <input
                  type="text"
                  name="name"
                  placeholder="Trip name"
                  value={newTrip.name}
                  onChange={handleNewTripChange}
                  required
                  disabled={loading}
                />
              </label>
              <label>
                Trip Date
                <input
                  type="date"
                  name="tripDate"
                  value={newTrip.tripDate}
                  onChange={handleNewTripChange}
                  required
                  disabled={loading}
                />
              </label>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for sharing trip */}
      {isShareModalOpen && currentTripId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Share Trip</h3>
              <button 
                className="close-button"
                onClick={() => setIsShareModalOpen(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            <div className="share-form">
              <label>
                Traveler's Email
                <input
                  type="email"
                  placeholder="Enter email to share with"
                  value={emailToShare}
                  onChange={(e) => setEmailToShare(e.target.value)}
                  required
                  disabled={loading}
                />
              </label>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsShareModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleShareTrip}
                  disabled={loading || !emailToShare}
                >
                  {loading ? 'Sharing...' : 'Share Trip'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for adding costs */}
      {isCostModalOpen && currentTripId && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add Cost</h3>
              <button 
                className="close-button"
                onClick={() => setIsCostModalOpen(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            <form onSubmit={addCostToTrip} className="cost-form">
              <label>
                Category
                <select
                  name="category"
                  value={newCost.category}
                  onChange={handleCostChange}
                  required
                  disabled={loading}
                >
                  <option value="Transport">Transport</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Food">Food</option>
                  <option value="Activities">Activities</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label>
                Amount
                <input
                  type="number"
                  name="amount"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={newCost.amount || ''}
                  onChange={handleCostChange}
                  required
                  disabled={loading}
                />
              </label>
              <label>
                Description (Optional)
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={newCost.description}
                  onChange={handleCostChange}
                  disabled={loading}
                />
              </label>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setIsCostModalOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !newCost.category || newCost.amount <= 0}
                >
                  {loading ? 'Adding...' : 'Add Cost'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTrips;