import { useState, useEffect } from 'react';
import { Settings, Sun, Moon, BookOpenText, Mic, History, LogIn, Radio } from 'lucide-react';
import { Link, useLocation } from 'wouter';

interface HeaderProps {
  onThemeToggle?: () => void;
  onSettingsOpen?: () => void;
  isDark?: boolean;
}

export default function Header({ onThemeToggle, onSettingsOpen, isDark }: HeaderProps) {
  const [location] = useLocation();
  const [localDark, setLocalDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  );

  const activeDark = isDark !== undefined ? isDark : localDark;

  const handleToggleTheme = () => {
    if (onThemeToggle) {
      onThemeToggle();
    } else {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      if (isCurrentlyDark) {
        document.documentElement.classList.remove('dark');
        setLocalDark(false);
      } else {
        document.documentElement.classList.add('dark');
        setLocalDark(true);
      }
    }
  };

  useEffect(() => {
    if (isDark !== undefined) {
      setLocalDark(isDark);
    }
  }, [isDark]);

  const navItems = [
    { href: '/', label: 'Sermon Studio', icon: BookOpenText, active: location === '/' || location === '/sermon' },
    { href: '/live', label: 'Live Subtitles', icon: Mic, active: location === '/live' },
    { href: '/history', label: 'History', icon: History, active: location === '/history' || location.startsWith('/transcriptions') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90" aria-label="Voxora home">
            <img
              src="/voxora.png"
              alt="Voxora logo"
              className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base font-semibold leading-none tracking-tight text-foreground">Voxora</span>
              <span className="text-[10px] font-medium tracking-wider text-muted-foreground uppercase">Real-Time AI Audio</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 rounded-lg border border-border/60 bg-muted/40 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                    item.active
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Mobile quick nav links */}
          <div className="flex md:hidden items-center gap-1 mr-1">
            <Link
              href="/"
              className={`rounded-md p-1.5 transition-colors ${
                location === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Sermon Studio"
            >
              <BookOpenText className="h-4 w-4" />
            </Link>
            <Link
              href="/live"
              className={`rounded-md p-1.5 transition-colors ${
                location === '/live' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Live Subtitles"
            >
              <Mic className="h-4 w-4" />
            </Link>
            <Link
              href="/history"
              className={`rounded-md p-1.5 transition-colors ${
                location.startsWith('/history') || location.startsWith('/transcriptions') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="History"
            >
              <History className="h-4 w-4" />
            </Link>
          </div>

          {/* Listener Mode Link */}
          <Link
            href="/listen"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-accent/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            title="Open audience listener view"
          >
            <Radio className="h-3 w-3 text-primary animate-pulse" />
            <span>Listener Stream</span>
          </Link>

          {/* Account / Auth */}
          <Link
            href="/auth"
            className={`rounded-lg p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground ${
              location === '/auth' ? 'bg-accent text-foreground' : ''
            }`}
            aria-label="Account & Auth"
            title="Account & Auth"
          >
            <LogIn className="h-4 w-4" />
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
            aria-label="Toggle theme"
            data-testid="button-theme-toggle"
            title={activeDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {activeDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Settings */}
          {onSettingsOpen && (
            <button
              onClick={onSettingsOpen}
              className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              aria-label="Open settings"
              data-testid="button-settings"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
