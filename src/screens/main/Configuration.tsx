import React, { FC, useMemo } from 'react';

import { NavigationProp, RouteProp } from '@react-navigation/native';
import { transparentize } from 'polished';
import styled from 'styled-components/native';
import BasicLayout from '../../components/BasicLayout';
import agentConfig from '../../config/agent';
import i18n from '../../locale';

interface ConfigurationProps {
    navigation: NavigationProp<any>;
    route: RouteProp<any, any>;
}

const Configuration: FC<ConfigurationProps> = ({ navigation }) => {
    const items = useMemo(
        () => [
            {
                title: 'Decentralized Web Node',
                body: agentConfig.dwnUrl,
            },
            {
                title: 'Modena DID Resolver',
                body: agentConfig.universalResolverUrl,
            },
        ],
        []
    );
    return (
        <BasicLayout title={i18n.t('configurationScreen.title')} onlyTitle bottomTab={false} onBack={() => navigation.goBack()}>
            <Container>
                {items.map((item, index) => (
                    <Item key={index}>
                        {index !== 0 && <Separator />}
                        <TextWrapper>
                            <Title>{item.title}</Title>
                            <Body>{item.body}</Body>
                        </TextWrapper>
                    </Item>
                ))}
            </Container>
        </BasicLayout>
    );
};

const Separator = styled.View`
    height: 1px;
    background-color: #e5e5e5;
    width: 90%;
    margin-bottom: 10px;
`;

const Item = styled.View`
    width: 100%;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
`;
const TextWrapper = styled.View`
    width: 95%;
    padding: 0 10px;
`;

const Title = styled.Text`
    font-size: 14px;
    color: ${(props) => props.theme.color.secondary};
`;

const Body = styled.Text`
    font-size: 14px;
    color: ${transparentize(0.4, 'black')};
`;

const Container = styled.View`
    padding-top: 15px;
    width: 100%;
`;

export default Configuration;
