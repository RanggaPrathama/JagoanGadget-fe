import { Check, X } from "lucide-react";

export function PasswordStrengthIndicator({ password }: { password: string }) {
  const rules = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /[0-9]/.test(password) },
    {
      label: "Contains special character (e.g., @, #, !)",
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
  return (
    <div className="mt-2 space-y-1.5 rounded-lg border border-border/50 bg-background/50 p-3">
      <p className="text-xs font-medium text-muted-foreground mb-2">
        Kekuatan Password:
      </p>
      {rules.map((rule, idx) => (
        <div key={idx} className="flex items-center gap-2 text-xs">
          {rule.met ? (
            <Check className="size-3.5 text-green-500" />
          ) : (
            <X className="size-3.5 text-red-500/70" />
          )}
          <span
            className={rule.met ? "text-green-500" : "text-muted-foreground/70"}
          >
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}
