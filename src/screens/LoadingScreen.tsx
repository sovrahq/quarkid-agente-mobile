import React, { useEffect, useRef } from "react";
import styled, { useTheme } from "styled-components/native";
import { Video, ResizeMode } from "expo-av";

interface LoadingScreenProps {
  onVideoEnd: () => {};
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  onVideoEnd = () => {},
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onVideoEnd();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onVideoEnd]);
  const video = useRef(null);
  const theme = useTheme();

  return (
    <Container style={{ backgroundColor: theme.color.primary }}>
      {/* TODO  */}
      <Video
        ref={video}
        source={require("../assets/animations/loading.mp4")}
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        shouldPlay
        style={{ width: "80%", height: "80%", maxWidth: 600, maxHeight: 600 }}
      />
    </Container>
  );
};
const Container = styled.View`
  position: relative;
  flex: 1;
  justify-content: center;
  align-items: center;
`;

export default LoadingScreen;
