import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import EventoCard from "../components/EventoCard";
import StatCard from "../components/StatCard";
import { useAuth } from "../utils/authContext";

const API_BASE = "https://tarea.transforma.edu.sv";

// Función utilitaria para obtener solo la fecha (sin hora)
function soloFecha(dateString) {
  const d = new Date(dateString);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

// Obtener eventos desde la API
const fetchEventos = async (cookie) => {
  const res = await fetch(`${API_BASE}/Eventos/eventos`, {
    headers: cookie ? { Cookie: cookie } : {},
    credentials: "include",
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text || "Error al obtener eventos");
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
};

// Simulación de confirmación de asistencia
const confirmarAsistencia = async (eventoId, userId, cookie) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 600));
};

// NUEVO: Eliminar evento desde la API
const eliminarEvento = async (eventoId, cookie) => {
  const res = await fetch(`${API_BASE}/Eventos/eventos/${eventoId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    credentials: "include",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "No se pudo eliminar el evento");
  }
  return true;
};

export default function ListaEventos({ navigation }) {
  const { user, logout } = useAuth();

  // Estados para eventos y UI
  const [eventos, setEventos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [asistencias, setAsistencias] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  // NUEVO: Estado para modal de eliminar evento
  const [eventoAEliminar, setEventoAEliminar] = useState(null);

  // Cargar eventos al inicio y al enfocar la pantalla
  const cargarEventos = useCallback(async () => {
    try {
      setRefrescando(true);
      const data = await fetchEventos(user?.cookie);
      setEventos(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudieron cargar los eventos");
      setEventos([]);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, [user]);

  useEffect(() => {
    cargarEventos();
    const unsubscribe = navigation.addListener("focus", cargarEventos);
    return unsubscribe;
  }, [navigation, cargarEventos]);

  // Filtrar eventos próximos y pasados
  const hoy = new Date();
  const hoySoloFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const proximos = (eventos || [])
    .filter((ev) => {
      try {
        return soloFecha(ev.fecha) >= hoySoloFecha;
      } catch {
        return false;
      }
    })
    .sort((a, b) => soloFecha(a.fecha) - soloFecha(b.fecha));
  const pasados = (eventos || [])
    .filter((ev) => {
      try {
        return soloFecha(ev.fecha) < hoySoloFecha;
      } catch {
        return false;
      }
    })
    .sort((a, b) => soloFecha(b.fecha) - soloFecha(a.fecha));

  // Handler para confirmar asistencia
  const handleConfirmarAsistencia = async (eventoId) => {
    if (!user?.id) {
      Alert.alert("Debes tener sesión para confirmar asistencia.");
      return;
    }
    try {
      setAsistencias((prev) => ({ ...prev, [eventoId]: "loading" }));
      await confirmarAsistencia(eventoId, user.id, user.cookie);
      setAsistencias((prev) => ({ ...prev, [eventoId]: true }));
      setShowModal(true);
    } catch (err) {
      setAsistencias((prev) => ({ ...prev, [eventoId]: false }));
      Alert.alert("Error", "No se pudo confirmar tu asistencia, intenta de nuevo.");
    }
  };

  // Handler para cerrar sesión
  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    navigation.replace("Login");
  };

  // NUEVO: Handler para eliminar evento
  const handleEliminarEvento = async () => {
    if (!eventoAEliminar) return;
    try {
      await eliminarEvento(eventoAEliminar.id, user?.cookie);
      Alert.alert("Evento eliminado", "El evento se eliminó correctamente.");
      setEventoAEliminar(null);
      cargarEventos();
    } catch (err) {
      Alert.alert("Error", err.message || "No se pudo eliminar el evento.");
    }
  };

  // Mostrar enlace externo
  const openURL = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "No se pudo abrir el enlace.")
    );
  };

  // Solo el organizador o admin puede editar/eliminar
  const puedeEditarOEliminar = (ev) =>
    ev.organizadorId === user?.id || user?.rol === "admin";

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ color: "#7a7aac", marginTop: 12 }}>Cargando eventos...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.bg}
        refreshControl={
          <RefreshControl refreshing={refrescando} onRefresh={cargarEventos} />
        }
      >
        {/* Header y bienvenida */}
        <View style={styles.headerRow}>
          <Text style={styles.hello}>
            ¡Hola, {user?.name || user?.nombres || "invitado"}!
          </Text>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowLogoutModal(true)}
          >
            <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>¿Qué quieres hacer hoy?</Text>
        <View style={styles.cardsRow}>
          <StatCard icon="calendar-outline" label="Próximos eventos" value={proximos.length} />
          <StatCard icon="time-outline" label="Eventos pasados" value={pasados.length} color="#21d183" />
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => navigation.navigate("CrearEvento")}
        >
          <Ionicons name="add-circle-outline" size={21} color="#fff" style={{ marginRight: 7 }} />
          <Text style={styles.createBtnText}>Crear Evento</Text>
        </TouchableOpacity>
        {/* Listado de próximos eventos */}
        <Text style={styles.sectionTitle}>Próximos eventos</Text>
        {proximos.length > 0 ? (
          proximos.map((ev) => (
            <View key={ev.id} style={styles.eventoContainer}>
              <EventoCard
                evento={ev}
                onPress={() => navigation.navigate("EventoDetalle", { id: ev.id })}
              />
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.asistenciaBtn,
                    asistencias[ev.id] === true && styles.asistenciaBtnConfirmada,
                    asistencias[ev.id] === "loading" && styles.asistenciaBtnLoading,
                  ]}
                  disabled={asistencias[ev.id] === true || asistencias[ev.id] === "loading"}
                  onPress={() => handleConfirmarAsistencia(ev.id)}
                >
                  {asistencias[ev.id] === true ? (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.asistenciaBtnText}>Asistencia confirmada</Text>
                    </>
                  ) : asistencias[ev.id] === "loading" ? (
                    <>
                      <ActivityIndicator size={16} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.asistenciaBtnText}>Confirmando...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="notifications-outline" size={18} color="#fff" />
                      <Text style={styles.asistenciaBtnText}>Confirmar asistencia</Text>
                    </>
                  )}
                </TouchableOpacity>
                {/* Botón editar (navega a una pantalla de edición) */}
                {puedeEditarOEliminar(ev) && (
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      navigation.navigate("EditarEvento", { evento: ev })
                    }
                  >
                    <Ionicons name="pencil" size={19} color="#fff" />
                  </TouchableOpacity>
                )}
                {/* Botón eliminar */}
                {puedeEditarOEliminar(ev) && (
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => setEventoAEliminar(ev)}
                  >
                    <Ionicons name="trash" size={19} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noEvent}>No tienes eventos próximos</Text>
        )}
        {/* Listado eventos pasados */}
        <Text style={styles.sectionTitle}>Eventos recientes</Text>
        {pasados.length > 0 ? (
          pasados.map((ev) => (
            <EventoCard
              key={ev.id}
              evento={ev}
              variant="past"
              onPress={() => navigation.navigate("EventoDetalle", { id: ev.id })}
            />
          ))
        ) : (
          <Text style={styles.noEvent}>No tienes eventos pasados</Text>
        )}
        {/* Botones informativos */}
        <View style={styles.infoBtnsContainer}>
          <TouchableOpacity
            style={styles.infoBtn}
            onPress={() => setShowLicenseModal(true)}
          >
            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#6C63FF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.infoBtnText}>
              Información sobre la licencia
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoBtn}
            onPress={() => openURL("https://www.udb.edu.sv/")}
          >
            <Ionicons
              name="school-outline"
              size={22}
              color="#21d183"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.infoBtnText}>Sitio oficial UDB</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 35 }} />
      </ScrollView>
      {/* Modal de asistencia confirmada */}
      <Modal
        animationType="fade"
        visible={showModal}
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Ionicons name="checkmark-circle-outline" size={54} color="#21d183" style={{ marginBottom: 14 }} />
                <Text style={styles.modalTitle}>¡Asistencia confirmada!</Text>
                <Text style={styles.modalMsg}>
                  Te notificaremos si hay cambios importantes o recordatorios para este evento.
                </Text>
                <TouchableOpacity style={styles.modalBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.modalBtnText}>Aceptar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Modal de confirmar cerrar sesión */}
      <Modal
        animationType="fade"
        visible={showLogoutModal}
        transparent
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLogoutModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Ionicons name="log-out-outline" size={48} color="#e53935" style={{ marginBottom: 11 }} />
                <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
                <Text style={styles.modalMsg}>
                  ¿Seguro que deseas cerrar sesión y salir de tu cuenta?
                </Text>
                <View style={{ flexDirection: "row", gap: 12, marginTop: 2 }}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "#e0e0e0" }]}
                    onPress={() => setShowLogoutModal(false)}
                  >
                    <Text style={{ color: "#6C63FF", fontWeight: "bold", fontSize: 16 }}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalBtn}
                    onPress={handleLogout}
                  >
                    <Text style={styles.modalBtnText}>Sí, cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Modal de confirmar eliminar evento */}
      <Modal
        animationType="fade"
        transparent
        visible={!!eventoAEliminar}
        onRequestClose={() => setEventoAEliminar(null)}
      >
        <TouchableWithoutFeedback onPress={() => setEventoAEliminar(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Ionicons name="trash-outline" size={48} color="#e53935" style={{ marginBottom: 10 }} />
                <Text style={styles.modalTitle}>¿Eliminar evento?</Text>
                <Text style={styles.modalMsg}>
                  ¿Seguro que deseas eliminar el evento "{eventoAEliminar?.titulo}"? Esta acción no se puede deshacer.
                </Text>
                <View style={{ flexDirection: "row", gap: 12, marginTop: 2 }}>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "#e0e0e0" }]}
                    onPress={() => setEventoAEliminar(null)}
                  >
                    <Text style={{ color: "#e53935", fontWeight: "bold", fontSize: 16 }}>No</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, { backgroundColor: "#e53935" }]}
                    onPress={handleEliminarEvento}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Sí, eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Modal de licencia */}
      <Modal
        visible={showLicenseModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowLicenseModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowLicenseModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.modalContent,
                  {
                    maxWidth: 370,
                    maxHeight: Dimensions.get("window").height * 0.85,
                  },
                ]}
              >
                <Ionicons name="book-outline" size={38} color="#6C63FF" style={{ marginBottom: 10 }} />
                <Text style={[styles.modalTitle, { color: "#6C63FF", fontSize: 20 }]}>
                  Licencia Creative Commons
                </Text>
                <ScrollView
                  style={{
                    flexGrow: 0,
                    maxHeight: Dimensions.get("window").height * 0.45,
                    marginVertical: 10,
                  }}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={[styles.modalMsg, { color: "#21215c", fontSize: 15.3 }]}>
                    Este software está licenciado bajo la{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional (CC BY-NC-SA 4.0).
                    </Text>
                    {"\n\n"}
                    <Text style={{ fontWeight: "bold" }}>En resumen, usted es libre de:</Text>
                    {"\n"}- Compartir: copiar y redistribuir el material en cualquier medio o formato.
                    {"\n"}- Adaptar: remezclar, transformar y crear a partir del material.
                    {"\n\n"}<Text style={{ fontWeight: "bold" }}>Bajo las siguientes condiciones:</Text>
                    {"\n"}- Atribución: Debe dar crédito de manera adecuada.
                    {"\n"}- NoComercial: No puede usar el material con fines comerciales.
                    {"\n"}- CompartirIgual: Si remezcla, debe distribuir bajo la misma licencia.
                    {"\n\n"}
                    Para más detalles consulte el texto oficial de la licencia.
                  </Text>
                </ScrollView>
                <TouchableOpacity
                  style={[styles.modalBtn, { marginTop: 9, backgroundColor: "#6C63FF" }]}
                  onPress={() => Linking.openURL("https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es")}
                >
                  <Text style={styles.modalBtnText}>Ver licencia completa</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#e0e0e0", marginTop: 7 }]}
                  onPress={() => setShowLicenseModal(false)}
                >
                  <Text style={{ color: "#6C63FF", fontWeight: "bold", fontSize: 16 }}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

// Estilos para la pantalla de eventos
const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: "#f6f8ff", paddingHorizontal: 18 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 28,
    marginBottom: 0,
  },
  hello: { fontSize: 26, fontWeight: "bold", color: "#21215c" },
  logoutBtn: {
    backgroundColor: "#d32f2f",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
    marginLeft: 10,
  },
  logoutBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.5,
  },
  subtitle: { fontSize: 15, color: "#7a7aac", marginBottom: 18, marginTop: 2 },
  cardsRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 23,
    marginTop: 20,
    alignSelf: "flex-start",
    marginBottom: 15,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  createBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    marginLeft: 2,
  },
  sectionTitle: { marginTop: 28, fontWeight: "700", fontSize: 18, color: "#21215c" },
  noEvent: { color: "#7a7aac", marginVertical: 8, fontSize: 15 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f6f8ff" },
  eventoContainer: {
    marginBottom: 14,
    position: "relative",
  },
  asistenciaBtn: {
    marginTop: 8,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 18,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 1,
    gap: 7,
  },
  asistenciaBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 5,
  },
  asistenciaBtnConfirmada: {
    backgroundColor: "#21d183",
  },
  asistenciaBtnLoading: {
    backgroundColor: "#aaa",
  },
  editBtn: {
    marginLeft: 6,
    backgroundColor: "#ffb300",
    borderRadius: 14,
    padding: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    marginLeft: 6,
    backgroundColor: "#e53935",
    borderRadius: 14,
    padding: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  infoBtnsContainer: {
    marginTop: 30,
    marginBottom: 10,
    flexDirection: "column",
    gap: 12,
    alignItems: "flex-start",
  },
  infoBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8fd",
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 20,
    marginBottom: 7,
    elevation: 0.5,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
  },
  infoBtnText: {
    color: "#222a",
    fontWeight: "500",
    fontSize: 15.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(44, 44, 70, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 30,
    alignItems: "center",
    shadowColor: "#21d183",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
    width: 320,
    maxWidth: 370,
  },
  modalTitle: {
    fontSize: 22,
    color: "#21d183",
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalMsg: {
    color: "#3c3c4e",
    fontSize: 16,
    marginBottom: 18,
    textAlign: "center",
  },
  modalBtn: {
    backgroundColor: "#6C63FF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 35,
    alignItems: "center",
    marginTop: 3,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});