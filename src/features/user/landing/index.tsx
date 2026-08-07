import { Link } from "@tanstack/react-router";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_CATEGORIES, MOCK_PRODUCTS } from "@/lib/mock-data";

const featuredProducts = MOCK_PRODUCTS.slice(0, 5);
const heroProduct = featuredProducts[0];

const valuePoints = [
  "Kurasi gadget yang cepat discan sejak hero pertama.",
  "Arah visual lebih ringan supaya fokus ke produk, bukan dekorasi.",
  "Transisi ke product list dan auth tetap terasa satu flow.",
];

const discoveryTags = [
  "Laptop kerja",
  "Audio harian",
  "Creator setup",
  "Desktop clean",
  "Mobile office",
  "Gaming ringan",
];

const curatedLines = [
  {
    eyebrow: "Performance Picks",
    title: "Laptop dan monitor untuk kerja berat yang tetap rapi di meja.",
    description:
      "Perangkat performa tinggi disusun seperti shortlist, bukan feed yang terlalu ramai.",
    product: featuredProducts[1],
  },
  {
    eyebrow: "Creator Daily",
    title: "Audio, tablet, dan gear ringan untuk ritme kerja yang mobile.",
    description:
      "Pilihan dibuat lebih editorial supaya user cepat tahu setup mana yang cocok.",
    product: featuredProducts[2],
  },
  {
    eyebrow: "Desk Essentials",
    title: "Aksesori inti yang bikin workstation terasa bersih dan presisi.",
    description:
      "Komponen pendukung diberi ruang yang cukup agar tetap kebaca tanpa terasa berat.",
    product: featuredProducts[3],
  },
];

