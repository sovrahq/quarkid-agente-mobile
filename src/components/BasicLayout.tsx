import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { darken, lighten, transparentize } from "polished";
import React, { FC, useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CSSProperties } from "styled-components";
import { shallow } from "zustand/shallow";
import { useApplicationStore } from "../contexts/useApplicationStore";
import i18n from "../locale";
import { ContainerLayout } from "../styled-components/Layouts";
import Logo from "../assets/icons/Logo";
import BackIcon from "../assets/icons/BackIcon";

interface BasicLayoutProps {
  title?: string;
  titleStyle?: CSSProperties;
  children?: React.ReactNode;
  onlyTitle?: boolean;
  headerStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  onBack?: () => void;
  onExit?: () => void;
  style?: CSSProperties;
  bottomTab?: boolean;
  setContentHeight?: (height: number) => void;
  principal?: boolean;
  backText?: boolean;
}

const BasicLayout: FC<BasicLayoutProps> = ({
  title,
  titleStyle,
  children,
  onlyTitle = false,
  headerStyle,
  contentStyle,
  onBack,
  onExit,
  style,
  bottomTab = true,
  setContentHeight = () => {},
  principal = false,
  backText = true,
  ...props
}) => {
  const theme = useTheme();
  const { top, bottom } = useSafeAreaInsets();

  // ✅ Memoiza el estilo del container
  const containerStyle = useMemo(
    () => ({
      ...style,
      paddingTop: top >= 16 ? top : 16,
    }),
    [style, top]
  );

  // ✅ Memoiza el estilo del header
  const headerContainerStyle = useMemo(
    () => [headerStyle, { display: "flex" as const }],
    [headerStyle]
  );

  // ✅ Memoiza el estilo del contenido con safe area bottom
  const safeContentStyle = useMemo(
    () => ({
      ...contentStyle,
      paddingBottom: Math.max(
        (contentStyle?.paddingBottom as number) || 0,
        bottom + 20
      ),
    }),
    [contentStyle, bottom]
  );

  return (
    <ContainerLayout
      backgroundColor={theme.color.primary}
      style={containerStyle}
      {...props}
    >
      <HeaderContainer style={headerContainerStyle}>
        {onBack && (
          <BackWrapper
            style={{ position: "absolute", left: 20, zIndex: 1 }}
            onPress={onBack}
          >
            <BackIcon color={theme.color.font} />
            {backText && (
              <BackText color={theme.color.font}>{i18n.t("back")}</BackText>
            )}
          </BackWrapper>
        )}
        {!onlyTitle && (
          <ImageStyled
            source={theme.images.logoSmall}
            resizeMode="contain"
            style={{ marginLeft: "auto", marginRight: "auto" }}
          />
        )}
      </HeaderContainer>

      <ContentWrapper
        style={safeContentStyle}
        theme={theme}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setContentHeight(height.toFixed(0));
        }}
      >
        {children}
      </ContentWrapper>
    </ContainerLayout>
  );
};

const ImageStyled = styled.Image`
  width: 150px;
  height: 48px;
`;

const ViewStyled = styled.View``;

const IoniconsStyled = styled(Ionicons)``;
const AntDesignStyled = styled(AntDesign)``;
const TouchableOpacityStyled = styled.TouchableOpacity``;

const HeaderContainer = styled.View`
  padding: 12px 24px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 48px;
  position: relative;
  width: 100%;
`;

const BackWrapper = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin: 0 10px;
`;

const BackWrapperSpacer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const ExitWrapper = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
`;

const HeaderText = styled.Text`
  font-size: 16px;
  font-family: Manrope-Regular;
  color: ${(props) => props.theme.color.font};
  align-self: center;
  text-align: left;
  flex: 1;
`;

const BackText = styled.Text`
  color: ${(props) => props.color};
  text-align: center;
  font-size: 16px;
  font-family: Manrope-SemiBold;
  font-style: normal;
  line-height: 20px;
  margin-left: 16px;
`;

const ContentWrapper = styled.View`
  align-items: center;
  background-color: ${(props) => props.theme.color.primary};
  position: relative;
  width: 100%;
  flex: 1;
  position: relative;
`;

export default BasicLayout;
