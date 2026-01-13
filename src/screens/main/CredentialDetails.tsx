import { MaterialIcons } from "@expo/vector-icons";
import { lighten } from "polished";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  ImageBackground,
  useWindowDimensions,
  View,
  Platform,
} from "react-native";
import styled from "styled-components/native";
import BasicLayout from "../../components/BasicLayout";
import i18n from "../../locale";
// import { useStorageProvider } from '../../contexts/StorageContext';
import { useTheme } from "styled-components";
import validator from "validator";
import CredentialAbstract from "../../components/CredentialAbstract";
import { useApplicationStore } from "../../contexts/useApplicationStore";
import { formatField, isImgUrl } from "../../utils";
import Popup from "../../components/Popup";
import ListLayout from "../../components/ListLayout";
import ForwardIcon from "../../assets/icons/ForwardIcon";
import { ExtrimianVCAttachmentAgentPlugin } from "@extrimian/vc-attachments-agent-plugin";
import { AttachmentFileStorage } from "../../storages/fs-storage";
import { VerifiableCredentialWithInfo } from "../../models/credential";
interface CredentialDetailsProperties {
  label: string;
  value: string;
}
const ImageItem = ({ navigation, item }) => {
  const theme: any = useTheme();
  const [error, setError] = useState(false);
  return (
    <>
      <Label
        style={{
          color: theme.color.secondary,
        }}
      >
        {item.label}
      </Label>
      {!error ? (
        <ImageWrapper
          onPress={() => navigation.navigate("ImageDetails", { item })}
        >
          <ImageStyled
            style={{
              width: Dimensions.get("window").width / 2.5,
              height: Dimensions.get("window").width / 2.5,
              borderRadius: 10,
            }}
            resizeMode={"cover"}
            source={{
              uri: item.value,
              cache: "force-cache",
            }}
            onError={() => {
              setError(true);
            }}
          />
          <Separator />
        </ImageWrapper>
      ) : (
        <>
          <Value ellipsizeMode="tail" numberOfLines={3}>
            {item.value}
          </Value>
          <Separator />
        </>
      )}
    </>
  );
};

const ImageStyled = styled(Image)``;

