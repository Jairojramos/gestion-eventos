import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../firebaseConfig';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !passwordConfirm) {
      Alert.alert("Error", "Completa todos los campos.");
      return;
    }
    if (password !== passwordConfirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Éxito", "Usuario registrado correctamente.");
      navigation.navigate('Login');
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          Alert.alert("Error", "Este correo ya está registrado.");
          break;
        case 'auth/invalid-email':
          Alert.alert("Error", "Correo electrónico no válido.");
          break;
        case 'auth/weak-password':
          Alert.alert("Error", "La contraseña es demasiado débil.");
          break;
        default:
          Alert.alert("Error al registrar", error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro</Text>
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
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        value={passwordConfirm}
        onChangeText={setPasswordConfirm}
        secureTextEntry
      />
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding: 24, backgroundColor:'#fff' },
  input: { borderBottomWidth: 1, marginBottom:16, padding:8, fontSize:16 },
  title: { fontSize:24, marginBottom:24, textAlign:'center', fontWeight:'bold' },
});