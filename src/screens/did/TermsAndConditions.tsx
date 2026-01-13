import React, { useState, useEffect } from 'react';
import { Dimensions, View } from 'react-native';
import Button from '../../components/Button';
import Checkbox from 'expo-checkbox';
import { transparentize } from 'polished';
import BasicLayout from '../../components/BasicLayout';
import styled, { useTheme } from 'styled-components/native';
import { useApplicationStore } from '../../contexts/useApplicationStore';
import i18n from '../../locale';

const TermsAndConditions = ({ navigation, route }) => {
    const [definitions, setDefinitions] = useState([])
    const theme = useTheme();
    const [ accepted, setAccepted ] = useState(false)
    // const { tyc } = useApplicationStore((state) => ({ tyc: state.tyc }));
    const tyc = useApplicationStore((state) => (state.tyc));
    const onAccept = () => {
        tyc.accept()
    };

    useEffect(() => {
        const defs = []
        for (let index = 0; index < 13; index++) {
            defs.push({
                "name": i18n.t(`termsAndConditions.definitions.${index}.name`),
                "meaning": i18n.t(`termsAndConditions.definitions.${index}.meaning`)
            })
        }
        setDefinitions(defs)
    }, [])

    return (
        <BasicLayout            
            onlyTitle
            backText={false}
            onBack={() => navigation.goBack()}
        >
            <ItemContainer>
                <ItemWrapper style={{height: route.params?.hideButtons ? '100%' : '80%'}}>
                    <Text style={{ marginTop: 10, marginBottom: 10, marginLeft: 10, color: '#6B6C89'  }}>
                        {i18n.t('termsAndConditions.termsAndConditions')}
                    </Text>
                    {!route.params?.hideButtons && 
                        <SnackBar>
                            <Text>
                                {i18n.t('termsAndConditions.snackbar')}
                            </Text>
                        </SnackBar>
                    }
                    <TextWrapper>
                        <Text style={{ textTransform: 'uppercase', marginTop: 0 }}>
                            {i18n.t('termsAndConditions.title1')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text1')}
                        </Text>

                        <Text style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {i18n.t('termsAndConditions.title2')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text2')}
                        </Text>

                        <Text style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {i18n.t('termsAndConditions.title3')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text3')}
                        </Text>
                        {definitions.map(def => (
                            <Text style={{marginTop: 20}}>
                                <Text style={{fontWeight: 'bold'}}>{def.name}</Text>{def.meaning}
                            </Text>
                        ))}

                        <Text style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {i18n.t('termsAndConditions.title4')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text4')}
                        </Text>
                        <Text style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {i18n.t('termsAndConditions.title5')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text5')}
                        </Text>
                        <Text style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {i18n.t('termsAndConditions.title6')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text6')}
                        </Text>
                        <Text style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {i18n.t('termsAndConditions.title7')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text7')}
                        </Text>
                        <Text style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {i18n.t('termsAndConditions.title8')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text8')}
                        </Text>
                        <Text style={{ textTransform: 'uppercase', marginTop: 20 }}>
                            {i18n.t('termsAndConditions.title9')}
                        </Text>
                        <Text>
                            {i18n.t('termsAndConditions.text9')}
                        </Text>

                    </TextWrapper>
                </ItemWrapper>
                {!route.params?.hideButtons && <ButtonWrapper>
                    <FooterContainer
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <Checkbox
                            value={accepted}
                            color={'#404267'}
                            onValueChange={() => setAccepted(!accepted)}
                            style={{
                                marginTop: 10,
                                marginRight: 20,
                                marginBottom: 25,
                                padding: 10,
                                borderColor: transparentize(0.8, '#7BD1E0'),
                            }}
                        />
                        <TextContainer>
                            <Text>{i18n.t('termsAndConditions.accept')}</Text>
                            <Text>{i18n.t('termsAndConditions.accept2')}</Text>
                        </TextContainer>
                    </FooterContainer>
                    <Button
                        backgroundColor={"#404267"}
                        color={theme.color.white}
                        style={{
                            paddingTop: 16,
                            paddingBottom: 16,
                            width: (Dimensions.get('window').width - 64),
                            borderRadius: 50
                        }}
                        textStyle={{
                            fontFamily: 'Manrope-Bold',
                            fontSize: 16,
                            letterSpacing: 0.32,
                            lineHeight: 20
                        }}
                        loading={false}
                        onPress={onAccept}
                        disabled={!accepted}
                    >
                        {i18n.t('termsAndConditions.create')}
                    </Button>
                </ButtonWrapper>}
            </ItemContainer>
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

const ButtonWrapper = styled.View`
`;

const TouchableOpacityStyled = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
    flex-direction: row;
    margin-top: 10px;
`;

const SnackBar = styled.View`
    background-color: #7BD1E0;
    border-radius: 4px;
    padding: 20px;
`;

const Text = styled.Text`
    text-align: left;
    font-size: 16px;
    font-family: Manrope-Medium;
    line-height: 20px;
    letter-spacing: 0.32px;
`;

const TextStyled = styled.Text`
    text-align: center;
    font-size: 16px;
    font-family: Manrope-Medium;
    line-height: 20px;
    letter-spacing: 0.32px;
    text-decoration-line: underline;
`;

const FooterContainer = styled.View`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-top: 30px;
`;

const TextContainer = styled.View`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
`;

const TextWrapper = styled.ScrollView`
`;

export default TermsAndConditions;
