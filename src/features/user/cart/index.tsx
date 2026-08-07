import { Link } from "@tanstack/react-router";
import { PriceDisplay } from "@/components/user/PriceDisplay";
import { UserButton } from "@/components/user/UserButton";
import { UserSectionHeadline } from "@/components/user/UserSectionHeadline";
import { MOCK_PRODUCTS } from "@/lib/mock-data";

const cartItems = MOCK_PRODUCTS.slice(0, 3).map((product, index) => ({
  ...product,
  quantity: index + 1,
}));

const subtotal = cartItems.reduce(
  (total, item) => total + item.price * item.quantity,
  0,
);

export function CartPage() {
  return (
    <div className="user-section space-y-8">
      <section className="user-container">
        <UserSectionHeadline
          eyebrow="Cart Review"
          body="Keranjang publik ikut memakai bahasa visual yang sama: terang, lapang, dan tanpa rasa dashboard."
          align="left"
        >
          Semua item terasa lebih rapi sebelum checkout.
        </UserSectionHeadline>
      </section>

      <section className="user-container">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] bg-white p-6 sm:p-8">
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.slug}
                  className="flex flex-col gap-4 rounded-[24px] bg-[var(--user-canvas)] p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[var(--user-muted)]">
                      {item.category}
                    </p>
                    <h2 className="mt-2 text-[1.4rem] font-semibold tracking-[-0.05em] text-[var(--user-ink)]">
                      {item.name}
                    </h2>
                    <p className="mt-2 text-[15px] leading-[1.55] tracking-[-0.02em] text-[var(--user-muted)]">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <PriceDisplay
                    price={item.price * item.quantity}
                    originalPrice={
                      item.originalPrice
                        ? item.originalPrice * item.quantity
                        : undefined
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 sm:p-8">
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[var(--user-muted)]">
              Summary
            </p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between text-[15px] tracking-[-0.02em] text-[var(--user-muted)]">
                <span>Subtotal</span>
                <PriceDisplay price={subtotal} />
              </div>
              <div className="flex items-center justify-between text-[15px] tracking-[-0.02em] text-[var(--user-muted)]">
                <span>Shipping</span>
                <span>Gratis</span>
              </div>
              <div className="border-t border-[var(--user-soft)] pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-[15px] tracking-[-0.02em] text-[var(--user-muted)]">
                    Total
                  </span>
                  <PriceDisplay price={subtotal} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <UserButton>Checkout</UserButton>
              <Link to="/products" className="inline-flex">
                <UserButton variant="ghost" className="w-full">
                  Lanjut Belanja
                </UserButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
