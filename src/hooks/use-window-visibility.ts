import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export function useWindowVisibility() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const appWindow = getCurrentWebviewWindow();
    const focusUnlisten = appWindow.listen("tauri://focus", () =>
      setVisible(true),
    );
    const blurUnlisten = appWindow.listen("tauri://blur", () =>
      setVisible(false),
    );
    const checkVisibility = async () => {
      try {
        const isVisible = await appWindow.isVisible();
        setVisible(isVisible);
      } catch (e) {
        console.error("Failed to check window visibility", e);
      }
    };

    checkVisibility();
    return () => {
      focusUnlisten.then((u) => u());
      blurUnlisten.then((u) => u());
    };
  }, []);

  return visible;
}
