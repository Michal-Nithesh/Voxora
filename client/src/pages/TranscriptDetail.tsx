import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import {
  ArrowLeft,
  Save,
  Trash2,
  Copy,
  Check,
  Clock3,
  Languages,
  Layers,
  FileText,
  RotateCw,
} from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deleteTranscription, getTranscription, updateTranscription, type TranscriptionRecord } from '@/lib/api';

export default function TranscriptDetail() {
  const [, params] = useRoute('/transcriptions/:id');
  const [, navigate] = useLocation();
  const [record, setRecord] = useState<TranscriptionRecord | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'saving' | 'saved' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslation, setCopiedTranslation] = useState(false);

  useEffect(() => {
    if (params?.id) {
      setStatus('loading');
      getTranscription(params.id)
        .then(({ data }) => {
          setRecord(data);
          setTitle(data.title);
          setText(data.originalText);
          setTranslatedText(data.translatedText || '');
          setStatus('idle');
        })
        .catch((err: Error) => {
          setStatus('error');
          setErrorMessage(err.message);
        });
    }
  }, [params?.id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center p-6 text-muted-foreground gap-3">
          <RotateCw className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm">Loading transcript document...</p>
        </main>
      </div>
    );
  }

  if (status === 'error' || !record) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8">
            <h2 className="text-lg font-semibold text-destructive">Failed to Load Transcript</h2>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage || 'Transcript not found.'}</p>
            <Link href="/history">
              <Button variant="outline" className="mt-6 gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Return to History</span>
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const handleSave = async () => {
    setStatus('saving');
    try {
      const result = await updateTranscription(record.id, {
        title: title.trim(),
        transcriptText: text,
        translatedText: translatedText || undefined,
      });
      setRecord(result.data);
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Could not save changes');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this transcript permanently from Supabase?')) return;
    try {
      await deleteTranscription(record.id);
      navigate('/history');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete transcript');
    }
  };

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    });
  };

  const handleCopyTranslation = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText).then(() => {
      setCopiedTranslation(true);
      setTimeout(() => setCopiedTranslation(false), 2000);
    });
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {/* Navigation & Controls Top Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link href="/history">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to History</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {status === 'saved' && (
              <span className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
                <Check className="h-3.5 w-3.5" />
                <span>Changes saved to Supabase</span>
              </span>
            )}
            {status === 'saving' && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <RotateCw className="h-3.5 w-3.5 animate-spin text-primary" />
                <span>Saving...</span>
              </span>
            )}

            <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:bg-destructive/10 gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={status === 'saving' || !title.trim() || !text.trim()}
              className="gap-1.5 shadow-sm shadow-primary/25"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>
        </div>

        {/* Title & Metadata Header */}
        <div className="mb-8 rounded-xl border border-border/70 bg-card p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <label htmlFor="transcript-title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1.5">
                Transcript Title
              </label>
              <Input
                id="transcript-title"
                value={title}
                maxLength={160}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold h-11"
                placeholder="Untitled transcript"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-5 shrink-0">
              <Badge variant="secondary" className="gap-1 text-xs">
                <Languages className="h-3 w-3" />
                <span>{record.language.toUpperCase()} → {(record.targetLanguage || 'en').toUpperCase()}</span>
              </Badge>
              <Badge variant="outline" className="text-xs">
                {record.provider}
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
            <span className="flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              Created {new Date(record.createdAt).toLocaleString()}
            </span>
            <span>•</span>
            <span>{wordCount} words ({charCount} characters)</span>
            {record.durationSeconds != null && (
              <>
                <span>•</span>
                <span>Duration: {Math.floor(record.durationSeconds / 60)}m {record.durationSeconds % 60}s</span>
              </>
            )}
          </div>
        </div>

        {/* Document Editor Tabs */}
        <Tabs defaultValue="original" className="w-full">
          <div className="flex items-center justify-between mb-3">
            <TabsList className="bg-muted/60">
              <TabsTrigger value="original" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Original Transcript</span>
              </TabsTrigger>
              <TabsTrigger value="translated" className="gap-1.5">
                <Languages className="h-3.5 w-3.5" />
                <span>Translation ({record.targetLanguage.toUpperCase()})</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyOriginal}
                className="h-8 gap-1.5 text-xs"
              >
                {copiedOriginal ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy Original</span>
              </Button>
              {translatedText && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTranslation}
                  className="h-8 gap-1.5 text-xs"
                >
                  {copiedTranslation ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy Translation</span>
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="original" className="mt-0">
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
              <Textarea
                id="transcript-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[420px] font-sans text-base leading-relaxed resize-y border-0 focus-visible:ring-0 p-2"
                placeholder="Original transcript text..."
              />
            </div>
          </TabsContent>

          <TabsContent value="translated" className="mt-0">
            <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs">
              <Textarea
                id="translated-text"
                value={translatedText}
                onChange={(e) => setTranslatedText(e.target.value)}
                className="min-h-[420px] font-sans text-base leading-relaxed resize-y border-0 focus-visible:ring-0 p-2"
                placeholder="No translation available for this transcript yet..."
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
