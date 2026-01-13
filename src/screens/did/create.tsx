// import * as FileSystem from "expo-file-system";
import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Platform } from "react-native";
import WebView from "react-native-webview";
import styled, { useTheme } from "styled-components/native";
import { shallow } from "zustand/shallow";
import Button from "../../components/Button";
import agentConfig from "../../config/agent";
import stylesConfig from "../../config/styles";
import { useApplicationStore } from "../../contexts/useApplicationStore";
import i18n from "../../locale";
import { Layout } from "../../styled-components/Layouts";
import Popup from "../../components/Popup";
import BBSKeyGenerator, {
  BBSKeyMaterial,
} from "../../components/BBSKeyGenerator";

interface CreateDidProps {}

const CreateDid: FC<CreateDidProps> = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [bbsKeys, setBbsKeys] = useState<BBSKeyMaterial | null>(null);

  // Usar selector específico sin shallow para evitar re-renders
  const did = useApplicationStore((state) => state.did);
  const didMethodSelected = agentConfig.didMethod;

  const [PopupVisible, setPopupVisible] = useState(false);
  const [PopupTitle, setPopupTitle] = useState("Error");
  const [PopupDescription, setPopupDescription] = useState(
    i18n.t("errorDescription")
  );

  const onCreate = useCallback(async () => {
    if (!bbsKeys || loading) {
      console.log("🔐 No BBS+ keys available or loading in progress");
      return;
    }

    // Establecer loading INMEDIATAMENTE antes de cualquier operación
    setLoading(true);

    // Usar setTimeout para permitir que React actualice la UI
    setTimeout(async () => {
      try {
        console.log("🔐 Creating DID with BBS+ keys:", bbsKeys);
        await did.create(didMethodSelected, [bbsKeys]);
      } catch (error) {
        console.error(error);
        console.log("ayuda");

        setPopupTitle(i18n.t("Error"));
        setPopupDescription(i18n.t("didStack.errorMessage"));
        setPopupVisible(true);
      } finally {
        setLoading(false);
      }
    }, 0);
  }, [bbsKeys, did, didMethodSelected, loading]);

  const handleKeyGenerated = useCallback(async (message: BBSKeyMaterial) => {
    console.log("🔐 Llegan las llaves");
    setBbsKeys(message);
    setLoading(false);
  }, []);

  const handleKeyGenerationError = useCallback(async (error: string) => {
    console.error("❌ BBS+ key generation error:", error);
    setPopupTitle(i18n.t("Error"));
    setPopupDescription(error);
    setPopupVisible(true);
  }, []);

  const handleBBSGeneratorReady = useCallback(async () => {
    console.log("🌐 DOM Component ready");
  }, []);

  return (
    <Layout
      backgroundColor={theme.color.primary}
      style={{
        paddingTop: Platform.OS === "ios" ? 0 : 10,
      }}
    >
      <Popup
        title={PopupTitle}
        description={PopupDescription}
        acceptHandler={() => {
          setPopupVisible(false);
        }}
        visible={PopupVisible}
        warning={true}
      />
      <ItemContainer>
        <ItemWrapper>
          <ImageWrapper>
            <ImageStyled
              style={{
                width: 300,
                height: 150,
              }}
              source={stylesConfig.steps[2]}
              resizeMode="contain"
            />
          </ImageWrapper>
          <TextWrapper>
            <Title style={{ color: theme.color.secondary }}>
              {i18n.t("didStack.createDid")}
            </Title>
          </TextWrapper>
        </ItemWrapper>
        {!bbsKeys && (
          <BBSKeyGenerator
            onKeyGenerated={handleKeyGenerated}
            onError={handleKeyGenerationError}
            onReady={handleBBSGeneratorReady}
          />
        )}

        <ButtonWrapper>
          {/* <TouchableOpacityStyled
            style={{
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              marginBottom: 24,
            }}
            disabled={loading || fetching}
            onPress={onImport}
          >
            <TextStyled style={{ color: theme.color.secondary }}>
              {i18n.t("didStack.import")}
            </TextStyled>
          </TouchableOpacityStyled> */}
          <Button
            backgroundColor={theme.color.secondary}
            color={theme.color.white}
            style={{
              paddingTop: 16,
              paddingBottom: 16,
              width: Dimensions.get("window").width - 64,
              borderRadius: 50,
            }}
            textStyle={{
              fontFamily: "Manrope-Bold",
              fontSize: 16,
              letterSpacing: 0.32,
              lineHeight: 20,
            }}
            loading={loading}
            onPress={onCreate}
            disabled={!bbsKeys || loading}
          >
            {i18n.t("didStack.create")}
          </Button>
        </ButtonWrapper>
      </ItemContainer>
    </Layout>
  );
};

const WebViewStyled = styled(WebView)``;

const TouchableOpacityStyled = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
  flex-direction: row;
  margin-top: 10px;
`;

const TextStyled = styled.Text`
  text-align: center;
  font-size: 16px;
  font-family: Manrope-Medium;
  line-height: 20px;
  letter-spacing: 0.32px;
  text-decoration-line: underline;
`;

const ImageWrapper = styled.View`
  width: 100%;
  max-width: 192px;
  justify-content: center;
  align-items: center;
  display: flex;
  margin-left: auto;
  margin-right: auto;
  padding-top: 84px;
  padding-bottom: 90px;
`;

const ImageStyled = styled.Image``;

const ItemContainer = styled.View`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  position: relative;
  padding-bottom: 32px;
`;

const ItemWrapper = styled.View`
  width: 100%;
`;

const TextWrapper = styled.View`
  padding: 0px 20px;
  align-items: center;
`;

const Title = styled.Text`
  font-size: 24px;
  font-family: Manrope-Bold;
  padding-bottom: 18px;
  text-align: center;
  line-height: 30px;
`;

const ButtonWrapper = styled.View`
  width: 100%;
  align-items: center;
`;

export default CreateDid;
