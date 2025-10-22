import { useEffect, useRef, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Account } from "@/models/account";

export function useAccounts(handleError: (e: unknown) => void) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef<number | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const result: Account[] = await invoke("get_all_accounts", {});
      setAccounts(result);
      setLoading(false);
      return result;
    } catch (e: unknown) {
      handleError(e);
      return [];
    }
  }, [handleError]);

  const scheduleNextUpdate = useCallback(
    async (data?: Account[]) => {
      const accountsData = data ?? (await fetchAccounts());
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      if (accountsData.length === 0) return;

      const now = Date.now() / 1000;
      const nextExpire = Math.min(...accountsData.map((a) => a.expires_at));
      const msUntilNext = Math.max(0, (nextExpire - now) * 1000 + 500);

      timeoutRef.current = setTimeout(() => {
        scheduleNextUpdate();
      }, msUntilNext);
    },
    [fetchAccounts],
  );

  useEffect(() => {
    scheduleNextUpdate();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [scheduleNextUpdate]);

  const refresh = useCallback(async () => {
    const data = await fetchAccounts();
    scheduleNextUpdate(data);
  }, [fetchAccounts, scheduleNextUpdate]);

  return { accounts, refreshAccounts: refresh, loading };
}
