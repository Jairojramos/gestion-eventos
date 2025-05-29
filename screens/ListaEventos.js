import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const fetchEventos = async () => {
  const cookie = await AsyncStorage.getItem('sessionCookie');
  const res = await fetch('https://tarea.transforma.edu.sv/Eventos/listar', {
    headers: { 'cookie': cookie }
  });
  return await res.json();
};

export default function ListaEventos({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        const data = await fetchEventos();
        setEventos(data);
      } catch (error) {
        Alert.alert('Error', 'No se pudieron cargar los eventos');
      } finally {
        setCargando(false);
      }
    };
    cargarEventos();
  }, []);

  if (cargando) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#008080" />
      <Text>Cargando eventos...</Text>
    </View>
  );

  if (!eventos || eventos.length === 0) return (
    <View style={styles.center}>
      <Text>No hay eventos disponibles</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Eventos</Text>
      <FlatList
        data={eventos}
        keyExtractor={item => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.evento}
            onPress={() => navigation.navigate('EventoDetalle', { id: item.id })}
            onLongPress={() => navigation.navigate('ComentariosEvento', { eventId: item.id })}
          >
            <Text style={styles.eventoTitulo}>{item.descripcion}</Text>
            <Text style={styles.eventoFecha}>{item.fecha} {item.hora}</Text>
            <Text style={styles.eventoUbicacion}>Ubicación: {item.ubicacion}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  evento: { marginBottom: 12, padding: 12, backgroundColor: '#f1f1f1', borderRadius: 8 },
  eventoTitulo: { fontSize: 18, fontWeight: '600' },
  eventoFecha: { fontSize: 14, color: '#555' },
  eventoUbicacion: { fontSize: 13, color: '#666' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});