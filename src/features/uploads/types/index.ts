export type UploadPurpose = "avatar" | "document" | "brands" ;

export type PresignResponse = {
  uploadUrl: string;
  token: string;
  expiresAt: number;
  purpose: UploadPurpose;
};

export type UploadTempResult = {
  tempKey: string;
  filename: string;
  mimeType: string;
  size: number;
};
