import { useRouter, useSearchParams } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function DetalleEvento() {
  const router = useRouter();
  const { id } = useSearchParams();

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Detalle del Evento {id}</Text>
      <Button title="Volver a la lista" onPress={() => router.push('/')} />
    </View>
  );
}
