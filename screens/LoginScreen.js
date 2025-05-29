import { signInWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../firebaseConfig';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor completa todos los campos.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      Alert.alert("Éxito", `Bienvenido ${user.email}`);
      navigation.replace("ListaEventos");
    } catch (error) {
      switch (error.code) {
        case 'auth/user-not-found':
          Alert.alert("Error", "El usuario no existe.");
          break;
        case 'auth/wrong-password':
          Alert.alert("Error", "Contraseña incorrecta.");
          break;
        case 'auth/invalid-email':
          Alert.alert("Error", "El correo no es válido.");
          break;
        default:
          Alert.alert("Error al iniciar sesión", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Ingresar" onPress={handleLogin} />
      <TouchableOpacity
        onPress={() => navigation.navigate('Register')}
        style={{ marginTop: 20 }}
      >
        <Text style={{ color: 'blue', textAlign: 'center' }}>
          ¿No tienes cuenta? Regístrate aquí
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff'
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 16,
    padding: 8,
    fontSize: 16
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: 'bold'
  }
});