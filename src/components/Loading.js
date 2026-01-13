import { transparentize } from "polished";
import React, { useState } from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import styled, { useTheme } from "styled-components/native";
import ZkSyncIcon from "../assets/icons/ZkSyncIcon";
import { AntDesign } from "@expo/vector-icons";
import Popup from "./Popup";
import i18n from "../locale";

const Loading = ({ closeConnection }) => {
  const theme = useTheme();
  const [PopupVisible, setPopupVisible] = useState(false);

  return (
    <ItemContainer style={{ backgroundColor: theme.color.primary }}>
      <Popup
        title={i18n.t("closeConnection")}
        description={i18n.t("closeConnectionMessage")}
        acceptHandler={() => closeConnection()}
        declineHandler={() => {
          setPopupVisible(false);
        }}
        visible={PopupVisible}
        warning={true}
      />

      <ItemWrapper>
        <ImageContainer image={theme.images.logo} />
        <TextWrapper>
          <Title style={{ color: theme.color.secondary }}>
            {i18n.t("loading.processing")}
          </Title>
          <Description theme={theme}>{i18n.t("loading.message")}</Description>
        </TextWrapper>
        <ActivityIndicator
          color={
            theme.statusBar === "dark-content"
              ? transparentize(0.5, "black")
              : "white"
          }
          size={"large"}
        />

        <TextWrapper>
          {closeConnection ? (
            <CloseIconWrapper onPress={() => closeConnection()}>
              <AntDesign name="close" size={24} color="black" />
            </CloseIconWrapper>
          ) : null}
          <PoweredBy>powered by</PoweredBy>
          <ZkSyncIcon />
        </TextWrapper>
      </ItemWrapper>
    </ItemContainer>
  );
};

const ItemContainer = styled.View`
  width: ${Dimensions.get("window").width}px;
  height: ${Dimensions.get("screen").height.toFixed(0)}px;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
`;

const ItemWrapper = styled.View`
  flex: 1;
  padding-top: 16px;
  padding-bottom: 86px;
  justify-content: space-between;
  align-items: center;
`;

const CloseIconWrapper = styled.TouchableOpacity`
  margin-bottom: 40px;
  border: solid black 1px;
  padding: 10px;
  border-radius: 50px;
`;

// Eliminado: AntDesignStyled

const TextWrapper = styled.View`
  align-items: center;
`;

const ImageContainer = styled.Image.attrs((props) => ({
  resizeMode: "contain",
  source: props.image,
}))`
  width: 120px;
  height: 24px;
`;

const Title = styled.Text`
  text-align: center;
  font-size: 20px;
  font-style: normal;
  font-family: Manrope-Bold;
  line-height: 25px;
  padding-bottom: 16px;
`;

const Description = styled.Text`
  color: ${(props) => {
    props.theme.color.font;
  }};
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-family: Manrope-Regular;
  line-height: 17.5px;
  letter-spacing: 0.14px;
`;

const PoweredBy = styled.Text`
  color: #b4b7c6;
  text-align: center;
  font-size: 14px;
  font-style: normal;
  font-family: Manrope-Regular;
  line-height: 17.5px;
  letter-spacing: 0.14px;
  padding-bottom: 16px;
`;

export default Loading;
