import { Link } from "@tanstack/react-router";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PriceDisplay } from "./PriceDisplay";

interface Product {
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug }}
      className="group block no-underline"
    >
      <Card className="landing-surface h-full overflow-hidden border-border/70 py-0 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_28px_80px_-48px_rgba(15,23,42,0.45)]">
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-border/60 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--primary)_12%,transparent),transparent_48%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_88%,white),color-mix(in_oklab,var(--muted)_42%,white))] p-7">
          <div className="absolute left-4 top-4">
            <Badge variant="secondary" className="w-fit">
              {product.category}
            </Badge>
          </div>
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="text-sm text-muted-foreground">No image</div>
          )}
        </div>

        <CardHeader className="gap-3 px-6 py-6">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Featured gear
          </p>
          <CardTitle className="text-[22px] font-semibold leading-[1.08] tracking-[-0.05em] text-foreground">
            {product.name}
          </CardTitle>
        </CardHeader>

        {product.description ? (
          <CardContent className="px-6 pt-0">
            <CardDescription className="text-sm leading-6">
              {product.description}
            </CardDescription>
          </CardContent>
        ) : null}

        <CardFooter className="mt-auto flex items-end justify-between gap-4 px-6 py-6 pt-4">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Price
            </p>
            <PriceDisplay
              price={product.price}
              originalPrice={product.originalPrice}
            />
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-sm font-medium text-foreground transition-colors group-hover:border-primary/35 group-hover:text-primary">
            Lihat
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
