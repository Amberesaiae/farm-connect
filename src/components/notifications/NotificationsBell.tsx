import { useEffect, useState, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { BellIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export function NotificationsBell() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("notifications")
      .select("id,type,title,body,link,read_at,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(15);
    setItems((data ?? []) as NotificationRow[]);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setItems([]);
      return;
    }
    void load();
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setItems((prev) => [payload.new as NotificationRow, ...prev].slice(0, 15));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user, load]);

  const unread = items.filter((n) => !n.read_at).length;

  const markAllRead = async () => {
    if (!user || unread === 0) return;
    const ids = items.filter((n) => !n.read_at).map((n) => n.id);
    if (!ids.length) return;
    setItems((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, read_at: new Date().toISOString() } : n)));
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids);
  };

  const onItemClick = async (n: NotificationRow) => {
    setOpen(false);
    if (!n.read_at && user) {
      setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x)));
      await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", n.id);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
          className="relative rounded-md text-muted-foreground hover:text-foreground"
        >
          <BellIcon size={18} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button
              type="button"
              onClick={() => void markAllRead()}
              className="text-[11.5px] font-semibold text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="px-3 py-8 text-center text-[12.5px] text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <ul>
              {items.map((n) => {
                const content = (
                  <div
                    className={cn(
                      "flex gap-2 border-b border-border px-3 py-2.5 transition-colors hover:bg-surface",
                      !n.read_at && "bg-primary-soft/40",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                        n.read_at ? "bg-transparent" : "bg-primary",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold">{n.title}</p>
                      {n.body && (
                        <p className="line-clamp-2 text-[12px] text-muted-foreground">{n.body}</p>
                      )}
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {formatRelative(n.created_at)}
                      </p>
                    </div>
                  </div>
                );
                return (
                  <li key={n.id}>
                    {n.link ? (
                      <Link to={n.link} onClick={() => void onItemClick(n)} className="block">
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void onItemClick(n)}
                        className="block w-full text-left"
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
