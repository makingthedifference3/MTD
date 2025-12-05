import { useEffect, useRef, useState } from 'react';

type PendingEntityType = 'partner' | 'toll' | 'project';

interface PendingDeleteAction {
  key: string;
  entityId: string;
  entityType: PendingEntityType;
  label: string;
  expiresAt: number;
}

const buildKey = (entityType: PendingEntityType, entityId: string) => `${entityType}:${entityId}`;

export const useDelayedUndoAction = (delayMs = 10000) => {
  const [pendingActions, setPendingActions] = useState<PendingDeleteAction[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const actionRef = useRef<Record<string, () => Promise<void>>>({});
  const [, tick] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = window.setInterval(() => {
      tick((prev) => prev + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const scheduleAction = (
    entityType: PendingEntityType,
    entityId: string,
    label: string,
    action: () => Promise<void>
  ) => {
    const key = buildKey(entityType, entityId);
    if (timersRef.current[key]) {
      return key;
    }

    const expiresAt = Date.now() + delayMs;
    actionRef.current[key] = action;

    const timer = window.setTimeout(async () => {
      try {
        await actionRef.current[key]?.();
      } catch (error) {
        console.error('Delayed action failed', error);
      } finally {
        setPendingActions((prev) => prev.filter((entry) => entry.key !== key));
        delete timersRef.current[key];
        delete actionRef.current[key];
      }
    }, delayMs);

    timersRef.current[key] = timer;
    setPendingActions((prev) => [...prev, { key, entityId, entityType, label, expiresAt }]);

    return key;
  };

  const undoAction = (key: string) => {
    const timer = timersRef.current[key];
    if (timer) {
      window.clearTimeout(timer);
      delete timersRef.current[key];
    }
    delete actionRef.current[key];
    setPendingActions((prev) => prev.filter((entry) => entry.key !== key));
  };

  const isPending = (entityType: PendingEntityType, entityId: string) => {
    const key = buildKey(entityType, entityId);
    return Boolean(timersRef.current[key]);
  };

  return {
    pendingActions,
    scheduleAction,
    undoAction,
    isPending,
  };
};
