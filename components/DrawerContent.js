import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import { Image, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../utils/authContext";

export default function CustomDrawerContent(props) {
  const { user } = useAuth();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.header}>
        <Image
          source={user?.picture ? { uri: user.picture } : require('../../assets/avatar.png')}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || user?.nombres || "Usuario"}</Text>
        <Text style={styles.email}>{user?.email || user?.usuario || ""}</Text>
      </View>
      <DrawerItemList {...props} />
      <View style={styles.footer}>
        <Ionicons name="notifications-outline" size={20} color="#4f4fff" />
        <Text style={styles.footerText}>Notificaciones push activas</Text>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", marginTop: 20, marginBottom: 10 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginBottom: 8, backgroundColor: "#ececec" },
  name: { fontWeight: "600", fontSize: 17, color: "#21215c" },
  email: { fontSize: 13, color: "#7a7aac" },
  footer: { marginTop: 25, flexDirection: "row", alignItems: "center", paddingLeft: 18 },
  footerText: { color: "#4f4fff", fontSize: 14, marginLeft: 6 },
});