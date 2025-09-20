export interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'daily';
  nextBillingDate: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Vault {
  id: string;
  name: string;
  description?: string;
  subscriptions: Subscription[];
  totalAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  isRead: boolean;
  createdAt: string;
}

export type RootStackParamList = {
  login: undefined;
  dashboard: undefined;
  vaultDetail: { vaultId: string };
  addSubscription: { vaultId?: string };
  notifications: undefined;
  settings: undefined;
};
