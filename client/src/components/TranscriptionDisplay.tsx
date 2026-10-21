import { useEffect, useRef, useState } from 'react';
import { Check, Copy, FileText, Languages } from 'lucide-react';

interface TranscriptionDisplayProps {
  title: string;
  text: string;
  testId?: string;
  isRTL?: boolean;
  isPartial?: boolean;
  displayStyle?: 'default' | 'stream';
}

function useTypewriter(text: string, active: boolean): string {
  const [displayed, setDisplayed] = useState(text);
  const prevRef = useRef(text);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) {
      setDisplayed(text);
      prevRef.current = text;
      return;
    }

    const prev = prevRef.current;
    prevRef.current = text;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (text === prev) return;

    if (!text.startsWith(prev)) {
      setDisplayed(text);
      return;
    }

    const newPart = text.slice(prev.length);
    const words = newPart.match(/\S+\s*/g) ?? [];
    if (words.length === 0) {
      setDisplayed(text);
      return;
    }

    let i = 0;
    let current = prev;
    timerRef.current = setInterval(() => {
      if (i >= words.length) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setDisplayed(text);
        return;
      }
      current += words[i];
      i++;
      setDisplayed(current);
    }, 120);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, active]);

  return displayed;
}

export default function TranscriptionDisplay({
  title,
  text,
  testId,
  isRTL = false,
  isPartial = false,
  displayStyle = 'default',
}: TranscriptionDisplayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isStream = displayStyle === 'stream' && !isPartial;
  const displayedText = useTypewriter(text, isStream);
  const visibleText = isStream ? displayedText : text;
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleText]);

  const wordCount = visibleText.trim() ? visibleText.trim().split(/\s+/).length : 0;
  const isTranslation = title.toLowerCase().includes('translation');

  return (
    <div className="flex flex-col h-full rounded-xl border border-border/70 bg-card/70 shadow-2xs backdrop-blur-xs overflow-hidden">
      {/* Pane Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {isTranslation ? (
            <Languages className="h-4 w-4 text-primary" />
          ) : (
            <FileText className="h-4 w-4 text-primary" />
          )}
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{title}</span>
          {wordCount > 0 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          )}
        </div>

        {text && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Copy to clipboard"
            title="Copy text"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-500" />
                <span className="text-green-500">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Pane Content */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 scrollbar-thin"
        data-testid={testId}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {visibleText ? (
          <p
            className={`text-lg leading-relaxed whitespace-pre-wrap transition-opacity ${
              isPartial ? 'text-muted-foreground' : 'text-foreground'
            }`}
          >
            {visibleText}
            {isPartial && <span className="inline-block w-2 h-5 bg-primary ml-1 animate-pulse align-middle" />}
          </p>
        ) : (
          <div className="flex h-full min-h-[140px] items-center justify-center text-center">
            <p className="text-sm text-muted-foreground/70 italic">
              {title === 'Original'
                ? 'Speak into your microphone — transcription will stream here...'
                : 'Real-time AI translation will appear here...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
