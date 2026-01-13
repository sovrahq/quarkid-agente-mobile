import React, { useCallback, useEffect, useState } from "react";

import {
  Alert,
  BackHandler,
  Dimensions,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from "react-native";
import BasicLayout from "../../components/BasicLayout";
// Libs
import { lighten, transparentize } from "polished";
import styled, { useTheme } from "styled-components/native";

// Providers
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";
import Button from "../../components/Button";
import CredentialAbstract from "../../components/CredentialAbstract";
import EntityHeader from "../../components/EntityHeader";
import {
  useApplicationStore,
  websocketTransport,
} from "../../contexts/useApplicationStore";
import i18n from "../../locale";
import Popup from "../../components/Popup";
import ListLayout from "../../components/ListLayout";

const PresentSection = ({
  descriptor,
  credentials,
  selectCredential,
  selectedIndex,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [logo, setLogo] = useState({
    width: "50%",
    height: 35,
    opacity: 1,
    enabled: true,
  });

const [creds, setCreds] = useState([]);

  const setSelected = useCallback((index) => {
    const c = (credentials || []).map((credential, i) => ({
      credential,
      selected: i === index,
    }));

    selectCredential(c[index].credential, index);
  }, []);
  if (!credentials || credentials.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: theme.color.secondary,
            fontSize: 16,
            textAlign: "center",
          }}
        >
          No hay credenciales disponibles
        </Text>
      </View>
    );
  }
  
  // return (
  //   <>
  //     <View></View>
  //   </>
  // );
  return (
    <>
      <ListLayout
        data={credentials}
        EmptyComponent={() => <></>}
        RenderItemComponent={({ item: input, index }) => {
          return (
            <View key={index}>
              {!!index && <View style={{ height: 10 }} />}
              <CredentialItem
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  borderRadius: 15,
                  padding: 20,
                }}
                onPress={() => {
                  input.data &&
                    navigation.navigate("CredentialDetails", {
                      credential: input,
                      color: input?.styles?.text?.color,
                    });
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {input.styles?.thumbnail?.uri && (
                    <ImageStyled
                      source={{
                        uri: logo.enabled
                          ? input.styles?.thumbnail?.uri
                          : "https://i.ibb.co/Krv9jRg/Quark-ID-iso.png",
                        cache: "force-cache",
                      }}
                      style={{
                        height: 50,
                        width: 50,
                        backgroundColor:
                          input.styles?.background?.color ||
                          theme.color.tertiary,
                        borderRadius: 100,
                        marginRight: 10,
                      }}
                      resizeMode="contain"
                      onLoad={(e) => {
                        // setLogo((logo) => ({
                        //     ...logo,
                        //     width: Number(((35 * e.nativeEvent.source.width) / e.nativeEvent.source.height).toFixed(0)),
                        //     height: 35,
                        //     opacity: 1,
                        // }));
                      }}
                      onError={(e) => {
                        setLogo((logo) => ({
                          ...logo,
                          enabled: false,
                        }));
                      }}
                    />
                  )}
                  <View>
                    <Title
                      ellipsizeMode={"tail"}
                      numberOfLines={2}
                      color={theme.color.secondary}
                    >
                      {input.data?.issuer?.name ||
                        input.data?.issuer?.id ||
                        input.data?.issuer ||
                        i18n.t("credential")}
                    </Title>
                    <Text
                      ellipsizeMode={"tail"}
                      numberOfLines={2}
                      style={{
                        color: theme.color.secondary,
                      }}
                    >
                      {input.data?.credentialSubject?.name ||
                        input.data?.issuer?.name ||
                        input.data?.issuer ||
                        i18n.t("credential")}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setSelected(index);
                  }}
                  // style={{ position: "absolute", right: 20, top: 35 }}
                >
                  <View
                    style={{
                      width: 25,
                      height: 25,
                      marginRight: 5,
                      borderRadius: 20,
                      borderWidth: index == selectedIndex ? 2 : 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderColor:
                        index == selectedIndex
                          ? "#5F5F5F"
                          : transparentize(
                              0.6,
                              input.styles?.text?.color || "black"
                            ),
                    }}
                  >
                    <View
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: 20,
                        backgroundColor:
                          index == selectedIndex ? "#5F5F5F" : "transparent",
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </CredentialItem>
            </View>
          );
        }}
      />
    </>
  );
};

const ListWrapper = styled.View`
  align-items: center;
  margin-bottom: 15px;
  width: 100%;
`;

