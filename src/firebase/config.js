import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
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

// 🔹 Inicializa app
const app = initializeApp(firebaseConfig);

// 🔹 AUTH COM PERSISTÊNCIA
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// 🔹 FIRESTORE
export const db = getFirestore(app);