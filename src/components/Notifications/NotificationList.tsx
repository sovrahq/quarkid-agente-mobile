import React, { ReactElement } from "react";
import ListLayout from "../ListLayout";
import i18n from "../../locale";
import styled from "styled-components/native";

import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "styled-components/native";

interface NotificationListProps {
  data?: any[];
  titleKey?: string;
  notificationItem?: React.ComponentType<any>;
}
const NotificationList = (props: NotificationListProps) => {
  const { data, titleKey, notificationItem } = props;
  const theme = useTheme();

  return (
    <ListLayout
      title={i18n.t("notificationsScreen.title")}
      data={data}
      RenderItemComponent={notificationItem}
      ListHeaderComponent={() =>
        titleKey ? (
          <DateTitle theme={theme}>{i18n.t(titleKey)}</DateTitle>
        ) : null
      }
      contentContainerStyle={{ paddingBottom: 30, paddingTop: 8 }}
      EmptyComponent={() => (
        <LinearGradient
          style={{
            height: "60%",
            width: "90%",
            borderRadius: 25,
            justifyContent: "center",
            alignItems: "center",
            top: 50,
            position: "absolute",
          }}
          colors={[theme.color.primary, theme.color.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <ViewStyled
            style={{
              height: "99%",
              width: "99%",
              backgroundColor: theme.color.primary,
              borderRadius: 25,
              flexDirection: "column",
            }}
          >
            {/* <ViewStyled style={{ borderRadius: 100, justifyContent: 'center', alignItems: 'center', padding: 10, backgroundColor: theme.color.secondary, marginBottom: 10 }}>
                                    <ScanIcon name="scan" size={18} color={theme.color.primary} />
                                </ViewStyled> */}
            <EmptyText color={theme.color.font}>
              {i18n.t("notificationsScreen.empty")}
            </EmptyText>
          </ViewStyled>
        </LinearGradient>
      )}
    />
  );
};

export default NotificationList;
const EmptyText = styled.Text`
  color: ${(props) => props.color};
  text-align: center;
  font-size: 20px;
  width: 65%;
`;
const ViewStyled = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
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
  width: 100%;
  margin-bottom: 10px;
`;
