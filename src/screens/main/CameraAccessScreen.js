import React, { useState } from "react";
import { View, Text, Modal, Alert, Linking, Platform } from "react-native";
import { openSettings } from "react-native-permissions"; // For opening settings
import { useNavigation } from "@react-navigation/native"; // Navigation to home
import Button from "../../components/Button";
import i18n from "../../locale";
import { borderRadius, padding } from "polished";

const CameraAccessScreen = ({ requestPermission }) => {
  const [showModal, setShowModal] = useState(true);
  const navigation = useNavigation();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result.granted) {
      Alert.alert(
        i18n.t("cameraAccessRequest.successTitle") || "Éxito",
        i18n.t("cameraAccessRequest.successMessage") ||
          "Permiso de cámara otorgado"
      );
      setShowModal(false); // Close modal on success
    } else {
      Alert.alert(
        i18n.t("cameraAccessRequest.deniedTitle") || "Permiso Denegado",
        i18n.t("cameraAccessRequest.deniedMessage") ||
          "Se requiere el permiso de cámara"
      );
    }
  };

  const handleOpenSettings = async () => {
    openSettings().catch(() =>
      Alert.alert(
        i18n.t("error") || "Error",
        i18n.t("cameraAccessRequest.settingsError") ||
          "No se puede abrir la configuración"
      )
    );
  };

  const handleCancel = () => {
    setShowModal(false); // Close modal
    navigation.goBack(); // Navigate back to home
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 1)",
          }}
        >
          <View
            style={{
              width: 100,
              padding: 20,
              backgroundColor: "white",
              borderRadius: 10,
              width: 300,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 20,
                color: "#404267",
                textAlign: "center",
                fontFamily: "Manrope-Bold",
                width: 225,
              }}
            >
              {i18n.t("cameraAccessRequest.title")}
            </Text>
            <Text
              style={{
                marginBottom: 20,
                textAlign: "center",
                color: "#6B6C89",
                fontFamily: "Manrope-Regular",
              }}
            >
              {i18n.t("cameraAccessRequest.description")}
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                height: 70,
                width: 250,
              }}
            >
              <Button
                onPress={handleCancel}
                color="#5F5F5F"
                backgroundColor="#D5D5D5"
                style={{
                  width: "40%",
                  borderRadius: 50,
                  paddingTop: 8,
                  paddingRight: 12,
                  paddingBottom: 8,
                  paddingLeft: 12,
                  height: 51,
                }}
              >
                {i18n.t("cameraAccessRequest.continue")}
              </Button>
              <Button
                onPress={handleRequestPermission}
                color="white"
                backgroundColor={"#404267"}
                style={{
                  width: "50%",
                  borderRadius: 50,
                  paddingTop: 8,
                  paddingRight: 12,
                  paddingBottom: 8,
                  paddingLeft: 12,
                  height: 51,
                }}
              >
                {i18n.t("cameraAccessRequest.settings")}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default CameraAccessScreen;
