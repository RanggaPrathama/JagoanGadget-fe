import { cn } from "@/utils/cn";

type MainProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  fluid?: boolean;
  ref?: React.Ref<HTMLElement>;
};

export function Main({
  className,
  fixed,
  fluid,
  children,
  ...props
}: MainProps) {
  return (
    <main
      data-layout={fixed ? "fixed" : "auto"}
      className={cn(
        "admin-scrollbar flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden",
        fixed && "grow",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex flex-1 flex-col px-4 py-6 sm:px-6 sm:py-7",
          !fluid && "mx-auto w-full max-w-7xl",
        )}
      >
        {children}
      </div>
    </main>
  );
}
