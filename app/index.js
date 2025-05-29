import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import LoginScreen from './(auth)/login';
import ListaEventos from './(tabs)/index';

export default function Home() {
  const [logueado, setLogueado] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const cookie = await AsyncStorage.getItem('sessionCookie');
      setLogueado(!!cookie);
    };
    checkSession();
  }, []);

  if (logueado === null) return null; // Esperando verificación

  return logueado ? <ListaEventos /> : <LoginScreen onLogin={() => setLogueado(true)} />;
}