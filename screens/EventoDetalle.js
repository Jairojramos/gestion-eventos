import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useAuth } from "../utils/authContext";

// --- API base URL ---
const API_BASE = "https://tarea.transforma.edu.sv";

// --- Obtener evento por ID desde la API ---
const fetchEventoPorId = async (id, cookie) => {
  try {
    const res = await fetch(`${API_BASE}/Eventos/eventos/${id}`, {
      headers: cookie ? { Cookie: cookie } : {},
      credentials: "include",
    });
    const text = await res.text();
    if (!res.ok) throw new Error(text || "Error al obtener el evento");
    return JSON.parse(text);
  } catch (e) {
    return {
      descripcion: "Evento",
      fecha: "2024-05-01",
      hora: "18:00",
      ubicacion: "Virtual",
      id,
    };
  }
};

// --- Actualizar evento por ID en la API ---
const actualizarEvento = async (evento, cookie) => {
  const res = await fetch(`${API_BASE}/Eventos/eventos/${evento.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    credentials: "include",
    body: JSON.stringify(evento),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "No se pudo actualizar el evento");
  }
  return true;
};

// --- Eliminar evento por ID en la API ---
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

// --- Simulación de usuarios asistentes ---
const usuariosSimulados = [
  { id: 1, nombre: "Josué Rodríguez", usuario: "josue", correo: "josue@ejemplo.com" },
  { id: 2, nombre: "Andrea López", usuario: "andrea", correo: "andrea@ejemplo.com" },
  { id: 3, nombre: "Carlos Martínez", usuario: "carlos", correo: "carlos@ejemplo.com" },
  { id: 4, nombre: "Karla Gómez", usuario: "karla", correo: "karla@ejemplo.com" },
  { id: 5, nombre: "Miguel Rivera", usuario: "miguel", correo: "miguel@ejemplo.com" },
];

// --- Simulación global de comentarios ---
global.simComentarios = global.simComentarios || {};
const fetchComentarios = async (eventoId) => {
  return global.simComentarios[eventoId] || [];
};
const enviarComentario = async ({ eventoId, comentario, calificacion }) => {
  global.simComentarios[eventoId] = global.simComentarios[eventoId] || [];
  global.simComentarios[eventoId].unshift({
    autor: "Tú",
    comentario,
    calificacion: calificacion || 5,
    fecha: new Date().toLocaleString(),
  });
  return true;
};

export default function EventoDetalle({ route, navigation }) {
  const { id } = route.params;
  const { user } = useAuth();

  // --- Estados para datos y UI ---
  const [evento, setEvento] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [comentarios, setComentarios] = useState([]);
  const [comentarioText, setComentarioText] = useState("");
  const [calificacion, setCalificacion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- Estados para modales ---
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackModalSuccess, setFeedbackModalSuccess] = useState(true);
  const [feedbackModalMsg, setFeedbackModalMsg] = useState("");
  const [editando, setEditando] = useState(false);
  const [eventoEdit, setEventoEdit] = useState(null);
  const [editCargando, setEditCargando] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- Cargar evento y comentarios ---
  const cargarTodo = async () => {
    setCargando(true);
    try {
      const ev = await fetchEventoPorId(id, user?.cookie);
      setEvento(ev);
      setEventoEdit(ev);
      const coms = await fetchComentarios(id);
      setComentarios(Array.isArray(coms) ? coms : []);
    } catch (error) {
      Alert.alert("Error", error.message || "No se pudo cargar el evento");
      navigation.goBack();
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line
  }, [id]);

  // --- Enviar comentario y calificación ---
  const handleEnviarComentario = async () => {
    if (!comentarioText.trim() || calificacion === 0) {
      setFeedbackModalSuccess(false);
      setFeedbackModalMsg("Por favor, completa el comentario y la calificación.");
      setFeedbackModalVisible(true);
      return;
    }
    setEnviando(true);
    try {
      await enviarComentario({
        eventoId: id,
        comentario: comentarioText,
        calificacion,
      });
      setComentarioText("");
      setCalificacion(0);
      setFeedbackModalSuccess(true);
      setFeedbackModalMsg("¡Comentario y calificación enviados exitosamente! 🎉");
      setFeedbackModalVisible(true);
      await cargarTodo();
    } catch (e) {
      setFeedbackModalSuccess(false);
      setFeedbackModalMsg(e.message || "No se pudo enviar el comentario.");
      setFeedbackModalVisible(true);
    } finally {
      setEnviando(false);
    }
  };

  // --- Guardar edición del evento ---
  const handleGuardarEdicion = async () => {
    setEditCargando(true);
    try {
      await actualizarEvento(eventoEdit, user?.cookie);
      setFeedbackModalSuccess(true);
      setFeedbackModalMsg("¡Evento actualizado exitosamente!");
      setFeedbackModalVisible(true);
      setEditando(false);
      await cargarTodo();
    } catch (e) {
      setFeedbackModalSuccess(false);
      setFeedbackModalMsg(e.message || "No se pudo actualizar el evento.");
      setFeedbackModalVisible(true);
    } finally {
      setEditCargando(false);
    }
  };

  // --- Eliminar el evento ---
  const handleEliminarEvento = async () => {
    setShowDeleteModal(false);
    setCargando(true);
    try {
      await eliminarEvento(evento.id, user?.cookie);
      setFeedbackModalSuccess(true);
      setFeedbackModalMsg("¡Evento eliminado exitosamente!");
      setFeedbackModalVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    } catch (e) {
      setFeedbackModalSuccess(false);
      setFeedbackModalMsg(e.message || "No se pudo eliminar el evento.");
      setFeedbackModalVisible(true);
    } finally {
      setCargando(false);
    }
  };

  // --- Verifica si el usuario puede editar/eliminar (ajusta la lógica si es necesario) ---
  const puedeEditarOEliminar = true;

  // --- Compartir evento por apps nativas ---
  const handleCompartir = () => {
    const mensaje = `¡Mira este evento!\n\n${evento.descripcion}\n📅 ${evento.fecha} 🕒 ${evento.hora}\n📍 ${evento.ubicacion}\n\n¿Te animas?`;
    Share.share({
      message: mensaje,
      title: `Evento: ${evento.descripcion}`,
    });
  };

  // --- Compartir evento por correo ---
  const handleCompartirCorreo = () => {
    const subject = `Evento: ${evento.descripcion}`;
    const body = `¡Mira este evento!\n\n${evento.descripcion}\n📅 ${evento.fecha} 🕒 ${evento.hora}\n📍 ${evento.ubicacion}\n\n¿Te animas?`;
    Linking.openURL(
      `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    );
  };

  // --- Muestra indicador de carga inicial ---
  if (cargando) {
    return (
      <View style={detalleStyles.center}>
        <ActivityIndicator size="large" color="#6C63FF" />
        <Text style={{ color: "#7a7aac", marginTop: 12 }}>Cargando evento...</Text>
      </View>
    );
  }

  // --- Valida si el evento existe ---
  if (!evento) {
    return (
      <View style={detalleStyles.center}>
        <Ionicons name="alert-circle-outline" size={54} color="#d32f2f" />
        <Text style={{ color: "#d32f2f", fontSize: 18, marginTop: 10 }}>
          Evento no encontrado
        </Text>
      </View>
    );
  }

  // --- Determina si el evento es pasado ---
  let eventoEsPasado = true;
  if (evento.fecha) {
    const fechaEv = new Date(evento.fecha);
    if (!isNaN(fechaEv)) {
      eventoEsPasado = fechaEv < new Date();
    }
  }

  // --- Render principal con ScrollView y modales ---
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={detalleStyles.bg}>
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ paddingBottom: 60 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={cargarTodo} />
          }
        >
          {/* Header y detalles del evento */}
          <View style={detalleStyles.header}>
            <Ionicons
              name="calendar"
              size={48}
              color="#6C63FF"
              style={detalleStyles.icon}
            />
            <Text style={detalleStyles.title}>{evento.descripcion}</Text>
          </View>
          <View style={detalleStyles.infoCard}>
            <View style={detalleStyles.infoRow}>
              <Ionicons name="calendar-outline" size={22} color="#21215c" />
              <Text style={detalleStyles.infoText}>{evento.fecha}</Text>
            </View>
            <View style={detalleStyles.infoRow}>
              <Ionicons name="time-outline" size={22} color="#21215c" />
              <Text style={detalleStyles.infoText}>{evento.hora}</Text>
            </View>
            <View style={detalleStyles.infoRow}>
              <Ionicons name="location-outline" size={22} color="#21215c" />
              <Text style={detalleStyles.infoText}>{evento.ubicacion}</Text>
            </View>
            {/* Botones de editar/eliminar si el usuario tiene permiso */}
            {puedeEditarOEliminar && (
              <View style={detalleStyles.editDeleteRow}>
                <TouchableOpacity style={detalleStyles.editBtn} onPress={() => setEditando(true)}>
                  <Ionicons name="pencil" size={19} color="#fff" />
                  <Text style={detalleStyles.editBtnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={detalleStyles.deleteBtn} onPress={() => setShowDeleteModal(true)}>
                  <Ionicons name="trash" size={19} color="#fff" />
                  <Text style={detalleStyles.deleteBtnText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Botones para compartir */}
          <View style={detalleStyles.socialRow}>
            <TouchableOpacity
              style={detalleStyles.socialBtn}
              onPress={handleCompartir}
            >
              <Ionicons name="share-social-outline" size={19} color="#6C63FF" />
              <Text style={detalleStyles.socialBtnText}>Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={detalleStyles.socialBtn}
              onPress={handleCompartirCorreo}
            >
              <Ionicons name="mail-outline" size={19} color="#6C63FF" />
              <Text style={detalleStyles.socialBtnText}>Correo</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de asistentes simulados (solo si evento ya pasó) */}
          {eventoEsPasado && (
            <View style={detalleStyles.asistentesBlock}>
              <Text style={detalleStyles.sectionTitle}>Usuarios que asistieron</Text>
              {usuariosSimulados.map(u => (
                <View key={u.id} style={detalleStyles.usuarioCard}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 2 }}>
                    <Ionicons name="person-circle-outline" size={23} color="#6C63FF" style={{ marginRight: 6 }} />
                    <Text style={detalleStyles.usuarioNombre}>{u.nombre}</Text>
                  </View>
                  <Text style={detalleStyles.usuarioInfo}>Usuario: {u.usuario}</Text>
                  <Text style={detalleStyles.usuarioInfo}>Correo: {u.correo}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Comentarios y calificaciones */}
          <View style={detalleStyles.section}>
            <Text style={detalleStyles.sectionTitle}>
              Comentarios y calificaciones
            </Text>
            <View style={detalleStyles.comentarioBox}>
              <Text style={detalleStyles.comentarioLabel}>Tu comentario:</Text>
              <TextInput
                style={detalleStyles.input}
                placeholder="Deja tu opinión sobre el evento..."
                value={comentarioText}
                onChangeText={setComentarioText}
                multiline
                editable={!enviando}
              />
              <View style={detalleStyles.ratingRow}>
                <Text style={detalleStyles.comentarioLabel}>
                  Tu calificación:
                </Text>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setCalificacion(star)}
                  >
                    <Ionicons
                      name={star <= calificacion ? "star" : "star-outline"}
                      size={26}
                      color="#f8b400"
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={detalleStyles.enviarBtn}
                onPress={handleEnviarComentario}
                disabled={enviando}
              >
                {enviando ? (
                  <ActivityIndicator size={17} color="#fff" />
                ) : (
                  <Ionicons
                    name="send"
                    size={17}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                )}
                <Text style={detalleStyles.enviarBtnText}>Comentar</Text>
              </TouchableOpacity>
            </View>
            {comentarios.length === 0 ? (
              <Text style={{ color: "#7a7aac", marginTop: 10 }}>
                No hay comentarios aún.
              </Text>
            ) : (
              <View style={{ marginTop: 13 }}>
                {comentarios.map((item, idx) => (
                  <View key={idx} style={detalleStyles.comentarioItem}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Ionicons
                        name="person-circle-outline"
                        size={23}
                        color="#6C63FF"
                        style={{ marginRight: 5 }}
                      />
                      <Text style={detalleStyles.comentarioAutor}>
                        {item.autor || "Usuario"}
                      </Text>
                    </View>
                    <Text style={detalleStyles.comentarioTexto}>
                      {item.comentario}
                    </Text>
                    <View style={detalleStyles.ratingShowRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={
                            star <= (item.calificacion || 5)
                              ? "star"
                              : "star-outline"
                          }
                          size={19}
                          color="#f8b400"
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Botón para regresar */}
          <TouchableOpacity
            style={detalleStyles.btn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color="#fff"
              style={{ marginRight: 6 }}
            />
            <Text style={detalleStyles.btnText}>Regresar</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* MODALES de Feedback, Edición y Eliminación */}
        {/* Modal de feedback (comentario, edición o eliminación) */}
        <Modal
          visible={feedbackModalVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setFeedbackModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setFeedbackModalVisible(false)}>
            <View style={detalleStyles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={detalleStyles.modalCard}>
                  {feedbackModalSuccess ? (
                    <Ionicons name="chatbubbles" size={54} color="#21d183" style={{ marginBottom: 13 }} />
                  ) : (
                    <Ionicons name="alert-circle" size={54} color="#e53935" style={{ marginBottom: 13 }} />
                  )}
                  <Text style={[detalleStyles.modalMsg, feedbackModalSuccess ? { color: "#21d183" } : { color: "#e53935" }]}>
                    {feedbackModalMsg}
                  </Text>
                  <TouchableOpacity
                    style={[detalleStyles.modalBtn, feedbackModalSuccess ? { backgroundColor: "#21d183" } : { backgroundColor: "#e53935" }]}
                    onPress={() => setFeedbackModalVisible(false)}
                  >
                    <Text style={detalleStyles.modalBtnText}>
                      {feedbackModalSuccess ? "¡Perfecto!" : "Entendido"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Modal para editar evento */}
        <Modal
          visible={editando}
          animationType="slide"
          transparent
          onRequestClose={() => setEditando(false)}
        >
          <View style={detalleStyles.modalOverlay}>
            <View style={detalleStyles.editModalCard}>
              <Text style={[detalleStyles.sectionTitle, { marginBottom: 18 }]}>Editar evento</Text>
              <TextInput
                style={detalleStyles.input}
                placeholder="Descripción"
                value={eventoEdit?.descripcion}
                onChangeText={txt => setEventoEdit(e => ({ ...e, descripcion: txt }))}
              />
              <TextInput
                style={detalleStyles.input}
                placeholder="Fecha (YYYY-MM-DD)"
                value={eventoEdit?.fecha}
                onChangeText={txt => setEventoEdit(e => ({ ...e, fecha: txt }))}
              />
              <TextInput
                style={detalleStyles.input}
                placeholder="Hora (hh:mm)"
                value={eventoEdit?.hora}
                onChangeText={txt => setEventoEdit(e => ({ ...e, hora: txt }))}
              />
              <TextInput
                style={detalleStyles.input}
                placeholder="Ubicación"
                value={eventoEdit?.ubicacion}
                onChangeText={txt => setEventoEdit(e => ({ ...e, ubicacion: txt }))}
              />
              <View style={{ flexDirection: "row", gap: 10, marginTop: 11 }}>
                <TouchableOpacity
                  style={[detalleStyles.modalBtn, { backgroundColor: "#e0e0e0" }]}
                  onPress={() => setEditando(false)}
                  disabled={editCargando}
                >
                  <Text style={{ color: "#6C63FF", fontWeight: "bold", fontSize: 16 }}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[detalleStyles.modalBtn, { backgroundColor: "#6C63FF" }]}
                  onPress={handleGuardarEdicion}
                  disabled={editCargando}
                >
                  {editCargando ? (
                    <ActivityIndicator size={15} color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>Guardar</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal para confirmar eliminación */}
        <Modal
          visible={showDeleteModal}
          animationType="fade"
          transparent
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowDeleteModal(false)}>
            <View style={detalleStyles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={detalleStyles.modalCard}>
                  <Ionicons name="trash-outline" size={48} color="#e53935" style={{ marginBottom: 10 }} />
                  <Text style={detalleStyles.modalTitle}>¿Eliminar evento?</Text>
                  <Text style={detalleStyles.modalMsg}>
                    ¿Seguro que deseas eliminar el evento "{evento?.descripcion}"? Esta acción no se puede deshacer.
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 2 }}>
                    <TouchableOpacity
                      style={[detalleStyles.modalBtn, { backgroundColor: "#e0e0e0" }]}
                      onPress={() => setShowDeleteModal(false)}
                    >
                      <Text style={{ color: "#e53935", fontWeight: "bold", fontSize: 16 }}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[detalleStyles.modalBtn, { backgroundColor: "#e53935" }]}
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
      </View>
    </KeyboardAvoidingView>
  );
}

// --- Estilos personalizados para la pantalla de detalle de evento ---
const detalleStyles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "#f6f8ff",
    paddingHorizontal: 18,
    paddingTop: 28,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
    position: 'relative',
    width: "100%",
  },
  icon: {
    backgroundColor: "#e7e6ff",
    borderRadius: 32,
    padding: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    color: "#21215c",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
  },
  editDeleteRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 12,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 16,
    marginRight: 5,
  },
  editBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 7,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e53935",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  deleteBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 7,
  },
  infoCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
  },
  infoText: {
    fontSize: 17,
    color: "#21215c",
    marginLeft: 12,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 18,
    marginBottom: 16,
    marginRight: 2,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaeaff",
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginLeft: 4,
  },
  socialBtnText: {
    color: "#6C63FF",
    fontWeight: "bold",
    fontSize: 13.5,
    marginLeft: 5,
  },
  asistentesBlock: { marginTop: 24, marginBottom: 10 },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 17,
    marginTop: 10,
    marginBottom: 26,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 18,
    color: "#21215c",
    marginBottom: 9,
  },
  usuarioCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    padding: 13,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 1,
  },
  usuarioNombre: { fontWeight: "bold", fontSize: 16, color: "#21215c" },
  usuarioInfo: { color: "#7a7aac", fontSize: 14, marginLeft: 29 },
  comentarioBox: {
    marginBottom: 19,
  },
  comentarioLabel: {
    fontWeight: "bold",
    fontSize: 15.5,
    color: "#21215c",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f3f3fd",
    borderRadius: 12,
    padding: 9,
    minHeight: 42,
    borderWidth: 1,
    borderColor: "#e0e0ff",
    fontSize: 15.5,
    marginBottom: 9,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 11,
    marginTop: 2,
  },
  enviarBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6C63FF",
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 22,
    alignSelf: "flex-end",
    marginTop: 3,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 3,
    elevation: 1,
  },
  enviarBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 7,
  },
  comentarioItem: {
    marginBottom: 18,
    backgroundColor: "#f6f8ff",
    borderRadius: 12,
    padding: 10,
    paddingTop: 9,
    borderWidth: 1,
    borderColor: "#ececff",
  },
  comentarioAutor: {
    fontWeight: "bold",
    color: "#21215c",
    fontSize: 15,
    marginBottom: 1,
  },
  comentarioTexto: {
    color: "#25255a",
    fontSize: 15.5,
    marginVertical: 5,
    marginLeft: 2,
  },
  ratingShowRow: {
    flexDirection: "row",
    marginLeft: 2,
    marginTop: 2,
  },
  btn: {
    flexDirection: "row",
    backgroundColor: "#6C63FF",
    borderRadius: 22,
    paddingVertical: 11,
    paddingHorizontal: 30,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 12,
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 4,
    elevation: 2,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f8ff",
  },
  // MODAL estilos
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(44,44,70,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 270,
    maxWidth: "90%",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    color: "#21d183",
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMsg: {
    fontSize: 17,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  modalBtn: {
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 36,
    alignItems: "center",
    marginTop: 2,
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.1,
  },
  editModalCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingVertical: 30,
    paddingHorizontal: 24,
    alignItems: "center",
    minWidth: 270,
    maxWidth: "90%",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 10,
  },
});