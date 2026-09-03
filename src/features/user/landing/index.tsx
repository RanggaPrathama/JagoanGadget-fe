import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerItem } from "@/components/motion";

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

export function LandingPage() {
  return (
    <div className="user-section bg-background">
      <div className="user-container flex flex-col gap-12 md:gap-16">
        <section className="grid gap-10 border-b border-border/60 pb-12 pt-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,460px)] lg:items-start">
          <div className="flex flex-col gap-8">
            <FadeIn inView={false} delay={0}>
              <div className="flex flex-col gap-4">
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
            </FadeIn>

            <FadeIn inView={false} delay={0.08}>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-5">
                  <Link to="/products">Lihat Produk</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link to="/sign-in">Masuk Akun</Link>
                </Button>
              </div>
            </FadeIn>

            <FadeIn inView={false} delay={0.16}>
              <div className="grid gap-4 sm:grid-cols-3">
                {valuePoints.map((point) => (
                  <div key={point} className="border-t border-border/60 pt-4">
                    <p className="text-sm leading-6 text-muted-foreground">{point}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          <FadeIn className="lg:pl-6" inView={false} delay={0.24}>
            <div className="flex h-full flex-col gap-6 border-t border-border/60 pt-5">
              <div className="flex aspect-[4/3] items-center justify-center rounded-[28px] border border-border/60 bg-[var(--user-canvas)]">
                <p className="text-sm text-muted-foreground">Produk akan segera hadir</p>
              </div>
            </div>
          </FadeIn>
        </section>

        <FadeIn>
          <section className="grid gap-8 border-b border-border/60 pb-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
            <div className="flex flex-col gap-4">
              <h2 className="max-w-[13ch] text-balance text-[clamp(1.8rem,2.8vw,2.6rem)] font-semibold leading-[1] tracking-[-0.05em] text-foreground">
                Cari kategori yang tepat tanpa distraksi visual.
              </h2>
              <p className="text-[15px] leading-7 text-muted-foreground">
                Search rail dan kategori ditahan skalanya supaya tetap terasa premium,
                tapi tidak menutupi produk yang ingin dibuka user.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="flex flex-wrap gap-2">
                {discoveryTags.map((tag, index) => (
                  <StaggerItem key={tag} index={index}>
                    <span
                      className="rounded-full border border-border/70 px-4 py-2 text-[13px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  </StaggerItem>
                ))}
              </div>

              <div className="rounded-[24px] border border-dashed border-border/60 p-8 text-center">
                <p className="text-[15px] font-medium text-foreground">Katalog produk sedang disiapkan.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Segera kami tampilkan kategori produk lengkap untuk Anda.
                </p>
              </div>
            </div>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="grid gap-6 border-b border-border/60 pb-12">
            <div className="flex flex-col gap-3">
              <h2 className="max-w-[14ch] text-balance text-[clamp(1.8rem,2.8vw,2.5rem)] font-semibold leading-[1] tracking-[-0.05em] text-foreground">
                Produk unggulan tetap jadi pusat perhatian utama.
              </h2>
              <p className="text-[15px] leading-7 text-muted-foreground">
                Produk pilihan kami akan segera ditampilkan di sini.
              </p>
            </div>

            <div className="rounded-[24px] border border-dashed border-border/60 p-10 text-center">
              <p className="text-[15px] font-medium text-foreground">Produk akan segera hadir.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Katalog produk sedang dalam persiapan dan akan tersedia segera.
              </p>
            </div>
          </section>
        </FadeIn>

        <FadeIn>
          <section className="flex flex-col gap-4 border-t border-border/60 pt-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
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
        </FadeIn>
      </div>
    </div>
  );
}
