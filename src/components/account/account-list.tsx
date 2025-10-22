import { Account } from "@/models/account";
import { AccountCard } from "@/components/account/account-card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { IconKeyOff } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
<p></p>;
type AccountListProps = {
  accounts?: Account[];
  onCreate: () => void;
  onImport: () => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
};
export function AccountList({
  accounts,
  onCreate,
  onImport,
  onEdit,
  onDelete,
}: AccountListProps) {
  if (accounts && accounts.length > 0) {
    return (
      <div className="p-4 space-y-1">
        <AnimatePresence>
          {accounts.map((acc) => (
            <motion.div
              key={acc.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
            >
              <AccountCard
                key={acc.id}
                id={acc.id}
                name={acc.name}
                code={acc.code}
                expiresAt={acc.expires_at}
                onEdit={() => onEdit(acc)}
                onDelete={() => onDelete(acc)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconKeyOff />
        </EmptyMedia>
        <EmptyTitle>No Accounts</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t added any accounts yet. Get started by adding your
          first account.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={onCreate}>Add account</Button>
          <Button variant="outline" onClick={onImport}>
            Import account
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
