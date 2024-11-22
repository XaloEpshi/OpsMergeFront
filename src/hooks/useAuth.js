// frontend/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase'; // Importar la configuración del frontend
import { doc, getDoc } from 'firebase/firestore';

const useAuth = () => {
  const [userData, setUserData] = useState({ name: '', email: '', profile: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData({
            name: data.username || 'Usuario',  // Aquí aseguramos que username se guarda correctamente
            email: user.email,
            profile: data.profile || 'default',  // Se asegura que el perfil esté disponible
          });
          setIsAuthenticated(true);
        } else {
          console.log("No such document!");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Limpia el listener cuando el componente se desmonte
  }, []);

  return { userData, isAuthenticated, isLoading };
};

export default useAuth;
