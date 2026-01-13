import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useCallback, useEffect, useMemo } from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { CopilotStep, CopilotProvider, walkthroughable, useCopilot } from "react-native-copilot";
import styled, { useTheme } from "styled-components/native";
import { shallow } from "zustand/shallow";
import { useApplicationStore } from "../contexts/useApplicationStore";
import i18n from "../locale";
import Credentials from "../screens/main/Credentials";
import WalletIcon from "../assets/icons/WalletIcon";
import NotificationsIcon from "../assets/icons/NotificationsIcon";
import SettingsIcon from "../assets/icons/SettingsIcon";
import ScanIcon from "../assets/icons/ScanIcon";
import Notifications from "../screens/main/Notifications";
import Settings from "../screens/main/Settings";
import ExportKeys from "../screens/main/ExportKeys";
import ShareDID from "../screens/main/ShareDID";
import ResetApp from "../screens/main/Reset";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FAQ from "../screens/main/FAQ";
import { StateType } from "../models";

const TabWrapper = styled.View`
  justify-content: center;
  align-items: center;
  position: relative;
`;

// const CopilotWrapper = walkthroughable(TabWrapper);

const Tab = createBottomTabNavigator();
const ButtonScreen = () => null;

const SettingsStack = createNativeStackNavigator();

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen
        name="SettingsMain"
        component={Settings}
        options={{ headerShown: false }}
      />
      <SettingsStack.Screen name="ExportKeys" component={ExportKeys} />
      <SettingsStack.Screen name="ShareDID" component={ShareDID} />
      <SettingsStack.Screen name="ResetApp" component={ResetApp} />
      <SettingsStack.Screen name="FAQ" component={FAQ} />
    </SettingsStack.Navigator>
  );
}


