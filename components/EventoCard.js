import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EventoCard({ evento, onPress, variant = "default" }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={[
        styles.card,
        variant === "past" && styles.past,
        variant === "rsvp" && styles.rsvp
      ]}>
        <Text style={styles.title}>{evento.descripcion}</Text>
        <Text style={styles.date}>
          <Ionicons name="calendar-outline" size={15} /> {evento.fecha} {evento.hora}
        </Text>
        <Text style={styles.location}>
          <Ionicons name="location-outline" size={15} /> {evento.ubicacion}
        </Text>
        {onPress && (
          <Text style={styles.link}>Ver detalles</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    marginVertical: 8,
    padding: 18,
    shadowColor: "#4f4fff",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#21215c" },
  date: { color: "#4f4fff", marginTop: 7 },
  location: { color: "#6c6cc5", marginTop: 3, marginBottom: 7 },
  link: { color: "#4f4fff", marginTop: 10, fontWeight: "bold" },
  past: { opacity: 0.75, backgroundColor: "#f3f3fa" },
  rsvp: { borderWidth: 1, borderColor: "#4f4fff" },
});