import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ComentariosEvento from './screens/ComentariosEvento';
import CrearEvento from './screens/CrearEvento';
import EventoDetalle from './screens/EventoDetalle';
import ListaEventos from './screens/ListaEventos';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

import { AuthProvider } from "./utils/authContext";

// Si usas expo-auth-session en Android/iOS, necesitas este import para que funcione correctamente
import * as WebBrowser from "expo-web-browser";
WebBrowser.maybeCompleteAuthSession();

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
          <Stack.Screen name="ListaEventos" component={ListaEventos} options={{ title: 'Eventos' }} />
          <Stack.Screen name="CrearEvento" component={CrearEvento} options={{ title: 'Crear Evento' }} />
          <Stack.Screen name="EventoDetalle" component={EventoDetalle} options={{ title: 'Detalle del Evento' }} />
          <Stack.Screen name="ComentariosEvento" component={ComentariosEvento} options={{ title: 'Comentarios' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}