import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Vibration, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";
import { shallow } from "zustand/shallow";
import Draft from "../../components/Draft";
import NumberPad from "../../components/NumberPad";
import PinItems from "../../components/PinItems";
import { useApplicationStore } from "../../contexts/useApplicationStore";
import i18n from "../../locale";
import { Layout } from "../../styled-components/Layouts";
import app from "../../../app.json";

const ConfirmPin = ({
  navigation,
  route,
  pendingOob,
  setPendingOob,
  ...others
}) => {
  const theme: any = useTheme();
  const authenticationPin = route.params?.authenticationPin;
  if (!authenticationPin || typeof authenticationPin !== "string") {
    return null;
  }
  const pin = useApplicationStore((state: any) => state.pin);
  const { top, bottom } = useSafeAreaInsets();
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [disabled, setDisabled] = useState(false);

  const [pinSuccess, setPinSuccess] = useState(false);
  const handlePin = useCallback(
    (authPin: string) => {
      if (authPin.length <= authenticationPin.length && !disabled) {
        setValue(authPin);
        if (authPin.length === authenticationPin.length) {
          if (authPin === authenticationPin) {
            pin.set(authPin);
            setPinSuccess(true);
          } else {
            Vibration.vibrate(50);
            setError(true);
            setDisabled(true);
            setTimeout(() => {
              setError(false);
              setDisabled(false);
              setValue("");
            }, 500);
          }
        }
      }
    },
    [authenticationPin, disabled, pin]
  );

  // Procesar didcomm tras el pin, igual que el QR, sin mostrar Scan
  const processMessage = useApplicationStore((state) => state.processMessage);
  useEffect(() => {
    const processDidcom = async () => {
      if (pinSuccess && pendingOob) {
        try {
          await processMessage(pendingOob);
          Alert.alert(
            "DIDComm procesado",
            "El mensaje fue procesado correctamente."
          );
        } catch (error) {
          let errorMessage = "Error procesando el mensaje DIDComm.";
          if (error?.message?.includes("Cannot find private key")) {
            errorMessage =
              "No se encontró la clave privada. Por favor, crea tu DID nuevamente.";
          } else if (error?.message?.includes("KMS")) {
            errorMessage =
              "Error en el almacenamiento de claves. Intenta reiniciar la aplicación.";
          }
          Alert.alert("Error", errorMessage);
        } finally {
          setPendingOob(null);
        }
      }
    };
    processDidcom();
  }, [pinSuccess, pendingOob, setPendingOob, processMessage]);
  const bkcolor =
    app.expo.name == "RockID" ? { backgroundColor: theme.color.primary } : null;
  return (
    <Draft
      color={theme.color.white}
      setHeight={setHeaderHeight}
      backgroundColor={theme.color.primary}
    >
      <Layout backgroundColor={theme.color.primary} {...bkcolor}>
        <Wrapper style={{ backgroundColor: theme.color.primary }}>
          <TitleWrapper>
            <Title style={{ color: theme.color.secondary }}>
              {i18n.t("pinStack.confirmPin")}
            </Title>
            <Description theme={theme}>
              {i18n.t("pinStack.description")}
            </Description>
          </TitleWrapper>

          <PinItems
            length={authenticationPin.length}
            value={value}
            error={error}
            color={theme.color.secondary}
            style={{ marginBottom: 15 }}
          />
          <NumberPad
            style={{
              width: "90%",
            }}
            value={value}
            setValue={handlePin}
            maxLength={authenticationPin.length}
          />
        </Wrapper>
      </Layout>
    </Draft>
  );
};

const ImageStyled = styled.Image``;

const Wrapper = styled.View`
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
  padding-top: 80px;
`;

const Title = styled.Text`
  text-align: center;
  font-size: 24px;
  font-style: normal;
  font-family: Manrope-Bold;
  line-height: 30px;
  margin-bottom: 9px;
`;
const Description = styled.Text`
  color: ${(props) => props.theme.color.font};
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-family: Manrope-Regular;
  line-height: 17.5px;
  letter-spacing: 0.14px;
`;

const TitleWrapper = styled.View`
  align-items: center;
  width: 100%;
`;

export default ConfirmPin;