const PresentCredentials = ({ route }) => {
  const theme = useTheme();
  console.log("🔖 Render PresentCredentials")
  console.log("🚀 PresentCredentials rendered with route params:", route.params.inputs[0])
  console.log("🚀 PresentCredentials rendered with route params:", route.params.resolve)
  const navigation = useNavigation();
  const [isDisabled, setIsDisabled] = useState(false);

  const { resolve, inputs, credentialsToReceive, issuer } = route.params;
  const [selectedCredentials, setSelectedCredentials] = useState(
    inputs.map((input) => {
      return input.credentials[0];
    })
  );
  const [selectedIndex, setSelectedIndex] = useState(
    inputs.map((input) => {
      return 0;
    })
  );
  const setIsConnected = useApplicationStore((state) => (state.setIsConnected));
  // const { setIsConnected } = useApplicationStore((state) => ({
  //   setIsConnected: state.setIsConnected,
  // }));
  const [visible, setVisible] = useState(false);
  const [btnPress1, isBtnPress1] = useState(false);
  const [btnPress2, isBtnPress2] = useState(false);

  const [logo, setLogo] = useState({
    width: "50%",
    height: 35,
    opacity: 1,
    enabled: true,
  });

  const acceptCredentials = useCallback(() => {
    try {
      setIsDisabled(true);
      const credentialsToSend = selectedCredentials.map(
        (credential) => credential.data
      );
      console.log("✅ Accepting credentials: ", credentialsToSend);
      resolve(credentialsToSend);
      // Set connection state to show loading while waiting for ACK
      setIsConnected(true);
    } catch (error) {
      console.log("Error", error);
      console.log("Error", error?.message);
      setIsDisabled(false);
    }
  }, [selectedCredentials, resolve]);

  const selectCredential = useCallback(
    (credential, credIndex, index) => {
      console.log("aa: ", credential, index);
      setSelectedIndex((prev) => {
        const newSelected = [...prev];
        newSelected[index] = credIndex;
        return newSelected;
      });
      setSelectedCredentials((prev) => {
        console.log("bb: ", prev);
        const newSelectedCredentials = [...prev];
        newSelectedCredentials[index] = credential;
        console.log("cc: ", newSelectedCredentials);
        return newSelectedCredentials;
      });
    },
    [selectedCredentials]
  );

  useEffect(() => {
    if (inputs.length > 0 && !inputs[0]?.credentials.length) {
      setIsDisabled(true);
    }
    setIsConnected(false);
  }, []);

  const rejectCredentials = useCallback(() => {
    websocketTransport.dispose();
    navigation.goBack();
  }, []);

  useEffect(() => {
    console.log("ya know ISSUER: ", issuer);
    console.log('selected: ', selectedCredentials)
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setVisible(true);
        return true;
      }
    );

    return () => backHandler.remove();
  }, []);

  return (
    <BasicLayout
      title={i18n.t("credentials")}
      contentStyle={{
        paddingBottom: 30,
      }}
      bottomTab={false}
      backText={false}
      onBack={() => {
        setVisible(true);
      }}
    >
      <Popup
        navigation={navigation}
        title={i18n.t("presentCredentialsScreen.reject")}
        description={i18n.t("presentCredentialsScreen.rejectDescription")}
        acceptHandler={() => {
          rejectCredentials();
        }}
        declineHandler={() => {
          setVisible(false);
        }}
        visible={visible}
        warning={true}
      />
      <Container>
        {credentialsToReceive?.length > 0 && (
          <ListLayout
            title={
              (issuer?.name ? issuer?.name : i18n.t("someone")) +
              " " +
              i18n.t("presentCredentialsScreen.emit")
            }
            showsVerticalScrollIndicator={false}
            data={credentialsToReceive}
            EmptyComponent={() => <></>}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
            RenderItemComponent={({ item, index }) => {
              return (
                <View key={index}>
                  {!!index && <View style={{ height: 10 }} />}
                  <CredentialItem
                    style={{
                      backgroundColor: "white",
                      borderRadius: 15,
                      padding: 20,
                    }}
                    onPress={() => {
                      item?.data &&
                        navigation.navigate("CredentialDetails", {
                          credential: item,
                          color: item?.styles?.text?.color,
                          isFromPresentCredential: true,
                        });
                    }}
                  >
                    <Title
                      color={theme.color.font}
                      style={{ marginLeft: 20, marginBottom: 10 }}
                    >
                      {item?.display?.title?.text ||
                        item?.display?.title?.fallback ||
                        i18n.t("credential")}
                    </Title>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginLeft: 20,
                        width: "75%",
                      }}
                    >
                      {item?.styles?.thumbnail?.uri && (
                        <ViewStyled
                          style={{
                            backgroundColor:
                              item?.styles?.background?.color ||
                              theme.color.tertiary,
                            borderRadius: 100,
                            height: 35,
                            width: 35,
                            marginRight: 10,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ImageStyled
                            source={{
                              uri: logo.enabled
                                ? item?.styles?.thumbnail?.uri
                                : "https://i.ibb.co/Krv9jRg/Quark-ID-iso.png",
                              cache: "force-cache",
                            }}
                            style={{ height: 25, width: 25 }}
                            resizeMode="contain"
                            onLoad={(e) => {
                              // setLogo((logo) => ({
                              //     ...logo,
                              //     width: Number(((35 * e.nativeEvent.source.width) / e.nativeEvent.source.height).toFixed(0)),
                              //     height: 35,
                              //     opacity: 1,
                              // }));
                            }}
                            onError={(e) => {
                              setLogo((logo) => ({
                                ...logo,
                                enabled: false,
                              }));
                            }}
                          />
                        </ViewStyled>
                      )}
                      <Title color={theme.color.font}>
                        {item?.data?.issuer?.name ||
                          item?.data?.issuer?.id ||
                          item?.data?.issuer ||
                          i18n.t("credential")}
                      </Title>
                    </View>
                  </CredentialItem>
                </View>
              );
            }}
          />
        )}
        {credentialsToReceive?.length > 0 && inputs?.length > 0 && (
          <View
            style={{
              width: "100%",
              height: 1,
              marginTop: 20,
              backgroundColor: transparentize(0.8, "black"),
            }}
          />
        )}
        {inputs?.length > 0 && (
          <ListLayout
            title={i18n.t("presentCredentialsScreen.presentTitle")}
            showsVerticalScrollIndicator={false}
            data={inputs}
            EmptyComponent={() => <></>}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 10,
            }}
            RenderItemComponent={({ item, index }) => (
              <PresentSection
                credentials={item.credentials}
                descriptor={item.descriptor}
                selectCredential={(credential, credIndex) => {
                  selectCredential(credential, credIndex, index);
                }}
                selectedIndex={selectedIndex[index]}
              />
            )}
          />
        )}

        <ButtonsWrapper>
          <EmailButton
            onPress={acceptCredentials}
            disabled={isDisabled}
            style={{
              backgroundColor: isDisabled ? "#333333" : theme.color.secondary,
            }}
            onShowUnderlay={() => isBtnPress1(true)}
            onHideUnderlay={() => isBtnPress1(false)}
            theme={theme}
          >
            <Texto
              style={{ color: theme.color.primary }}
              btnPressed={btnPress1}
            >
              {i18n.t("accept")}
            </Texto>
          </EmailButton>
          <SendButton
            onPress={() => {
              setVisible(true);
            }}
            onShowUnderlay={() => isBtnPress2(true)}
            onHideUnderlay={() => isBtnPress2(false)}
            theme={theme}
          >
            <Texto style={{ color: theme.color.font }} btnPressed={btnPress2}>
              {i18n.t("cancel")}
            </Texto>
          </SendButton>
        </ButtonsWrapper>
      </Container>
    </BasicLayout>
  );
};

