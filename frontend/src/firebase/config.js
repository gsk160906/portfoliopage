import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAAbFdtf9WNwTWh2AuPTFHXPWOnbqS1gyU",
    authDomain: "servisgo-backend.firebaseapp.com",
    projectId: "servisgo-backend",
    storageBucket: "servisgo-backend.firebasestorage.app",
    messagingSenderId: "392859339369",
    appId: "1:392859339369:web:aec408093d3e7269ee30f8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