const TabStack = (props) => {
  const theme = useTheme();
  const state = useApplicationStore((state) => state.state);
  const insets = useSafeAreaInsets();
  // const tutorial = useApplicationStore((state) => state.tutorial);
  // const notifications = useApplicationStore((state) => state.notifications, shallow);
  
  // const { start, events: copilotEvents } = useCopilot();

  // const notificationsCount = useMemo(
  //   () => notifications.filter((notification) => !notification.read).length,
  //   [notifications]
  // );

  useEffect(() => {
    // async function startTutorial() {
    //   if (state !== StateType.UNAUTHENTICATED && (await tutorial.get())) {
    //     setTimeout(() => {
    //       start();
    //     }, 500);
    //   }
    // }
    // startTutorial();
    console.log("🌟 TABSTACK STATE CHANGE:", state);
  }, [state]);

  // const finishTutorial = useCallback(async () => {
  //   tutorial.skip();
  // }, []);

  // useEffect(() => {
  //   copilotEvents.on("stop", finishTutorial);
  //   return () => {
  //     copilotEvents.off("stop", finishTutorial);
  //   };
  // }, []);

  return (
    <Tab.Navigator
      // initialRouteName="Credentials"
      initialRouteName="Credentials"
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: theme.color.secondary,
        tabBarActiveTintColor: "#FFF",
        tabBarStyle: {
          paddingBottom: Math.max(Platform.OS === "android" ? 10 : 15, insets.bottom),
          paddingTop: Platform.OS === "android" ? 8 : 15,
          height: Platform.OS === "android" ? 65 + insets.bottom : 80,
          bottom: Platform.OS === "android" ? 0 : 25,
          backgroundColor: theme.color.primary,
          shadowOpacity: 0, // iOS Shadow
          shadowRadius: 0, // iOS Shadow
          shadowOffset: { height: 0, width: 0 }, // iOS Shadow
          elevation: 0, // Android Shadow
          borderTopWidth: 0, // Potential line at the top of the tabBar
          position: "relative",
          paddingHorizontal: 0,
          width: "100%",
        },
      }}
    >
      <Tab.Screen
        name="ScanButton"
        component={ButtonScreen}
        options={({ navigation }) => ({
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (

                <TouchableOpacity
                  onPress={() => navigation.navigate("Scan")}
                  activeOpacity={0.5}
                >
                  <TabWrap
                    style={{
                      backgroundColor:
                        color === "#FFF"
                          ? theme.color.secondary
                          : theme.color.primary,
                    }}
                  >
                    <ScanIcon name="scan" size={size} color={color} />
                  </TabWrap>
                </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="Credentials"
        component={Credentials}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
                <TabWrap
                  style={{
                    backgroundColor:
                      color === "#FFF"
                        ? theme.color.secondary
                        : theme.color.primary,
                  }}
                >
                  <WalletIcon name="credentials" size={size} color={color} />
                </TabWrap>
          ),
        }}
      />
      {/* <Tab.Screen
        name="Notificaitons"
        component={Notifications}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (

                <TabWrap
                  style={{
                    backgroundColor:
                      color === "#FFF"
                        ? theme.color.secondary
                        : theme.color.primary,
                  }}
                >
                  <NotificationsIcon
                    name="notifications"
                    size={size}
                    color={color}
                  />
                  {notificationsCount > 0 && (
                    <NotificationCircle
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 8,
                        backgroundColor:
                          color === "#FFF"
                            ? theme.color.primary
                            : theme.color.secondary,
                        borderRadius: 10,
                        width: 10,
                        height: 10,
                        justifyContent: "center",
                        alignItem: "center",
                      }}
                    />
                  )}
                </TabWrap>
          ),
        }}
      /> */}
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: ({ color, size }) => (
  
                <TabWrap
                  style={{
                    backgroundColor:
                      color === "#FFF"
                        ? theme.color.secondary
                        : theme.color.primary,
                    borderRadius: 12,
                  }}
                >
                  <SettingsIcon name="settings" size={size} color={color} />
                </TabWrap>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const NotificationCircle = styled.View``;
const TouchableOpacityStyled = styled.TouchableOpacity``;

const TabText = styled.Text`
  font-size: 12px;
  color: ${(props) => props.color};
`;

const TabWrap = styled.View`
  width: 60px;
  height: 60px;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`;
const ToolTipText = styled.Text`
  font-size: 12px;
  font-family: Manrope-Bold;
  color: ${(props) => props.color};
`;
const ToolTipButtons = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 5px;
`;

// const ToolTip = (props) => {
//   const theme = useTheme();
//   return (
//     <NotificationCircle
//       style={{
//         justifyContent: "center",
//         alignItems: "center",
//         width: 190,
//       }}
//     >
//       <TabText
//         style={{
//           fontSize: 15,
//           textAlign: "center",
//           padding: 10,
//           width: "100%",
//         }}
//         color={theme.color.secondary}
//       >
//         {props.currentStep.name}
//       </TabText>
//       <TabText
//         style={{
//           fontSize: 12,
//           textAlign: "center",
//           width: "100%",
//         }}
//         color={theme.color.font}
//       >
//         {props.currentStep.text}
//       </TabText>
//       <ToolTipButtons style={{ padding: 20 }}>
//         {!props.isLastStep && (
//           <TouchableOpacityStyled
//             onPress={props.handleStop}
//             style={{
//               paddingHorizontal: 15,
//               padding: 10,
//               marginHorizontal: 10,
//               borderRadius: 25,
//               alignItems: "center",
//             }}
//           >
//             <ToolTipText color={theme.color.font}>
//               {props.labels.skip}
//             </ToolTipText>
//           </TouchableOpacityStyled>
//         )}
//         {!props.isLastStep ? (
//           <TouchableOpacityStyled
//             onPress={props.handleNext}
//             style={{
//               paddingHorizontal: 15,
//               padding: 10,

//               backgroundColor: theme.color.secondary,
//               borderRadius: 25,
//               alignItems: "center",
//             }}
//           >
//             <ToolTipText color={theme.color.primary}>
//               {props.labels.next}
//             </ToolTipText>
//           </TouchableOpacityStyled>
//         ) : (
//           <TouchableOpacityStyled
//             onPress={props.handleStop}
//             style={{
//               paddingHorizontal: 15,
//               padding: 10,
//               marginHorizontal: 10,
//               backgroundColor: theme.color.secondary,
//               borderRadius: 25,
//               alignItems: "center",
//             }}
//           >
//             <ToolTipText color={theme.color.primary}>
//               {props.labels.finish}
//             </ToolTipText>
//           </TouchableOpacityStyled>
//         )}
//       </ToolTipButtons>
//     </NotificationCircle>
//   );
// };

// const CopilotTabStack = (props) => (
//   <CopilotProvider
//     tooltipStyle={{ borderRadius: 15 }}
//     tooltipComponent={ToolTip}
//     labels={{
//       previous: i18n.t("previous"),
//       next: i18n.t("next"),
//       skip: i18n.t("skip"),
//       finish: i18n.t("done"),
//     }}
//     androidStatusBarVisible={Platform.OS === "ios" ? false : true}
//     stepNumberComponent={() => null}
//   >
//     <TabStack {...props} />
//   </CopilotProvider>
// );

export default TabStack;