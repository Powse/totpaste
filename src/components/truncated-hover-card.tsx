import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { useRef, useState, useEffect } from "react";

type TruncatedHoverCardProps = {
  text: string;
};

export function TruncatedHoverCard({ text }: TruncatedHoverCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div ref={ref} className="text-sm text-muted-foreground w-42 truncate">
          {text}
        </div>
      </HoverCardTrigger>
      {isTruncated && (
        <HoverCardContent className="break-all">{text}</HoverCardContent>
      )}
    </HoverCard>
  );
}
