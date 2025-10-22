import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleError(e: unknown) {
  const randomId = `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  if (typeof e === "string") {
    toast.error(e, { id: randomId });
  } else if (e instanceof Error) {
    toast.error(e.message, { id: randomId });
  } else {
    toast.error("Unexpected error");
  }
}

export function getTimeLeft(expiresAt: number, now: number) {
  return Math.max(0, Math.ceil((expiresAt * 1000 - now) / 1000));
}
