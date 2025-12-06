import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/useAuth';

export const useExpenseNotifications = () => {
  const { currentUser } = useAuth();
  const [unseenReceiptsCount, setUnseenReceiptsCount] = useState(0);

  const calculateUnseenReceipts = async () => {
    if (!currentUser) {
      setUnseenReceiptsCount(0);
      return;
    }

    try {
      // Get seen receipt IDs from localStorage
      const seenKey = `seen_receipts_${currentUser.id}`;
      const seenReceiptsStr = localStorage.getItem(seenKey);
      const seenReceipts: string[] = seenReceiptsStr ? JSON.parse(seenReceiptsStr) : [];

      // Fetch paid expenses submitted by current user that have receipts
      const { data, error } = await supabase
        .from('project_expenses')
        .select('id, receipt_drive_link')
        .eq('submitted_by', currentUser.id)
        .eq('status', 'paid')
        .not('receipt_drive_link', 'is', null);

      if (error) throw error;

      // Filter out seen receipts
      const unseenReceipts = (data || []).filter(
        expense => !seenReceipts.includes(expense.id)
      );

      setUnseenReceiptsCount(unseenReceipts.length);
    } catch (error) {
      console.error('Error calculating unseen receipts:', error);
      setUnseenReceiptsCount(0);
    }
  };

  const markReceiptAsSeen = (expenseId: string) => {
    if (!currentUser) return;

    const seenKey = `seen_receipts_${currentUser.id}`;
    const seenReceiptsStr = localStorage.getItem(seenKey);
    const seenReceipts: string[] = seenReceiptsStr ? JSON.parse(seenReceiptsStr) : [];

    if (!seenReceipts.includes(expenseId)) {
      seenReceipts.push(expenseId);
      localStorage.setItem(seenKey, JSON.stringify(seenReceipts));
      setUnseenReceiptsCount(prev => Math.max(0, prev - 1));
    }
  };

  useEffect(() => {
    if (currentUser) {
      calculateUnseenReceipts();

      // Set up real-time subscription for new paid expenses
      const subscription = supabase
        .channel('expense_receipts')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'project_expenses',
            filter: `submitted_by=eq.${currentUser.id}`,
          },
          (payload) => {
            const newExpense = payload.new as any;
            // Only recalculate if expense was just marked as paid with a receipt
            if (newExpense.status === 'paid' && newExpense.receipt_drive_link) {
              calculateUnseenReceipts();
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser]);

  return { unseenReceiptsCount, markReceiptAsSeen, refreshCount: calculateUnseenReceipts };
};
