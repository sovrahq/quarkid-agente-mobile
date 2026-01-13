type Issuer = {
  id: string;
  name: string;
};
interface NotificationExtra {
  issuer?: Issuer;
  message?: any;
}
export interface INotification {
  type: any;
  id: string;
  title: string;
  body: string;
  data?: any;
  read?: boolean;
  extra?: NotificationExtra;
  date?: string;
}
