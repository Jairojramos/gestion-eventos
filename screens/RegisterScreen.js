import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../utils/authContext";

// Pantalla de registro de usuario
export default function RegisterScreen({ navigation }) {
  // Estados para los campos del formulario
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contra, setContra] = useState("");
  // Hook personalizado de autenticación
  const { register } = useAuth();
  // Estado de carga para el botón
  const [loading, setLoading] = useState(false);

  // Estados para el modal de feedback
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [modalSuccess, setModalSuccess] = useState(false);

  // Validar los campos de entrada antes de registrar
  const validate = () => {
    if (!nombres.trim()) return "Por favor ingresa tus nombres.";
    if (!apellidos.trim()) return "Por favor ingresa tus apellidos.";
    if (!usuario.trim()) return "Por favor ingresa un usuario.";
    if (!/^[a-zA-Z0-9_.-]{3,18}$/.test(usuario))
      return "El usuario debe tener de 3 a 18 caracteres y solo usar letras, números y . _ -";
    if (!contra.trim()) return "Por favor ingresa una contraseña.";
    if (contra.length < 5)
      return "La contraseña debe tener al menos 5 caracteres.";
    return null;
  };

  // Función que maneja el registro del usuario
  const handleRegister = async () => {
    const error = validate();
    if (error) {
      setModalMsg(error);
      setModalSuccess(false);
      setModalVisible(true);
      return;
    }
    setLoading(true);
    try {
      await register(nombres, apellidos, usuario, contra);
      // Si el registro es exitoso, muestra un mensaje de éxito
      setModalMsg("¡Registro exitoso!\nBienvenido, " + nombres + " " + apellidos + " 🎉");
      setModalSuccess(true);
      setModalVisible(true);
    } catch (error) {
      // Si hay error, muestra el mensaje correspondiente
      setModalMsg(error.message || "No se pudo registrar");
      setModalSuccess(false);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Cierra el modal y, si el registro fue exitoso, navega al login
  const handleCloseModal = () => {
    setModalVisible(false);
    if (modalSuccess) navigation.replace("Login");
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f4f6fa" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Encabezado con icono y título */}
        <View style={styles.header}>
          <Ionicons name="person-add" size={54} color="#6C63FF" style={{ marginBottom: 8 }} />
          <Text style={styles.title}>Registro</Text>
        </View>
        {/* Formulario de registro */}
        <View style={styles.formCard}>
          <Text style={styles.label}>Nombres</Text>
          <TextInput
            placeholder="José"
            value={nombres}
            onChangeText={setNombres}
            style={styles.input}
            autoCapitalize="words"
            placeholderTextColor="#a3a3c2"
          />
          <Text style={styles.label}>Apellidos</Text>
          <TextInput
            placeholder="Hernández"
            value={apellidos}
            onChangeText={setApellidos}
            style={styles.input}
            autoCapitalize="words"
            placeholderTextColor="#a3a3c2"
          />
          <Text style={styles.label}>Usuario</Text>
          <TextInput
            placeholder="joseantonio"
            value={usuario}
            onChangeText={setUsuario}
            style={styles.input}
            autoCapitalize="none"
            placeholderTextColor="#a3a3c2"
          />
          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            placeholder="*****"
            value={contra}
            onChangeText={setContra}
            style={styles.input}
            secureTextEntry
            placeholderTextColor="#a3a3c2"
          />

          {/* Botón de registro */}
          <TouchableOpacity
            style={[styles.boton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="person-add-outline" size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.botonTxt}>Registrarse</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Enlace para ir a la pantalla de login si el usuario ya tiene cuenta */}
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>¿Ya tienes cuenta? <Text style={{color:"#6C63FF", fontWeight:"bold"}}>Inicia sesión aquí</Text></Text>
          </TouchableOpacity>
        </View>

        {/* Modal de feedback para éxito o error */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseModal}
        >
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <View style={styles.modalBg}>
              <TouchableWithoutFeedback>
                <View style={styles.modalCard}>
                  {/* Icono según éxito o error */}
                  {modalSuccess ? (
                    <Ionicons name="checkmark-circle" size={60} color="#4BB543" style={{ marginBottom: 8 }} />
                  ) : (
                    <Ionicons name="close-circle" size={60} color="#d32f2f" style={{ marginBottom: 8 }} />
                  )}
                  {/* Mensaje del modal */}
                  <Text style={[styles.modalText, modalSuccess ? styles.successText : styles.errorText]}>
                    {modalMsg}
                  </Text>
                  {/* Botón para cerrar el modal */}
                  <TouchableOpacity
                    style={[styles.modalBtn, modalSuccess ? styles.modalBtnSuccess : styles.modalBtnError]}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.modalBtnTxt}>Aceptar</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos de la pantalla de registro y del modal
const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#f4f6fa',
    justifyContent: 'center'
  },
  header: {
    marginTop: 40,
    marginBottom: 10,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    marginBottom: 2,
    fontWeight: "bold",
    textAlign: "center",
    color: "#21215c",
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
    marginTop: 24,
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
    marginLeft: 2,
  },
  link: {
    color: "#222",
    marginTop: 18,
    textAlign: "center",
    fontSize: 15
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
    borderRadius: 22,
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
    fontSize: 17,
    textAlign: "center",
    marginBottom: 18,
    marginTop: 2,
  },
  successText: {
    color: "#21215c",
  },
  errorText: {
    color: "#d32f2f",
  },
  modalBtn: {
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 2,
    minWidth: 120,
  },
  modalBtnSuccess: {
    backgroundColor: "#6C63FF",
  },
  modalBtnError: {
    backgroundColor: "#d32f2f",
  },
  modalBtnTxt: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15.5,
    letterSpacing: 0.1,
  },
});