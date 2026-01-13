import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Platform,
  StatusBar,
  Vibration,
  Button,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useApplicationStore } from "../../contexts/useApplicationStore";
import i18n from "../../locale";
import { StateType } from "../../models";

const DidcommHandlerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const processMessage = useApplicationStore((state) => state.processMessage);
  const state = useApplicationStore((store) => store.state);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStack, setErrorStack] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pendingPin, setPendingPin] = useState(false);
  const [hasTried, setHasTried] = useState(false);
  // Reconstruye el string si solo llega el base64, igual que el QR
  const didcommDataRaw = route.params?.didcommData;
  const didcommData =
    typeof didcommDataRaw === "string" && !didcommDataRaw.startsWith("didcomm://")
      ? `didcomm://?_oob=${didcommDataRaw}`
      : didcommDataRaw;

  useEffect(() => {
    if (hasTried) return;
    // Si no está autenticado, navegar a PIN y volver aquí tras éxito
    if (state !== StateType.AUTHENTICATED && !pendingPin) {
      setPendingPin(true);
      navigation.navigate("PinStack", {
        screen: "ConfirmPin",
        params: {
          onSuccess: () => {
            setPendingPin(false);
          },
        },
      });
      return;
    }
    if (state === StateType.AUTHENTICATED && !success && !loading) {
      setLoading(true);
    }
    if (state === StateType.AUTHENTICATED && !success && loading) {
      setHasTried(true);
      const handle = async () => {
        try {
          // Obtener agent y DID operativo igual que Scan
          const agent = useApplicationStore.getState().agent;
          const operationalDID = agent?.identity?.getOperationalDID?.();
          console.log("🔍 DID operativo al procesar el deep link:", operationalDID);
          if (!operationalDID) {
            setLoading(false);
            setError("No hay DID operativo. Primero debes crear tu identidad digital antes de conectarte.");
            return;
          }
          // Si es URL, abrir navegador
          const validator = require("validator");
          if (validator.isURL(didcommData, { protocols: ["http", "https"] })) {
            setLoading(false);
            setSuccess(false);
            setError(null);
            setErrorStack(null);
            const WebBrowser = require("expo-web-browser");
            WebBrowser.openBrowserAsync(didcommData);
            return;
          }
          // Procesar mensaje
          console.log(" 📦 Processing deep link message...");
          await processMessage(didcommData);
          console.log(" ✅ Deep link message processed successfully");
          Vibration.vibrate(200);
          Platform.OS === "android" && StatusBar.setHidden(false);
          setSuccess(true);
          // Navegar a MainStack igual que Scan
          navigation.reset({ index: 0, routes: [{ name: "MainStack" }] });
        } catch (err: any) {
          console.error("❌ Deep link Error:", err);
          let errorMessage = i18n.t("scanScreen.error");
          if (err?.message?.includes("Cannot find private key")) {
            errorMessage =
              "No se encontró la clave privada. Por favor, crea tu DID nuevamente.";
          } else if (err?.message?.includes("KMS")) {
            errorMessage =
              "Error en el almacenamiento de claves. Intenta reiniciar la aplicación.";
          }
          setError(errorMessage + (err?.message ? `\n${err.message}` : ""));
          setErrorStack(err?.stack || null);
        } finally {
          setLoading(false);
        }
      };
      handle();
    }
  }, [
    didcommData,
    processMessage,
    state,
    pendingPin,
    loading,
    success,
    navigation,
    hasTried,
  ]);

  const handleClose = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainStack" }],
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
      }}
    >
      {loading && <ActivityIndicator size="large" color="#008798" />}
      {!loading && error && (
        <>
          <Text style={{ color: "red", fontSize: 18, marginBottom: 16 }}>
            {error}
          </Text>
          <Button title={i18n.t("accept") || "Cerrar"} onPress={handleClose} />
        </>
      )}
          {errorStack && (
            <Text style={{ color: "#a00", fontSize: 12, marginBottom: 16 }}>{errorStack}</Text>
          )}
          <Button title={i18n.t("accept") || "Cerrar"} onPress={handleClose} />
        <>
          <Text style={{ color: "green", fontSize: 18, marginBottom: 16 }}>
            ¡Mensaje DIDComm procesado correctamente!
          </Text>
          <Button title={i18n.t("accept") || "Cerrar"} onPress={handleClose} />
        </>
      )}
    </View>
  );
};

export default DidcommHandlerScreen;
