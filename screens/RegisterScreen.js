import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../utils/authContext";

export default function RegisterScreen({ navigation }) {
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contra, setContra] = useState("");
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await register(nombres, apellidos, usuario, contra);
      navigation.replace("ListaEventos");
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
      <TextInput
        placeholder="Nombres"
        value={nombres}
        onChangeText={setNombres}
        style={styles.input}
        autoCapitalize="words"
      />
      <TextInput
        placeholder="Apellidos"
        value={apellidos}
        onChangeText={setApellidos}
        style={styles.input}
        autoCapitalize="words"
      />
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
      <Button title={loading ? "Registrando..." : "Registrarse"} onPress={handleRegister} disabled={loading} />
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión aquí</Text>
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