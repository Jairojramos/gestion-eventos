import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

// Si tienes un hook para el tema, úsalo; si no, puedes eliminar esta línea
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  // Soporte para tema oscuro/claro
  const colorScheme = useColorScheme?.() || 'light';

  // Carga de fuentes personalizada (opcional)
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Agrega aquí otras fuentes si las tienes
  });

  if (!loaded) {
    // Solo muestra la app cuando las fuentes estén listas
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* Stack principal de navegación */}
      <Stack>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Puedes agregar otras pantallas globales aquí */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}