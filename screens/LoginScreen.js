import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../utils/authContext";

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState("");
  const [contra, setContra] = useState("");
  const { login, loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(usuario, contra);
      navigation.replace("ListaEventos");
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      navigation.replace("ListaEventos");
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo iniciar sesión con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Usuario"
        value={usuario}
        onChangeText={setUsuario}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Contraseña"
        value={contra}
        onChangeText={setContra}
        style={styles.input}
        secureTextEntry
      />
      <Button title={loading ? "Cargando..." : "Ingresar"} onPress={handleLogin} disabled={loading} />
      <View style={{ height: 10 }} />
      <Button title="Ingresar con Google" color="#DB4437" onPress={handleGoogleLogin} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate aquí</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, fontWeight: "bold", textAlign: "center" },
  input: { borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 5 },
  link: { color: "blue", marginTop: 15, textAlign: "center" },
});