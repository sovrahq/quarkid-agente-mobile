import { lighten, transparentize } from "polished";
import { ActivityIndicator } from "react-native";
import { FC, ReactNode } from "react";
import styled from "styled-components/native";
import { TextStyle, StyleProp } from "react-native";

interface ButtonProps {
  onPress: () => void;
  backgroundColor?: string;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  textStyle?: StyleProp<TextStyle>;
  style?: any;
}

const Button: FC<ButtonProps> = ({
  onPress,
  backgroundColor = "#38A1FF",
  color = "white",
  disabled = false,
  loading = false,
  children,
  textStyle,
  style,
  ...otherProps
}) => {
  return (
    <Container
      onPress={onPress}
      backgroundColor={
        disabled || loading
          ? transparentize(0.5, backgroundColor)
          : backgroundColor
      }
      disabled={disabled || loading}
      style={style}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicatorStyled color={transparentize(0.2, color)} />
      ) : (
        <Text
          color={disabled ? transparentize(0.2, color) : color}
          style={textStyle}
        >
          {children}
        </Text>
      )}
    </Container>
  );
};

interface ContainerProps {
  backgroundColor: string;
}

const Container = styled.TouchableOpacity<ContainerProps>`
  padding: 10px;
  border-radius: 5px;
  width: 100%;
  position: relative;
  align-items: center;
  justify-content: center;
  background-color: ${(props: ContainerProps) => props.backgroundColor};
`;

const ActivityIndicatorStyled = styled(ActivityIndicator)``;

interface TextProps {
  color: string;
}
const Text = styled.Text<TextProps>`
  color: ${(props: TextProps) => props.color};
`;

export default Button;
