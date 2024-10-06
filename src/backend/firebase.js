import { initializeApp } from 'firebase/app' // Import initializeApp from firebase/app
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDyFvxkmOFdT6wUJN5IgPryod5cvx6rVco',
  authDomain: 'thesismanagementsystem-39688.firebaseapp.com',
  projectId: 'thesismanagementsystem-39688',
  storageBucket: 'thesismanagementsystem-39688.appspot.com',
  messagingSenderId: '344707455909',
  appId: '1:344707455909:web:782f0865d92dd4d12fa64c',
  measurementId: 'G-RETHEZ24WR',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firestore and Auth
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
