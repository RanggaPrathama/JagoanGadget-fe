import { Link } from "@tanstack/react-router";
import { UserButton } from "@/components/user/UserButton";

export function CartPage() {
  return (
    <div className="user-section space-y-8">
      <section className="user-container">
        <div className="rounded-[32px] bg-white p-10 text-center">
          <p className="text-[2rem] font-semibold tracking-[-0.06em] text-[var(--user-ink)]">
            Keranjang Anda kosong.
          </p>
          <p className="mt-4 text-[16px] leading-[1.6] tracking-[-0.02em] text-[var(--user-muted)]">
            Katalog produk sedang disiapkan. Silakan kembali lagi nanti.
          </p>
          <Link to="/products" className="mt-6 inline-flex">
            <UserButton>Lanjut Belanja</UserButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
