import { Link } from "@tanstack/react-router";
import { UserButton } from "@/components/user/UserButton";

export function ProductDetailPage() {
  return (
    <div className="user-container user-section">
      <div className="rounded-[32px] bg-white p-10 text-center">
        <p className="text-[2rem] font-semibold tracking-[-0.06em] text-[var(--user-ink)]">
          Produk tidak ditemukan
        </p>
        <p className="mt-4 text-[16px] leading-[1.6] tracking-[-0.02em] text-[var(--user-muted)]">
          Katalog produk sedang disiapkan. Produk yang Anda cari belum tersedia.
        </p>
        <Link to="/products" className="mt-6 inline-flex">
          <UserButton>Lihat Produk Lain</UserButton>
        </Link>
      </div>
    </div>
  );
}
