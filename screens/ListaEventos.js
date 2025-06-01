import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../utils/authContext';

// Modificado: ahora recibe la cookie de sesión y la envía en el header
const fetchEventos = async (cookie) => {
  const res = await fetch('https://tarea.transforma.edu.sv/Eventos/listar', {
    headers: cookie ? { Cookie: cookie } : {},
    credentials: 'include',
  });
  const text = await res.text();
  // Para depuración, imprime la cookie y la respuesta
  console.log("Cookie enviada:", cookie);
  console.log("Respuesta eventos:", text);
  if (!res.ok) throw new Error(text || 'Error al obtener eventos');
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
};

export default function ListaEventos({ navigation }) {
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const { logout, user } = useAuth();

  // Modificado: pasa la cookie del usuario a fetchEventos
  const cargarEventos = useCallback(async () => {
    try {
      setRefrescando(true);
      const data = await fetchEventos(user?.cookie);
      setEventos(data);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudieron cargar los eventos');
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [user]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await logout();
            navigation.replace('Login');
          }}
        >
          <Text style={styles.logoutBtnText}>CERRAR SESIÓN</Text>
        </TouchableOpacity>
      ),
      headerRightContainerStyle: { paddingRight: 16 },
    });
  }, [navigation, logout]);

  useEffect(() => {
    cargarEventos();
    // Para que la lista se refresque al regresar de CrearEvento
    const unsubscribe = navigation.addListener('focus', cargarEventos);
    return unsubscribe;
  }, [navigation, cargarEventos]);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008080" />
        <Text>Cargando eventos...</Text>
      </View>
    );
  }

  if (!eventos || eventos.length === 0) {
    return (
      <View style={styles.center}>
        {user?.picture && (
          <Image source={{ uri: user.picture }} style={styles.avatar} />
        )}
        <Text style={styles.saludo}>
          Hola{user?.name ? `, ${user.name}` : ''} 👋
        </Text>
        <Text>No hay eventos disponibles</Text>
        <Button title="Crear Evento" onPress={() => navigation.navigate('CrearEvento')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {user?.picture && (
        <Image source={{ uri: user.picture }} style={styles.avatar} />
      )}
      <Text style={styles.saludo}>
        Bienvenido{user?.name ? `, ${user.name}` : ''} !
      </Text>
      <Text style={styles.titulo}>Lista de Eventos</Text>
      <FlatList
        data={eventos}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={cargarEventos} />
        }
      />
      <Button title="Crear Evento" onPress={() => navigation.navigate('CrearEvento')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20, backgroundColor: '#fff'
  },
  saludo: {
    fontSize: 18, fontWeight: '500', marginBottom: 8, color: '#333'
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24, marginBottom: 8, alignSelf: 'flex-start',
  },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
  evento: { padding: 12, backgroundColor: '#f1f1f1', borderRadius: 8 },
  eventoTitulo: { fontSize: 18, fontWeight: '600' },
  eventoFecha: { fontSize: 14, color: '#555' },
  eventoUbicacion: { fontSize: 13, color: '#666' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoutBtn: {
    backgroundColor: '#d32f2f',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  logoutBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
});