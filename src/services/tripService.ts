import { 
    collection, 
    query, 
    where, 
    getDocs, 
    addDoc, 
    doc, 
    updateDoc,
    arrayUnion,
    Timestamp 
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  export interface Cost {
    id?: string;
    description: string;
    value: number;
    category: string;
    date: Timestamp;
    paidBy: string;
  }
  
  export interface Trip {
    id?: string;
    name: string;
    destination: string;
    startDate: Timestamp;
    endDate: Timestamp;
    imageUrl: string;
    status: 'planned' | 'in-progress' | 'completed';
    userId: string;
    costs: Cost[];
    sharedWith: string[]; // Array de IDs de usuários com acesso
  }
  
  export const getUserTrips = async (userId: string): Promise<Trip[]> => {
    const q = query(
      collection(db, 'trips'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
  };
  
  export const createTrip = async (trip: Omit<Trip, 'id' | 'costs' | 'sharedWith'>) => {
    const docRef = await addDoc(collection(db, 'trips'), {
      ...trip,
      costs: [],
      sharedWith: [],
      createdAt: Timestamp.now()
    });
    return docRef.id;
  };
  
  export const addCostToTrip = async (tripId: string, cost: Omit<Cost, 'id'>) => {
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      costs: arrayUnion({ ...cost })
    });
  };
  
  export const shareTrip = async (tripId: string, userIdToShare: string) => {
    const tripRef = doc(db, 'trips', tripId);
    await updateDoc(tripRef, {
      sharedWith: arrayUnion(userIdToShare)
    });
  };