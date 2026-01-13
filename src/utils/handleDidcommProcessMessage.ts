import { Alert, Platform, StatusBar, Vibration } from "react-native";
import i18n from "../../locale";

/**
 * Maneja el resultado de processMessage para flujos de didcomm (QR o deep link)
 * - Feedback de error específico
 * - Navegación a MainStack
 * - Vibración y status bar
 *
 * @param {Function} processMessage - función que procesa el mensaje (de useApplicationStore)
 * @param {any} data - mensaje didcomm (string o buffer)
 * @param {object} navigation - objeto navigation de React Navigation
 * @param {Function} [setIsLoading] - opcional, para mostrar loading
 */
export async function handleDidcommProcessMessage({ processMessage, data, navigation, setIsLoading }) {
  try {
    if (setIsLoading) setIsLoading(true);
    await processMessage(data);
    // Éxito: vibrar y navegar
    Vibration.vibrate(200);
    Platform.OS === "android" && StatusBar.setHidden(false);
    navigation.navigate("MainStack");
  } catch (error) {
    console.error("❌ DIDComm Error:", error);
    let errorMessage = i18n.t("scanScreen.error");
    if (error?.message?.includes("Cannot find private key")) {
      errorMessage =
        "No se encontró la clave privada. Por favor, crea tu DID nuevamente.";
    } else if (error?.message?.includes("KMS")) {
      errorMessage =
        "Error en el almacenamiento de claves. Intenta reiniciar la aplicación.";
    }
    Alert.alert("Error", errorMessage);
  } finally {
    if (setIsLoading) setIsLoading(false);
  }
}
