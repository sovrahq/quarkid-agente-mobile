import React, { useState } from 'react';
import { Dimensions, View, TextInputAndroidProps, TouchableOpacity } from 'react-native';
import Button from '../../components/Button';
import Checkbox from 'expo-checkbox';
import { fontFace, transparentize } from 'polished';
import BasicLayout from '../../components/BasicLayout';
import styled, { useTheme } from 'styled-components/native';
import i18n from '../../locale';
import Pdf from 'react-native-pdf'
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import ForwardIcon from '../../assets/icons/ForwardIcon';
import DownloadError from '../../assets/icons/DownloadError';

const DocumentVisualization = ({ navigation, route }) => {
    const { pdfFiles, hasOneAttachment, attachments, position, title } = route.params;
    const [ pdfError, setPdfError] = useState(false)
    const theme = useTheme();

    const pdfPath = pdfFiles[position];
    const source = {
        uri: `file://${pdfPath}`,
        cache: true
    };

    const downloadAndSharePdf = async () => {
        try {        
            await Sharing.shareAsync(source.uri);
        } catch (error) {
            console.error('Error downloading or sharing the file: ', error);
        }
    };

    const PdfErrorEmptyState = () => (
        <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: 270 }}>
            <Text style={{ textAlign: 'center', fontSize: 20, color: '#404267', fontFamily: 'Manrope-Bold', marginTop: 42 }}>{i18n.t('credentialDetailsScreen.downloadErrorTitle')}</Text>
            <Text style={{ textAlign: 'center', fontSize: 15, color: '#6B6C89', fontFamily: 'Manrope-Regular', marginTop: 16, marginBottom: 100 }}>{i18n.t('credentialDetailsScreen.downloadErrorSubtitle')}</Text>
            <DownloadError
                name="error"
                size={200}
            />
        </View>
    )

    const SingleDocument = () => {
        return(
            <ItemContainer>
                <ItemWrapper style={{height: '80%', width: "100%"}}>
                    <Text style={{ marginLeft: 70, color: '#404267', fontFamily: 'Manrope-Bold', fontSize: 18, marginTop: -43, paddingBottom: 26 }}>
                        {title}
                    </Text>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        {pdfError ? (
                            <PdfErrorEmptyState />
                        ) : (
                            <Pdf
                                trustAllCerts={false}
                                source={source}
                                style={{ flex: 1, width: Dimensions.get('window').width - 50 }}
                                onError={() => setPdfError(true)}
                            />
                        )}
                    </View>
                </ItemWrapper>
                {
                    !pdfError ? (
                        <ButtonWrapper>
                            <Button
                                backgroundColor={"#404267"}
                                color={theme.color.white}
                                style={{
                                    paddingTop: 16,
                                    paddingBottom: 16,
                                    width: (Dimensions.get('window').width - 64),
                                    borderRadius: 50,
                                }}
                                textStyle={{
                                    fontFamily: 'Manrope-Bold',
                                    fontSize: 16,
                                    letterSpacing: 0.32,
                                    lineHeight: 20,
                                }}
                                loading={false}
                                onPress={downloadAndSharePdf}
                            >
                                {i18n.t('credentialDetailsScreen.share')}
                            </Button>
                        </ButtonWrapper>
                    ) : null
                }
            </ItemContainer>
        )
    }

    const DocumentContainer = ({ data }) => {
        return data.map((att, index) => <Document attachment={att} position={index} />)
    }

    const Document = ({ attachment, position }) => {
        return(
            <DocumentView>
                <View
                    style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingBottom: 4,
                    }}>
                        <Text
                            style={{
                                fontSize: 16,
                                color: '#505E70',
                                fontFamily: 'Manrope-Bold',
                            }}>
                                {attachment.title}
                        </Text>
                    <HeaderText>
                        <ForwardIcon color="#505E70" />
                    </HeaderText>
                </View>

                <Text style={{
                    fontSize: 11,
                    color: '#6B6C89',
                    fontFamily: 'Manrope-Regular',
                }}>
                    {attachment.description}
                </Text>
            </DocumentView>
        )
    }

    const CertificatesContainer = () => {
        return (
            <View>
                <Text
                    style={{
                        color: '#007BC7',
                        fontSize: 12,
                        fontFamily: 'Manrope-Bold',
                        paddingBottom: 10,
                    }}>
                    {i18n.t('credentialDetailsScreen.viewRelatedDocuments')}
                </Text>
                <DocumentContainer data={attachments} />
            </View>
        )
    }

    /*
    const MultiDocuments = () => {
        return showPdf ? (
            <SingleDocument />
        ) : (
            <ItemContainer>
                <ItemWrapper style={{height: '80%', width: "100%"}}>
                    <Text
                        style={{
                            marginLeft: 70,
                            color: '#404267',
                            fontFamily: 'Manrope-Bold',
                            fontSize: 18,
                            marginTop: -43,
                            paddingBottom: 26
                        }}
                        >
                            {title}
                    </Text>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        <CertificatesContainerView>
                            <CertificatesContainer />
                        </CertificatesContainerView>
                    </View>
                </ItemWrapper>
            </ItemContainer>
            
        )
    }
    */

    return (
        <BasicLayout            
            onlyTitle
            backText={false}
            onBack={() => navigation.goBack()}
        >
            <SingleDocument />
        </BasicLayout>
    )
}

const ItemContainer = styled.View`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 100%;
    position: relative;
    padding-bottom: 32px;
`;

const ItemWrapper = styled.View`
    margin: 0 30px;
`;

const CertificatesContainerView = styled.View`
    width: 80%;
    background-color: white;
    border-radius: 8px;
    padding: 20px;
`

const DocumentView = styled.View`
    background-color: #D7F1F6;
    border-radius: 8px;
    padding: 16px;
    margin-botom: 10px;
    margin-top: 10px;
`

const ButtonWrapper = styled.View`
`;

const Text = styled.Text`
    font-style: normal;
`;

const HeaderText = styled.Text`
    font-size: 20px;
    line-height: 25px;
    font-family: Manrope-Bold;
`;

export default DocumentVisualization;
