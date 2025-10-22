import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AccountList } from "@/components/account/account-list";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { AccountDrawer } from "@/components/account/account-drawer";
import { AccountDto } from "@/models/account-dto";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useAccounts } from "@/hooks/use-accounts";
import { handleError } from "@/lib/utils";
import { Account } from "@/models/account";
import { FloatingAddButton } from "@/components/floating-add-button";
import { Spinner } from "@/components/ui/spinner";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useTauriEvent } from "@/context/tauri-event-context";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWindowVisibility } from "@/hooks/use-window-visibility";

function App() {
  const { accounts, refreshAccounts, loading } = useAccounts(handleError);
  const [account, setAccount] = useState<AccountDto | undefined>();
  const [open, setOpen] = useState(false);
  const { lastEvent } = useTauriEvent<string>();
  const isVisible = useWindowVisibility();

  useEffect(() => {
    if (lastEvent) {
      importQrCode(lastEvent.payload);
    }
  }, [lastEvent]);

  async function saveAccount(account: AccountDto) {
    try {
      if (account.id) {
        await invoke("edit_account", {
          id: account.id,
          name: account.name,
          secretB32: account.secret,
        });
        toast.success("Account edited successfully.", {
          id: `edt-${account.id}`,
        });
      } else {
        await invoke("add_account", {
          name: account.name,
          secretB32: account.secret,
        });
        toast.success("Account added successfully.");
      }
      await refreshAccounts();
      setOpen(false);
    } catch (e: unknown) {
      handleError(e);
    }
  }

  async function deleteAccount(account: Account) {
    try {
      await invoke("delete_account", { id: account.id });
      toast.success("Account deleted successfully.", {
        id: `del-${account.id}`,
      });
      await refreshAccounts();
      setOpen(false);
    } catch (e: unknown) {
      handleError(e);
    }
  }

  async function editAccount(account: Account) {
    try {
      const secret = await invoke<string>("get_account_secret", {
        id: account.id,
      });
      setAccount({ id: account.id, name: account.name, secret: secret });
      setOpen(true);
    } catch (e: unknown) {
      handleError(e);
    }
  }

  async function importQrCode(payload: string) {
    try {
      await invoke("import_from_qr_code", { code: payload });
      toast.success("Account(s) imported successfully.", {
        id: `imp-${payload}`,
      });
      await refreshAccounts();
    } catch (e: unknown) {
      handleError(e);
    }
  }

  const onCreateAccountEvent = () => {
    setAccount(undefined);
    setOpen(true);
  };
  const onImportAccountEvent = () => {
    new WebviewWindow("camera", {
      url: "index.html?action=camera",
      title: "camera",
      width: 510,
      height: 730,
      decorations: false,
      resizable: false,
      transparent: true,
      skipTaskbar: false,
      dragDropEnabled: false, //todo: works only on windows
    });
  };
  const onSaveAccount = (account: AccountDto) => {
    saveAccount(account);
  };

  const onEditAccountEvent = (account: Account) => {
    editAccount(account);
  };

  const onDeleteAccountEvent = (account: Account) => {
    deleteAccount(account);
  };

  if (!isVisible) return null;

  if (loading) {
    return (
      <div className="flex justift-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <main className="fixed inset-0 flex flex-col overflow-hidden bg-background">
        <ScrollArea className="flex-1 w-full max-h-full">
          <div className="flex flex-col justify-start items-center p-4">
            <AccountList
              accounts={accounts}
              onCreate={onCreateAccountEvent}
              onDelete={onDeleteAccountEvent}
              onEdit={onEditAccountEvent}
              onImport={onImportAccountEvent}
            />
            <AccountDrawer
              account={account}
              open={open}
              onClose={() => setOpen(false)}
              onSave={onSaveAccount}
            />
          </div>
        </ScrollArea>
        {accounts.length > 0 && (
          <FloatingAddButton
            onCreate={onCreateAccountEvent}
            onImport={onImportAccountEvent}
          />
        )}
      </main>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
