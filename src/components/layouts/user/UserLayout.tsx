import { Outlet } from "@tanstack/react-router";
import { UserNav } from "./UserNav";
import { UserFooter } from "./UserFooter";

export function UserLayout() {
  return (
    <div data-layout="user" className="user-shell min-h-svh text-foreground">
      <UserNav />
      <main className="flex-1 pt-20 md:pt-24">
        <Outlet />
      </main>
      <UserFooter />
    </div>
  );
}
