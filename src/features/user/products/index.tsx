import { useState } from "react";
import { ProductCard } from "@/components/user/ProductCard";
import { ProductGrid } from "@/components/user/ProductGrid";
import { UserInput } from "@/components/user/UserInput";
import { UserSectionHeadline } from "@/components/user/UserSectionHeadline";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";

export function ProductsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const normalizedQuery = query.trim().toLowerCase();

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchCategory =
      activeCategory === "all" ||
      product.category.toLowerCase() === activeCategory;

    const matchQuery =
      normalizedQuery.length === 0 ||
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description.toLowerCase().includes(normalizedQuery);

    return matchCategory && matchQuery;
  });

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
            <UserInput
              label="Search"
              placeholder="Cari nama produk atau deskripsi"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory("all")}
                className={`rounded-full px-4 py-2 text-[14px] font-medium tracking-[-0.02em] transition-colors ${
                  activeCategory === "all"
                    ? "bg-[var(--user-ink)] text-white"
                    : "bg-[var(--user-canvas)] text-[var(--user-ink)]"
                }`}
              >
                Semua
              </button>
              {MOCK_CATEGORIES.map((category) => (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => setActiveCategory(category.slug)}
                  className={`rounded-full px-4 py-2 text-[14px] font-medium tracking-[-0.02em] transition-colors ${
                    activeCategory === category.slug
                      ? "bg-[var(--user-ink)] text-white"
                      : "bg-[var(--user-canvas)] text-[var(--user-ink)]"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="user-container">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-[14px] tracking-[-0.02em] text-[var(--user-muted)]">
            {filteredProducts.length} produk ditemukan
          </p>
          <p className="text-[14px] tracking-[-0.02em] text-[var(--user-muted)]">
            Kategori aktif:{" "}
            <span className="text-[var(--user-ink)]">
              {activeCategory === "all" ? "Semua" : activeCategory}
            </span>
          </p>
        </div>

        <ProductGrid>
          {filteredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </ProductGrid>

        {filteredProducts.length === 0 && (
          <div className="rounded-[28px] bg-white p-10 text-center">
            <p className="text-[18px] font-medium tracking-[-0.03em] text-[var(--user-ink)]">
              Tidak ada produk yang cocok.
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] tracking-[-0.02em] text-[var(--user-muted)]">
              Coba ganti kata kunci atau pilih kategori lain.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
