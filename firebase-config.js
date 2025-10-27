// Firebase Configuration and Database Functions
// Vendemmia Meccanizzata App

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, onSnapshot, query, orderBy, where, setDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpS12dA3c0LceaxHNMhntEhgPyfwsØRSE",
  authDomain: "vendemmia-meccanizzata.firebaseapp.com",
  projectId: "vendemmia-meccanizzata",
  storageBucket: "vendemmia-meccanizzata.firebasestorage.app",
  messagingSenderId: "745067977805",
  appId: "1:745067977805:web:095dd00b16f9ad2f199004",
  measurementId: "G-6T53WV1GD3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// ========== DATABASE FUNCTIONS ==========

// Clients Management
export const clientsCollection = collection(db, 'clients');

// Add new client
export async function addClient(clientData) {
  try {
    const docRef = await addDoc(clientsCollection, {
      ...clientData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Client added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding client: ', error);
    throw error;
  }
}

// Update client
export async function updateClient(clientId, clientData) {
  try {
    const clientRef = doc(db, 'clients', clientId);
    await updateDoc(clientRef, {
      ...clientData,
      updatedAt: new Date()
    });
    console.log('Client updated successfully');
  } catch (error) {
    console.error('Error updating client: ', error);
    throw error;
  }
}

// Delete client
export async function deleteClient(clientId) {
  try {
    await deleteDoc(doc(db, 'clients', clientId));
    console.log('Client deleted successfully');
  } catch (error) {
    console.error('Error deleting client: ', error);
    throw error;
  }
}

// Get all clients
export async function getAllClients() {
  try {
    const querySnapshot = await getDocs(query(clientsCollection, orderBy('nome')));
    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    return clients;
  } catch (error) {
    console.error('Error getting clients: ', error);
    throw error;
  }
}

// Get single client
export async function getClient(clientId) {
  try {
    const clientRef = doc(db, 'clients', clientId);
    const clientSnap = await getDoc(clientRef);
    if (clientSnap.exists()) {
      return { id: clientSnap.id, ...clientSnap.data() };
    } else {
      console.log('No such client!');
      return null;
    }
  } catch (error) {
    console.error('Error getting client: ', error);
    throw error;
  }
}

// Listen to clients changes (real-time)
export function listenToClients(callback) {
  return onSnapshot(query(clientsCollection, orderBy('nome')), (querySnapshot) => {
    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    callback(clients);
  });
}

// ========== TARIFFE MANAGEMENT ==========

// Tariffe collection
export const tariffeCollection = collection(db, 'tariffe');

// Save tariffe
export async function saveTariffe(tariffeData) {
  try {
    const tariffeRef = doc(db, 'tariffe', 'current');
    await updateDoc(tariffeRef, {
      ...tariffeData,
      updatedAt: new Date()
    });
    console.log('Tariffe saved successfully');
  } catch (error) {
    // If document doesn't exist, create it
    if (error.code === 'not-found') {
      await addDoc(tariffeCollection, {
        ...tariffeData,
        updatedAt: new Date()
      });
    } else {
      console.error('Error saving tariffe: ', error);
      throw error;
    }
  }
}

// Get tariffe
export async function getTariffe() {
  try {
    const tariffeRef = doc(db, 'tariffe', 'current');
    const tariffeSnap = await getDoc(tariffeRef);
    if (tariffeSnap.exists()) {
      return tariffeSnap.data();
    } else {
      // Return default tariffe if none exist
      return {
        tariffeVendemmia: {
          'montagna-ferro': 120,
          'montagna-legno': 110,
          'montagna-cemento': 130,
          'collina-ferro': 100,
          'collina-legno': 90,
          'collina-cemento': 110,
          'pianura-ferro': 80,
          'pianura-legno': 70,
          'pianura-cemento': 90,
          'personalizzata': 100
        },
        tariffeTrasporto: {
          'sociale': 0.15,
          'intesa': 0.20,
          'colli': 0.18,
          'altro': 0.25,
          'personalizzata': 0.20
        }
      };
    }
  } catch (error) {
    console.error('Error getting tariffe: ', error);
    throw error;
  }
}

// Listen to tariffe changes (real-time)
export function listenToTariffe(callback) {
  const tariffeRef = doc(db, 'tariffe', 'current');
  return onSnapshot(tariffeRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
}

// ========== CALCOLI HISTORY ==========

// Calcoli collection
export const calcoliCollection = collection(db, 'calcoli');

// Save calculation
export async function saveCalculation(calculationData) {
  try {
    const docRef = await addDoc(calcoliCollection, {
      ...calculationData,
      createdAt: new Date()
    });
    console.log('Calculation saved with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving calculation: ', error);
    throw error;
  }
}

// Get calculations history
export async function getCalculationsHistory() {
  try {
    const querySnapshot = await getDocs(query(calcoliCollection, orderBy('createdAt', 'desc')));
    const calculations = [];
    querySnapshot.forEach((doc) => {
      calculations.push({ id: doc.id, ...doc.data() });
    });
    return calculations;
  } catch (error) {
    console.error('Error getting calculations: ', error);
    throw error;
  }
}

// ========== AUTHENTICATION FUNCTIONS ==========

// Sign up new user
export async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User signed up:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// Sign in user
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('User signed in:', userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// Sign out user
export async function signOutUser() {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ========== MIGRATION FUNCTIONS ==========

// Migrate data from localStorage to Firebase
export async function migrateFromLocalStorage() {
  try {
    console.log('Starting migration from localStorage to Firebase...');
    
    // Migrate clients
    const savedClients = localStorage.getItem('vendemmia_clients');
    if (savedClients) {
      const clients = JSON.parse(savedClients);
      for (const client of clients) {
        const { id, ...clientData } = client;
        await addClient(clientData);
      }
      console.log(`Migrated ${clients.length} clients`);
    }
    
    // Migrate tariffe
    const savedTariffeVendemmia = localStorage.getItem('tariffeVendemmia');
    const savedTariffeTrasporto = localStorage.getItem('tariffeTrasporto');
    
    if (savedTariffeVendemmia || savedTariffeTrasporto) {
      const tariffeData = {
        tariffeVendemmia: savedTariffeVendemmia ? JSON.parse(savedTariffeVendemmia) : {},
        tariffeTrasporto: savedTariffeTrasporto ? JSON.parse(savedTariffeTrasporto) : {}
      };
      await saveTariffe(tariffeData);
      console.log('Migrated tariffe');
    }
    
    console.log('Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// ========== ANNO SELEZIONATO MANAGEMENT ==========

// Salva anno selezionato (singolo valore globale per tutta l'app)
export async function saveAnnoSelezionato(anno) {
  try {
    const annoRef = doc(db, 'preferenze', 'annoSelezionato');
    await updateDoc(annoRef, {
      anno: anno,
      updatedAt: new Date()
    });
    console.log(`Anno ${anno} salvato su Firestore`);
  } catch (error) {
    // Se il documento non esiste, crealo con setDoc
    if (error.code === 'not-found' || error.code === 'failed-precondition') {
      await setDoc(doc(db, 'preferenze', 'annoSelezionato'), {
        anno: anno,
        updatedAt: new Date()
      });
      console.log(`Anno ${anno} creato su Firestore`);
    } else {
      console.error('Error saving anno:', error);
      throw error;
    }
  }
}

// Leggi anno selezionato
export async function getAnnoSelezionato() {
  try {
    const annoRef = doc(db, 'preferenze', 'annoSelezionato');
    const annoSnap = await getDoc(annoRef);
    if (annoSnap.exists()) {
      const data = annoSnap.data();
      console.log(`Anno selezionato da Firestore: ${data.anno}`);
      return data.anno;
    } else {
      // Se non esiste, usa l'anno corrente
      const defaultYear = new Date().getFullYear();
      console.log(`Nessun anno trovato, uso anno corrente: ${defaultYear}`);
      return defaultYear;
    }
  } catch (error) {
    console.error('Error getting anno:', error);
    // Fallback all'anno corrente
    return new Date().getFullYear();
  }
}

// Listener real-time per anno selezionato
export function listenToAnnoSelezionato(callback) {
  const annoRef = doc(db, 'preferenze', 'annoSelezionato');
  return onSnapshot(annoRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      console.log(`Anno cambiato in tempo reale: ${data.anno}`);
      callback(data.anno);
    }
  });
}

// ========== UTILITY FUNCTIONS ==========

// Check if user is authenticated
export function isAuthenticated() {
  return auth.currentUser !== null;
}

// Get current user
export function getCurrentUser() {
  return auth.currentUser;
}

// Export Firebase instances for direct use if needed
export { app, db, auth, analytics };

