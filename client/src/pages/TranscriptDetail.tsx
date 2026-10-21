import { useEffect, useState } from 'react';
import { Link, useLocation, useRoute } from 'wouter';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { deleteTranscription, getTranscription, updateTranscription, type TranscriptionRecord } from '@/lib/api';

export default function TranscriptDetail() {
  const [, params] = useRoute('/transcriptions/:id');
  const [, navigate] = useLocation();
  const [record, setRecord] = useState<TranscriptionRecord | null>(null);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [status, setStatus] = useState('Loading transcript...');

  useEffect(() => { if (params?.id) getTranscription(params.id).then(({ data }) => { setRecord(data); setTitle(data.title); setText(data.originalText); setStatus(''); }).catch((err: Error) => setStatus(err.message)); }, [params?.id]);
  if (!record) return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-3xl px-4 py-12"><p className="text-muted-foreground">{status}</p><Link href="/history"><Button variant="ghost" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to history</Button></Link></main></div>;
  const save = async () => { setStatus('Saving...'); try { const result = await updateTranscription(record.id, { title: title.trim(), transcriptText: text }); setRecord(result.data); setStatus('Saved'); } catch (err) { setStatus(err instanceof Error ? err.message : 'Could not save'); } };
  const remove = async () => { if (!window.confirm('Delete this transcript permanently?')) return; try { await deleteTranscription(record.id); navigate('/history'); } catch (err) { setStatus(err instanceof Error ? err.message : 'Could not delete'); } };
  return <div className="min-h-screen bg-background"><Header /><main className="mx-auto max-w-3xl px-4 py-8 sm:px-6"><Link href="/history"><Button variant="ghost" className="mb-6 -ml-3"><ArrowLeft className="mr-2 h-4 w-4" />Back to history</Button></Link><div className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Saved transcript</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Edit transcript</h1><p className="mt-2 text-sm text-muted-foreground">Created {new Date(record.createdAt).toLocaleString()}</p></div><div className="space-y-5"><div><label htmlFor="transcript-title" className="mb-2 block text-sm font-medium">Title</label><Input id="transcript-title" value={title} maxLength={160} onChange={(event) => setTitle(event.target.value)} /></div><div><label htmlFor="transcript-text" className="mb-2 block text-sm font-medium">Transcript</label><Textarea id="transcript-text" value={text} onChange={(event) => setText(event.target.value)} className="min-h-[360px] leading-7" /></div><div className="flex flex-wrap items-center justify-between gap-3"><span className="text-sm text-muted-foreground">{status}</span><div className="flex gap-2"><Button variant="destructive" onClick={remove}><Trash2 className="mr-2 h-4 w-4" />Delete</Button><Button onClick={save} disabled={!title.trim() || !text.trim()}><Save className="mr-2 h-4 w-4" />Save changes</Button></div></div></div></main></div>;
}