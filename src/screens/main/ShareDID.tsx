// Imports
import React, { FC, useEffect } from "react";
import i18n from "../../locale";
import { Image } from "react-native";
import { Dimensions } from "react-native";
import { transparentize } from "polished";

// Components
import { NavigationProp } from "@react-navigation/native";
import BasicLayout from "../../components/BasicLayout";
import styled, { useTheme } from "styled-components/native";
import { useApplicationStore } from "../../contexts/useApplicationStore";
import { shallow } from "zustand/shallow";
import { Ionicons } from "@expo/vector-icons";
import SingleTitleAndBtn from "../../components/SingleTitleAndBtn";
import { Alert, Share, TouchableHighlight } from "react-native";
import ShareDIDIcon from "../../assets/icons/ShareDIDIcon";
import { useState } from "react";
import * as Clipboard from "expo-clipboard";

interface ShareDIDProps {
  navigation: NavigationProp<any>;
}

const ShareDID: FC<ShareDIDProps> = ({ navigation }) => {
  const theme = useTheme();

  // const { did } = useApplicationStore(
  //   (state) => ({ did: state.did, reset: state.reset }),
  //   shallow
  // );
  const did = useApplicationStore((state) => state.did);
  const reset = useApplicationStore((state) => state.reset);
  const [btnPress, isBtnPress] = useState(false);
  const [didText, setDidText] = useState("");
  useEffect(() => {
    // Define an async function inside the useEffect
    const fetchCurrentDid = async () => {
      const currentDid = await did.current();
      const message = currentDid.isLongDID()
        ? currentDid.value.slice(0, currentDid.value.lastIndexOf(":"))
        : currentDid.value;
      setDidText(message);
    };
    fetchCurrentDid();
    return () => {};
  }, []);

  const shareHandler = async () => {
    try {
      const currentDid = await did.current();
      const message = currentDid.isLongDID()
        ? currentDid.value.slice(0, currentDid.value.lastIndexOf(":"))
        : currentDid.value;

      const result = await Share.share({
        message,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
        } else {
        }
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  const copyHandler = async () => {
    await Clipboard.setStringAsync(didText);
    Alert.alert(
      "Copied to Clipboard",
      "The DID has been copied to your clipboard."
    );
  };

  return (
    <BasicLayout
      contentStyle={{
        paddingTop: 32,
        paddingBottom: 32,
        justifyContent: "space-between",
      }}
      onlyTitle
      onBack={() => navigation.goBack()}
    >
      <Title style={{ color: theme.color.secondary }}>
        {i18n.t("settingsScreen.share.title")}
      </Title>
      {/* <ShareDIDIcon /> */}
      {/* <ImageStyled
        style={{
          width: Dimensions.get("window").width * 0.5,
          height: Dimensions.get("window").height * 0.3,
        }}
        source={theme.images.logoSmall}
        resizeMode="contain"
      /> */}
      <ButtonsWrapper>
        <DidContainer color={theme.color.tertiary}>
          <DidText
            numberOfLines={1}
            ellipsisMode="tail"
            color={theme.color.tertiary}
          >
            {didText}
          </DidText>
        </DidContainer>
        <CopyButton onPress={copyHandler} color={theme.color.secondary}>
          <Texto style={{ color: theme.color.secondary }} btnPressed={btnPress}>
            {i18n.t("settingsScreen.share.btn")}
          </Texto>
        </CopyButton>
        <ShareButton
          onPress={shareHandler}
          onShowUnderlay={() => isBtnPress(true)}
          onHideUnderlay={() => isBtnPress(false)}
          theme={theme}
          color={theme.color.secondary}
        >
          <Texto style={{ color: "#FFF" }} btnPressed={btnPress}>
            {i18n.t("settingsScreen.share.sharebtn")}
          </Texto>
        </ShareButton>
      </ButtonsWrapper>
    </BasicLayout>
  );
};
const ImageStyled = styled.Image``;

const ButtonsWrapper = styled.View`
  align-items: center;
`;
const DidContainer = styled.View`
  display: flex;
  padding: 24px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  border: ${(props) => `1px dashed ${props.color}`};
  background: #fff;
  margin-bottom: 32px;
  width: ${Dimensions.get("window").width - 64}px;
`;
const DidText = styled.Text`
  color: ${(props) => props.color};
  text-align: center;
  font-family: Manrope-Bold;
  font-size: 15px;
  font-style: normal;
  line-height: 18.75px;
`;
const Title = styled.Text`
  text-align: center;
  font-family: Manrope-Bold;
  font-size: 20px;
  font-style: normal;
  line-height: 25px;
`;
const Texto = styled.Text`
  text-align: center;
  font-family: Manrope-Bold;
  font-size: 16px;
  font-style: normal;
  line-height: 20px;
  letter-spacing: 0.32px;
`;

const CopyButton = styled(TouchableHighlight)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 52px;
  width: ${Dimensions.get("window").width - 64}px;
  border-radius: 50px;
  background: ${(props) => transparentize(0.8, props.color)};
  margin-bottom: 16px;
`;

const ShareButton = styled(TouchableHighlight)`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 52px;
  width: ${Dimensions.get("window").width - 64}px;
  border-radius: 50px;
  background: ${(props) => props.color};
`;

export default ShareDID;
