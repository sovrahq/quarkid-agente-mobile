import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import ConfirmDid from "../screens/did/Confirm";
import TermsAndConditions from "../screens/did/TermsAndConditions";
import CameraAccessScreen from "../screens/main/CameraAccessScreen";
import DocumentVisualization from "../screens/main/DocumentVisualization";
import CreateDid from "../screens/did/create";
import AcceptCredentials from "../screens/main/AcceptCredentials";
import AddCredential from "../screens/main/AddCredential";
import AddEntity from "../screens/main/AddEntity";
import Configuration from "../screens/main/Configuration";
import CredentialDetails from "../screens/main/CredentialDetails";
import Credentials from "../screens/main/Credentials";
import EntityDetails from "../screens/main/EntityDetails";
import Notifications from "../screens/main/Notifications";
import PresentCredentials from "../screens/main/PresentCredentials";
import Scan from "../screens/main/Scan";
import Settings from "../screens/main/Settings";
import VerificationResult from "../screens/main/VerificationResult";
import ConfirmPin from "../screens/pin/Confirm";
import CreatePin from "../screens/pin/Create";
import TutorialPin from "../screens/pin/Tutorial";
import TabStack from "./TabStack";
import ExportKeys from "../screens/main/ExportKeys";
import ShareDID from "../screens/main/ShareDID";
import ResetApp from "../screens/main/Reset";
import FAQ from "../screens/main/FAQ";
import ImageDetails from "../screens/main/ImageDetails";
import PDFDetails from "../screens/main/PDFDetails";
import Authenticate from "../components/Authenticate";
import LoadingScreen from "../screens/LoadingScreen";
import DidcommHandlerScreen from "../screens/main/DidcommHandlerScreen";
import ExportCredentials from "../screens/main/ExportCredentials";
import ImportCredentials from "../screens/main/ImportCredentials";

const PinStack = ({ pendingOob, setPendingOob }) => {
  console.log("🌟 RENDER PINSTACK")
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={"TutorialPin"} component={TutorialPin} />
      <Stack.Screen name={"CreatePin"} component={CreatePin} />
      <Stack.Screen name={"ConfirmPin"}>
        {props => <ConfirmPin {...props} pendingOob={pendingOob} setPendingOob={setPendingOob} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

const DidStack = () => {
  const Stack = createNativeStackNavigator();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        options={{ animation: "none" }}
        name={"CreateDid"}
        component={CreateDid}
      />
      <Stack.Screen
        options={{ animation: "none" }}
        name={"TermsAndConditions"}
        component={TermsAndConditions}
      />
      <Stack.Screen
        options={{ animation: "none" }}
        name={"ConfirmDid"}
        component={ConfirmDid}
      />
    </Stack.Navigator>
  );
};

const MainStack = () => {
  const Stack = createNativeStackNavigator();
  console.log("🌟 RENDER MAINSTACK")
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={"TabStack"} component={TabStack} />
      <Stack.Screen name={"Scan"} component={Scan} />
      <Stack.Screen name={"Configuration"} component={Configuration} />
      <Stack.Screen name={"AddEntity"} component={AddEntity} />
      <Stack.Screen name={"Credentials"} component={Credentials} />
      <Stack.Screen name={"CredentialDetails"} component={CredentialDetails} />
      <Stack.Screen
        name={"DocumentVisualization"}
        component={DocumentVisualization}
      />
      <Stack.Screen name={"AddCredential"} component={AddCredential} /> 
      <Stack.Screen name={"EntityDetails"} component={EntityDetails} />
      <Stack.Screen
        name={"AcceptCredentials"}
        component={AcceptCredentials}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={"PresentCredentials"}
        component={PresentCredentials}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={"VerificationResult"}
        component={VerificationResult}
      />
      <Stack.Screen name={"Settings"} component={Settings} />
      {/* <Stack.Screen name={"Notifications"} component={Notifications} /> */}
      <Stack.Screen name={"ExportKeys"} component={ExportKeys} />
      <Stack.Screen name={"ExportCredentials"} component={ExportCredentials} />
      <Stack.Screen name={"ImportCredentials"} component={ImportCredentials} />
      <Stack.Screen name={"ShareDID"} component={ShareDID} />
      <Stack.Screen name={"ResetApp"} component={ResetApp} />
      <Stack.Screen name={"FAQ"} component={FAQ} />
      <Stack.Screen
        name={"CameraAccessScreen"}
        component={CameraAccessScreen}
      />
      <Stack.Screen name={"ImageDetails"} component={ImageDetails} />
      <Stack.Screen name={"PDFDetails"} component={PDFDetails} />
    </Stack.Navigator>
  );
};


const RootStack = ({ pendingOob, setPendingOob }) => {
  console.log("🌟 RENDER ROOTSTACK")
  const Stack = createNativeStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={"Loading"} component={LoadingScreen} />
      <Stack.Screen name={"PinStack"}>
        {props => <PinStack {...props} pendingOob={pendingOob} setPendingOob={setPendingOob} />}
      </Stack.Screen>
      <Stack.Screen name={"Authenticate"} component={Authenticate} />
      <Stack.Screen
        name={"TermsAndConditions"}
        component={TermsAndConditions}
      />
      <Stack.Screen
        name={"CameraAccessScreen"}
        component={CameraAccessScreen}
      />
      <Stack.Screen name={"DidcommHandlerScreen"} component={DidcommHandlerScreen} />
      <Stack.Screen name={"DidStack"} component={DidStack} />
      <Stack.Screen name={"MainStack"} component={MainStack} />
    </Stack.Navigator>
  );
};

export default RootStack;
