import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Localization from "expo-localization";
import { transparentize } from "polished";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import styled from "styled-components/native";
import { shallow } from "zustand/shallow";
import BasicLayout from "../../components/BasicLayout";
import ListLayout from "../../components/ListLayout";

import { useApplicationStore } from "../../contexts/useApplicationStore";
import i18n from "../../locale";
import { useTheme } from "styled-components/native";
import NotificationList from "../../components/Notifications/NotificationList";
import NotificationItem from "../../components/Notifications/NotificationItem";

const ItemContainer = styled.View`
  position: relative;
`;

const TextStyled = styled.Text``;

const Notifications = ({ navigation }) => {
  const { notifications } = useApplicationStore(
    (state) => ({
      notifications: state.notifications,
    }),
    shallow
  );
  const theme = useTheme();
  const [today, setToday] = useState([]);
  const [lastWeek, setLastWeek] = useState([]);
  const [before, setBefore] = useState([]);

  useEffect(() => {
    if (!notifications.length) {
      setToday([]);
      setLastWeek([]);
      setBefore([]);
    }
    notifications.map((not) => {
      if (new Date(parseInt(not.id)).toDateString == new Date().toDateString) {
        if (!today.includes(not)) {
          setToday([...today, not]);
        }
      } else if (
        new Date(parseInt(not.id)).toDateString >
          new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toDateString &&
        new Date(parseInt(not.id)).toDateString <
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toDateString
      ) {
        if (!lastWeek.includes(not)) {
          setLastWeek([...lastWeek, not]);
        }
      } else {
        if (!before.includes(not)) {
          setBefore([...before, not]);
        }
      }
    });
  }, [notifications]);
  const renderNotificationSection = (data: any, titleKey: string) => {
    return data.length > 0 ? (
      <NotificationList
        data={data}
        titleKey={titleKey}
        notificationItem={NotificationItem}
      />
    ) : null;
  };
  const noNotifications =
    today.length === 0 && lastWeek.length === 0 && before.length === 0;

  return (
    <BasicLayout
      headerStyle={{ width: "100%" }}
      backText={false}
      onBack={() => navigation.goBack()}
    >
      {noNotifications ? (
        <NotificationList />
      ) : (
        <>
          {renderNotificationSection(today, "today")}
          {renderNotificationSection(lastWeek, "lastWeek")}
          {renderNotificationSection(before, "before")}
        </>
      )}
    </BasicLayout>
  );
};

const IoniconsStyled = styled(Ionicons)``;

const Badge = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

const Item = styled.TouchableOpacity`
  width: 100%;
  position: relative;
  padding: 16px 24px;
  border-radius: 12px;
  background: white;
  border: 1px
    ${(props) => (!props.read ? "rgba(0, 138, 161, 0.30)" : "transparent")};
`;

const Title = styled.Text`
  text-align: center;
  font-size: 20px;
  line-height: 25px;
  padding-top: 17px;
  padding-bottom: 32px;
  font-family: Manrope-Bold;
`;

const TitleNotification = styled.Text`
  color: #404267;
  font-size: 14px;
  font-style: normal;
  font-family: Manrope-Medium;
  line-height: 16.1px;
  padding-top: ${(props) => (!props.read ? "8px" : "0px")};
`;

const Body = styled.Text`
  color: #404267;
  font-size: 14px;
  font-style: normal;
  font-family: Manrope-Regular;
  line-height: 16.1px;
  padding-top: 4px;
`;

const NewText = styled.Text`
  color: #008aa1;
  font-size: 13px;
  font-style: normal;
  font-family: Manrope-Regular;
  line-height: 16.25px;
  letter-spacing: 0.39px;
  margin-left: 4px;
`;
const NewDot = styled.View`
  width: 9px;
  height: 9px;
  background-color: #008aa1;
  border-radius: 9px;
`;

const CloseX = styled.TouchableOpacity`
  position: absolute;
  top: -6px;
  right: -2px;
  background: #000;
  padding: 4px 6px;
  border-radius: 5px;
`;

const TextX = styled.Text`
  color: white;
  font-size: 12px;
  line-height: 12px;
`;
const DateTitle = styled.Text`
  color: ${(props) => {
    props.theme.color.font;
  }};
  font-size: 14px;
  font-style: normal;
  font-family: Manrope-Regular;
  line-height: 14px;
  letter-spacing: 0.14px;

  margin-bottom: 10px;
`;
const DateWrap = styled.Text`
  justify-content: flex-start;
  align-items: flex-start;
  width: 100%;
  padding: 0 32px;
`;

export default Notifications;
