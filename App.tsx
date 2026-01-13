import "./src/polyfills/crypto-polyfill";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, ActivityIndicator, Image, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ThemeProvider } from "styled-components/native";
import { AppProvider } from "./src/contexts/AppContext";
import { theme as themeStyles } from "./src/theme";
import { useState, useEffect, useRef } from "react";
import { Linking } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import { ErrorBoundary } from "react-error-boundary";

import { useColorScheme } from "react-native";
import RootStack from "./src/stacks/RootStack";

// Error Fallback Component
function ErrorFallback({ error, resetErrorBoundary }) {
  console.error("❌ Error capturado:", error);
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Algo salió mal</Text>
      <Text style={styles.errorText}>{error.message}</Text>
      <Text style={styles.errorStack}>{error.stack}</Text>
    </View>
  );
}

export default function App() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState(
    colorScheme === "light" ? themeStyles.light : themeStyles.dark
  );
  // Estado global para el valor _oob recibido por deep link
  const [pendingOob, setPendingOob] = useState<string | null>(null);
  const navigationRef = useRef();
  console.log("[App] Render, pendingOob:", pendingOob);

  // Deep linking: didcomm://?_oob= handler
  useEffect(() => {
    const handleUrl = (event) => {
      try {
        const url = event.url;
        console.log("[App] handleUrl called with:", url);
        if (url.startsWith("didcomm://")) {
          const match = url.match(/\?_oob=([^&]+)/);
          if (match && match[1]) {
            const oobValue = decodeURIComponent(match[1]);
            console.log("[App] didcomm _oob detected:", oobValue);
            // Navegar a la pantalla especial
            if (navigationRef.current) {
              navigationRef.current.navigate("DidcommHandlerScreen", {
                didcommData: oobValue,
              });
            } else {
              setPendingOob(oobValue); // fallback por si navigation aún no está
            }
          } else {
            console.log("[App] didcomm URL sin _oob param:", url);
          }
        }
      } catch (e) {
        console.error("Error procesando deep link didcomm://", e);
      }
    };
    const subscription = Linking.addEventListener("url", handleUrl);
    Linking.getInitialURL().then((url) => {
      console.log("[App] getInitialURL:", url);
      if (url && url.startsWith("didcomm://")) {
        handleUrl({ url });
      }
    });
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Mantener el splash visible hasta que la app esté lista
        await SplashScreen.preventAutoHideAsync();
        // Aquí podrías cargar datos iniciales si lo necesitas
      } catch (e) {
        console.error("❌ Error in prepare:", e);
        setError(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error al iniciar</Text>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
    );
  }

  if (!appIsReady) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require("./src/assets/splash.png")}
          style={styles.splashImage}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color="#023c69"
          style={{ marginTop: 32 }}
        />
      </View>
    );
  }

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("❌ Error Boundary caught:", error);
        console.error("❌ Error Info:", errorInfo);
      }}
    >
      <SafeAreaProvider>
        <ThemeProvider theme={theme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <NavigationContainer
              ref={navigationRef}
              fallback={
                <View style={styles.splashContainer}>
                  <Text>Loading Navigation...</Text>
                </View>
              }
            >
              <AppProvider>
                <View style={styles.container}>
                  <RootStack
                    pendingOob={pendingOob}
                    setPendingOob={setPendingOob}
                  />
                  <StatusBar style="auto" />
                </View>
              </AppProvider>
            </NavigationContainer>
          </GestureHandlerRootView>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f6f9",
  },
  splashContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f6f9",
  },
  splashImage: {
    width: 200,
    height: 200,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#d32f2f",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  errorStack: {
    fontSize: 12,
    color: "#999",
    marginTop: 20,
    fontFamily: "monospace",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
});
