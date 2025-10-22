import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type CameraDeviceSelectorProps = {
  devices: MediaDeviceInfo[];
  selected: MediaDeviceInfo;
  onSelect: (device: MediaDeviceInfo) => void;
};

export function CameraDeviceSelector({
  devices,
  selected,
  onSelect,
}: CameraDeviceSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Change device</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={selected.deviceId}
          onValueChange={(id) => {
            const found = devices.find((d) => d.deviceId === id);
            if (found) onSelect(found);
          }}
        >
          {devices.map((device) => (
            <DropdownMenuRadioItem
              key={device.deviceId}
              value={device.deviceId}
            >
              {device.label || `Camera ${device.deviceId}`}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
