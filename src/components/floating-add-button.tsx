import { AnimatePresence, motion } from "framer-motion";
import { CircleFadingPlusIcon, FileKeyIcon, QrCodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type FloatingAddButtonProps = {
  onCreate: () => void;
  onImport: () => void;
};

export function FloatingAddButton({
  onCreate,
  onImport,
}: FloatingAddButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm z-10"
          />
        )}
      </AnimatePresence>
      <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-2 z-20">
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    onImport();
                  }}
                >
                  <QrCodeIcon /> Scan QR Code
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2, delay: 0.08 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    onCreate();
                  }}
                >
                  <FileKeyIcon /> Add manually
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <Button variant="outline" size="icon" onClick={() => setOpen(!open)}>
          <CircleFadingPlusIcon />
        </Button>
      </div>
    </>
  );
}
