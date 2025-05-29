import { useState } from 'react';
import { Button, FlatList, Text, TextInput, View } from 'react-native';

const comentariosMock = [
  { id: '1', usuario: 'Ana', texto: 'Muy buen evento' },
  { id: '2', usuario: 'Luis', texto: 'Me encantó' },
];

export default function ComentariosEventoScreen({ route }) {
  const { eventId } = route.params;
  const [comentarios, setComentarios] = useState(comentariosMock);
  const [nuevoComentario, setNuevoComentario] = useState('');

  const agregarComentario = () => {
    if (nuevoComentario.trim() === '') return;
    setComentarios([
      ...comentarios,
      { id: String(comentarios.length + 1), usuario: 'Tú', texto: nuevoComentario }
    ]);
    setNuevoComentario('');
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Comentarios del evento {eventId}</Text>
      <FlatList
        data={comentarios}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Text>{item.usuario}: {item.texto}</Text>
        )}
      />
      <TextInput
        placeholder="Escribe un comentario"
        value={nuevoComentario}
        onChangeText={setNuevoComentario}
        style={{ borderWidth: 1, marginVertical: 10, padding: 5 }}
      />
      <Button title="Agregar comentario" onPress={agregarComentario} />
    </View>
  );
}