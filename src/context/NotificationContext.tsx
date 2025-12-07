import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useExpenseNotifications } from '../hooks/useExpenseNotifications';
import { useTaskNotifications } from '../hooks/useTaskNotifications';

interface NotificationContextType {
  expenseNotifications: number;
  taskNotifications: number;
  totalNotifications: number;
  notificationCounts: Record<string, number>;
  markReceiptAsSeen: (expenseId: string) => Promise<void>;
  markTaskAsSeen: (taskId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { unseenReceiptsCount, markReceiptAsSeen } = useExpenseNotifications();
  const { unseenTasksCount, markTaskAsSeen } = useTaskNotifications();

  const notificationCounts = {
    'project-expenses': unseenReceiptsCount,
    'my-tasks': unseenTasksCount,
  };

  const totalNotifications = Object.values(notificationCounts).reduce((sum, count) => sum + count, 0);

  return (
    <NotificationContext.Provider
      value={{
        expenseNotifications: unseenReceiptsCount,
        taskNotifications: unseenTasksCount,
        totalNotifications,
        notificationCounts,
        markReceiptAsSeen,
        markTaskAsSeen,
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
      taskNotifications: 0,
      totalNotifications: 0,
      notificationCounts: {},
      markReceiptAsSeen: async () => {},
      markTaskAsSeen: async () => {},
    };
  }
  return context;
};
