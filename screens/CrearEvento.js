import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function CrearEvento({ navigation }) {
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const handleCrear = () => {
    if (!descripcion || !fecha || !hora || !ubicacion) {
      Alert.alert('Error', 'Por favor completa todos los campos.');
      return;
    }
    // Aquí deberías hacer la petición a la API para crear el evento.
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
      />
      <TextInput
        style={styles.input}
        placeholder="Hora (HH:MM)"
        value={hora}
        onChangeText={setHora}
      />
      <TextInput
        style={styles.input}
        placeholder="Ubicación"
        value={ubicacion}
        onChangeText={setUbicacion}
      />
      <Button title="Crear Evento" onPress={handleCrear} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
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