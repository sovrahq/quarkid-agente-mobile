// Imports
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { transparentize } from "polished";
import React, { FC, useState } from "react";
import styled, { useTheme } from "styled-components/native";
import { shallow } from "zustand/shallow";
import app from "../../../app.json";
import i18n from "../../locale";
import { Dimensions } from "react-native";

// Components
import { AntDesign, Entypo, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { NavigationProp } from "@react-navigation/native";
import { TouchableHighlight } from "react-native";
import BasicLayout from "../../components/BasicLayout";
import { useApplicationStore } from "../../contexts/useApplicationStore";

//Icons
import ShareIDIcon from "../../assets/icons/ShareIDIcon";
import BackupIcon from "../../assets/icons/BackupIcon";
import FaqIcon from "../../assets/icons/FaqIcon";
import TermsIcon from "../../assets/icons/TermsIcon";
import PrivacyIcon from "../../assets/icons/PrivacyIcon";
import ResetAppIcon from "../../assets/icons/ResetAppIcon";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
interface SettingsProps {
  navigation: NavigationProp<any>;
}

const Settings: FC<SettingsProps> = ({ navigation }) => {
  const theme = useTheme();

  // const { did, reset } = useApplicationStore(
  //   (state) => ({ did: state.did, reset: state.reset }),
  //   shallow
  // );
  const did = useApplicationStore((state) => state.did);
  const reset = useApplicationStore((state) => state.reset);
  const [isLoading, setIsLoading] = useState(false);
  const [restartBtnPress, isRestartBtnPress] = useState(false);

  const items = [
    {
      title: i18n.t("settingsScreen.share.semiTitle"),
      body: i18n.t("settingsScreen.share.description"),
      onPress: async () => {
        navigation.navigate("ShareDID");
      },
      icon: (
        <MaterialCommunityIcons
          name="share-variant-outline"
          size={26}
          color={theme.color.tertiary}
        />
      ),
    },
    // {
    //   title: i18n.t("settingsScreen.export.title"),
    //   body: i18n.t("settingsScreen.export.description"),
    //   onPress: async () => {
    //     navigation.navigate("ExportKeys");
    //   },
    //   icon: (
    //     <MaterialCommunityIcons
    //       name="monitor-share"
    //       size={26}
    //       color={theme.color.tertiary}
    //     />
    //   ),
    // },
    // {
    //   title: i18n.t("settingsScreen.exportCredentials.title"),
    //   body: i18n.t("settingsScreen.exportCredentials.description"),
    //   onPress: async () => {
    //     navigation.navigate("ExportCredentials");
    //   },
    //   icon: (
    //     <MaterialCommunityIcons
    //       name="file-document-multiple-outline"
    //       size={26}
    //       color={theme.color.tertiary}
    //     />
    //   ),
    // },
    // {
    //   title: i18n.t("settingsScreen.importCredentials.title"),
    //   body: i18n.t("settingsScreen.importCredentials.description"),
    //   onPress: async () => {
    //     navigation.navigate("ImportCredentials");
    //   },
    //   icon: (
    //     <MaterialCommunityIcons
    //       name="import"
    //       size={28}
    //       color={theme.color.tertiary}
    //     />
    //   ),
    // },
    {
      title: i18n.t("settingsScreen.faq.title"),
      body: i18n.t("settingsScreen.config.description"),
      onPress: async () => {
        navigation.navigate("FAQ");
      },

      icon: (
        <MaterialCommunityIcons
          name="account-question-outline"
          size={28}
          color={theme.color.tertiary}
        />
      ),
    },
    {
      title: i18n.t("settingsScreen.terms.title"),
      body: i18n.t("settingsScreen.config.description"),
      onPress: async () => {
        navigation.navigate("TermsAndConditions", { hideButtons: true });
      },

      icon: (
        <MaterialCommunityIcons
          name="file-document-outline"
          size={24}
          color={theme.color.tertiary}
        />
      ),
    },
    {
      title: i18n.t("settingsScreen.reset.fullTitle"),
      body: i18n.t("settingsScreen.reset.description"),
      onPress: async () => {
        navigation.navigate("ResetApp");
      },
      warning: true,
      icon: (
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={24}
          color="#f0c7c7"
        />
      ),
    },
  ];

  const bkcolor = app.expo.name.includes("QuarkID")
    ? "#2D0060"
    : theme.color.white;

  return (
    <BasicLayout
      contentStyle={{
        paddingTop: 10,
        paddingBottom: 10,
        justifyContent: "space-between",
        backgroundColor: theme.color.primary,
      }}
      onlyTitle
      onBack={() => navigation.goBack()}
    >
      <ItemWrapper>
        {items
          .filter((i) => !i.warning)
          .map((item, index) => (
            <Item
              key={index}
              onPress={item.onPress}
              underlayColor={theme.color.tertiary}
              disabled={isLoading}
              theme={theme}
            >
              <TextWrapper>
                <IconWrapper>{item.icon}</IconWrapper>
                {item.title && <Title>{item.title}</Title>}
              </TextWrapper>
            </Item>
          ))}
      </ItemWrapper>
      <BottomWrapper>
        <ItemWrapper>
          {items
            .filter((i) => i.warning)
            .map((item, index) => (
              <Item
                key={index}
                onPress={item.onPress}
                warning={item.warning}
                disabled={isLoading}
                underlayColor={"#C93B3B"}
                theme={theme}
                onShowUnderlay={() => isRestartBtnPress(true)}
                onHideUnderlay={() => isRestartBtnPress(false)}
              >
                <TextWrapper>
                  <IconWrapper>{item.icon}</IconWrapper>
                  {item.title && (
                    <Title btnPressed={restartBtnPress} warning={item.warning}>
                      {item.title}
                    </Title>
                  )}
                </TextWrapper>
              </Item>
            ))}
        </ItemWrapper>
        <Version>
          {app.expo.name} v{app.expo.version}
        </Version>
      </BottomWrapper>
    </BasicLayout>
  );
};

const ItemWrapper = styled.View`
  align-items: center;
  width: 100%;
  margin-top: 30px;
`;

const BottomWrapper = styled.View`
  width: 100%;
`;

const Item = styled(TouchableHighlight)`
  width: ${Dimensions.get("window").width - 64}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  margin-bottom: 16px;
  border-radius: 12px;
  background-color: white;
`;

const Version = styled.Text`
  font-size: 12px;
  font-family: Manrope-SemiBold;
  color: ${transparentize(0.5, "black")};
  padding-right: 10px;
  width: 100%;
  text-align: right;
`;

const IconWrapper = styled.View`
  width: 44px;
  height: 44px;
  padding: 8px;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
`;

const TextWrapper = styled.View`
  flex-direction: row;
  width: 100%;
  align-items: center;
`;

const Title = styled.Text`
  font-family: Manrope-Medium;
  font-size: 18px;
  font-style: normal;
  line-height: 22.5px;
  letter-spacing: 0.18px;
  color: ${(props) =>
    props.warning
      ? props.btnPressed
        ? "white"
        : "#C93B3B"
      : props.theme.color.secondary};
`;

export default Settings;
