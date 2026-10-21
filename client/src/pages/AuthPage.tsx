import { FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LogIn, UserPlus, Waves } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/auth';

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabase?.auth.getSession().then(({ data }) => { if (data.session) navigate('/history'); }); }, [navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) { setMessage('Supabase Auth is not configured for this frontend.'); return; }
    setBusy(true); setMessage('');
    const result = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) { setMessage(result.error.message); return; }
    if (mode === 'signup' && !result.data.session) setMessage('Account created. Check your email to confirm the address.');
    else navigate('/history');
  };

  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto flex max-w-md px-4 py-16"><section className="w-full rounded-xl border bg-card p-7 shadow-sm"><div className="mb-8 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Waves className="h-6 w-6" /></span><h1 className="mt-5 text-2xl font-semibold">{mode === 'signin' ? 'Welcome back' : 'Create your Voxora account'}</h1><p className="mt-2 text-sm text-muted-foreground">Your Voice. Instantly Understood.</p></div><form className="space-y-4" onSubmit={submit}><div><label htmlFor="auth-email" className="mb-2 block text-sm font-medium">Email</label><Input id="auth-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div><div><label htmlFor="auth-password" className="mb-2 block text-sm font-medium">Password</label><Input id="auth-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></div>{message && <p className="text-sm text-destructive" role="alert">{message}</p>}<Button className="w-full" disabled={busy}>{mode === 'signin' ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}{busy ? 'Working...' : mode === 'signin' ? 'Sign in' : 'Create account'}</Button></form><button type="button" className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }}>{mode === 'signin' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}</button><Link href="/" className="mt-4 block text-center text-sm text-primary hover:underline">Return to workspace</Link></section></main></div>;
}