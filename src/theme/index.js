import config from "../config/styles";

const commonStyles = {
  font: {
    title: {
      fontSize: 20,
      fontWeight: "bold",
    },
    subtitle: {
      fontSize: 16,
    },
    text: {
      fontSize: 14,
    },
  },
  images: {
    logo: require("../assets/logo.png"),
    logoSmall: require("../assets/small-logo.png") || null,
  },
  steps: config.steps,
  introduction: config.introduction,
  statusBar: config.style.statusBar || "light-content",
  introductionResizeMode: config.style.introductionResizeMode || "contain",
  introductionType: config.style.introductionType || "default",
};

export const theme = {
  light: {
    ...commonStyles,
    color: {
      primary: config.style.primaryColor,
      secondary: config.style.secondaryColor,
      tertiary: config.style.tertiaryColor,
      font: config.style.fontColor || "white",
      footer: config.style.footerColor || "black",
      black: "black",
      white: "white",
    },
  },
  dark: {
    ...commonStyles,
    color: {
      primary: config.style.primaryColor,
      secondary: config.style.secondaryColor,
      tertiary: config.style.tertiaryColor,
      font: config.style.fontColor || "white",
      footer: config.style.footerColor || "black",
      black: "black",
      white: "white",
    },
  },
};
