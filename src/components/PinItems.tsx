import { transparentize } from "polished";
import React, { FC, useCallback, useEffect, useMemo } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { CSSProperties } from "styled-components";
import styled from "styled-components/native";

interface PinItemsProps {
  length: number;
  value: string;
  color: string;
  textColor?: string;
  error?: boolean;
  style?: CSSProperties;
}

const PinItems: FC<PinItemsProps> = ({
  length,
  value,
  color,
  textColor = "white",
  error,
  ...otherProps
}) => {
  const shake = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX:
            shake.value === 0 ? 0 : Math.sin(shake.value * Math.PI * 4) * 10,
        },
      ],
    };
  }, [shake]);

  const createPinItems = useCallback(() => {
    let items = [];
    for (let i = 0; i < length; i++) {
      items.push(
        <PinItem
          key={i}
          active={value.length > i}
          color={error ? "red" : color}
        />
      );
    }
    return items;
  }, [length, value, color, error]);

  useEffect(() => {
    if (error) {
      shake.value = 0;
      shake.value = withSpring(1, { damping: 2, stiffness: 80 }, () => {
        shake.value = withSpring(0);
      });
    }
  }, [error, shake]);

  return (
    <PinWrapper {...otherProps}>
      <AnimatedViewStyled style={animatedStyle}>
        <PinItemsWrapper>{createPinItems()}</PinItemsWrapper>
      </AnimatedViewStyled>
    </PinWrapper>
  );
};

const AnimatedViewStyled = styled(Animated.View)``;

const PinWrapper = styled.View``;

const PinItemsWrapper = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

const PinText = styled.Text`
  color: ${(props) => transparentize(0.5, props.theme.color.font)};
  text-align: center;
  margin-top: 5px;
`;

interface PinItemProps {
  active: boolean;
  color: string;
}
const PinItem = styled.View<PinItemProps>`
  height: 16px;
  width: 16px;
  border-radius: 16px;
  background-color: ${(props: PinItemProps) =>
    props.active
      ? transparentize(0, props.color)
      : transparentize(0.8, props.color)};
  margin: 10px;
  transition: 0.1s ease-in-out;
`;

export default PinItems;
