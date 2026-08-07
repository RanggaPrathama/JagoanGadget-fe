import { Link, useParams } from "@tanstack/react-router";
import { PriceDisplay } from "@/components/user/PriceDisplay";
import { UserButton } from "@/components/user/UserButton";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

export function ProductDetailPage() {
  const { slug } = useParams({ from: "/_user/products/$slug" });
  const product = MOCK_PRODUCTS.find((item) => item.slug === slug);

  if (!product) {
    return (
      <div className="user-container user-section">
        <div className="rounded-[32px] bg-white p-10 text-center">
          <p className="text-[2rem] font-semibold tracking-[-0.06em] text-[var(--user-ink)]">
            Produk tidak ditemukan
          </p>
          <p className="mt-4 text-[16px] leading-[1.6] tracking-[-0.02em] text-[var(--user-muted)]">
            Item yang Anda buka sudah tidak tersedia di katalog publik.
          </p>
          <Link to="/products" className="mt-6 inline-flex">
            <UserButton>Lihat Produk Lain</UserButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="user-section">
      <section className="user-container">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[36px] bg-white p-8 sm:p-10">
            <div className="aspect-[4/3] rounded-[28px] bg-[var(--user-canvas)]" />
          </div>

          <div className="rounded-[36px] bg-white p-8 sm:p-10">
            <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--user-muted)]">
              {product.category}
            </p>
            <h1 className="mt-4 max-w-[12ch] text-[clamp(2.8rem,6vw,5rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-[var(--user-ink)]">
              {product.name}
            </h1>
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice}
              className="mt-6"
            />
            <p className="mt-6 text-[17px] leading-[1.7] tracking-[-0.02em] text-[var(--user-muted)]">
              {product.description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <UserButton className="w-full sm:w-auto">Tambah ke Keranjang</UserButton>
              <Link to="/cart" className="inline-flex">
                <UserButton variant="ghost" className="w-full sm:w-auto">
                  Lihat Keranjang
                </UserButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="user-container mt-8">
        <div className="rounded-[36px] bg-white p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--user-muted)]">
                Product Notes
              </p>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.75rem)] font-semibold leading-[0.94] tracking-[-0.08em] text-[var(--user-ink)]">
                Detail informasi tampil lebih tenang dan lebih premium.
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-[24px] bg-[var(--user-canvas)] p-5 text-[15px] leading-[1.6] tracking-[-0.02em] text-[var(--user-ink)]"
                >
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
