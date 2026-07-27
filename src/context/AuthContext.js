import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const ref = doc(db, 'usuarios', firebaseUser.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            setUsuario({
              uid: firebaseUser.uid,
              ...snap.data(),
            });
          } else {
            setUsuario({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            });
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        setUsuario(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function logout() {
    await signOut(auth);
  }

  //   const atualizarUsuario = (dados) => {
  //   setUsuario(prev => ({
  //     ...prev,
  //     ...dados
  //   }));
  // };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        loading,
        setUsuario,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
