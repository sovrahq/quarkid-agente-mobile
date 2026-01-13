import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import styled, { css } from 'styled-components/native';
import config from '../config/styles';

const BottomLine = () => {
    return (
        <>
            {config.features?.bottomBarColors && (
                <>
                    {config.features?.bottomBarColors.length > 1 ? (
                        <GradientLine colors={config.features?.bottomBarColors} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} />
                    ) : (
                        <Line color={config.features.bottomBarColors[0]} />
                    )}
                </>
            )}
        </>
    );
};

const lineStyle = css`
    position: absolute;
    height: 4px;
    width: 100%;
    bottom: 0;
`;

const GradientLine = styled(LinearGradient)`
    ${lineStyle}
`;

const Line = styled.View`
    background-color: ${(props) => props.color};
    ${lineStyle}
`;

export default BottomLine;
