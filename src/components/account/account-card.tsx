import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { CircularProgress } from "@/components/circular-progress";
import { getTimeLeft, handleError } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { toast } from "sonner";
import { TruncatedHoverCard } from "@/components/truncated-hover-card";
interface AccountCardProps {
  id: string;
  name: string;
  code: string;
  expiresAt: number;
  onEdit: () => void;
  onDelete: () => void;
}

const STEP = 30;

export function AccountCard({
  name,
  code,
  expiresAt,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(expiresAt, Date.now()));
  useEffect(() => {
    let timeout: number;

    const tick = () => {
      const now = Date.now();
      const newTimeLeft = getTimeLeft(expiresAt, now);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft > 0) {
        const nextTick = 1000 - (now % 1000);
        timeout = setTimeout(tick, nextTick);
      }
    };

    tick();

    return () => clearTimeout(timeout);
  }, [expiresAt]);

  const elapsed = STEP - timeLeft;
  const progressPercent = Math.min(100, Math.max(0, (elapsed / STEP) * 100));

  const copyAccountCodeToClipboard = async () => {
    try {
      await writeText(code);
      toast.success("Code copied to clipboard!", { id: code });
    } catch (e: unknown) {
      handleError(e);
    }
  };

  return (
    <Card
      className="w-72 rounded-2xl border shadow-sm py-1 pt-0 gap-0 select-none hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
      onClick={copyAccountCodeToClipboard}
    >
      <div className="flex justify-end pb-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="z-50">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4 text-destructive" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="flex items-center justify-between p-4 pt-0">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={code}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-3xl tracking-widest"
            >
              {code}
            </motion.div>
          </AnimatePresence>
          <TruncatedHoverCard text={name} />
        </div>
        <CircularProgress
          value={progressPercent}
          size={85}
          strokeWidth={10}
          showLabel
          labelClassName="text-xl font-bold"
          renderLabel={() => `${timeLeft}s`}
        />
      </CardContent>
    </Card>
  );
}
