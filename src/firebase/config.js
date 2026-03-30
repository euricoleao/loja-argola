import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA2Chpu2lNwWGJ1bmBPuJp1zOy9Oxz9TDw",
  authDomain: "loja-joias-17e4c.firebaseapp.com",
  projectId: "loja-joias-17e4c",
  storageBucket: "loja-joias-17e4c.firebasestorage.app",
  messagingSenderId: "24014498399",
  appId: "1:24014498399:web:cb976065ed84ed7f8fc9ea",
  measurementId: "G-ME642J5D9J"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);