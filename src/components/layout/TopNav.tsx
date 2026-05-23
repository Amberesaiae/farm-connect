import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  SignOutIcon,
  PlusIcon,
  SearchIcon,
  ShieldIcon,
} from "@/components/icons";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
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
  const [searchOpen, setSearchOpen] = useState(false);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/listings", search: { q: q.trim() || undefined } as never });
    setSearchOpen(false);
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

        <nav className="ml-4 hidden items-center gap-5 lg:flex">
          <NavLink to="/listings">Browse</NavLink>
          <NavLink to="/services">Services</NavLink>
          <NavLink to="/hatcheries">Hatcheries</NavLink>
          <NavLink to="/post">Sell</NavLink>
        </nav>

        <form onSubmit={onSearch} className="mx-3 hidden max-w-[440px] flex-1 md:flex">
          <div className="flex w-full items-center overflow-hidden rounded-full border border-border bg-surface-cream pl-4 transition-colors focus-within:border-primary focus-within:bg-card">
            <SearchIcon size={15} strokeWidth={2} className="text-muted-foreground" />
            <label htmlFor="topnav-search" className="sr-only">Search the marketplace</label>
            <input
              id="topnav-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search livestock, breed, region…"
              className="flex-1 bg-transparent px-3 py-2.5 text-[13.5px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Search"
              className="m-1 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="hidden lg:inline">Search</span>
              <SearchIcon size={14} strokeWidth={2} className="lg:hidden" />
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          {/* Mobile search trigger — keeps search reachable on every screen */}
          <button
            type="button"
            aria-label="Search"
            onClick={() => setSearchOpen((s) => !s)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface md:hidden"
          >
            <SearchIcon size={18} strokeWidth={2} />
          </button>
          {isAuthenticated ? (
            <>
              <Button
                asChild
                size="sm"
                className="hidden rounded-full bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 md:inline-flex"
              >
                <Link to="/post">
                  <PlusIcon size={16} strokeWidth={2} /> Post listing
                </Link>
              </Button>
              <NotificationsBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account" className="rounded-full">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-[13px] font-bold text-primary">
                      {(user?.email?.[0] ?? "U").toUpperCase()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    My activity
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">My listings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/reservations">My reservations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/quotes">My quotes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved">Saved</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Sell on farmlink
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/verification">Verification</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/hatchery">My hatchery</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/provider">Service provider</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                    Help & more
                  </DropdownMenuLabel>
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
              <Button asChild variant="ghost" size="sm" className="rounded-full font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hidden rounded-full bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90 sm:inline-flex"
              >
                <Link to="/post">
                  <PlusIcon size={16} strokeWidth={2} /> Post listing
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile slide-down search panel */}
      {searchOpen ? (
        <div className="fl-fade-in border-t border-border bg-background px-4 py-3 md:hidden">
          <form onSubmit={onSearch} className="flex w-full items-center overflow-hidden rounded-xl border-[1.5px] border-border bg-background focus-within:border-primary">
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search livestock, breed, region…"
              className="flex-1 bg-transparent px-3.5 py-2.5 text-[14px] text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex items-center gap-1.5 bg-primary px-4 py-2.5 text-[13px] font-semibold text-primary-foreground"
            >
              <SearchIcon size={14} strokeWidth={2} /> Go
            </button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
