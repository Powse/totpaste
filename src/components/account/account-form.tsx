import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AccountDto } from "@/models/account-dto";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

type AccountFormProps = {
  account?: AccountDto;
  onSave: (account: AccountDto) => void;
  className?: string;
};

const accountSchema = z.object({
  name: z.string().min(1, "Account name is required"),
  secret: z
    .string()
    .min(16, "Secret must be at least 16 characters long")
    .regex(/^[A-Z2-7]+=*$/, "Secret must be base32 encoded (A-Z, 2-7)"),
});

type AccountFormValues = z.infer<typeof accountSchema>;

export function AccountForm({ account, onSave, className }: AccountFormProps) {
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name ?? "",
      secret: account?.secret ?? "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = (values: AccountFormValues) => {
    onSave({ id: account?.id, ...values });
  };

  return (
    <form
      id="account-form"
      className={cn("grid items-start gap-6", className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={form.control}
        name="name"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="name">Account</FieldLabel>
            <Input id="name" placeholder="Account name" {...field} />
            <FieldDescription>
              Enter a label or identifier for this account.
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={form.control}
        name="secret"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="secret">Secret</FieldLabel>
            <Input
              id="secret"
              placeholder="One-time password secret"
              {...field}
            />
            <FieldDescription>
              Must be a Base32 string (A–Z, 2–7).
            </FieldDescription>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button type="submit" form="account-form" disabled={isSubmitting}>
        Save changes
      </Button>
    </form>
  );
}
