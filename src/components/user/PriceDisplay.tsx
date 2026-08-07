interface PriceDisplayProps {
  price: number;
  originalPrice?: number;
  className?: string;
}

export function PriceDisplay({
  price,
  originalPrice,
  className = "",
}: PriceDisplayProps) {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const discount =
    originalPrice
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-[18px] font-semibold tracking-[-0.04em] text-[var(--user-ink)]">
        {formatter.format(price)}
      </span>
      {originalPrice && originalPrice > price && (
        <>
          <span className="text-[14px] tracking-[-0.02em] text-[var(--user-muted)] line-through">
            {formatter.format(originalPrice)}
          </span>
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[var(--user-danger)]">
            -{discount}%
          </span>
        </>
      )}
    </div>
  );
}
