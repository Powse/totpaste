import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AccountForm } from "@/components/account/account-form";
import { Button } from "@/components/ui/button";
import { AccountDto } from "@/models/account-dto";
import { useEffect, useRef } from "react";

type AccountDrawerProps = {
  account?: AccountDto;
  open: boolean;
  onClose: () => void;
  onSave: (account: AccountDto) => void;
};

export function AccountDrawer({
  account,
  open,
  onClose,
  onSave,
}: AccountDrawerProps) {
  const saveTimeout = useRef<number | null>(null);

  const debouncedOnSave = (data: AccountDto) => {
    if (saveTimeout.current) return;
    onSave(data);
    saveTimeout.current = setTimeout(() => {
      saveTimeout.current = null;
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{account ? "Edit account" : "Add account"}</DrawerTitle>
          <DrawerDescription>
            <>
              {(account
                ? "Make changes to your account here."
                : "Create a new account here.") +
                "Click save when you're done."}
            </>
          </DrawerDescription>
        </DrawerHeader>
        <AccountForm
          account={account}
          onSave={debouncedOnSave}
          className="px-4"
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
