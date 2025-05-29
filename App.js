import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ComentariosEventoScreen from './screens/ComentariosEventoScreen';
import CrearEvento from './screens/CrearEvento';
import EventoDetalleScreen from './screens/EventoDetalleScreen';
import ListaEventos from './screens/ListaEventos';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Iniciar Sesión' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Registro' }} />
        <Stack.Screen name="ListaEventos" component={ListaEventos} options={{ title: 'Eventos' }} />
        <Stack.Screen name="CrearEvento" component={CrearEvento} options={{ title: 'Crear Evento' }} />
        <Stack.Screen name="EventoDetalle" component={EventoDetalleScreen} options={{ title: 'Detalle del Evento' }} />
        <Stack.Screen name="ComentariosEvento" component={ComentariosEventoScreen} options={{ title: 'Comentarios' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}