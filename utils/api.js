export const API_URL = "https://tarea.transforma.edu.sv";

// LOGIN CON USUARIO Y CONTRASEÑA (API)
export async function loginUsuario(usuario, contra) {
  const res = await fetch(`${API_URL}/Login/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usuario, contra }),
  });
  if (!res.ok) throw new Error("Usuario o contraseña incorrectos");
  const data = await res.json();
  // Obtén la cookie de sesión
  const cookie = res.headers.get('set-cookie');
  return { ...data, cookie };
}
// REGISTRO DE USUARIO (API)
export async function registrarUsuario(nombres, apellidos, usuario, contra) {
  const response = await fetch('https://tarea.transforma.edu.sv/Usuarios/usuarios/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombres,
      apellidos,
      usuario,
      contra,
    }),
  });
  const text = await response.text();
  console.log("Respuesta registro:", text); // <-- Aquí verás el error real
  if (!response.ok) throw new Error(text || 'Error registrando usuario');
  return JSON.parse(text);
}

// CERRAR SESIÓN (API)
export async function cerrarSesionAPI() {
  try {
    const res = await fetch(`${API_URL}/Login/logOut`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return res.ok;
  } catch {
    // Si hay error de red, igual seguimos
    return false;
  }
}