import { FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { createDrawerNavigator } from "@react-navigation/drawer";
import CustomDrawerContent from "../components/DrawerContent";
import ComentariosEvento from "../screens/ComentariosEvento";
import CrearEvento from "../screens/CrearEvento";
import EstadisticasScreen from "../screens/EstadisticasScreen";
import EventoDetalle from "../screens/EventoDetalle";
import HistorialEventos from "../screens/HistorialEventos";
import ListaEventos from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RSVPEventos from "../screens/RSVPEventos";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: "#4f4fff",
        drawerInactiveTintColor: "#666",
        drawerStyle: {
          backgroundColor: "#f6f8ff",
          width: 260,
        },
      }}
    >
      
      <Drawer.Screen
        name="ListaEventos"
        component={ListaEventos}
        options={{
          title: "Ver Eventos",
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-search" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="CrearEvento"
        component={CrearEvento}
        options={{
          title: "Crear Evento",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="RSVPEventos"
        component={RSVPEventos}
        options={{
          title: "RSVP / Participar",
          drawerIcon: ({ color, size }) => (
            <FontAwesome5 name="hands-helping" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="HistorialEventos"
        component={HistorialEventos}
        options={{
          title: "Historial",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Estadisticas"
        component={EstadisticasScreen}
        options={{
          title: "Estadísticas",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      { }
      <Drawer.Screen
        name="EventoDetalle"
        component={EventoDetalle}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="ComentariosEvento"
        component={ComentariosEvento}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Login"
        component={LoginScreen}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
      <Drawer.Screen
        name="Register"
        component={RegisterScreen}
        options={{ drawerItemStyle: { display: 'none' } }}
      />
    </Drawer.Navigator>
  );
}