const CredentialDetails = ({ navigation, route }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const [hasAttachments, setHasAttachments] = useState(false);
  const [hasOneAttachment, setHasOneAttachment] = useState(false);
  const [pdfFiles, setPdfFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [isDocAvailable, setIsDocAvailable] = useState(false);
  // const { credential, did } = useApplicationStore((state) => ({
  //   credential: state.credential,
  //   did: state.did,
  // }));
  const credential = useApplicationStore((state) => state.credential);
  const did = useApplicationStore((state) => state.did);
  const theme: any = useTheme();

  const [deletePopupVisible, setDeletePopupVisible] = useState(false);
  const { height } = useWindowDimensions();
  const buttonColor = "#505E70";

  const currentCredential: VerifiableCredentialWithInfo = useMemo(
    () => route.params?.credential,
    []
  );

  const styles = useMemo(() => route.params?.credential.styles, []);
  const remove = useMemo(() => route.params?.remove, []);

  const properties: CredentialDetailsProperties[] = useMemo(() => {
    return currentCredential.display?.properties
      ?.map((prop) => {
        const value = formatField(currentCredential.data, prop);
        /*
                if (prop.label === 'link' || prop.label === 'Link') {
                    const value = formatField(currentCredential.data, prop)
                    setLink(value)
                }
                */
        if (!validator.isDataURI(value) && !isImgUrl(value)) {
          return {
            label: prop.label,
            value,
          };
        }
      })
      .filter((prop) => prop.label !== "link" && prop.label !== "Link");
  }, [currentCredential]);

  const fetchAttachments = async () => {
    const attachmentPlugin = new ExtrimianVCAttachmentAgentPlugin({
      attachmentStorage: new AttachmentFileStorage(),
      fileAttachmentContextName: "",
    });
    const fileAttachments = await attachmentPlugin.getFileAttachments(
      currentCredential.data
    );

    // Uncomment this to try 3 attachments
    // const fileAttachments = [
    //   {
    //     description: "Credencial de identidad de la Ciudad de Buenos Aires",
    //     extension: "pdf",
    //     hash: "23203f9264161714cdb8d2f474b9b641e6a735f8cea4098c40a3cab8743bd749",
    //     localDownloadPath:
    //       "/data/user/0/com.quarkid/files/quarkid_fs/did_quarkid_zksync_EiAauMsrxbK8t670y8l8GKYMEU6UUuxZDwly0wHXoL2I_Q/23203f9264161714cdb8d2f474b9b641e6a735f8cea4098c40a3cab8743bd749.pdf",
    //     mimeType: "application/pdf",
    //     title: "Documento 1",
    //   },
    //   {
    //     description: "Credencial de identidad de la Ciudad de Buenos Aires",
    //     extension: "pdf",
    //     hash: "23203f9264161714cdb8d2f474b9b641e6a735f8cea4098c40a3cab8743bd749",
    //     localDownloadPath:
    //       "/data/user/0/com.quarkid/files/quarkid_fs/did_quarkid_zksync_EiAauMsrxbK8t670y8l8GKYMEU6UUuxZDwly0wHXoL2I_Q/.pdf",
    //     mimeType: "application/pdf",
    //     title: "Documento 2",
    //   },
    //   {
    //     description: "Credencial de identidad de la Ciudad de Buenos Aires",
    //     extension: "pdf",
    //     hash: "23203f9264161714cdb8d2f474b9b641e6a735f8cea4098c40a3cab8743bd749",
    //     localDownloadPath:
    //       "/data/user/0/com.quarkid/files/quarkid_fs/did_quarkid_zksync_EiAauMsrxbK8t670y8l8GKYMEU6UUuxZDwly0wHXoL2I_Q/23203f9264161714cdb8d2f474b9b641e6a735f8cea4098c40a3cab8743bd749.pdf",
    //     mimeType: "application/pdf",
    //     title: "Documento 3",
    //   },
    // ];

    if (fileAttachments.length === 1) {
      setHasOneAttachment(true);
    } else {
      setHasOneAttachment(false);
    }

    if (fileAttachments.length !== 0) {
      setAttachments(fileAttachments);
      setHasAttachments(true);
    }

    let pdfFilesPaths = [];
    for (let att of fileAttachments) {
      pdfFilesPaths.push(att.localDownloadPath);
    }
    setPdfFiles(pdfFilesPaths);
  };

  useEffect(() => {
    setIsDocAvailable(route.params?.isFromPresentCredential);
    fetchAttachments();
  }, []);

  const idCredential = useMemo(() => {
    const splitId = currentCredential.data?.id.split("/");
    return splitId[splitId.length - 1];
  }, [currentCredential]);

  const media = useMemo(() => {
    return currentCredential.display?.properties
      ?.map((prop) => {
        const value = formatField(currentCredential.data, prop);
        if (validator.isDataURI(value) || isImgUrl(value)) {
          return {
            label: prop.label,
            value,
          };
        }
      })
      .filter((prop) => prop);
  }, [currentCredential]);

  const [logo, setLogo] = useState({
    width: "50%",
    height: 35,
    opacity: 1,
    enabled: true,
  });

  const deleteCredential = useCallback(async (id) => {
    await credential.remove(id);
    navigation.goBack();
  }, []);

  /*
    const DocumentButton = () => {
        return (
            <TouchableOpacityStyled
                onPress={() => {
                    navigation.navigate('DocumentVisualization', {
                        pdfFiles,
                        hasOneAttachment,
                        attachments,
                        title: currentCredential.display?.title?.fallback
                    })
                }}
            >
                <Container style={{marginBottom: -15}}>
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginLeft: 20}}>
                        <HeaderText
                            style={{
                                fontFamily: 'Manrope-Regular',
                                fontSize: 15,
                                color: buttonColor,
                                marginLeft: 7,
                                alignSelf: 'center',
                            }}
                        >
                            {hasOneAttachment ? attachments[0]?.title : i18n.t('credentialDetailsScreen.viewRelatedDocuments')}
                        </HeaderText>
                    </View>
                    <HeaderText>
                        <ForwardIcon color={buttonColor}/>
                    </HeaderText>
                </Container>
            </TouchableOpacityStyled>
        )
    }
    */

  const Document = ({ attachment, position }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          !isDocAvailable &&
          navigation.navigate("DocumentVisualization", {
            pdfFiles,
            hasOneAttachment,
            attachments,
            position,
            title: currentCredential.display?.title?.fallback,
          })
        }
      >
        <DocumentView>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, flexDirection: "row" }}>
              <MaterialIconsStyled
                name="insert-drive-file"
                size={24}
                color={buttonColor}
              />
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 4,
                  paddingLeft: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: "#505E70",
                    fontFamily: "Manrope-Bold",
                  }}
                >
                  {attachment.title}
                </Text>
              </View>
            </View>
            <HeaderText style={{ marginTop: Platform.OS === "ios" ? 20 : 0 }}>
              <ForwardIcon color="#505E70" />
            </HeaderText>
          </View>
        </DocumentView>
      </TouchableOpacity>
    );
  };

  return (
    <BasicLayout
      title={i18n.t("credentialDetailsScreen.title")}
      contentStyle={{
        paddingTop: 10,
      }}
      backText={false}
      onBack={() => navigation.goBack()}
      setContentHeight={setContentHeight}
    >
      <Popup
        navigation={navigation}
        title={i18n.t("credentialDetailsScreen.remove")}
        description={i18n.t("credentialDetailsScreen.removeMessage")}
        acceptHandler={() => {
          deleteCredential(currentCredential.data.id);
        }}
        declineHandler={() => {
          setDeletePopupVisible(false);
        }}
        visible={deletePopupVisible}
        warning={true}
      />

      <DataWrapper style={{ height: height - 320 }}>
        <CredentialItem
          style={{
            backgroundColor: currentCredential?.styles?.background?.color,
            borderRadius: 15,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* <Brightness style={{ width: '100%', position: 'absolute', top: 25, right: 40, opacity: 0.5 }} amount={0}>
                        <ImageStyled
                            style={{ width: '100%', height: 100 }}
                            source={{ uri: logo.enabled ? currentCredential?.styles?.thumbnail?.uri : 'https://i.ibb.co/Krv9jRg/Quark-ID-iso.png' }}
                        />
                    </Brightness> */}
          <ImageBkgStyled
            imageStyle={{}}
            style={{ width: "100%", alignItems: "center" }}
            source={{ uri: currentCredential?.styles?.hero?.uri }}
          >
            {currentCredential?.styles?.thumbnail?.uri && (
              <ViewStyled
                style={{
                  backgroundColor: "white",
                  borderRadius: 100,
                  height: 40,
                  width: 40,
                  margin: 30,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ImageStyled
                  source={{
                    uri: logo.enabled
                      ? currentCredential?.styles?.thumbnail?.uri
                      : "https://i.ibb.co/Krv9jRg/Quark-ID-iso.png",
                    cache: "force-cache",
                  }}
                  style={{ height: 30, width: 30 }}
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
          </ImageBkgStyled>
        </CredentialItem>

        {/* <CredentialAbstract
                    disabled
                    credential={currentCredential}
                    // style={{
                    //     marginVertical: 10,
                    // }}
                    children={
                        route.params?.remove ? (
                            <TouchableOpacityStyled onPress={() => setDeletePopupVisible(true)}>
                                <IoniconsStyled name="md-trash" size={30} color={transparentize(0.5, styles?.text?.color || 'black')} />
                            </TouchableOpacityStyled>
                        ) : (
                            <></>
                        )
                    }
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        setCredentialHeight(height.toFixed(0));
                    }}
                /> */}
        <Info>
          {/* <Titles
                        onLayout={(event) => {
                            const { height } = event.nativeEvent.layout;
                            setTitlesHeight(height.toFixed(0));
                        }}
                    > */}
          {/* {(currentCredential.data?.issuer?.id || currentCredential?.data?.issuer) && (didVisible ? <Description style={{ fontSize: 12 }}>{currentCredential?.data?.issuer?.id || currentCredential?.data?.issuer}</Description> : <DidSquare underlayColor={theme.color.tertiary} onPress={() => { setDidVisible(true) }}><Description style={{ color: "white" }}>{"did"}</Description></DidSquare>)} */}

          {/* {currentCredential.display?.title && (
                            <Title
                                style={{
                                    color: theme.color.secondary,
                                }}
                            >
                                {formatField(currentCredential.data, currentCredential.display.title)}
                            </Title>
                        )} */}

          {/* {currentCredential.display?.subtitle && <SubTitle>{formatField(currentCredential.data, currentCredential.display.subtitle)}</SubTitle>}

                        {currentCredential.display?.description && (
                            <Description>{formatField(currentCredential.data, currentCredential.display.description)}</Description>
                        )} */}
          {/* </Titles> */}
          <ListWrapper
          // style={{
          //     height: contentHeight - titlesHeight - credentialHeight - 70,
          // }}
          >
            <ListLayout
              showsVerticalScrollIndicator={false}
              data={properties}
              EmptyComponent={() => <></>}
              contentContainerStyle={{
                backgroundColor: "white",
                paddingHorizontal: 0,
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
              }}
              ListHeaderComponent={() => {
                return currentCredential.display?.title ? (
                  <>
                    <HeaderText
                      style={{
                        color: theme.color.secondary,
                        marginHorizontal: 20,
                      }}
                    >
                      {formatField(
                        currentCredential.data,
                        currentCredential.display?.title
                      )}
                    </HeaderText>
                    <Separator
                      style={{ backgroundColor: theme.color.primary }}
                    />
                    {currentCredential?.display?.subtitle && (
                      <HeaderText
                        style={{
                          color: theme.color.secondary,
                          marginHorizontal: 20,
                          fontSize: 15,
                          fontFamily: "Manrope-SemiBold",
                        }}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {formatField(
                          currentCredential.data,
                          currentCredential.display?.subtitle
                        )}
                      </HeaderText>
                    )}
                    <Separator
                      style={{ backgroundColor: theme.color.primary }}
                    />
                    <HeaderText
                      style={{
                        color: theme.color.secondary,
                        marginHorizontal: 20,
                        fontSize: 12,
                        fontFamily: "Manrope-Regular",
                      }}
                      ellipsizeMode="tail"
                    >
                      {formatField(
                        currentCredential.data,
                        currentCredential.display?.description
                      )}
                    </HeaderText>
                    <Separator
                      style={{ backgroundColor: theme.color.primary }}
                    />
                  </>
                ) : (
                  <></>
                );
              }}
              RenderItemComponent={({ item, index }) => {
                return (
                  <Container>
                    <HeaderText
                      style={{
                        fontFamily: "Manrope-Regular",
                        fontSize: 15,
                        color: theme.color.secondary,
                        marginLeft: 20,
                        width: "30%",
                      }}
                      numberOfLines={3}
                    >
                      {item.label}
                    </HeaderText>
                    <HeaderText
                      style={{
                        fontFamily: "Manrope-SemiBold",
                        fontSize: 15,
                        color: theme.color.secondary,
                        width: "55%",
                        textAlign: "right",
                      }}
                      ellipsizeMode="tail"
                      numberOfLines={3}
                    >
                      {item.value}
                    </HeaderText>
                  </Container>
                );
              }}
              ItemSeparatorComponent={() => (
                <Separator style={{ backgroundColor: theme.color.primary }} />
              )}
              ListFooterComponent={() => {
                return (
                  <>
                    <Separator
                      style={{ backgroundColor: theme.color.primary }}
                    />
                    <Container style={{ marginBottom: -15 }}>
                      <HeaderText
                        style={{
                          fontFamily: "Manrope-Regular",
                          fontSize: 15,
                          color: theme.color.secondary,
                          marginLeft: 20,
                          width: "30%",
                          marginBottom: 10,
                        }}
                      >
                        ID
                      </HeaderText>
                      <HeaderText
                        style={{
                          fontFamily: "Manrope-SemiBold",
                          fontSize: 15,
                          marginRight: 20,
                          color: theme.color.secondary,
                          width: "55%",
                          textAlign: "right",
                        }}
                        numberOfLines={3}
                        textAlign="center"
                      >
                        {idCredential}
                      </HeaderText>
                    </Container>

                    {hasAttachments ? (
                      <>
                        {hasOneAttachment ? null : (
                          <View>
                            <Separator
                              style={{ backgroundColor: theme.color.primary }}
                            />
                            <HeaderText
                              style={{
                                fontFamily: "Manrope-SemiBold",
                                fontSize: 18,
                                marginLeft: 20,
                                color: theme.color.secondary,
                                width: "100%",
                                textAlign: "left",
                              }}
                              numberOfLines={3}
                              textAlign="center"
                            >
                              {i18n.t(
                                "credentialDetailsScreen.viewRelatedDocuments"
                              )}
                            </HeaderText>
                            <Separator
                              style={{ backgroundColor: theme.color.primary }}
                            />
                          </View>
                        )}

                        {attachments.map((att, index) => (
                          <View style={{ marginTop: -2 }}>
                            <Separator
                              style={{ backgroundColor: theme.color.primary }}
                            />
                            <Document attachment={att} position={index} />
                          </View>
                        ))}
                      </>
                    ) : null}

                    {media?.map((item, index) => (
                      <ImageItem
                        navigation={navigation}
                        item={item}
                        key={index}
                      />
                    ))}
                  </>
                );
              }}
            />
          </ListWrapper>
          {remove && (
            <TouchableOpacityStyled
              onPress={() => {
                setDeletePopupVisible(true);
              }}
              style={{
                flexDirection: "row",
                marginBottom: 10,
                marginTop: 10,
                height: 20,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme.color.primary,
              }}
            >
              <MaterialIconsStyled name="delete" size={24} color={"black"} />
              <Label>{i18n.t("remove")}</Label>
            </TouchableOpacityStyled>
          )}
        </Info>
      </DataWrapper>
    </BasicLayout>
  );
};

const FlatListStyled = styled(FlatList)``;
const MaterialIconsStyled = styled(MaterialIcons)``;

const TouchableOpacityStyled = styled(TouchableOpacity)``;
const ImageBkgStyled = styled(ImageBackground)``;
const ViewStyled = styled.View``;

const Info = styled.View`
  width: 95%;
`;

const CredentialItem = styled.View``;

const Separator = styled.View`
  width: 100%;
  height: 2px;
`;

const ImageWrapper = styled(TouchableOpacity)`
  border-radius: 10px;
  position: relative;
  margin-top: 8px;
  margin-bottom: 8px;
  width: 100%;
`;

const Titles = styled.View`
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const ListWrapper = styled.View`
  width: 100%;
`;

const DataWrapper = styled.View`
  align-items: center;
  width: 90%;
  padding-top: 15px;
`;

const Container = styled.View`
  flex-direction: row;
  justify-content: space-between;
`;

const Title = styled.Text`
  font-weight: bold;
  font-size: 18px;
  width: 100%;
  margin-bottom: 8px;
`;

const Label = styled.Text`
  font-size: 14px;
  font-weight: bold;
`;

const Value = styled.Text`
  font-size: 13px;
  color: ${lighten(0.2, "black")};
`;

const HeaderText = styled.Text`
  font-size: 20px;
  line-height: 25px;
  padding: 12px 0;
  font-family: Manrope-Bold;
  margin-right: 20px;
`;

const DocumentView = styled.View`
  padding-left: 20px;
`;

const Text = styled.Text`
  font-style: normal;
`;

export default CredentialDetails;
