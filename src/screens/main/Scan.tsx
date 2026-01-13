import React, { useCallback, useEffect, useState } from "react";
import styled from "styled-components/native";
import * as WebBrowser from "expo-web-browser";
import i18n from "../../locale";
import { Button, TouchableOpacity, Text } from "react-native";
// Components
import { Entypo } from "@expo/vector-icons";
// import { BarCodeScanner } from "expo-barcode-scanner";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { transparentize } from "polished";
import {
  Alert,
  BackHandler,
  Platform,
  StatusBar,
  StyleSheet,
  Vibration,
} from "react-native";
import { useApplicationStore } from "../../contexts/useApplicationStore";
import { ContainerLayout, Layout } from "../../styled-components/Layouts";
import validator from "validator";
import CameraAccessScreen from "./CameraAccessScreen";

const Scan = ({ navigation }) => {
  console.log("😺 RENDER SCAN SCREEN");
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const { processMessage } = useApplicationStore(
  //   (state) => ({
  //     processMessage: state.processMessage,
  //   }),
  //   shallow
  // );
  const processMessage = useApplicationStore((state) => state.processMessage);

  useEffect(() => {
    if (!permission) {
      // Aún cargando permisos
      return;
    }
    if (!permission.granted) {
      // Solicitar permisos si no están otorgados
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = useCallback(async ({ data }) => {
    setScanned(true);
    console.log(" 📸 llegué a scannear:", data);
    try {
      console.info("QR Scanner:", data);
      setIsLoading(true);

      const agent = useApplicationStore.getState().agent;
      const operationalDID = agent.identity.getOperationalDID();

      console.log("🔍 DID operativo al escanear el QR:", operationalDID);
      if (!operationalDID) {
        console.log("❌ No hay DID operativo al escanear el QR 🥺");
        Alert.alert(
          "DID no encontrado",
          "Primero debes crear tu identidad digital antes de conectarte.",
          [
            {
              text: "Crear DID",
              onPress: () => {
                navigation.navigate("DidStack", { screen: "CreateDid" });
              },
            },
            {
              text: "Cancelar",
            },
          ]
        );
        setScanned(false);
        setIsLoading(false);
        return;
      }

      if (validator.isURL(data, { protocols: ["http", "https"] })) {
        Alert.alert(
          i18n.t("scanScreen.urlTitle") + data,
          i18n.t("scanScreen.urlDescription"),
          [
            {
              text: i18n.t("accept"),
              onPress: async () => {
                WebBrowser.openBrowserAsync(data);
              },
            },
            {
              text: i18n.t("cancel"),
            },
          ]
        );
      } else {
        console.log(" 📦 Processing QR message...");
        await processMessage(data);
        console.log(" ✅ QR message processed successfully");
      }
      Vibration.vibrate(200);
      Platform.OS === "android" && StatusBar.setHidden(false);
    } catch (error: any) {
      console.error("❌ QR Scanner Error:", error);
      console.error("❌ Error message:", error.message);

      let errorMessage = i18n.t("scanScreen.error");

      // Mensajes de error más específicos
      if (error.message?.includes("Cannot find private key")) {
        errorMessage =
          "No se encontró la clave privada. Por favor, crea tu DID nuevamente.";
      } else if (error.message?.includes("KMS")) {
        errorMessage =
          "Error en el almacenamiento de claves. Intenta reiniciar la aplicación.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      // navigation.navigate("Credentials");
      navigation.navigate("MainStack");
      setScanned(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        Platform.OS === "android" && StatusBar.setHidden(false);
        return false;
      }
    );
    Platform.OS === "android" && StatusBar.setHidden(true);
    return () => backHandler.remove();
  }, []);

  if (!permission) {
    // Cargando permisos
    return (
      <ContainerLayout>
        <ActivityIndicatorStyled size={"large"} />
      </ContainerLayout>
    );
  }

  if (!permission.granted) {
    // Sin permisos de cámara
    return <CameraAccessScreen requestPermission={requestPermission} />;
  }

  return (
    <ViewStyled>
      <CameraView
        facing={facing}
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <ViewStyled
        style={{
          backgroundColor: transparentize(isLoading ? 0.1 : 1, "black"),
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <HeaderWrapper>
          <BackWrapper
            onPress={() => {
              navigation.goBack();
              Platform.OS === "android" && StatusBar.setHidden(false);
            }}
          >
            <EntypoStyled name="chevron-left" size={20} color={"white"} />
            <BackText>{i18n.t("back")}</BackText>
          </BackWrapper>
          <TitleText>{i18n.t("scanScreen.title")}</TitleText>
          <TitleText></TitleText>
        </HeaderWrapper>
        <ViewStyled>
          {isLoading && <ActivityIndicatorStyled size={"large"} />}
        </ViewStyled>
      </ViewStyled>
    </ViewStyled>
  );

  // /////////////////////////////////
  // return (
  //   <ContainerLayout style={{ backgroundColor: "black" }}>
  //     <Button
  //       title="Simular Invitacion"
  //       onPress={() =>
  //         handleBarCodeScanned({
  //           data: "didcomm://?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiOGJlY2VlNTItNTRmYy00YmNhLTkxZjctMmNiZTI0YzQ0MjgzIiwiZnJvbSI6ImRpZDpxdWFya2lkOkVpRFNHcGRUN3hWVGFCOU1mWkx3a282ZGwyZU9MZU5fYkdOWDJDT2dwREhMSlEiLCJib2R5Ijp7ImdvYWxfY29kZSI6InN0cmVhbWxpbmVkLXZjIiwiYWNjZXB0IjpbImRpZGNvbW0vdjIiXX19",
  //         })
  //       }
  //     />
  //     <TouchableOpacity
  //       // title="Simular Presentacion"
  //       onPress={() =>
  //         handleBarCodeScanned({
  //           data: "didcomm://?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiMzUwODYwMzYtY2QyYi00NDg4LWI3NmEtZmI2MGQ2ZDBjY2UxIiwiZnJvbSI6ImRpZDpxdWFya2lkOkVpQUhFTDZXNG1EM21QZ0tVVnRvSVQzWmc1RDNpMWk5ZFBCZEdLc1I2OFRRakEiLCJib2R5Ijp7ImdvYWxfY29kZSI6InN0cmVhbWxpbmVkLXZwIiwiYWNjZXB0IjpbImRpZGNvbW0vdjIiXX19",
  //         })
  //       }
  //       style={{
  //         padding: 10,
  //         backgroundColor: "#008798",
  //         borderRadius: 5,
  //       }}
  //     >
  //       <Text style={{ color: "white", textAlign: "center" }}>
  //         Simular Presentacion
  //       </Text>
  //     </TouchableOpacity>
  //     <Button
  //       title="Simular Invitacion"
  //       onPress={() =>
  //         handleBarCodeScanned({
  //           data: "didcomm://?_oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiIsImlkIjoiNjlkZTc5MzUtMTRlNS00ZmE4LWJhYjQtNzExMTdiZTU5ZDdhIiwiZnJvbSI6ImRpZDpxdWFya2lkOkVpQUhFTDZXNG1EM21QZ0tVVnRvSVQzWmc1RDNpMWk5ZFBCZEdLc1I2OFRRakEiLCJib2R5Ijp7ImdvYWxfY29kZSI6InN0cmVhbWxpbmVkLXZjIiwiYWNjZXB0IjpbImRpZGNvbW0vdjIiXX19",
  //         })
  //       }
  //     />
  //   </ContainerLayout>
  // );
};

const ViewStyled = styled.View`
  flex: 1;
  justify-content: center;
`;

const ActivityIndicatorStyled = styled.ActivityIndicator``;

const EntypoStyled = styled(Entypo)``;

const HeaderWrapper = styled.View`
  margin-top: 15px;
  flex-direction: row;
  width: 100%;
`;

const BackWrapper = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const BackText = styled.Text`
  font-size: 14px;
  padding-bottom: 2px;
  font-weight: bold;
  color: white;
`;

const TitleText = styled.Text`
  font-size: 16px;
  padding-bottom: 2px;
  flex: 1;
  font-weight: bold;
  color: white;
  text-align: center;
`;

export default Scan;
