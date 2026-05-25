import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { DisplayAccent } from "@/components/shared/DisplayAccent";
import authHero from "@/assets/auth-hero.jpg";

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — farmlink" },
      { name: "description", content: "Sign in to post or save livestock listings on farmlink." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo = "/listings" } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  const onSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    navigate({ to: redirectTo as never });
  };

  const onSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${redirectTo}`,
        data: { display_name: displayName || email.split("@")[0] },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created. Check your email if confirmation is required.");
    navigate({ to: redirectTo as never });
  };

  const onGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${redirectTo}`,
    });
    if (result.error) {
      setBusy(false);
      toast.error(result.error.message);
      return;
    }
    if (result.redirected) return; // browser will navigate to Google
    setBusy(false);
    toast.success("Welcome back");
    navigate({ to: redirectTo as never });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 overflow-hidden rounded-[28px] border border-border bg-surface-cream md:grid-cols-[1.05fr_1fr]">
        {/* Left — editorial lifestyle panel */}
        <div className="relative hidden overflow-hidden md:block">
          <img
            src={authHero}
            alt="Ghanaian farmer holding a young goat kid at golden hour"
            width={1024}
            height={1280}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-x-8 bottom-8 max-w-sm rounded-3xl bg-card/95 p-6 shadow-soft backdrop-blur">
            <Wordmark size="text-[22px]" />
            <p className="font-display mt-3 text-[22px] font-extrabold leading-tight tracking-tight text-foreground">
              Livestock, <DisplayAccent>direct</DisplayAccent> from the farm that raised them.
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div className="flex items-center justify-center bg-card p-6 md:p-10">
          <div className="w-full max-w-sm">
            <div className="mb-7 md:hidden">
              <Wordmark size="text-[24px]" />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Sign in
            </p>
            <h1 className="font-display mt-2 text-[30px] font-extrabold leading-tight tracking-tight md:text-[36px]">
              Welcome <DisplayAccent>back</DisplayAccent>.
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
              Post, save and message farmers across Ghana — one account.
            </p>

            <div className="mt-7">
          <Button
            variant="outline"
            className="h-12 w-full rounded-full border-[1.5px] font-semibold"
            onClick={onGoogle}
            disabled={busy}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10.5px] uppercase tracking-wider text-muted-foreground">
              or with email
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-surface-cream p-1">
              <TabsTrigger value="signin" className="rounded-full">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="signup" className="rounded-full">
                Create account
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="mt-4">
              <form onSubmit={onSignIn} className="space-y-3">
                <div>
                  <Label htmlFor="email-si">Email</Label>
                  <Input
                    id="email-si"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-11 rounded-full px-4"
                  />
                </div>
                <div>
                  <Label htmlFor="pw-si">Password</Label>
                  <Input
                    id="pw-si"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 h-11 rounded-full px-4"
                  />
                </div>
                <Button type="submit" className="h-12 w-full rounded-full font-bold" disabled={busy}>
                  Sign in
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-4">
              <form onSubmit={onSignUp} className="space-y-3">
                <div>
                  <Label htmlFor="dn">Your name</Label>
                  <Input
                    id="dn"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Kwame Mensah"
                    className="mt-1.5 h-11 rounded-full px-4"
                  />
                </div>
                <div>
                  <Label htmlFor="email-su">Email</Label>
                  <Input
                    id="email-su"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 h-11 rounded-full px-4"
                  />
                </div>
                <div>
                  <Label htmlFor="pw-su">Password</Label>
                  <Input
                    id="pw-su"
                    type="password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1.5 h-11 rounded-full px-4"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                <Button type="submit" className="h-12 w-full rounded-full font-bold" disabled={busy}>
                  Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to{" "}
              <Link to="/terms" className="underline hover:text-foreground">
                farmlink's terms
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.42 3.46 1.18 4.95l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
