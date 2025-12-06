import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useExpenseNotifications } from '../hooks/useExpenseNotifications';

interface NotificationContextType {
  expenseNotifications: number;
  totalNotifications: number;
  notificationCounts: Record<string, number>;
  markReceiptAsSeen: (expenseId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { unseenReceiptsCount, markReceiptAsSeen } = useExpenseNotifications();

  const notificationCounts = {
    'project-expenses': unseenReceiptsCount,
    // Add more notification types here in the future (tasks, etc.)
  };

  const totalNotifications = Object.values(notificationCounts).reduce((sum, count) => sum + count, 0);

  return (
    <NotificationContext.Provider
      value={{
        expenseNotifications: unseenReceiptsCount,
        totalNotifications,
        notificationCounts,
        markReceiptAsSeen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Return default values instead of throwing error for better UX
    return {
      expenseNotifications: 0,
      totalNotifications: 0,
      notificationCounts: {},
      markReceiptAsSeen: () => {},
    };
  }
  return context;
};
