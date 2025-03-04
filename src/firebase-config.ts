import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDXhZZGO7CtrbTUvamgJmmJ_2v3yWYUmfg",
  authDomain: "menuchat-a215e.firebaseapp.com",
  databaseURL: "https://menuchat-a215e-default-rtdb.firebaseio.com",
  projectId: "menuchat-a215e",
  storageBucket: "menuchat-a215e.firebasestorage.app",
  messagingSenderId: "1002439982066",
  appId: "1:1002439982066:web:1a351f64ca5cbdadd8896b",
  measurementId: "G-RJP6BSXYGD"
};

 
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app); 
export const auth = getAuth(app); 
export const database = getDatabase(app);
export default app;
