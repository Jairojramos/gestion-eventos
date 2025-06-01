import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function EventoDetalleScreen({ route, navigation }) {
  const { id } = route.params;
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarEvento = async () => {
      try {
        const cookie = await AsyncStorage.getItem('sessionCookie');
        if (!cookie) throw new Error('Sesión expirada, inicia sesión de nuevo.');
        const res = await fetch(`https://tarea.transforma.edu.sv/Eventos/eventos/${id}`, {
          headers: {
            'Cookie': cookie,
          },
        });
        if (!res.ok) throw new Error('No se pudo obtener el evento');
        const data = await res.json();
        setEvento(data);
      } catch (e) {
        Alert.alert('Error', e.message);
      } finally {
        setCargando(false);
      }
    };
    cargarEvento();
  }, [id]);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008080" />
        <Text>Cargando detalles...</Text>
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={styles.center}>
        <Text>No se encontró el evento.</Text>
        <Button title="Volver a la lista" onPress={() => navigation.navigate('ListaEventos')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{evento.descripcion}</Text>
      <Text style={styles.detalle}>Fecha: {evento.fecha}</Text>
      <Text style={styles.detalle}>Hora: {evento.hora}</Text>
      <Text style={styles.detalle}>Ubicación: {evento.ubicacion}</Text>
      <Button title="Ver comentarios" onPress={() => navigation.navigate('ComentariosEvento', { eventId: id })} />
      <Button title="Volver a la lista" onPress={() => navigation.navigate('ListaEventos')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  detalle: { fontSize: 17, marginBottom: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});