/** A warehouse record returned by the API. */
export type WarehouseItem = {
  id: string;
  /** Unique warehouse code (max 50 chars). */
  code: string;
  /** Display name (max 150 chars). */
  name: string;
  /** Optional street address; null when not provided. */
  address: string | null;
  /** Whether the warehouse is active/selectable. */
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/** Payload accepted by create/update warehouse endpoints. */
export type WarehousePayload = {
  code: string;
  name: string;
  address?: string | null;
  isActive?: boolean;
};
