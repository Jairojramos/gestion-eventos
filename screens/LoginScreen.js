import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { useAuth } from "../utils/authContext";

export default function LoginScreen({ navigation }) {
  // Estados para los campos de usuario y contraseña
  const [usuario, setUsuario] = useState("");
  const [contra, setContra] = useState("");
  // Hook de autenticación personalizado
  const { login, loginWithGoogle, user, googleResponse } = useAuth();
  // Estado para mostrar loading en el botón
  const [loading, setLoading] = useState(false);
  // Estados para controlar la visibilidad y el mensaje del modal de error
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  // Función para mostrar el modal de error con un mensaje personalizado
  const showErrorModal = (msg) => {
    setModalMsg(msg);
    setModalVisible(true);
  };

  // Función para manejar login tradicional
  const handleLogin = async () => {
    // Validación simple de campos vacíos
    if (!usuario.trim() || !contra.trim()) {
      showErrorModal("Por favor ingresa usuario y contraseña.");
      return;
    }
    setLoading(true);
    try {
      await login(usuario, contra);
      // Navega a la pantalla de eventos al iniciar sesión correctamente
      navigation.replace("ListaEventos");
    } catch (error) {
      // Muestra mensaje de error si falla el login
      showErrorModal(error.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar login con Google
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      // Navega a la pantalla de eventos si login con Google es exitoso
      navigation.replace("ListaEventos");
    } catch (error) {
      showErrorModal(error.message || "No se pudo iniciar sesión con Google");
      setLoading(false);
    }
  };

  // Efecto para manejar cambios en el usuario autenticado o respuesta de Google
  useEffect(() => {
    // Si el usuario inició sesión con Google, navega automáticamente
    if (user?.isGoogle) {
      setLoading(false);
      navigation.replace("Home");
    }
    // Si la respuesta de Google no fue exitosa, desactiva el loading
    if (googleResponse?.type && googleResponse.type !== "success") {
      setLoading(false);
    }
  }, [user, googleResponse]);

  return (
    <View style={styles.container}>
      {/* Título de la app */}
      <Text style={styles.title}>Meet+</Text>
      {/* Campo de usuario */}
      <TextInput
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      {/* Campo de contraseña */}
      <TextInput
        placeholder="Contraseña"
        value={contra}
        onChangeText={setContra}
        style={styles.input}
        secureTextEntry
        placeholderTextColor="#888"
      />
      {/* Botón de login tradicional */}
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.8 }]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>
      {/* Botón de login con Google */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.googleButtonText}>Ingresar con Google</Text>
      </TouchableOpacity>
      {/* Enlace para ir a la pantalla de registro */}
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>
          ¿No tienes cuenta?{" "}
          <Text style={{ textDecorationLine: "underline" }}>Regístrate aquí</Text>
        </Text>
      </TouchableOpacity>

      {/* MODAL DE ERROR */}
      <Modal
        animationType="fade"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {/* Icono de alerta */}
                <Ionicons name="alert-circle" size={48} color="#e53935" style={{ marginBottom: 11 }} />
                {/* Título del modal */}
                <Text style={styles.modalTitle}>¡Ups!</Text>
                {/* Mensaje de error */}
                <Text style={styles.modalMessage}>{modalMsg}</Text>
                {/* Botón para cerrar el modal */}
                <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalBtnText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// Estilos de la pantalla de login y modal
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 22,
  },
  title: { 
    fontSize: 32, 
    color: "#6C63FF", 
    fontWeight: "bold", 
    marginBottom: 30, 
    textAlign: "left", 
    alignSelf: "flex-start",
  },
  input: {
    width: "100%",
    backgroundColor: "#f6f8ff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 13,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 18,
    color: "#21215c",
    shadowColor: "#e0e0e0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
  },
  button: {
    width: "100%",
    backgroundColor: "#6C63FF",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  googleButton: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DB4437",
    marginBottom: 25,
  },
  googleButtonText: {
    color: "#DB4437",
    fontWeight: "bold",
    fontSize: 16,
  },
  link: { 
    color: "#6C63FF", 
    marginTop: 10, 
    fontSize: 15, 
    textAlign: "center" 
  },
  
  // MODAL PERSONALIZADO
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(40,40,70,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 310,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 27,
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 7,
  },
  modalTitle: {
    fontSize: 22,
    color: "#e53935",
    fontWeight: "bold",
    marginBottom: 6,
  },
  modalMessage: {
    color: "#3c3c4e",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalBtn: {
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15.5,
  },
});