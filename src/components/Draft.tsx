import { Entypo } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import { transparentize } from 'polished';
import React, { FC, ReactNode } from 'react';

import styled, { useTheme } from 'styled-components/native';
import i18n from '../locale';
import { ContainerLayout, Layout } from '../styled-components/Layouts';

interface DraftProps {
    title?: string;
    navigation?: NavigationProp<any>;
    setHeight?: (height: number) => void;
    children?: ReactNode;
    color?: string;
    backgroundColor?: string;
}

const Draft: FC<DraftProps> = ({ title, navigation, setHeight, children, ...props }) => {
    const theme = useTheme();
    return (
        <Layout
            backgroundColor={theme.color.primary}
            style={{
                padding: 0,
            }}
        >
            <ContainerLayout
                style={{
                    alignItems: 'center',
                    width: '100%',
                }}
                {...props}
            >
                <Wrapper
                    onLayout={(event) => {
                        const { height } = event.nativeEvent.layout;
                        setHeight && setHeight(height.toFixed(0));
                    }}
                >
                    {title && <Title style={{ ...theme.font.title }}>{title}</Title>}
                    {navigation && (
                        <BackWrapper
                            onPress={() => {
                                navigation && navigation.goBack();
                            }}
                        >
                            <EntypoStyled name="chevron-left" size={25} color={transparentize(0.4, theme.color.font)} />
                            <BackText>{i18n.t('back')}</BackText>
                        </BackWrapper>
                    )}
                </Wrapper>
                {children}
            </ContainerLayout>
        </Layout>
    );
};

const EntypoStyled = styled(Entypo)``;

const Wrapper = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 95%;
    padding: 10px;
`;

const BackWrapper = styled.TouchableOpacity`
    flex-direction: row;
    align-items: center;
    transform: translateX(-8px);
    color: ${(props) => transparentize(0.5, props.theme.color.font)};
`;

const BackText = styled.Text`
    font-size: 14px;
    color: ${(props) => transparentize(0.4, props.theme.color.font)};
`;

const Title = styled.Text`
    font-weight: bold;
    color: ${(props) => transparentize(0.5, props.theme.color.font)};
`;

export default Draft;
