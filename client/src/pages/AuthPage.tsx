import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/auth';

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [busy, setBusy] = useState(false);
  const isSupabaseConfigured = Boolean(supabase);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/history');
    });
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) {
      setMessage({
        text: 'Supabase Auth publishable key is not configured in client environment. Use local development mode or set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.',
        type: 'error',
      });
      return;
    }

    setBusy(true);
    setMessage(null);

    const result =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);

    if (result.error) {
      setMessage({ text: result.error.message, type: 'error' });
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage({
        text: 'Account created! Please check your email to confirm your registration.',
        type: 'success',
      });
    } else {
      navigate('/history');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12 sm:px-6">
        <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-sm backdrop-blur-xs">
          {/* Logo & Headline */}
          <div className="mb-6 text-center">
            <img
              src="/voxora.png"
              alt="Voxora logo"
              className="mx-auto h-16 w-16 object-contain drop-shadow-md mb-2"
            />
            <h1 className="mt-2 text-2xl font-bold tracking-tight">
              {mode === 'signin' ? 'Welcome back to Voxora' : 'Create your Voxora account'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your Voice. Instantly Understood.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <Tabs
            value={mode}
            onValueChange={(val) => {
              setMode(val as 'signin' | 'signup');
              setMessage(null);
            }}
            className="w-full mb-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin" className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </TabsTrigger>
              <TabsTrigger value="signup" className="gap-1.5">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Info Banner for local mode */}
          {!isSupabaseConfigured && (
            <div className="mb-5 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5 font-medium text-foreground mb-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Local Guest Mode Active</span>
              </div>
              <p>
                Transcripts are automatically saved to your local Supabase database via the backend API without requiring browser sign-in.
              </p>
            </div>
          )}

          {/* Auth Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="auth-email" className="mb-1.5 block text-xs font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  disabled={busy}
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="mb-1.5 block text-xs font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-9 pr-9"
                  disabled={busy}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error or Success feedback message */}
            {message && (
              <div
                className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
                  message.type === 'error'
                    ? 'border border-destructive/30 bg-destructive/10 text-destructive'
                    : 'border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                }`}
                role="alert"
              >
                {message.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <Button className="w-full shadow-sm shadow-primary/25 mt-2" disabled={busy}>
              {busy ? (
                'Processing...'
              ) : mode === 'signin' ? (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 border-t border-border/60 pt-4 text-center">
            <Link href="/history" className="text-xs text-primary hover:underline block mb-2">
              Browse transcript history as guest →
            </Link>
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
              Return to Sermon Studio
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
