import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  SignOutIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  BellIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wordmark } from "@/components/brand/Wordmark";
import { useAuth } from "@/lib/auth-context";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

type NavTo = "/listings" | "/services" | "/hatcheries" | "/post";

export function TopNav() {
  const { isAuthenticated, isAdmin, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/listings", search: { q: q.trim() || undefined } as never });
  };

  const NavLink = ({ to, children }: { to: NavTo; children: React.ReactNode }) => {
    const active =
      location.pathname === to ||
      (to !== "/listings" && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={cn(
          "text-[13.5px] font-semibold transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-[60px] max-w-7xl items-center gap-3 px-4 md:px-8">
        <Wordmark />

        <nav className="ml-4 hidden items-center gap-5 md:flex">
          <NavLink to="/listings">Browse</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/hatcheries">Hatcheries</NavLink>
          <NavLink to="/post">Sell</NavLink>
        </nav>

        <form onSubmit={onSearch} className="mx-3 hidden max-w-[420px] flex-1 md:flex">
          <div className="flex w-full items-center overflow-hidden rounded-xl border-[1.5px] border-border bg-background transition-colors focus-within:border-primary">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search livestock, breed, region…"
              className="flex-1 bg-transparent px-3.5 py-2 text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center gap-1.5 bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <SearchIcon size={14} strokeWidth={2} />
              <span className="hidden lg:inline">Search</span>
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          {isAuthenticated ? (
            <>
              <Button
                asChild
                size="sm"
                className="hidden rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary/90 md:inline-flex"
              >
                <Link to="/post">
                  <PlusIcon size={16} strokeWidth={2} /> Post listing
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                className="rounded-md text-muted-foreground hover:text-foreground"
              >
                <BellIcon size={18} />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account" className="rounded-full">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary">
                      {(user?.email?.[0] ?? "U").toUpperCase()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">My listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved">Saved</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/verification">Verification</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/services">Services</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/hatcheries">Hatcheries</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/how-it-works">How it works</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <ShieldIcon size={16} /> Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void signOut()}>
                    <SignOutIcon size={16} /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-md font-semibold">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden rounded-md bg-primary font-semibold text-primary-foreground hover:bg-primary/90 sm:inline-flex"
              >
                <Link to="/post">
                  <PlusIcon size={16} strokeWidth={2} /> Post listing
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
