/** Single brand row returned by the API. */
export type BrandItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Payload sent to create/update a brand. `logoUrl` holds a tempKey when newly uploaded, or a committed URL. */
export type BrandPayload = {
  name: string;
  logoUrl: string | null;
};

/** Dialog visibility state for the brand form modal. */
export type BrandDialogMode = "create" | "edit" | "readonly" | "closed";
