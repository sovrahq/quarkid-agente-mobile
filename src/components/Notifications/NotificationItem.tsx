import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useMemo } from "react";
import styled, { useTheme } from "styled-components/native";
import { useApplicationStore } from "../../contexts/useApplicationStore";
import i18n from "../../locale";
import * as Localization from "expo-localization";
import { INotification } from "../../models/notifications";

interface NotificationItemProps {
  item: INotification;
}
const NotificationItem = (props: NotificationItemProps) => {
  const { item } = props;
  const theme = useTheme();
  const navigation = useNavigation<
    NativeStackNavigationProp<{
      Credentials: { credentialId: string };
    }>
  >();
  const { notification, processMessage } = useApplicationStore((state) => ({
    notification: state.notification,
    processMessage: state.processMessage,
  }));

  const issuer = useMemo(() => item?.extra?.issuer, [item?.data?.issuer]);
  const credential = useMemo(
    () => ({
      id: item?.data?.credentialId,
      title: item?.data?.credentialTitle,
    }),
    [item?.data]
  );

  const onPress = useCallback(() => {
    try {
      notification.read(item.id);
      if (item?.extra?.message) {
        processMessage({ message: item.extra.message });
      }
    } catch (error) {
      console.error(error);
    }
  }, [item]);

  const removeItem = (id: string) => {
    try {
      notification.remove(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <StyledView>
      <Item
        read={item.read}
        disabled={item.read}
        activeOpacity={0.5}
        onPress={onPress}
      >
        {!item.read && (
          <Badge>
            <NewDot color={theme.color.tertiary} />
            <NewText color={theme.color.tertiary}>{i18n.t("new")}</NewText>
          </Badge>
        )}
        <TitleNotification read={item.read} numberOfLines={1}>
          {i18n.t(item.title)}
          {credential?.title && " - " + credential.title}
        </TitleNotification>
        <Body numberOfLines={2}>
          {i18n.t(item.body)}
          {item.date &&
            new Date(item.date).toLocaleDateString(
              Localization.locale.slice(0, 2)
            ) + " - "}
          {issuer && " - " + (issuer?.name || issuer?.id || issuer)}
        </Body>
      </Item>
      {item.read && (
        <CloseX
          style={{ backgroundColor: theme.color.secondary }}
          onPress={() => removeItem(item.id)}
        >
          <TextX>{"x"}</TextX>
        </CloseX>
      )}
    </StyledView>
  );
};

export default NotificationItem;
const StyledView = styled.View`
  position: relative;
`;
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
const NewDot = styled.View`
  width: 9px;
  height: 9px;
  background-color: ${(props) => props.color};
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
const NewText = styled.Text`
  color: ${(props) => props.color};
  font-size: 13px;
  font-style: normal;
  font-family: Manrope-Regular;
  line-height: 16.25px;
  letter-spacing: 0.39px;
  margin-left: 4px;
`;
