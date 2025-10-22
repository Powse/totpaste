import { createContext, useContext, useEffect, useRef, useState } from "react";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface TauriEvent<T = unknown> {
  event: string;
  payload: T;
}

interface TauriEventContextValue<T = unknown> {
  lastEvent?: TauriEvent<T>;
}

const TauriEventContext = createContext<TauriEventContextValue | undefined>(
  undefined,
);

interface ProviderProps {
  children: React.ReactNode;
  event: string;
}

export function TauriEventProvider<T = unknown>({
  children,
  event,
}: ProviderProps) {
  const [lastEvent, setLastEvent] = useState<TauriEvent<T>>();
  const unlistenFn = useRef<UnlistenFn | null>();

  useEffect(() => {
    const setupListeners = async () => {
      let unlisten: UnlistenFn;
      try {
        unlisten = await listen<T>(event, (e) => {
          setLastEvent({ event: e.event, payload: e.payload });
        });

        unlistenFn.current = unlisten;
      } catch (err) {
        console.error("Failed to register Tauri listeners:", err);
      }
    };

    setupListeners();

    return () => {
      if (unlistenFn.current) {
        unlistenFn.current();
        unlistenFn.current = null;
      }
    };
  }, [event]);

  return (
    <TauriEventContext.Provider value={{ lastEvent }}>
      {children}
    </TauriEventContext.Provider>
  );
}

export function useTauriEvent<T = unknown>() {
  const ctx = useContext(TauriEventContext) as
    | TauriEventContextValue<T>
    | undefined;
  if (!ctx)
    throw new Error("useTauriEvent must be used within a TauriEventProvider");
  return ctx;
}
