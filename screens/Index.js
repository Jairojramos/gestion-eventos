import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';

const EVENTOS_URL = 'https://tarea.transforma.edu.sv/Eventos/eventos';

const ListaEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEventos = async () => {
      setCargando(true);
      try {
        const cookie = await AsyncStorage.getItem('sessionCookie');
        const res = await fetch(EVENTOS_URL, {
          headers: { 'cookie': cookie || '' }
        });
        if (res.status === 401) {
          Alert.alert('Sesión expirada', 'Por favor inicia sesión de nuevo.');
          setCargando(false);
          return;
        }
        const data = await res.json();
        setEventos(data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los eventos');
      }
      setCargando(false);
    };
    cargarEventos();
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008080" />
        <Text>Cargando eventos...</Text>
      </View>
    );
  }

  if (eventos.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No hay eventos disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Eventos</Text>
      <FlatList
        data={eventos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.evento}>
            <Text style={styles.eventoTitulo}>{item.descripcion}</Text>
            <Text style={styles.eventoFecha}>{item.fecha} {item.hora}</Text>
            <Text style={styles.eventoUbicacion}>Ubicación: {item.ubicacion}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default ListaEventos;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff'
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15
  },
  evento: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderRadius: 8
  },
  eventoTitulo: {
    fontSize: 18,
    fontWeight: '600'
  },
  eventoFecha: {
    fontSize: 14,
    color: '#555'
  },
  eventoUbicacion: {
    fontSize: 13,
    color: '#666'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});