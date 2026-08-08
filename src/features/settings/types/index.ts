export type NotificationPreferences = {
  /** Selalu aktif & terkunci — pembaruan status pesanan, sandi, keamanan. */
  accountActivity: boolean;
  /** Khusus staff/admin — downtime, laporan mingguan, aktivitas operasional. */
  systemUpdates: boolean;
  /** Khusus customer — diskon, produk baru, event eksklusif. */
  promos: boolean;
};

/**
 * Payload untuk update profil diri sendiri.
 * Email TIDAK diizinkan berubah dari halaman ini.
 * Real API: PUT /me/update-profile → { name, phoneNumber, avatarTempKey }
 */
export type UpdateMyProfilePayload = {
  name: string;
  phoneNumber: string | null;
  avatarTempKey: string | null;
};
