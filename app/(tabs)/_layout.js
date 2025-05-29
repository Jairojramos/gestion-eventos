import AsyncStorage from '@react-native-async-storage/async-storage';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import CrearEvento from './crear-evento';
import ListaEventos from './lista-eventos';

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const cookie = await AsyncStorage.getItem('sessionCookie');
      if (!cookie) {
        router.replace('/(auth)/login');
      }
    };
    checkSession();
  }, []);

  return (
    <Tab.Navigator>
      <Tab.Screen name="lista-eventos" component={ListaEventos} options={{ title: 'Eventos' }} />
      <Tab.Screen name="crear-evento" component={CrearEvento} options={{ title: 'Crear Evento' }} />
      {/* ...otras pantallas */}
    </Tab.Navigator>
  );
}