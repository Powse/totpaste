import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ImageIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { BarcodeDetector } from "barcode-detector/ponyfill";
import { handleError } from "@/lib/utils";
import { useState, DragEvent } from "react";

type FileScannerProps = {
  onDetect: (data: string) => void;
};

export function FileScanner({ onDetect }: FileScannerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const processFile = async (file: File) => {
    if (!file) return;

    try {
      const imageBitmap = await createImageBitmap(file);
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const barcodes = await detector.detect(imageBitmap);

      if (barcodes.length > 0) {
        onDetect(barcodes[0].rawValue);
      } else {
        toast.error("No QR codes detected!");
      }
    } catch (err) {
      handleError(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith("image/")) processFile(file);
    else toast.error("Please drop a valid image file.");
  };

  return (
    <Card className="mt-4 shadow-sm border rounded-2xl">
      <CardContent className="p-6 flex flex-col items-center justify-center text-center gap-4">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          className={`w-full border-2 border-dashed rounded-xl p-10 transition-colors cursor-pointer flex flex-col items-center justify-center ${
            isDragging
              ? "border-green-500 bg-green-50 dark:bg-green-950/40"
              : "border-muted-foreground/30 hover:border-foreground/50"
          }`}
        >
          <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Drag & Drop an image here
          </p>
          <p className="text-xs text-muted-foreground">or</p>
          <Button asChild className="mt-2">
            <Label htmlFor="file-upload" className="cursor-pointer">
              Choose File
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </Label>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <UploadIcon className="w-4 h-4" />
        <span>Upload or drop an image containing a QR code</span>
      </CardFooter>
    </Card>
  );
}
