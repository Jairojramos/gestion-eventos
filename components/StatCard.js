import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function StatCard({ icon, label, value, color = "#4f4fff" }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Ionicons name={icon} size={26} color={color} />
      <View style={{ marginLeft: 10 }}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 5,
    elevation: 2,
    shadowColor: "#4f4fff", shadowOpacity: 0.08, shadowRadius: 5,
  },
  label: { fontSize: 13, color: "#7a7aac" },
  value: { fontSize: 19, fontWeight: "bold", color: "#21215c" },
});