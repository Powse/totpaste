import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { IconCameraOff } from "@tabler/icons-react";
import { CameraDeviceSelector } from "@/components/camera/camera-device-selector";

type CameraScannerProps = {
  onDetect: (data: string) => void;
};
export function CameraScanner({ onDetect }: CameraScannerProps) {
  const devices = useDevices();
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(
    null,
  );

  useEffect(() => {
    if (devices.length > 0) setSelectedDevice(devices[0]);
  }, [devices]);

  const noDevices = !devices || devices.length === 0;

  return (
    <Card className="mt-4 shadow-sm border rounded-2xl">
      <CardHeader>
        {!noDevices && selectedDevice && (
          <CameraDeviceSelector
            devices={devices}
            selected={selectedDevice}
            onSelect={setSelectedDevice}
          />
        )}
      </CardHeader>

      <CardContent className="p-6 pt-0 flex flex-col items-center">
        {!noDevices ? (
          <div className="relative overflow-hidden rounded-xl w-full h-[55vh]">
            <Scanner
              components={{
                onOff: false,
                torch: false,
                zoom: false,
                finder: false,
              }}
              allowMultiple={false}
              formats={["qr_code"]}
              constraints={{
                deviceId: selectedDevice?.deviceId,
                facingMode: "environment",
              }}
              onScan={(results) => {
                if (results.length > 0) onDetect(results[0].rawValue);
              }}
              classNames={{
                container: "w-full h-full rounded-xl",
                video: "w-full h-full rounded-xl",
              }}
            />
            <div
              className="absolute inset-0 border-4  border-gray-100 rounded-xl pointer-events-none"
              style={{ boxShadow: "0 0 0 10000px rgba(0, 0, 0, 0.5)" }}
            />
          </div>
        ) : (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconCameraOff />
              </EmptyMedia>
              <EmptyTitle>No Cameras Found</EmptyTitle>
              <EmptyDescription>
                Check your connection or allow camera access.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>

      {!noDevices && (
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Point your QR code at the camera to scan.
        </CardFooter>
      )}
    </Card>
  );
}
