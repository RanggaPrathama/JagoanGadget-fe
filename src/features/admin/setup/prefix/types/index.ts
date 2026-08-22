export type PrefixType = "sequence" | "day" | "month" | "year" | "text";

export type PrefixItem = {
  id: string;
  name: string;
  value: string;
  type: PrefixType;
  isActive: boolean;
};

export type PrefixPayload = {
  name: string;
  value: string;
  type: PrefixType;
};

export type PrefixDialogMode = "create" | "edit" | "readonly" | "closed";
