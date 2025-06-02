import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Pantalla para crear un nuevo evento
export default function CrearEvento({ navigation }) {
  // Estados para los campos del formulario
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  // Estado para indicar si se está enviando la solicitud
  const [cargando, setCargando] = useState(false);

  // Estados para controlar el modal de feedback
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  // Maneja la creación del evento
  const handleCrear = async () => {
    // Validación simple de campos vacíos
    if (!descripcion || !fecha || !hora || !ubicacion) {
      setModalMsg("Por favor completa todos los campos.");
      setModalVisible(true);
      return;
    }
    setCargando(true);
    try {
      // Enviar solicitud POST a la API para crear el evento
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

      // Mostrar mensaje de éxito en el modal
      setModalMsg(
        `¡Evento creado exitosamente!\n\nDescripción: ${descripcion}\nFecha: ${fecha}\nHora: ${hora}\nUbicación: ${ubicacion}`
      );
      setModalVisible(true);

      // Limpiar campos del formulario
      setDescripcion('');
      setFecha('');
      setHora('');
      setUbicacion('');
    } catch (e) {
      // Mostrar mensaje de error en el modal
      setModalMsg(e.message);
      setModalVisible(true);
    } finally {
      setCargando(false);
    }
  };

  // Cerrar el modal y volver si el evento fue creado
  const handleCloseModal = () => {
    setModalVisible(false);
    // Si el evento fue creado, regresar a la pantalla anterior
    if (modalMsg.startsWith("¡Evento creado")) {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f4f6fa' }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado de la pantalla */}
        <View style={styles.header}>
          <Ionicons name="add-circle-outline" size={52} color="#6C63FF" style={{ marginBottom: 6 }} />
          <Text style={styles.titulo}>Crear Evento</Text>
        </View>

        {/* Formulario para los datos del evento */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={styles.input}
            placeholder="¿De qué trata el evento?"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            maxLength={160}
            placeholderTextColor="#a3a3c2"
          />

          <Text style={styles.label}>Fecha</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={fecha}
            onChangeText={setFecha}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            placeholderTextColor="#a3a3c2"
          />

          <Text style={styles.label}>Hora</Text>
          <TextInput
            style={styles.input}
            placeholder="HH:MM"
            value={hora}
            onChangeText={setHora}
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
            placeholderTextColor="#a3a3c2"
          />

          <Text style={styles.label}>Ubicación</Text>
          <TextInput
            style={styles.input}
            placeholder="¿Dónde será?"
            value={ubicacion}
            onChangeText={setUbicacion}
            placeholderTextColor="#a3a3c2"
          />

          {/* Botón para crear el evento */}
          <TouchableOpacity
            style={[styles.boton, cargando && { opacity: 0.7 }]}
            onPress={handleCrear}
            disabled={cargando}
            activeOpacity={0.85}
          >
            {cargando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.botonTxt}>Crear Evento</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Modal de feedback (éxito o error) */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              {modalMsg.startsWith("¡Evento creado") ? (
                <Ionicons name="checkmark-circle" size={60} color="#4BB543" style={{ marginBottom: 8 }} />
              ) : (
                <Ionicons name="warning" size={60} color="#d32f2f" style={{ marginBottom: 8 }} />
              )}
              <Text style={styles.modalText}>{modalMsg}</Text>
              <TouchableOpacity
                style={styles.modalBtn}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalBtnTxt}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos personalizados para la pantalla de crear evento y el modal
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: 0,
    backgroundColor: '#f4f6fa',
    justifyContent: 'center'
  },
  header: {
    marginTop: 38,
    marginBottom: 10,
    alignItems: 'center'
  },
  titulo: {
    fontSize: 28,
    color: "#21215c",
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.2
  },
  formCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    marginHorizontal: 18,
    padding: 22,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 22,
  },
  label: {
    color: "#21215c",
    fontWeight: "bold",
    marginBottom: 7,
    marginTop: 11,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d7d7ef',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 5,
    backgroundColor: '#f8f8ff',
    color: "#23235c"
  },
  boton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 15,
    paddingVertical: 13,
    justifyContent: "center",
    marginTop: 19,
    marginBottom: 2,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 2,
    elevation: 1,
  },
  botonTxt: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.2,
    marginLeft: 4,
  },
  // MODAL estilos
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(25, 20, 50, 0.14)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 35,
    paddingHorizontal: 26,
    alignItems: "center",
    maxWidth: "85%",
    marginHorizontal: 16,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  modalText: {
    color: "#21215c",
    fontSize: 17,
    textAlign: "center",
    marginBottom: 18,
    marginTop: 2,
  },
  modalBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    backgroundColor: "#6C63FF",
    borderRadius: 10,
    alignItems: "center",
    marginTop: 2,
  },
  modalBtnTxt: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15.5,
    letterSpacing: 0.1,
  },
});