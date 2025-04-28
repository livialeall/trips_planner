// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbJZBieS7Po0s4x9icFfNDB97s7lJVysk",
  authDomain: "trips-organizer-14ce0.firebaseapp.com",
  projectId: "trips-organizer-14ce0",
  storageBucket: "trips-organizer-14ce0.firebasestorage.app",
  messagingSenderId: "411332941597",
  appId: "1:411332941597:web:e193d09f7e6f24973133f4",
  measurementId: "G-SD5EG5R35G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);