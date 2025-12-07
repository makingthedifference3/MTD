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
      // Fetch paid expenses submitted by current user that have receipts
      const { data: expenses, error: expensesError } = await supabase
        .from('project_expenses')
        .select('id, receipt_drive_link')
        .eq('submitted_by', currentUser.id)
        .eq('status', 'paid')
        .not('receipt_drive_link', 'is', null);

      if (expensesError) throw expensesError;

      if (!expenses || expenses.length === 0) {
        setUnseenReceiptsCount(0);
        return;
      }

      // Fetch viewed receipts from database
      const { data: viewedReceipts, error: viewsError } = await supabase
        .from('receipt_views')
        .select('expense_id')
        .eq('user_id', currentUser.id);

      if (viewsError) throw viewsError;

      // Create a set of viewed expense IDs for quick lookup
      const viewedExpenseIds = new Set(
        (viewedReceipts || []).map(view => view.expense_id)
      );

      // Filter out viewed receipts
      const unseenReceipts = expenses.filter(
        expense => !viewedExpenseIds.has(expense.id)
      );

      setUnseenReceiptsCount(unseenReceipts.length);
    } catch (error) {
      console.error('Error calculating unseen receipts:', error);
      setUnseenReceiptsCount(0);
    }
  };

  const markReceiptAsSeen = async (expenseId: string) => {
    if (!currentUser) {
      console.warn('Cannot mark receipt as seen: No current user');
      return;
    }

    console.log('Marking receipt as seen:', { expenseId, userId: currentUser.id });

    try {
      // Insert receipt view into database (upsert to handle duplicates)
      const { data, error } = await supabase
        .from('receipt_views')
        .upsert(
          {
            user_id: currentUser.id,
            expense_id: expenseId,
            viewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,expense_id',
            ignoreDuplicates: false,
          }
        )
        .select();

      if (error) {
        console.error('Error marking receipt as seen:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return;
      }

      console.log('Receipt marked as seen successfully:', data);

      // Update local count immediately for better UX
      setUnseenReceiptsCount(prev => Math.max(0, prev - 1));
      
      // Recalculate to ensure accuracy
      await calculateUnseenReceipts();
    } catch (error) {
      console.error('Exception marking receipt as seen:', error);
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
