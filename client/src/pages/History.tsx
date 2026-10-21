import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Clock3, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { listTranscriptions, type TranscriptionRecord } from '@/lib/api';

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function History() {
  const [records, setRecords] = useState<TranscriptionRecord[]>([]);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    listTranscriptions({ page, search: query })
      .then((result) => { setRecords(result.data); setPagination(result.pagination); setError(''); })
      .catch((err: Error) => { setError(err.message); setRecords([]); })
      .finally(() => setLoading(false));
  }, [page, query]);

  return <div className="min-h-screen bg-background">
    <Header />
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Voxora archive</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Transcription history</h1><p className="mt-2 text-muted-foreground">{pagination.total} saved transcript{pagination.total === 1 ? '' : 's'}</p></div>
        <Link href="/"><Button>Open workspace</Button></Link>
      </div>
      <form className="mb-6 flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); setPage(1); setQuery(search.trim()); }}>
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search titles and transcript text" aria-label="Search transcripts" /></div>
        <Button type="submit">Search</Button>
      </form>
      {loading && <div className="py-16 text-center text-muted-foreground">Loading your transcripts...</div>}
      {!loading && error && <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">{error}. Configure Supabase and enable the documented local persistence mode to use history.</div>}
      {!loading && !error && records.length === 0 && <div className="rounded-lg border border-dashed p-12 text-center"><FileText className="mx-auto h-8 w-8 text-muted-foreground" /><h2 className="mt-4 font-medium">No saved transcripts yet</h2><p className="mt-2 text-sm text-muted-foreground">Finish a recording in the workspace and save it here.</p></div>}
      {!loading && !error && records.length > 0 && <div className="grid gap-3">{records.map((record) => <Link key={record.id} href={`/transcriptions/${record.id}`}><article className="group rounded-lg border bg-card p-5 transition-colors hover:border-primary/50"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><h2 className="truncate font-medium group-hover:text-primary">{record.title}</h2><p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{record.originalText}</p></div><span className="shrink-0 text-xs text-muted-foreground">{record.language.toUpperCase()}</span></div><div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{formatDate(record.createdAt)}</span>{record.durationSeconds != null && <span>{Math.round(record.durationSeconds / 60)} min</span>}<span>{record.provider}</span></div></article></Link>)}</div>}
      {!loading && !error && pagination.pages > 1 && <div className="mt-6 flex items-center justify-between"><span className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.pages}</span><div className="flex gap-2"><Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((value) => value - 1)} aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></Button><Button variant="outline" size="icon" disabled={page >= pagination.pages} onClick={() => setPage((value) => value + 1)} aria-label="Next page"><ChevronRight className="h-4 w-4" /></Button></div></div>}
    </main>
  </div>;
}