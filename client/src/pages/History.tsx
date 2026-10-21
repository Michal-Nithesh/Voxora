import { useEffect, useState, useMemo } from 'react';
import { Link } from 'wouter';
import {
  Clock3,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  PlusCircle,
  BarChart2,
  Languages,
  Mic,
  RotateCw,
} from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { listTranscriptions, deleteTranscription, type TranscriptionRecord } from '@/lib/api';

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function History() {
  const [records, setRecords] = useState<TranscriptionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchRecords = () => {
    setLoading(true);
    listTranscriptions({
      page,
      search: query || undefined,
      language: selectedLanguage !== 'all' ? selectedLanguage : undefined,
    })
      .then((result) => {
        setRecords(result.data);
        setPagination(result.pagination);
        setError('');
      })
      .catch((err: Error) => {
        setError(err.message);
        setRecords([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [page, query, selectedLanguage]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;
    try {
      await deleteTranscription(id);
      fetchRecords();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  // Derive simple metrics from visible records
  const metrics = useMemo(() => {
    const totalMinutes = records.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / 60;
    const languages = new Set(records.map((r) => r.language.toLowerCase())).size;
    return {
      totalMinutes: Math.round(totalMinutes),
      uniqueLanguages: languages,
    };
  }, [records]);

  const availableLanguages = ['all', 'en', 'nl', 'es', 'de', 'fr'];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {/* Page Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/70 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Supabase Cloud Archive</p>
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Transcription History</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, review, and manage your voice recordings and translations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchRecords} disabled={loading} className="gap-1.5">
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Link href="/live">
              <Button size="sm" className="gap-1.5 shadow-sm shadow-primary/25">
                <Mic className="h-4 w-4" />
                <span>Start Live Session</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Saved Records</span>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{pagination.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Stored in Supabase database</p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Est. Transcribed Audio</span>
              <Clock3 className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{metrics.totalMinutes} min</p>
            <p className="text-xs text-muted-foreground mt-0.5">Visible on current page</p>
          </div>

          <div className="rounded-xl border border-border/70 bg-card/60 p-4 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Source Languages</span>
              <Languages className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{metrics.uniqueLanguages || 1}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Multilingual support</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <form
            className="relative flex-1 max-w-md flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQuery(search.trim());
            }}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 pr-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transcripts by title or keyword..."
                aria-label="Search transcripts"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setQuery('');
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
            <Button type="submit" variant="secondary" size="default">
              Search
            </Button>
          </form>

          {/* Language filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">Filter:</span>
            {availableLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLanguage(lang);
                  setPage(1);
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium uppercase transition-colors ${
                  selectedLanguage === lang
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {!loading && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
            <p className="font-semibold">Unable to fetch transcripts</p>
            <p className="mt-1 text-muted-foreground">{error}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Verify your Supabase credentials in <code className="rounded bg-muted px-1.5 py-0.5">.env</code> and confirm that the table was created using the provided migration.
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <RotateCw className="h-6 w-6 animate-spin text-primary" />
            <p className="text-sm">Loading your saved transcripts...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && records.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center">
              <img src="/voxora.png" alt="Voxora logo" className="h-14 w-14 object-contain opacity-80" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No Transcripts Found</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              {query
                ? `No transcripts match "${query}". Try searching with different keywords.`
                : 'You have not saved any transcriptions yet. Start speaking in Live or Sermon mode and save your session.'}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/live">
                <Button className="gap-2">
                  <Mic className="h-4 w-4" />
                  <span>Start Live Subtitles</span>
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Open Sermon Studio</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Transcript Cards Grid */}
        {!loading && !error && records.length > 0 && (
          <div className="grid gap-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="group relative rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Link href={`/transcriptions/${record.id}`}>
                        <h2 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors cursor-pointer truncate">
                          {record.title}
                        </h2>
                      </Link>
                      <Badge variant="secondary" className="text-[10px] font-mono uppercase">
                        {record.language} {record.targetLanguage ? `→ ${record.targetLanguage}` : ''}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {record.provider}
                      </Badge>
                    </div>

                    <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {record.originalText}
                    </p>

                    {record.translatedText && (
                      <p className="mt-2 line-clamp-1 text-xs text-primary/80 italic font-medium">
                        {record.translatedText}
                      </p>
                    )}
                  </div>

                  {/* Quick Card Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleCopy(record.id, record.originalText)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="Copy original text"
                    >
                      {copiedId === record.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(record.id, record.title)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="Delete transcript"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link href={`/transcriptions/${record.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs gap-1">
                        <span>Open</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/40 pt-3">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-muted-foreground" />
                    {formatDate(record.createdAt)}
                  </span>
                  {record.durationSeconds != null && (
                    <span>
                      Duration: {Math.floor(record.durationSeconds / 60)}m {record.durationSeconds % 60}s
                    </span>
                  )}
                  <span>Word count: ~{record.originalText.trim().split(/\s+/).length} words</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-between border-t border-border/70 pt-4">
            <span className="text-xs text-muted-foreground">
              Showing page <strong className="text-foreground">{pagination.page}</strong> of <strong className="text-foreground">{pagination.pages}</strong> ({pagination.total} results)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((val) => val - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage((val) => val + 1)}
                className="gap-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
