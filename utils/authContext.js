import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { createContext, useContext, useEffect, useState } from "react";
import { cerrarSesionAPI, loginUsuario, registrarUsuario } from "./api";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // SOLO expoClientId y redirectUri
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "820367238137-k07tipi8480kq2h66r417uj9vqs02cnv.apps.googleusercontent.com",
    androidClientId: "820367238137-k07tipi8480kq2h66r417uj9vqs02cnv.apps.googleusercontent.com",
    redirectUri: "https://auth.expo.io/@jairojramos/gestion-eventos",
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication, params } = response;
      try {
        const base64Url = params.id_token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map(function (c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join('')
        );
        const profile = JSON.parse(jsonPayload);

        setUser({
          ...profile,
          name: profile.name,
          given_name: profile.given_name,
          family_name: profile.family_name,
          email: profile.email,
          picture: profile.picture,
          accessToken: authentication.accessToken,
          idToken: params.id_token,
          isGoogle: true,
        });
      } catch (error) {
        setUser(null);
      }
    }
  }, [response]);

const login = async (usuario, contra) => {
  const data = await loginUsuario(usuario, contra);
  setUser({
    ...data,
    isGoogle: false,
    cookie: data.cookie, // Guarda la cookie aquí
  });
};

  const register = async (nombres, apellidos, usuario, contra) => {
    const data = await registrarUsuario(nombres, apellidos, usuario, contra);
    setUser({
      ...data,
      isGoogle: false,
    });
  };

  const logout = async () => {
    if (user?.isGoogle) {
      setUser(null);
    } else {
      await cerrarSesionAPI();
      setUser(null);
    }
  };

  const loginWithGoogle = () => {
    promptAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Polyfill para atob (Expo Go lo necesita en Android/iOS)
function atob(input) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';
  if (str.length % 4 === 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
  for (
    let bc = 0, bs = 0, buffer, i = 0;
    (buffer = str.charAt(i++));
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4)
      ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}