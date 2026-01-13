import React, { FC, useState } from "react";
import { CSSProperties } from "styled-components";
import keys from "../utils/keys";
import styled, { useTheme } from "styled-components/native";
interface NumberPadProps {
  maxLength?: number;
  value: string;
  setValue: (value: string) => void;
  fingerPrint?: boolean;
  authenticate?: () => void;
  style?: CSSProperties;
}

const NumberPad: FC<NumberPadProps> = ({
  maxLength = 10,
  value,
  setValue,
  fingerPrint = false,
  authenticate,
  style,
}) => {
  const [width, setWidth] = useState(0);
  const theme = useTheme();
  // Reorganizar las teclas en filas
  const rows = [
    keys.slice(0, 3), // 1 2 3
    keys.slice(3, 6), // 4 5 6
    keys.slice(6, 9), // 7 8 9
    [keys[9], keys[10], keys[11]], // fingerprint, 0, delete
  ];

  return (
    <KeysWrapper style={style}>
      {rows.map((row, rowIdx) => (
        <Row key={rowIdx}>
          {row.map((key, colIdx) => {
            if (!key) return <KeyContainer key={colIdx} />; // espacio vacío si key es undefined
            return (
              <KeyContainer key={colIdx}>
                <KeyWrapper
                  disabled={
                    typeof key === "object" &&
                    key.type === "finger-print" &&
                    !fingerPrint
                  }
                  onPress={() => {
                    typeof key === "string"
                      ? value.length < maxLength
                        ? setValue(value + key)
                        : null
                      : key.type === "delete"
                      ? setValue(value.slice(0, value.length - 1))
                      : fingerPrint
                      ? authenticate()
                      : null;
                  }}
                >
                  {typeof key === "string" ? (
                    <KeyText style={{ color: theme.color.secondary }}>
                      {key}
                    </KeyText>
                  ) : key.type !== "finger-print" || fingerPrint ? (
                    key.content
                  ) : null}
                </KeyWrapper>
              </KeyContainer>
            );
          })}
        </Row>
      ))}
    </KeysWrapper>
  );
};

const KeysWrapper = styled.View`
  width: 90%;
`;

const Row = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
`;

interface KeyWrapperProps {
  disabled: boolean;
}

const KeyWrapper = styled.TouchableOpacity<KeyWrapperProps>`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  border-radius: 5px;
`;

const KeyContainer = styled.TouchableOpacity`
  position: relative;
  padding: 1%;
  width: 33%;
  height: 48px;
  margin-bottom: 40px;
`;

const KeyText = styled.Text`
  text-align: center;
  font-size: 32px;
  font-family: RobotoMono-Regular;
`;

export default NumberPad;