const ImageStyled = styled.Image``;

const Container = styled.View`
  width: ${Dimensions.get("window").width}px;
  height: 100%;
  align-items: center;
`;

const CredentialItem = styled.TouchableOpacity``;

// const ButtonWrapper = styled.View`
//     flex-direction: row;
//     margin-top: 25px;
//     width: 90%;
//     position: relative;
//     justify-content: space-between;
// `;

const ButtonsWrapper = styled.View`
  align-items: center;
`;

const ViewStyled = styled.View``;

const Title = styled.Text`
  font-size: 16px;
  font-weight: 500;

  color: ${(props) => props.color};
`;

const EmailButton = styled(TouchableHighlight)`
  display: flex;
  height: 52px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: ${Dimensions.get("window").width - 64}px;
  border-radius: 50px;
  background: ${(props) =>
    props.disabled ? "#333333" : props.theme.color.secondary};
  margin-bottom: 16px;
`;

const SendButton = styled(TouchableHighlight)`
  display: flex;
  height: 52px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  width: ${Dimensions.get("window").width - 64}px;
  border-radius: 50px;
  background: #d5d5d5;
`;

const Texto = styled.Text`
  text-align: center;
  font-family: Manrope-Bold;
  font-size: 16px;
  font-style: normal;
  line-height: 20px;
  letter-spacing: 0.32px;
`;

export default PresentCredentials;
