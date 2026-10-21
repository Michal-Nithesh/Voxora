import { Loader2, Mic, Square } from 'lucide-react';

interface RecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function RecordButton({ isRecording, isProcessing, onClick, disabled }: RecordButtonProps) {
  // Only disable the button while we're initialising before recording has started.
  // Once isRecording is true the user must always be able to click Stop.
  const isInitializing = isProcessing && !isRecording;

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ambient glow & pulse */}
      {isRecording && (
        <>
          <span className="absolute -inset-2 rounded-full bg-red-500/20 animate-ping duration-1000" />
          <span className="absolute -inset-1 rounded-full bg-red-500/30 animate-pulse" />
        </>
      )}

      <button
        onClick={onClick}
        disabled={disabled || isInitializing}
        data-testid="button-record"
        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        className={[
          'relative z-10 h-16 w-16 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          isRecording
            ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 hover:bg-red-700 active:scale-95'
            : 'bg-primary text-primary-foreground shadow-lg shadow-primary/35 hover:opacity-95 hover:scale-105 active:scale-95',
        ].join(' ')}
      >
        {isInitializing ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary-foreground" />
        ) : isRecording ? (
          <Square className="h-5 w-5 fill-current" />
        ) : (
          <Mic className="h-7 w-7" />
        )}
      </button>
    </div>
  );
}