const formatCurrency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function LandingPage() {
  return (
    <div className="user-section bg-background">
      <div className="user-container flex flex-col gap-12 md:gap-16">
        <section className="grid gap-10 border-b border-border/60 pb-12 pt-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,460px)] lg:items-start">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-5">
              <Badge variant="outline" className="w-fit rounded-full px-4 py-1.5 text-[11px] tracking-[0.24em]">
                Editorial Storefront
              </Badge>
              <div className="flex flex-col gap-4">
                <h1 className="max-w-[12ch] text-balance text-[clamp(2.35rem,4.2vw,4.1rem)] font-semibold leading-[0.96] tracking-[-0.06em] text-foreground">
                  Belanja gadget dengan layout yang lebih tenang.
                </h1>
                <p className="max-w-2xl text-[15px] leading-7 text-muted-foreground sm:text-base">
                  Homepage dibuat full putih, lebih lapang, dan lebih mudah discan.
                  Fokus utama sekarang pindah ke produk, kategori, dan CTA yang benar-benar dibutuhkan user.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-5">
                <Link to="/products">Lihat Produk</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link to="/sign-in">Masuk Akun</Link>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {valuePoints.map((point) => (
                <div key={point} className="border-t border-border/60 pt-4">
                  <p className="text-sm leading-6 text-muted-foreground">{point}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:pl-6">
            <div className="flex h-full flex-col gap-6 border-t border-border/60 pt-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    Featured Product
                  </p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.05em] text-foreground">
                    {heroProduct.name}
                  </h2>
                </div>
                <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] tracking-[0.24em]">
                  {heroProduct.category}
                </Badge>
              </div>

              <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div className="space-y-2">
                  <p className="text-[15px] leading-7 text-muted-foreground">
                    {heroProduct.description}
                  </p>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    Starting From
                  </p>
                  <p className="text-[22px] font-semibold tracking-[-0.05em] text-foreground">
                    {formatCurrency.format(heroProduct.price)}
                  </p>
                </div>

                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link to="/products/$slug" params={{ slug: heroProduct.slug }}>
                    Detail Produk
                  </Link>
                </Button>
              </div>

              <div className="flex aspect-[4/3] items-center justify-center border-t border-border/60 pt-6">
                <img
                  src={heroProduct.image}
                  alt={heroProduct.name}
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 border-b border-border/60 pb-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
          <div className="flex flex-col gap-4">
            <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5 text-[11px] tracking-[0.24em]">
              Discovery
            </Badge>
            <h2 className="max-w-[13ch] text-balance text-[clamp(1.8rem,2.8vw,2.6rem)] font-semibold leading-[1] tracking-[-0.05em] text-foreground">
              Cari kategori yang tepat tanpa distraksi visual.
            </h2>
            <p className="text-[15px] leading-7 text-muted-foreground">
              Search rail dan kategori ditahan skalanya supaya tetap terasa premium,
              tapi tidak menutupi produk yang ingin dibuka user.
            </p>
          </div>

          <div className="grid gap-6">
            <Input
              value="Cari laptop, audio, monitor, tablet, atau aksesoris..."
              readOnly
              className="h-12 rounded-full border-border/70 bg-white px-5 text-sm text-muted-foreground"
            />

            <div className="flex flex-wrap gap-3">
              {MOCK_CATEGORIES.map((category) => (
                <div
                  key={category.slug}
                  className="rounded-full border border-border/70 px-4 py-3"
                >
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {category.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {discoveryTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-full px-3 py-1.5 text-xs font-medium"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 border-b border-border/60 pb-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <Badge variant="outline" className="w-fit rounded-full px-4 py-1.5 text-[11px] tracking-[0.24em]">
                Curated Lines
              </Badge>
              <h2 className="max-w-[14ch] text-balance text-[clamp(1.8rem,2.8vw,2.5rem)] font-semibold leading-[1] tracking-[-0.05em] text-foreground">
                Section dibuat seperti editorial list, bukan tumpukan kartu.
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-muted-foreground">
              Setiap lane punya fokus yang jelas supaya user cepat pindah dari inspirasi ke intent belanja.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
            {curatedLines.map((line) => (
              <article key={line.title} className="border-t border-border/60 pt-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
                    {line.eyebrow}
                  </p>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency.format(line.product.price)}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[22px] font-semibold leading-[1.15] tracking-[-0.045em] text-foreground">
                    {line.title}
                  </h3>
                  <p className="text-sm leading-7 text-muted-foreground">
                    {line.description}
                  </p>
                  <div className="flex items-center gap-4 border-t border-border/60 pt-4">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center bg-[#fafaf8] p-3">
                      <img
                        src={line.product.image}
                        alt={line.product.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold tracking-[-0.03em] text-foreground">
                        {line.product.name}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {line.product.features[0]}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex max-w-2xl flex-col gap-3">
              <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5 text-[11px] tracking-[0.24em]">
                Product Focus
              </Badge>
              <h2 className="max-w-[13ch] text-balance text-[clamp(1.8rem,2.8vw,2.6rem)] font-semibold leading-[1] tracking-[-0.05em] text-foreground">
                Produk unggulan tetap jadi pusat perhatian utama.
              </h2>
            </div>

            <Button asChild variant="outline" className="rounded-full px-5">
              <Link to="/products">Lihat Semua</Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.slug}
                to="/products/$slug"
                params={{ slug: product.slug }}
                className="group grid gap-4 border-t border-border/60 pt-4 no-underline"
              >
                <div className="flex aspect-[4/3] items-center justify-center border-b border-border/50 bg-[#fbfbfa] p-5 transition-colors duration-200 group-hover:bg-[#f6f6f3]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {product.category}
                    </p>
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={16}
                      strokeWidth={2}
                      className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-foreground"
                    />
                  </div>
                  <h3 className="text-[18px] font-semibold leading-[1.18] tracking-[-0.035em] text-foreground">
                    {product.name}
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {product.description}
                  </p>
                  <p className="pt-1 text-base font-semibold tracking-[-0.03em] text-foreground">
                    {formatCurrency.format(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4 border-t border-border/60 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" className="rounded-full px-4 py-1.5 text-[11px] tracking-[0.24em]">
              Continue Shopping
            </Badge>
            <h2 className="max-w-[14ch] text-balance text-[clamp(1.7rem,2.7vw,2.35rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-foreground">
              Masuk akun atau lanjut ke cart tanpa putus ritme halaman.
            </h2>
            <p className="text-[15px] leading-7 text-muted-foreground">
              CTA penutup dibuat lebih sederhana supaya halaman tetap terasa penuh, tapi tidak ramai.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="rounded-full px-5">
              <Link to="/sign-up">Buat Akun</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-5">
              <Link to="/cart">Buka Cart</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
