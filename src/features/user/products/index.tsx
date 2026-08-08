import { UserSectionHeadline } from "@/components/user/UserSectionHeadline";

const categories = [
  "Semua",
  "Laptop",
  "Audio",
  "Wearable",
  "Tablet",
  "Accessories",
  "Monitor",
];

export function ProductsPage() {
  return (
    <div className="user-section space-y-8">
      <section className="user-container">
        <UserSectionHeadline
          eyebrow="Product Library"
          body="Daftar produk publik sekarang terasa satu language dengan landing dan auth: lebih lapang, lebih tenang, dan mudah discan."
          align="left"
        >
          Semua produk dalam satu grid yang lebih rapi.
        </UserSectionHeadline>
      </section>

      <section className="user-container">
        <div className="rounded-[32px] bg-white p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="rounded-full border border-border/60 bg-[var(--user-canvas)] px-5 py-3 text-sm text-muted-foreground">
              Pencarian produk akan tersedia setelah katalog dihubungkan ke backend.
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <span
                  key={category}
                  className="rounded-full px-4 py-2 text-[14px] font-medium tracking-[-0.02em] text-muted-foreground"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="user-container">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-[14px] tracking-[-0.02em] text-[var(--user-muted)]">
            0 produk ditemukan
          </p>
        </div>

        <div className="rounded-[28px] bg-white p-10 text-center">
          <p className="text-[18px] font-medium tracking-[-0.03em] text-[var(--user-ink)]">
            Tidak ada produk yang cocok.
          </p>
          <p className="mt-3 text-[15px] leading-[1.6] tracking-[-0.02em] text-[var(--user-muted)]">
            Katalog produk sedang disiapkan. Silakan kembali lagi nanti.
          </p>
        </div>
      </section>
    </div>
  );
}
