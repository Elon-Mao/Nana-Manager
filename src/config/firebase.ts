import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDxmSgdI0QkcNOnT4rlf7HvPokPxNz6ZHM",
  authDomain: "nana-manager.firebaseapp.com",
  projectId: "nana-manager",
  storageBucket: "nana-manager.appspot.com",
  messagingSenderId: "476903440628",
  appId: "1:476903440628:web:a52123e1ce81de45459ea1"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const provider = new GoogleAuthProvider()