import { transparentize } from 'polished';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled, { useTheme } from 'styled-components/native';
import BasicLayout from '../../components/BasicLayout';
import Button from '../../components/Button';

import i18n from '../../locale';

const AddEntity = ({ navigation }) => {
    const theme = useTheme();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');

    const isValidUrl = (string) => {
        if (string.match(/^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/)) {
            return true;
        } else {
            Alert.alert(i18n.t('addEntityScreen.invalidUrl'), i18n.t('addEntityScreen.invalidUrl'));
            return false;
        }
    };

    // const add = async () => {
    //     if (isValidUrl(url)) {
    //         await ArrayStorageInstance.set(StorageEnum.ENTITIES, [
    //             ...entities,
    //             {
    //                 name,
    //                 subtitle: description,
    //                 url,
    //             },
    //         ]);
    //         navigation.navigate('Entities');
    //     }
    // };

    return (
        <BasicLayout
            title={i18n.t('addEntityScreen.title')}
            contentStyle={{
                paddingTop: 10,
            }}
            onlyTitle
            bottomTab={false}
            onBack={() => navigation.goBack()}
        >
            <Wrapper>
                <Title>{i18n.t('addEntityScreen.name')}</Title>
                <TextInputCustom editable maxLength={50} onChangeText={(text) => setName(text)} value={name} />
                <Title>{i18n.t('addEntityScreen.description')}</Title>
                <TextInputCustom editable maxLength={50} onChangeText={(text) => setDescription(text)} value={description} />
                <Title>{i18n.t('addEntityScreen.url')}</Title>
                <TextInputCustom editable maxLength={50} onChangeText={(text) => setUrl(text)} value={url} keyboardType="url" autoCapitalize="none" />
                <Button
                    onPress={add}
                    style={{
                        width: '80%',
                        marginTop: 20,
                    }}
                    backgroundColor={theme.color.secondary}
                    disabled={name === '' || description === '' || url === ''}
                >
                    {i18n.t('addEntityScreen.add')}
                </Button>
            </Wrapper>
        </BasicLayout>
    );
};

const Wrapper = styled.View`
    width: 90%;
    align-items: center;
`;

const Title = styled.Text`
    width: 100%;
`;

const TextInputCustom = styled.TextInput`
    padding: 10px;
    border: solid 1px ${transparentize(0.8, '#000')};
    border-radius: 5px;
    width: 100%;
    margin-top: 5px;
    margin-bottom: 10px;
`;

export default AddEntity;
