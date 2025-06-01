import { useState } from 'react';
import { Alert, Button, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CrearEvento({ navigation }) {
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleCrear = async () => {
    if (!descripcion || !fecha || !hora || !ubicacion) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    setCargando(true);
    try {
      // Petición real a la API
      const res = await fetch('https://tarea.transforma.edu.sv/Eventos/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion,
          fecha,
          hora,
          ubicacion,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al crear evento');
      Alert.alert(
        'Evento creado',
        `Descripción: ${descripcion}\nFecha: ${fecha}\nHora: ${hora}\nUbicación: ${ubicacion}`,
        [
          {
            text: "OK",
            onPress: () => navigation.goBack()
          }
        ]
      );
      setDescripcion('');
      setFecha('');
      setHora('');
      setUbicacion('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Crear Evento</Text>
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={descripcion}
        onChangeText={setDescripcion}
      />
      <TextInput
        style={styles.input}
        placeholder="Fecha (YYYY-MM-DD)"
        value={fecha}
        onChangeText={setFecha}
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
      />
      <TextInput
        style={styles.input}
        placeholder="Hora (HH:MM)"
        value={hora}
        onChangeText={setHora}
        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
      />
      <TextInput
        style={styles.input}
        placeholder="Ubicación"
        value={ubicacion}
        onChangeText={setUbicacion}
      />
      <Button title={cargando ? "Creando..." : "Crear Evento"} onPress={handleCrear} disabled={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 23, backgroundColor: '#fff' },
  titulo: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    fontSize: 16,
  },
});