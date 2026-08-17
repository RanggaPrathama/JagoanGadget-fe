import { Link } from "@tanstack/react-router";
import { Fragment } from "react";
import { cn } from "@/utils/cn";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type BreadcrumbLinkItem = {
  title: string;
  href?: string;
  disabled?: boolean;
};

type TopNavProps = React.HTMLAttributes<HTMLElement> & {
  items: BreadcrumbLinkItem[];
};

export function TopNav({ className, items, ...props }: TopNavProps) {
  if (!items.length) {
    return null;
  }

  return (
    <Breadcrumb className={cn("min-w-0", className)} {...props}>
      <BreadcrumbList className="min-w-0 flex-nowrap gap-2 text-xs sm:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <Fragment key={`${item.title}-${item.href ?? index}`}>
              <BreadcrumbItem
                className={cn(
                  "min-w-0",
                  index < items.length - 2 && "hidden sm:inline-flex",
                )}
              >
                {isLast || !item.href || item.disabled ? (
                  <BreadcrumbPage className="truncate text-sm font-medium">
                    {item.title}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    asChild
                    className="truncate text-muted-foreground"
                  >
                    <Link to={item.href}>{item.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast ? (
                <BreadcrumbSeparator
                  className={cn(index < items.length - 2 && "hidden sm:block")}
                />
              ) : null}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
