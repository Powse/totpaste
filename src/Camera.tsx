import {
  getAllWebviewWindows,
  getCurrentWebviewWindow,
} from "@tauri-apps/api/webviewWindow";
import { emit } from "@tauri-apps/api/event";
import { ThemeProvider } from "@/components/theme-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallback } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prepareZXingModule } from "barcode-detector/ponyfill";
import { Toaster } from "@/components/ui/sonner";
import { CameraScanner } from "@/components/camera/camera-scanner";
import { FileScanner } from "@/components/camera/file-scanner";

prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => {
      if (path.endsWith(".wasm")) {
        return `/wasm/${path}`;
      }
      return prefix + path;
    },
  },
});

export default function Camera() {
  const exit = useCallback(async () => {
    const mainWindow = (await getAllWebviewWindows()).find(
      (x) => x.label === "main",
    );
    mainWindow?.show();
    mainWindow?.setFocus();
    getCurrentWebviewWindow().close();
  }, []);

  const handleDetect = useCallback(
    async (data: string) => {
      await emit("data", data);
      await exit();
    },
    [exit],
  );
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <main
        style={{ WebkitAppRegion: "drag" } as any}
        className="flex justify-center min-h-screen p-6 pt-8 bg-background"
      >
        <Button
          onClick={exit}
          style={{ WebkitAppRegion: "no-drag" } as any}
          variant="link"
          size="sm"
          className="absolute top-0 right-0 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Close"
        >
          <X className="h-1 w-1" />
        </Button>
        <div
          style={{ WebkitAppRegion: "no-drag" } as any}
          className="w-full max-w-2xl"
        >
          <Tabs defaultValue="camera" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-background">
              <TabsTrigger
                className="data-[state=active]:border-border data-[state=active]:shadow-none"
                value="camera"
              >
                Camera
              </TabsTrigger>
              <TabsTrigger
                className="data-[state=active]:border-border data-[state=active]:shadow-none"
                value="file"
              >
                From File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="camera">
              <CameraScanner onDetect={handleDetect} />
            </TabsContent>

            <TabsContent value="file">
              <FileScanner onDetect={handleDetect} />
            </TabsContent>
          </Tabs>
        </div>
        <Toaster />
      </main>
    </ThemeProvider>
  );
}
