import { Button, Text, View } from 'react-native';

export default function EventoDetalleScreen({ route, navigation }) {
  const { id } = route.params;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Detalle del Evento {id}</Text>
      <Button title="Ver comentarios" onPress={() => navigation.navigate('ComentariosEvento', { eventId: id })} />
      <Button title="Volver a la lista" onPress={() => navigation.navigate('ListaEventos')} />
    </View>
  );
}