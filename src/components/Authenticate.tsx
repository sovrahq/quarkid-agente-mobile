import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Vibration } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "styled-components";
import styled from "styled-components/native";
import { shallow } from "zustand/shallow";
import { useApplicationStore } from "../contexts/useApplicationStore";
import { Layout } from "../styled-components/Layouts";
import NumberPad from "./NumberPad";
import PinItems from "./PinItems";
import app from "../../app.json";
import i18n from "../locale";
import Draft from "./Draft";

const Authenticate = () => {
  const theme: any = useTheme();
  const [value, setValue] = useState("");
  const authenticationPinLength = useMemo(() => 6, []);
  // const [biometricSupported, setBiometricSupported] = useState(false);
  const [error, setError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const { top, bottom } = useSafeAreaInsets();
  //   const { pin } = useApplicationStore(
  //     (state) => ({
  //       pin: state.pin,
  //     }),
  //     shallow
  //   );

  const pin = useApplicationStore((state) => state.pin);

  // Biometric authentication logic removed/comented as requested

  const submitPassword = useCallback(async (authPin: string) => {
    if (authPin.length <= authenticationPinLength && !disabled) {
      setValue(authPin);
      if (authPin.length === authenticationPinLength) {
        if (await pin.validate(authPin)) {
          await pin.authenticate();
          //onAuthenticate();
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
  }, []);

  // useEffect(() => {
  //     LocalAuthentication.isEnrolledAsync().then((result) => {
  //         if (result) {
  //             setBiometricSupported(true);
  //             authenticate();
  //         }
  //     });
  // }, []);
  const bkcolor =
    app.expo.name == "RockID" ? { backgroundColor: theme.color.primary } : null;

  return (
    <Draft backgroundColor={theme.color.primary}>
      <Layout backgroundColor={theme.color.primary} {...bkcolor}>
        <Wrapper
          style={{
            backgroundColor: theme.color.primary,
            paddingTop: 80,
            paddingBottom: bottom,
          }}
        >
          <TitleWrapper>
            <Title style={{ color: theme.color.secondary }}>
              {i18n.t("enterPin")}
            </Title>
          </TitleWrapper>
          <PinItems
            length={authenticationPinLength}
            value={value}
            color={theme.color.secondary}
            error={error}
            style={{ marginBottom: 15 }}
          />
          <NumberPad
            style={{
              width: "90%",
            }}
            maxLength={authenticationPinLength}
            value={value}
            setValue={submitPassword}
          />
        </Wrapper>
      </Layout>
    </Draft>
  );
};

const ImageStyled = styled.Image``;

const Container = styled.SafeAreaView`
  flex: 1;
  align-items: center;
  z-index: 10;
`;

const Wrapper = styled.View`
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  padding-bottom: 20px;
  padding-top: 80px;
`;

const TitleWrapper = styled.View`
  align-items: center;
  width: 100%;
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

export default Authenticate;
