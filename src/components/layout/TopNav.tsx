import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Leaf, LogOut, Plus, Search, User as UserIcon, ShieldCheck, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/utils";

export function TopNav() {
  const { isAuthenticated, isAdmin, user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/listings", search: { q: q.trim() || undefined } as never });
  };

  const NavLink = ({ to, children }: { to: "/listings" | "/post"; children: React.ReactNode }) => {
    const active = location.pathname === to || (to !== "/listings" && location.pathname.startsWith(to));
    return (
      <Link
        to={to}
        className={cn(
          "text-sm font-medium transition-colors",
          active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {children}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 md:h-16">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold tracking-tight">Farmlink</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 ml-4">
          <NavLink to="/listings">Browse</NavLink>
          <NavLink to="/post">Sell</NavLink>
        </nav>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-sm ml-2">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search livestock, region…"
              className="pl-10 h-10 rounded-full bg-surface border-transparent focus-visible:bg-background"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          {isAuthenticated ? (
            <>
              <Button asChild size="sm" className="hidden md:inline-flex rounded-full font-semibold">
                <Link to="/post">
                  <Plus className="h-4 w-4" /> Post listing
                </Link>
              </Button>
              <Button variant="ghost" size="icon" aria-label="Notifications" className="rounded-full text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account" className="rounded-full">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-primary font-semibold text-sm">
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
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <ShieldCheck className="h-4 w-4" /> Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => void signOut()}>
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex rounded-full font-semibold">
                <Link to="/post">
                  <Plus className="h-4 w-4" /> Post listing
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
